import React,{useEffect,useRef,useState} from 'react';
import * as echarts from 'echarts/core';
import {BarChart,LineChart,PieChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,LegendComponent,AriaComponent} from 'echarts/components';
import {SVGRenderer} from 'echarts/renderers';
import {type ChartSpec} from '../../../packages/visualization';
echarts.use([BarChart,LineChart,PieChart,GridComponent,TooltipComponent,LegendComponent,AriaComponent,SVGRenderer]);
export default function EChartView({spec}:{spec:ChartSpec}){
 const el=useRef<HTMLDivElement>(null),[error,setError]=useState('');
 useEffect(()=>{if(!el.current)return;const chart=echarts.init(el.current,undefined,{renderer:'svg'});const pie=spec.option.series.every(s=>s.type==='pie');try{chart.setOption({animation:false,color:['#5c61ff','#29b5a2','#f5ad4a','#8896bb'],aria:{enabled:true},tooltip:{trigger:pie?'item':'axis',renderMode:'richText'},legend:{top:4},grid:{left:65,right:30,top:50,bottom:75},...(!pie?{xAxis:{...spec.option.xAxis,axisLabel:{interval:0,rotate:(spec.option.xAxis?.data.length||0)>6?25:0,overflow:'truncate',width:100}},yAxis:{type:'value',...spec.option.yAxis}}:{}),series:spec.option.series.map(s=>({...s,...(s.type==='pie'?{radius:['28%','60%'],center:['50%','55%']}: {})}))});setError('');}catch{setError('图表无法呈现，请查看下方数据。');}const observer=new ResizeObserver(()=>chart.resize());observer.observe(el.current);return()=>{observer.disconnect();chart.dispose();};},[spec]);
 return <section className="answer-visual chart-card" aria-label={spec.title}><div className="visual-heading"><div><span className="visual-tag">ECharts</span><h4>{spec.title}</h4></div></div>{error&&<p role="alert">{error}</p>}<div ref={el} className="echart-canvas" role="img" aria-label={spec.title}/>{spec.caption&&<p className="visual-caption">{spec.caption}</p>}<details className="chart-data"><summary>查看图表数据</summary><div className="answer-table-scroll"><table><thead><tr><th>系列</th><th>类别</th><th>数值</th></tr></thead><tbody>{spec.option.series.flatMap((s,si)=>s.data.map((d,i)=><tr key={si+'-'+i}><td>{s.name||'系列'+(si+1)}</td><td>{d&&typeof d==='object'?d.name:spec.option.xAxis?.data[i]}</td><td>{d===null?'未知':typeof d==='object'?d.value:d}</td></tr>))}</tbody></table></div></details></section>;
}
