import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
test('direct owner portal serves public assets without proxying credentials or unrelated paths',async()=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async (...args)=>{calls.push(args);return new Response('<a href="/">Store</a><script src="/admin-assets/dashboard.js"></script>',{headers:{'Content-Type':'text/html'}})};
 try {
  const page=await worker.fetch(new Request('https://fumesociety.ahmedhessein02.workers.dev/dashboard/',{headers:{cookie:'private-session'}}),{});
  assert.equal(page.status,200);assert.equal(page.headers.get('cache-control'),'no-store');assert.match(await page.text(),/href="https:\/\/fumesociety.com\/"/);
  assert.deepEqual(calls,[['https://fumesociety.com/dashboard/']]);
  await worker.fetch(new Request('https://fumesociety.ahmedhessein02.workers.dev/admin-assets/dashboard.js?v=4'),{});assert.equal(calls.length,2);
  assert.equal((await worker.fetch(new Request('https://fumesociety.ahmedhessein02.workers.dev/api/admin/session'),{})).status,503);assert.equal(calls.length,2);
  await worker.fetch(new Request('https://fumesociety.ahmedhessein02.workers.dev/server/crypto.mjs'),{});assert.equal(calls.length,2);
  await worker.fetch(new Request('https://fumesociety.com/dashboard/'),{});assert.equal(calls.length,2);
  globalThis.fetch=async()=>new Response('Not found',{status:404});assert.equal((await worker.fetch(new Request('https://fumesociety.ahmedhessein02.workers.dev/dashboard/'),{})).status,503);
 }finally{globalThis.fetch=original}
});
