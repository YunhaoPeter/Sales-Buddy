const themes:[string,RegExp][]=[
 ['company',/company overview|company introduction|company profile|corporate|supplier profile|公司介绍|企业介绍|公司概况|企业概况|公司概览|企业概览|公司概述|公司简介|企业简介|公司实力|企业实力|关于我们/ig],
 ['product',/product|portfolio|selection|battery and power|产品|选型|电池与/ig],
 ['agenda',/welcome|objectives|agenda|meeting purpose|priorities|欢迎|议程|交流目标|会晤目标|本次目标/ig],
 ['needs',/requirements|needs|baseline|application|operating objectives|需求|应用场景|项目理解|基线/ig],
 ['architecture',/architecture|system design|system solution|system building blocks|control and communication|系统架构|技术方案|解决方案/ig],
 ['interface',/interface|scope of supply|boundaries|responsibilit|供货|接口|责任|边界/ig],
 ['delivery',/delivery|coordination|milestones|dependencies|交付|协同|里程碑|排期/ig],
 ['safety',/safety|certification|test evidence|安全|认证|测试/ig],
 ['service',/service|operations|maintenance|warranty|售后|运维|服务|质保/ig],
 ['commercial',/commercial|procurement|investment|value assessment|tariff|商务|采购|投资|电价|收益/ig],
 ['case',/case stud|case discussion|comparable project|project reference|案例|项目经验/ig]
];
export function slideThemes(text:string){return new Set(themes.filter(([,r])=>{r.lastIndex=0;return r.test(text);}).map(([id])=>id));}
const stop=new Set(['the','and','with','this','that','for','from','what','how','our','your','of','to','in','on','a','an','是','的','与','和','如何','本次','客户']);
export function matchTerms(text:string){return [...new Set((text.toLowerCase().match(/[a-z0-9]{3,}|[\u4e00-\u9fff]{2,}/g)||[]).filter(t=>!stop.has(t)))];}
export function topicalScore(target:any,slide:any){
 const primary=slideThemes(target.title),all=slideThemes(target.title+' '+target.question+' '+target.direction),source=slideThemes(slide.title);
 const shared=[...primary].filter(t=>source.has(t)),secondary=[...all].filter(t=>source.has(t));
 const titleTerms=matchTerms(target.title),body=(slide.title+' '+slide.text).toLowerCase(),overlap=titleTerms.filter(t=>body.includes(t));
 if(primary.size&&!shared.length)return null;
 if(!primary.size&&!secondary.length&&overlap.length<2)return null;
 const score=Math.min(98,45+shared.length*18+secondary.length*4+Math.min(overlap.length,4)*3+(primary.size&&shared.length===primary.size?10:0));
 return {score,shared:shared.length?shared:secondary};
}
