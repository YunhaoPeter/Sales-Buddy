/** Decode only the reply string from a partial JSON response; never expose internal JSON. */
export function partialMeetingReply(json:string){
 const match=/"reply"\s*:\s*"/.exec(json);if(!match)return '';
 let out='';for(let i=match.index+match[0].length;i<json.length;i++){
  const c=json[i];if(c==='"')break;if(c!=='\\'){out+=c;continue;}
  const next=json[++i];if(next===undefined)break;
  if(next==='u'){const hex=json.slice(i+1,i+5);if(!/^[0-9a-f]{4}$/i.test(hex))break;out+=String.fromCharCode(parseInt(hex,16));i+=4;}
  else out+=({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f','"':'"','\\':'\\','/':'/'} as Record<string,string>)[next]||'';
 }return out;
}
