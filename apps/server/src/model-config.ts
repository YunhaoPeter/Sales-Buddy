import {readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {parse} from 'dotenv';
import {AppError} from '../../../packages/contracts/index.ts';
const path=()=>resolve(process.env.MODEL_CONFIG_PATH||'.env');
const raw=()=>existsSync(path())?readFileSync(path(),'utf8'):'';
const version=(text:string)=>createHash('sha256').update(text).digest('hex');
const keys=['MODEL_PROTOCOL','MODEL_API_BASE_URL','MODEL_API_KEY','MODEL_NAME','MODEL_TIMEOUT_MS'];
export function validateModelConfig(input:any){
 const c={protocol:input.protocol,baseUrl:String(input.baseUrl||'').trim(),model:String(input.model||'').trim(),apiKey:String(input.apiKey||'').trim(),timeoutMs:Number(input.timeoutMs)};
 if(c.protocol!=='chat_completions')throw new AppError('INVALID_ARGUMENT','请选择Chat Completions协议');
 let url:URL;try{url=new URL(c.baseUrl);}catch{throw new AppError('INVALID_ARGUMENT','API地址不是有效URL');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw new AppError('INVALID_ARGUMENT','API地址需为HTTP/HTTPS，且不能含凭据、查询参数或片段');
 if(!c.model||/[\s,，;]/.test(c.model))throw new AppError('INVALID_ARGUMENT','模型名必须是单个模型，不能用逗号分隔多个模型');
 if(!c.apiKey||/[\r\n\s]/.test(c.apiKey))throw new AppError('INVALID_ARGUMENT','请填写有效密钥，不能包含空格或换行');
 if(!Number.isInteger(c.timeoutMs)||c.timeoutMs<1000||c.timeoutMs>600000)throw new AppError('INVALID_ARGUMENT','超时应为1000–600000毫秒的整数');
 return c;
}
export function publicModelConfig(){const text=raw(),v=parse(text);return{protocol:v.MODEL_PROTOCOL||'chat_completions',baseUrl:v.MODEL_API_BASE_URL||'',model:v.MODEL_NAME||'',timeoutMs:Number(v.MODEL_TIMEOUT_MS||120000),hasApiKey:!!v.MODEL_API_KEY,version:version(text)};}
function candidate(input:any){return validateModelConfig({...input,apiKey:input.apiKey||parse(raw()).MODEL_API_KEY});}
export function saveModelConfig(input:any){
 const text=raw();if(input.version!==version(text))throw new AppError('CONFLICT','配置已被其他页面或本地文件修改，请重新加载',409);
 const c=candidate(input);const values:Record<string,string>={MODEL_PROTOCOL:c.protocol,MODEL_API_BASE_URL:c.baseUrl,MODEL_API_KEY:c.apiKey,MODEL_NAME:c.model,MODEL_TIMEOUT_MS:String(c.timeoutMs)};
 const lines=text.split(/\r?\n/).filter(line=>!keys.some(k=>new RegExp('^\\s*(?:export\\s+)?'+k+'\\s*=').test(line)));
 const next=lines.join('\n').replace(/\n*$/,'')+'\n'+keys.map(k=>k+'='+JSON.stringify(values[k])).join('\n')+'\n';
 const temp=path()+'.tmp';writeFileSync(temp,next,{mode:0o600});renameSync(temp,path());for(const k of keys)process.env[k]=values[k];return publicModelConfig();
}
export async function testModelConfig(input:any){
 const c=candidate(input),base=c.baseUrl.replace(/\/$/,'');const url=base.endsWith('/chat/completions')?base:base+'/chat/completions';const started=Date.now();
 try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.apiKey},body:JSON.stringify({model:c.model,messages:[{role:'user',content:'Reply only OK.'}],max_tokens:16,stream:false}),signal:AbortSignal.timeout(Math.min(c.timeoutMs,45000))});
 if(!r.ok)throw new AppError('MODEL_API_ERROR','连接测试失败：模型服务HTTP '+r.status,502);
 const j:any=await r.json();if(!j.choices?.[0]?.message)throw new AppError('MODEL_API_ERROR','服务响应不符合Chat Completions格式',502);
 return{ok:true,model:c.model,latencyMs:Date.now()-started,message:'连接成功，已收到Chat Completions响应；工具调用与流式能力需进一步验证。'};
 }catch(e:any){if(e instanceof AppError)throw e;throw new AppError('MODEL_API_ERROR',e.name==='TimeoutError'?'连接测试超时':'无法连接模型服务，请检查地址和网络',502);}
}
