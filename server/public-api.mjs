export const publicPaths=new Set(['/api/orders','/api/bag','/api/catalog','/api/shop']);
export const storeOrigins=new Set(['https://fumesociety.com','https://www.fumesociety.com']);
export function allowedStoreRequest(request){return publicPaths.has(new URL(request.url).pathname.replace(/\/$/,''))&&storeOrigins.has(request.headers.get('origin'))}
export function corsHeaders(request){return {'Access-Control-Allow-Origin':request.headers.get('origin'),'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}}
