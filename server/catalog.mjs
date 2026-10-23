import base from './catalog-base.mjs';
export const baseMap=new Map(base.map(p=>[p.id,p]));
export const sale=(price,p)=>p.discountType==='percentage'?Math.round(price*(100-p.discountValue)/100):p.discountType==='fixed'?price-p.discountValue:price;
export const publicProduct=p=>({...p,variants:p.variants.map(v=>({...v,regularPrice:v.price,price:sale(v.price,p)}))});
export async function setup(db){
 await db.prepare('CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY,payload TEXT NOT NULL)').bind().run();
 await db.prepare('CREATE TABLE IF NOT EXISTS product_images (id TEXT PRIMARY KEY,mime TEXT NOT NULL,data BLOB NOT NULL)').bind().run();
}
export async function catalog(db){const rows=await db.prepare('SELECT payload FROM products').bind().all();const overrides=rows.results.map(r=>JSON.parse(r.payload));return {overrides,all:[...new Map([...base,...overrides].map(p=>[p.id,p])).values()]}}
export function validateProduct(p){
 if(!p||!['label','brand'].every(k=>typeof p[k]==='string'&&p[k].trim()&&p[k].length<=200)||typeof p.id!=='string'||!/^[a-z0-9-]{3,200}$/.test(p.id))return false;
 if(typeof p.image!=='string'||!(/^(images\/[a-zA-Z0-9_.-]+\.(jpg|png|webp)|\/api\/images\/[a-f0-9]{64})$/.test(p.image)))return false;
 if(!['men','women','unisex','bath-body'].includes(p.category)||typeof p.description!=='string'||p.description.length>5000||typeof p.published!=='boolean')return false;
 if(!Array.isArray(p.variants)||!p.variants.length||p.variants.length>20||new Set(p.variants.map(v=>v.size)).size!==p.variants.length)return false;
 if(!p.variants.every(v=>typeof v.size==='string'&&v.size.trim()&&v.size.length<=60&&Number.isInteger(v.price)&&v.price>0&&v.price<=100000))return false;
 if(!['none','percentage','fixed'].includes(p.discountType)||!Number.isInteger(p.discountValue)||p.discountValue<0)return false;
 if(p.discountType==='percentage'&&(p.discountValue<1||p.discountValue>99))return false;
 if(p.discountType==='fixed'&&p.discountValue<1)return false;
 return p.variants.every(v=>sale(v.price,p)>=1);
}
export async function quote(db,lines){
 const {all}=await catalog(db),map=new Map(all.map(p=>[p.id,p]));
 return lines.map(l=>{const p=map.get(l.id),v=p?.variants.find(v=>v.size===l.size);if(!p||!p.published||!v)throw Error('A product is unavailable. Please update your bag.');return {id:p.id,brand:p.brand,label:p.label,image:p.image,size:v.size,qty:l.qty,price:sale(v.price,p),regularPrice:v.price}});
}
