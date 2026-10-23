import {digest, token, passwordHash, equal} from '../../server/crypto.mjs';
const cookieName='__Host-fume_admin';
const cookie=(value,age=43200)=>`${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const reply=(body,status=200,extra={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
function credential(env){try{const c=JSON.parse(env.FUME_ADMIN||'null');return c&&/^[a-zA-Z0-9_.-]{3,40}$/.test(c.username)&&['salt','password_hash','revision'].every(k=>/^[a-f0-9]{64}$/.test(c[k]))?c:null}catch{return null}}
function readToken(req){const v=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);return /^[a-f0-9]{64}$/.test(v||'')?v:null}
async function limit(db,req,kind,max){const now=Date.now(),window=Math.floor(now/900000),key=await digest(`${kind}:${req.headers.get('cf-connecting-ip')||'unknown'}:${window}`);await db.prepare('DELETE FROM request_limits WHERE expires_at<?').bind(now).run();const row=await db.prepare('INSERT INTO request_limits(id,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(key,(window+1)*900000).first();return row.attempts<=max}
async function body(req){if(!req.headers.get('content-type')?.startsWith('application/json'))throw Error('Invalid JSON');const reader=req.body?.getReader();if(!reader)throw Error('Missing body');let size=0,parts=[];for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw Error('Body too large')}parts.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length}return JSON.parse(new TextDecoder().decode(bytes))}
function validOrder(o){return o&&typeof o.ref==='string'&&/^FS-[A-Z0-9-]{5,64}$/.test(o.ref)&&['name','phone','city','address','payment'].every(k=>typeof o[k]==='string'&&o[k].trim().length>0&&o[k].length<=500)&&Array.isArray(o.lines)&&o.lines.length>0&&o.lines.length<=50&&o.lines.every(l=>l&&typeof l.id==='string'&&l.id.length<=200&&typeof l.size==='string'&&l.size.length<=100&&Number.isInteger(l.qty)&&l.qty>=1&&l.qty<=100)}
export async function onRequest({request:req,env}) {
 try {
 const path=new URL(req.url).pathname.replace(/\/$/,'');const method=req.method;
 if(!env.DB)return reply({error:'Admin service is not configured yet.'},503);
 if(method!=='GET'&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Invalid origin.'},403);
 if(path==='/api/orders'&&method==='POST'){
  if(!await limit(env.DB,req,'order',30))return reply({error:'Too many requests.'},429);
  let o;try{o=await body(req)}catch{return reply({error:'Invalid order.'},400)}
  if(!validOrder(o))return reply({error:'Invalid order.'},400);
  const payload={name:o.name,phone:o.phone,city:o.city,address:o.address,payment:o.payment,area:typeof o.area==='string'?o.area.slice(0,100):null,locale:o.locale==='ar'?'ar':'en',lines:o.lines.map(l=>({id:l.id,size:l.size,qty:l.qty}))};
  await env.DB.prepare('INSERT INTO orders(ref,created_at,payload) VALUES(?,?,?) ON CONFLICT(ref) DO NOTHING').bind(o.ref,Date.now(),JSON.stringify(payload)).run();
  return reply({saved:true},201);
 }
 const c=credential(env);if(!c)return reply({error:'Admin account is not configured yet.'},503);
 if(path==='/api/admin/login'&&method==='POST'){
  if(!await limit(env.DB,req,'login',10))return reply({error:'Too many attempts. Try again in 15 minutes.'},429);
  let input;try{input=await body(req)}catch{return reply({error:'Invalid request.'},400)}
  if(typeof input?.password!=='string'||input.password.length>128||typeof input.username!=='string')return reply({error:'Invalid credentials.'},401);
  const hash=await passwordHash(input.password,c.salt);
  if(!equal(hash,c.password_hash)||input.username!==c.username)return reply({error:'Invalid credentials.'},401);
  const value=token();await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(Date.now()).run();
  await env.DB.prepare('INSERT INTO admin_sessions(token_hash,revision,expires_at) VALUES(?,?,?)').bind(await digest(value),c.revision,Date.now()+43200000).run();
  return reply({authenticated:true},200,{'Set-Cookie':cookie(value)});
 }
 const value=readToken(req);
 if(path==='/api/admin/logout'&&method==='POST'){
  if(value)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(value)).run();
  return reply({authenticated:false},200,{'Set-Cookie':cookie('',0)});
 }
 const session=value&&await env.DB.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND revision=? AND expires_at>?').bind(await digest(value),c.revision,Date.now()).first();
 if(!session)return reply({error:'Please sign in.'},401);
 if(path==='/api/admin/session'&&method==='GET')return reply({authenticated:true});
 if(path==='/api/admin/orders'&&method==='GET'){
  const raw=Number(new URL(req.url).searchParams.get('before')||Number.MAX_SAFE_INTEGER);const before=Number.isSafeInteger(raw)&&raw>0?raw:Number.MAX_SAFE_INTEGER;
  // Cursor uses monotonically increasing rowid, so equal timestamps cannot omit orders.
  const rows=await env.DB.prepare('SELECT rowid AS cursor,ref,created_at,payload FROM orders WHERE rowid<? ORDER BY rowid DESC LIMIT 101').bind(before).all();
  return reply({orders:rows.results.slice(0,100).map(o=>({ref:o.ref,created_at:o.created_at,...JSON.parse(o.payload)})),next:rows.results.length>100?rows.results[99].cursor:null});
 }
 return reply({error:'Not found.'},404);
 }catch{return reply({error:'Service unavailable. Please try again later.'},503)}
}
