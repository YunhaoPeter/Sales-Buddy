import {AppError} from '../../../packages/contracts/index.ts';
export function modelStatus(){return{configured:!!(process.env.MODEL_API_BASE_URL&&process.env.MODEL_API_KEY&&process.env.MODEL_NAME),protocol:process.env.MODEL_PROTOCOL||'chat_completions',model:process.env.MODEL_NAME||null};}
export async function modelTurn(messages:any[],tools:any[],signal:AbortSignal,onText:(s:string)=>void){
 if(!modelStatus().configured)throw new AppError('MODEL_NOT_CONFIGURED','请在本地.env配置模型地址、模型名和密钥',503);
 if(modelStatus().protocol!=='chat_completions')throw new AppError('UNSUPPORTED_CAPABILITY','目前适配Chat Completions协议');
 const base=process.env.MODEL_API_BASE_URL!.replace(/\/$/,'');const url=base.endsWith('/chat/completions')?base:base+'/chat/completions';
 const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.MODEL_API_KEY},body:JSON.stringify({model:process.env.MODEL_NAME,messages,...(tools.length?{tools}:{}),stream:true}),signal});
 if(!response.ok)throw new AppError('MODEL_API_ERROR','模型服务HTTP '+response.status,502);
 const calls:any[]=[];let content='',usage:any=null;
 if(response.headers.get('content-type')?.includes('text/event-stream')){
 const reader=response.body!.getReader();const decoder=new TextDecoder();let buffer='';
 const consume=(line:string)=>{if(!line.startsWith('data:'))return;const payload=line.slice(5).trim();if(!payload||payload==='[DONE]')return;const j=JSON.parse(payload);usage=j.usage||usage;const d=j.choices?.[0]?.delta||{};if(d.content){content+=d.content;onText(d.content);}for(const c of d.tool_calls||[]){const i=c.index||0;if(!calls[i])calls[i]={id:c.id||'call-'+i,type:'function',function:{name:'',arguments:''}};if(c.id)calls[i].id=c.id;if(c.function?.name)calls[i].function.name+=c.function.name;if(c.function?.arguments)calls[i].function.arguments+=c.function.arguments;}};
 for(;;){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let at;while((at=buffer.indexOf('\n'))>=0){consume(buffer.slice(0,at).replace(/\r$/,''));buffer=buffer.slice(at+1);}}if(buffer.trim())consume(buffer);
 }else{const j:any=await response.json();const msg=j.choices?.[0]?.message;content=msg?.content||'';calls.push(...(msg?.tool_calls||[]));usage=j.usage||null;if(content)onText(content);}
 return{role:'assistant',content,tool_calls:calls.filter(Boolean),usage};
}

