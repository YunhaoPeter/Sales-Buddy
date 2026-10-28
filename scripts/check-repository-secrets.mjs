import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
const tracked=process.argv.includes('--tracked');
const files=execFileSync('git',tracked?['ls-files','-z']:['diff','--cached','--name-only','--diff-filter=ACMR','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const known=[];
if(existsSync('.env'))for(const line of readFileSync('.env','utf8').split(/\r?\n/)){const m=line.match(/^\s*(?:MODEL_API_KEY|EXA_API_KEY)\s*=\s*(.*?)\s*$/);if(m){const value=m[1].replace(/^['"]|['"]$/g,'');if(value.length>=12)known.push(value);}}
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bgithub_pat_[A-Za-z0-9_]{40,}\b/,/\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}\b/];
const failures=[];
for(const file of files){
 if(/(^|\/)(?:\.env(?:\..*)?|.*\.sqlite(?:-.*)?|.*\.db)$/.test(file)&&!file.endsWith('.env.example')){failures.push(file+' (local configuration/database)');continue;}
 let data;try{data=tracked?readFileSync(file):execFileSync('git',['show',':'+file],{maxBuffer:100*1024*1024});}catch{failures.push(file+' (cannot inspect)');continue;}
 const text=data.toString('utf8');if(known.some(secret=>text.includes(secret))||patterns.some(re=>re.test(text)))failures.push(file+' (possible secret; value omitted)');
}
if(failures.length){console.error('Repository secret check failed:\n'+failures.join('\n'));process.exit(1);}console.log(`Repository secret check passed: ${files.length} ${tracked?'tracked':'staged'} files. No secret values were printed.`);
