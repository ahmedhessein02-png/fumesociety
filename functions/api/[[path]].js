import {allowedStoreRequest} from '../../server/public-api.mjs';
import {setup,catalog,publicProduct,validateProduct,quote} from '../../server/catalog.mjs';
import {digest, token, passwordHash, equal} from '../../server/crypto.mjs';
const cookieName='__Host-fume_admin';
const cookie=(value,age=43200)=>`${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const reply=(body,status=200,extra={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
function credential(env){try{const c=JSON.parse(env.FUME_ADMIN||'null');return c&&/^[a-zA-Z0-9_.-]{3,40}$/.test(c.username)&&['salt','password_hash','revision'].every(k=>/^[a-f0-9]{64}$/.test(c[k]))?c:null}catch{return null}}
function readToken(req){const v=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);return /^[a-f0-9]{64}$/.test(v||'')?v:null}
async function limit(db,req,kind,max){const now=Date.now(),window=Math.floor(now/900000),key=await digest(`${kind}:${req.headers.get('cf-connecting-ip')||'unknown'}:${window}`);await db.prepare('DELETE FROM request_limits WHERE expires_at<?').bind(now).run();const row=await db.prepare('INSERT INTO request_limits(id,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(key,(window+1)*900000).first();return row.attempts<=max}
async function body(req){if(!req.headers.get('content-type')?.startsWith('application/json'))throw Error('Invalid JSON');const reader=req.body?.getReader();if(!reader)throw Error('Missing body');let size=0,parts=[];for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw Error('Body too large')}parts.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length}return JSON.parse(new TextDecoder().decode(bytes))}
function validOrder(o){return o&&['cod','fib'].includes(o.payment)&&typeof o.ref==='string'&&/^FS-[A-Z0-9-]{5,64}$/.test(o.ref)&&['name','phone','city','address','payment'].every(k=>typeof o[k]==='string'&&o[k].trim().length>0&&o[k].length<=500)&&Array.isArray(o.lines)&&o.lines.length>0&&o.lines.length<=50&&o.lines.every(l=>l&&typeof l.id==='string'&&l.id.length<=200&&typeof l.size==='string'&&l.size.length<=100&&Number.isInteger(l.qty)&&l.qty>=1&&l.qty<=100)}
export async function onRequest({request:req,env}) {
 try {
 const path=new URL(req.url).pathname.replace(/\/$/,'');const method=req.method;
 if(!env.DB)return reply({error:'Admin service is not configured yet.'},503);
 await setup(env.DB);
 if(path.startsWith('/api/images/')&&method==='GET'){const row=await env.DB.prepare('SELECT mime,data FROM product_images WHERE id=?').bind(path.split('/').pop()).first();return row?new Response(row.data,{headers:{'Content-Type':row.mime,'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}}):reply({error:'Not found.'},404)}
 if(path==='/api/catalog'&&method==='GET'){const {overrides}=await catalog(env.DB);return reply({products:overrides.map(publicProduct)})}
 if(path==='/api/shop'&&method==='GET'){const {all}=await catalog(env.DB);return reply({products:all.filter(p=>p.published).map(publicProduct)})}
 if(method!=='GET'&&req.headers.get('origin')!==new URL(req.url).origin&&!allowedStoreRequest(req))return reply({error:'Invalid origin.'},403);
 if(path==='/api/orders'&&method==='POST'){
  if(!await limit(env.DB,req,'order',30))return reply({error:'Too many requests.'},429);
  let o;try{o=await body(req)}catch{return reply({error:'Invalid order.'},400)}
  if(!validOrder(o))return reply({error:'Invalid order.'},400);
  const existing=await env.DB.prepare('SELECT payload FROM orders WHERE ref=?').bind(o.ref).first();
  if(existing){const prior=JSON.parse(existing.payload);if(prior.name!==o.name||prior.phone!==o.phone)return reply({error:'Order reference already used.'},409);return reply({saved:true,order:prior},201)}
  let lines;try{lines=await quote(env.DB,o.lines)}catch(e){return reply({error:e.message},400)}
  if(o.lines.some((l,i)=>Number.isFinite(l.price)&&l.price!==lines[i].price))return reply({error:'Prices have changed. Refresh this page to review the updated total before ordering.'},409);
  const payload={name:o.name.trim(),phone:o.phone.trim(),city:o.city.trim(),address:o.address.trim(),payment:o.payment,area:typeof o.area==='string'?o.area.slice(0,100):null,locale:o.locale==='ar'?'ar':'en',status:'new',lines,subtotal:lines.reduce((n,l)=>n+l.price*l.qty,0),currency:'USD',delivery:'To be confirmed'};
  await env.DB.prepare('INSERT INTO orders(ref,created_at,payload) VALUES(?,?,?) ON CONFLICT(ref) DO NOTHING').bind(o.ref,Date.now(),JSON.stringify(payload)).run();
  return reply({saved:true,order:payload},201);
 }
 if(path==='/api/bag'&&method==='POST'){let input;try{input=await body(req)}catch{return reply({error:'Invalid request'},400)}if(!Array.isArray(input.ids)||input.ids.length>100)return reply({error:'Invalid bag'},400);const {all}=await catalog(env.DB);return reply(Object.fromEntries(all.filter(p=>input.ids.includes(p.id)&&p.published).map(p=>[p.id,publicProduct(p)])))}
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
 if(path==='/api/admin/products'&&method==='GET'){const {all}=await catalog(env.DB);return reply({products:all})}
 if(path==='/api/admin/products'&&['POST','PATCH'].includes(method)){
  let p;try{p=await body(req)}catch{return reply({error:'Invalid product.'},400)}
  if(!p.id&&method==='POST')p.id='fume-'+token().slice(0,16);
  if(!validateProduct(p))return reply({error:'Check the name, image, sizes, prices and discount. Sale prices must be at least $1.'},400);
  const {all}=await catalog(env.DB);const exists=all.some(x=>x.id===p.id);
  if(method==='POST'&&exists)return reply({error:'This product already exists.'},409);
  if(method==='PATCH'&&!exists)return reply({error:'Product not found.'},404);
  p={id:p.id,label:p.label.trim(),brand:p.brand.trim(),image:p.image,category:p.category,description:p.description,published:p.published,variants:p.variants.map(v=>({size:v.size.trim(),price:v.price})),discountType:p.discountType,discountValue:p.discountType==='none'?0:p.discountValue};
  await env.DB.prepare('INSERT INTO products(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind(p.id,JSON.stringify(p)).run();return reply({product:p});
 }
 if(path==='/api/admin/images'&&method==='POST'){
  const mime=req.headers.get('content-type');if(!['image/jpeg','image/png','image/webp'].includes(mime))return reply({error:'Use JPG, PNG or WebP.'},400);
  const reader=req.body?.getReader();if(!reader)return reply({error:'Image required.'},400);let parts=[],size=0;for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>600000){await reader.cancel();return reply({error:'Image must be under 600 KB.'},413)}parts.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length}
  const valid=mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:mime==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
  if(!valid)return reply({error:'Invalid image.'},400);const id=token();await env.DB.prepare('INSERT INTO product_images(id,mime,data) VALUES(?,?,?)').bind(id,mime,bytes.buffer).run();return reply({image:'/api/images/'+id},201);
 }
 if(path==='/api/admin/orders'&&method==='PATCH'){
  let input;try{input=await body(req)}catch{return reply({error:'Invalid request.'},400)}
  if(!['new','confirmed','completed','cancelled'].includes(input.status)||typeof input.ref!=='string')return reply({error:'Invalid status.'},400);
  const result=await env.DB.prepare("UPDATE orders SET payload=json_set(payload,'$.status',?) WHERE ref=?").bind(input.status,input.ref).run();if((result.meta?.changes??result.changes)===0)return reply({error:'Order not found.'},404);return reply({saved:true});
 }
 if(path==='/api/admin/stats'&&method==='GET'){
  const row=await env.DB.prepare("SELECT COUNT(*) AS total,SUM(CASE WHEN COALESCE(json_extract(payload,'$.status'),'new')='new' THEN 1 ELSE 0 END) AS newOrders,SUM(CASE WHEN COALESCE(json_extract(payload,'$.status'),'new')!='cancelled' THEN COALESCE(json_extract(payload,'$.subtotal'),0) ELSE 0 END) AS value FROM orders").bind().first();return reply(row);
 }
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
