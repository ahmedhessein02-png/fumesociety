const enc = new TextEncoder();
export const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
export const token = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export const digest = async value => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value))));
export async function passwordHash(password, salt) {
 const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
 return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:enc.encode(salt), iterations:100000}, key, 256)));
}
export function equal(a,b) { if(typeof a!=='string'||typeof b!=='string'||a.length!==64||b.length!==64)return false;let diff=0;for(let i=0;i<64;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0; }
