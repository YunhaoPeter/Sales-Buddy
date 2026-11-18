import React,{useRef,useState} from 'react';
import {LocateFixed,ChevronDown,ChevronUp} from 'lucide-react';
import './mobile-mpt.css';
type Any=any;
const risk=(m:number,p:number)=>m>=4&&p<=2?'late':m===1&&p>=4?'pending':p>=4?'locked':p>=2?'grow':'explore';
const categories=[['explore','观察与核真'],['grow','培育'],['locked','重点投入'],['late','风险控投'],['pending','规则待补']];

export function MobileMptExplorer({knowledge,profile,full,onToggleFull}:{knowledge:Any;profile:Any;full:boolean;onToggleFull:()=>void}){
 const [m,setM]=useState(profile.stages.M||'M0'),[p,setP]=useState(profile.stages.P||'P0');
 const strategy=useRef<HTMLElement>(null);
 const selectCell=(m:string,p:string)=>{setM(m);setP(p);requestAnimationFrame(()=>strategy.current?.scrollIntoView({block:'start',behavior:'smooth'}));};
 const current=!!profile.assessed&&m===profile.stages.M&&p===profile.stages.P;
 const row=knowledge.matrix.find((r:string[])=>r[0]===m&&r[1]===p);
 const definition=(stage:string)=>knowledge.stages.find((r:string[])=>r[1]===stage);
 const locate=()=>{setM(profile.stages.M||'M0');setP(profile.stages.P||'P0');};
 return <section className="mobile-mpt-explorer" aria-label="移动端M乘P阶段浏览">
  <header><div><small>项目落地 × 订单归属</small><h3>M×P 阶段导航</h3></div>{profile.assessed&&<button type="button" onClick={locate}><LocateFixed size={14}/>回到当前</button>}</header>
  <p className="mpt-browse-note">{profile.assessed?`当前定位 ${profile.stages.M||'M待明确'} · ${profile.stages.P||'P待明确'}`:'尚未确认项目定位，以下仅供浏览'}<span>切换查看不会修改项目阶段</span></p>
  <div className="mpt-axis-selectors">{[['M','项目落地成熟度',m,setM],['P','订单归属',p,setP]].map(([axis,label,value,setValue]:Any)=><label key={axis}><span>{axis} · {label}</span><select aria-label={'浏览'+axis+'阶段'} value={value} onChange={e=>setValue(e.target.value)}>{knowledge.stages.filter((r:string[])=>r[0]===axis).map((r:string[])=><option key={r[1]} value={r[1]}>{r[1]} · {r[2]}</option>)}</select><small>{definition(value)?.[3]}</small></label>)}</div>
  <details className="mpt-mini-map"><summary>查看阶段定位图<span>点击格子查看建议</span></summary><div className="mpt-mini-grid" aria-label="简版阶段定位图"><span className="mpt-mini-origin">P ↑</span>{[0,1,2,3,4,5].map(i=><b key={'m'+i}>M{i}</b>)}{[5,4,3,2,1,0].map(j=><React.Fragment key={j}><b>P{j}</b>{[0,1,2,3,4,5].map(i=><button type="button" key={i} className={'risk-'+risk(i,j)+(m==='M'+i&&p==='P'+j?' selected':'')} aria-label={'查看M'+i+'与P'+j+'阶段建议'} aria-pressed={m==='M'+i&&p==='P'+j} onClick={()=>selectCell('M'+i,'P'+j)}>{profile.assessed&&profile.stages.M==='M'+i&&profile.stages.P==='P'+j?'●':m==='M'+i&&p==='P'+j?'✓':''}</button>)}</React.Fragment>)}</div><div className="mpt-mini-legend">{categories.map(([s,t])=><span key={s}><i className={'risk-'+s}/>{t}</span>)}</div><p>● 项目当前位置　✓ 正在浏览</p></details>
  <article ref={strategy} className={'mpt-mobile-strategy risk-'+risk(Number(m.slice(1)),Number(p.slice(1)))} aria-label="所选阶段建议">
   <div className="mpt-strategy-label"><b>{m} × {p}</b><span>{current?'当前项目':'浏览阶段'}</span></div>
   {row?<><h4>{row[2]}</h4><p>{row[3]}</p><section><h5>推进建议</h5><p>{row[4]||'暂无建议'}</p></section><section><h5>风险关注</h5><p>{row[5]||'暂无记录'}</p></section><section><h5>资源投入</h5><p>{row[6]||'暂无记录'}</p></section>{row[7]&&<div className="mpt-mobile-next"><h5>下一步</h5><p>{row[7]}</p></div>}</>:<p>此阶段组合暂未配置建议。</p>}
  </article>
  <button type="button" className="mpt-full-toggle" aria-expanded={full} onClick={onToggleFull}>{full?<ChevronUp size={15}/>:<ChevronDown size={15}/>} {full?'收起完整矩阵':'展开完整矩阵'}<small>横向对照所有阶段</small></button>
 </section>;
}
