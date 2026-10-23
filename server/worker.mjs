import {allowedStoreRequest,corsHeaders} from './public-api.mjs';
import {onRequest} from '../functions/api/[[path]].js';

// The workers.dev owner portal keeps dashboard assets and authentication on one
// origin, even while a customer's ISP still resolves the store to its old host.
const storeOrigin = 'https://fumesociety.com';
const dashboardAssets = new Set(['/admin-assets/dashboard.js', '/admin-assets/dashboard.css']);
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  const portalHost = url.hostname === 'fumesociety.ahmedhessein02.workers.dev';
  if (portalHost && request.method === 'GET') {
   if (url.pathname === '/' || url.pathname === '/dashboard') {
    return Response.redirect(url.origin + '/dashboard/', 302);
   }
   const dashboard = url.pathname === '/dashboard/';
   const asset = dashboardAssets.has(url.pathname);
   const catalogImage = /^\/catalog\/[a-zA-Z0-9_.-]+\.jpg$/.test(url.pathname);
   if (dashboard || asset || catalogImage) {
    const upstream = await fetch(storeOrigin + url.pathname + url.search);
    if (!upstream.ok) return new Response('The owner portal could not load. Please try again shortly.', {status:503});
    const headers = new Headers(upstream.headers);
    headers.set('Cache-Control', catalogImage ? 'public, max-age=3600' : 'no-store');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    if (dashboard) {
     headers.set('X-Robots-Tag', 'noindex, nofollow');
     const html = (await upstream.text()).replaceAll('href="/"', 'href="' + storeOrigin + '/"');
     return new Response(html, {headers});
    }
    return new Response(upstream.body, {headers});
   }
  }
  if (request.method === 'OPTIONS') {
   return allowedStoreRequest(request) ? new Response(null,{status:204,headers:corsHeaders(request)}) : new Response(null,{status:403});
  }
  const response=await onRequest({request, env});
  if(allowedStoreRequest(request)) {
   const headers=new Headers(response.headers);
   for(const [key,value] of Object.entries(corsHeaders(request)))headers.set(key,value);
   return new Response(response.body,{status:response.status,headers});
  }
  return response;
 }
};
