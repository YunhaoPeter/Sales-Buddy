import React,{useState} from 'react';
import {MessageSquare,X} from 'lucide-react';
import {resourceContact} from '../../../packages/resource-contact';
export function NavigatorResources({answer}:{answer:any}){
 const [selected,setSelected]=useState<any>(null);const resources=answer.navigator?.resources||[];if(!resources.length)return null;
 const open=(r:any)=>{const contact=resourceContact(r.row);if(contact.available&&contact.channel==='COME3.0')setSelected({...r,contact});};
 return <section className="navigator-resources"><h4>可协调资源</h4><div>{resources.slice(0,3).map((r:any)=>{const c=resourceContact(r.row),come=c.available&&c.channel==='COME3.0';return <article key={r.ref} className={come?'come-resource-card':''} onClick={()=>come&&open(r)}>
  <span className="pill">{r.row[1]}</span>{c.isDemo&&<span className="resource-demo-label">演示联系人</span>}<h4>{r.row[0]}</h4><p>{r.row[4]}</p><small>使用前提：{r.row[5]}</small><small>准备资料：{r.row[6]}</small>
  {c.available?<div className="resource-contact"><b>{c.name} · {c.employeeId}</b><small>{r.row[7]}</small>{come?<button className="soft" onClick={e=>{e.stopPropagation();open(r)}}><MessageSquare size={14}/>打开COME3.0对话（样例）</button>:<><small>邮箱</small><span className="resource-email">{c.email}</span></>}</div>:<div className="resource-pending"><b>对接人待补充</b><small>{r.row[7]}</small><span>资源能力及联系人需企业确认</span></div>}
 </article>;})}</div>
 {selected&&<div className="modal-mask"><section className="modal draft-modal come-demo-conversation" role="dialog" aria-label="COME3.0样例对话"><div className="modal-heading"><div><small>COME3.0 · 样例</small><h2>{selected.contact.name} · {selected.contact.employeeId}</h2></div><button className="icon-button" aria-label="关闭COME样例" onClick={()=>setSelected(null)}><X/></button></div><p className="notice">演示会话入口，未连接COME，未发送任何消息。</p><div className="come-demo-context"><b>{selected.row[0]}</b><p>关联商机：{answer.scope?.objectId||'当前商机'}</p><p>希望协调：{selected.row[4]}</p><small>准备资料：{selected.row[6]}</small></div><textarea aria-label="COME样例消息" placeholder="在这里准备对接内容（仅样例，不发送）"/><small>联系人、部门及邮箱均为界面演示用途，不代表资源授权或排期。</small></section></div>}
 </section>;
}
