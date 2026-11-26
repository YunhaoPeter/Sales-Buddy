import React from 'react';
const time=(v:string)=>v?new Date(v).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
export function ProfileTimeline({field,module,onEdit}:any){
 const entries=(field?.entries||[]).filter((e:any)=>e.status!=='disabled').sort((a:any,b:any)=>String(b.event?.occurredOn||b.event?.recordedAt||b.source?.at||b.updatedAt).localeCompare(String(a.event?.occurredOn||a.event?.recordedAt||a.source?.at||a.updatedAt)));
 return <div className="project-event-timeline" aria-label="项目关键事项时间线">{entries.length?entries.map((e:any)=><article className="project-event" key={e.id}>
  <div className="project-event-meta"><time>{e.event?.occurredOn||'日期待确认'}</time><span className={'project-event-status '+e.status}>{({effective:'已确认',pending_verification:'销售陈述 · 待核实',conflict:'存在冲突'} as any)[e.status]||'待核实'}</span></div>
  <h4>{e.event?.title||'项目关键事项'}</h4><p>{e.content}</p>{e.event?.impact&&<p className="project-event-impact">推进影响：{e.event.impact}</p>}{e.alternative&&<p className="profile-conflict">新陈述待核：{e.alternative.content}</p>}
  <footer><small>记录于 {time(e.event?.recordedAt||e.source?.at||e.updatedAt)}</small>{module.canEdit&&<button aria-label={'修正事项：'+(e.event?.title||e.content)} onClick={()=>onEdit(module,field,e)}>修正</button>}</footer>
  {e.source&&<details><summary>{e.source.kind==='assessment'?'评估确认依据':'查看对话依据'}</summary><blockquote>{e.source.quote}</blockquote><small>{e.source.messageId} · {time(e.source.at)}</small></details>}
 </article>):<p className="profile-empty">尚无关键事项。对话中明确的客户决定、关键结果或节点变化会整理在这里。</p>}</div>;
}
