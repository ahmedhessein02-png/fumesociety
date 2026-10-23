// Read credentials from stdin, never command-line arguments or repository files.
import {passwordHash,token} from './crypto.mjs';
let raw='';for await(const chunk of process.stdin)raw+=chunk;
const {username,password}=JSON.parse(raw);
if(!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)||typeof password!=='string'||password.length<16||password.length>128)throw Error('Use a 3–40 character username and a 16–128 character password.');
const salt=token();process.stdout.write(JSON.stringify({username,salt,password_hash:await passwordHash(password,salt),revision:token()}));
