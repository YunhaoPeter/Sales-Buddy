import React,{lazy,Suspense,useMemo,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {parseVisualization,normalizeMarkdown,csvCell,type TableSpec} from '../../../packages/visualization';
const EChartView=lazy(()=>import('./EChartView'));
export function DataTable({spec}:{spec:TableSpec}){
 const [q,setQ]=useState(''),[page,setPage]=useState(0);
 const rows=spec.rows.filter(r=>spec.columns.some(c=>String(r[c.key]??'').toLowerCase().includes(q.toLowerCase())));
 const pages=Math.max(1,Math.ceil(rows.length/8)),current=Math.min(page,pages-1);
 function download(){const csv='\uFEFF'+[spec.columns.map(c=>csvCell(c.label)).join(','),...rows.map(r=>spec.columns.map(c=>csvCell(r[c.key])).join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=spec.title.replace(/[\\/:*?"<>|]/g,'_')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="answer-visual data-table-card" aria-label={spec.title}><div className="visual-heading"><div><span className="visual-tag">数据表</span><h4>{spec.title}</h4></div><button className="soft compact" onClick={download}>导出 CSV</button></div><div className="visual-toolbar"><input aria-label={'搜索表格：'+spec.title} placeholder="搜索当前表格…" value={q} onChange={e=>{setQ(e.target.value);setPage(0);}}/><small>{rows.length} / {spec.rows.length} 条</small></div><div className="answer-table-scroll" tabIndex={0} role="region" aria-label={spec.title+'，可横向滚动'}><table style={{minWidth:spec.columns.length>4?spec.columns.length*145:undefined}}><thead><tr>{spec.columns.map(c=><th scope="col" key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.slice(current*8,current*8+8).map((r,i)=><tr key={i}>{spec.columns.map(c=><td key={c.key}><ReactMarkdown remarkPlugins={[remarkGfm]}>{r[c.key]==null?'—':String(r[c.key])}</ReactMarkdown></td>)}</tr>)}</tbody></table>{!rows.length&&<p className="empty">没有匹配记录</p>}</div><div className="visual-footer"><small>{spec.columns.length>4?'宽表可横向滚动查看全部列':'单元格自动换行'}</small>{pages>1&&<div><button className="soft compact" disabled={!current} onClick={()=>setPage(current-1)}>上一页</button><span>{current+1} / {pages}</span><button className="soft compact" disabled={current+1===pages} onClick={()=>setPage(current+1)}>下一页</button></div>}</div>{spec.caption&&<p className="visual-caption">{spec.caption}</p>}</section>;
}
function textOf(node:any):string{return node.type==='text'?node.value:node.tagName==='br'?'\n':(node.children||[]).map(textOf).join('');}
function historicalTable(node:any):TableSpec{const rows:any[]=[];function walk(n:any){if(n.tagName==='tr')rows.push((n.children||[]).filter((c:any)=>c.tagName==='th'||c.tagName==='td').map(textOf));else (n.children||[]).forEach(walk);}walk(node);const [head=[],...body]=rows;return{type:'table',title:'数据表',columns:head.map((label:string,i:number)=>({key:'c'+i,label})),rows:body.map(cells=>Object.fromEntries(head.map((_:string,i:number)=>['c'+i,cells[i]??''])))};}
function VisualBlock({raw,streaming}:{raw:string;streaming:boolean}){
 const parsed=useMemo(()=>{try{return{spec:parseVisualization(raw)};}catch{return{spec:null};}},[raw]);
 if(!parsed.spec)return streaming?<div className="visual-pending" role="status">正在生成表格或图表…</div>:<div className="visual-invalid"><p>可视化数据格式不完整，以下保留原始内容。</p><pre><code>{raw}</code></pre></div>;
 return parsed.spec.type==='table'?<DataTable spec={parsed.spec}/>:<Suspense fallback={<div className="visual-pending">正在加载 ECharts…</div>}><EChartView spec={parsed.spec}/></Suspense>;
}
export function AnswerContent({content,streaming=false}:{content:string;streaming?:boolean}){
 return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
 table:({node})=><DataTable spec={historicalTable(node)}/>,
 pre:({children})=>{const child=React.Children.toArray(children)[0];if(React.isValidElement<{className?:string;children?:React.ReactNode}>(child)&&/^language-echarts?$/.test(child.props.className||''))return <VisualBlock raw={String(child.props.children||'')} streaming={streaming}/>;return <pre>{children}</pre>;}
 }}>{normalizeMarkdown(content)}</ReactMarkdown>;
}
