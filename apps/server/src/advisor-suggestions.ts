import type {Scope,User} from '../../../packages/contracts/index.ts';
export type ResponsePurpose='analysis'|'task_suggestions'|'activity_plan';
export function responsePurpose(question:string):ResponsePurpose{if(/待办|任务建议|任务清单/.test(question))return'task_suggestions';if(/准备.*活动|活动.*准备|商务活动|会议准备/.test(question))return'activity_plan';return'analysis';}
export const suggestionInstructions:Record<ResponsePurpose,string>={analysis:'直接解决本次销售问题，约1000字以内，行动最多8项。',task_suggestions:'整理当前客户/项目的可执行待办建议，按优先级说明找谁、做什么、产出和完成判定。最多8项，参考已有任务但不罗列全部记录。数据维护只在确有必要时末尾简短提醒。仅生成建议，不生成表单或记录。',activity_plan:'准备针对当前客户/项目的商务活动计划，重点给目标、核心参会角色、会前准备、关键议题及预期产出；约1000字，最多8个动作。不要展开证据盘点、全部联系人和后台约束。未知标待确认，仅生成计划。'};
const table=(title:string,columns:string[],rows:any[],caption:string)=>'```echarts\n'+JSON.stringify({type:'table',title,columns:columns.map((label,i)=>({key:'c'+i,label})),rows:rows.map(row=>Object.fromEntries(row.map((v:any,i:number)=>['c'+i,v]))),caption})+'\n```';
export function replaySuggestions(purpose:ResponsePurpose,scope:Scope,object:any,assessment:any,records:any[],u:User){
 const contacts=records.filter(r=>r.type==='contact'),tasks=records.filter(r=>r.type==='task'),activities=records.filter(r=>r.type==='activity'),progress=records.filter(r=>['lead_progress','opportunity_progress'].includes(r.type));
 const actions:string[]=assessment.actions||[];const at=new Date(Date.now()+3*86400000).toISOString();
 let text='## '+object.name+'：'+(purpose==='task_suggestions'?'下一步待办建议':'商务活动准备计划')+'\n\n';
 text+='本轮根据实际读取的'+progress.length+'条进展、'+tasks.length+'条待办、'+activities.length+'条商务活动和'+contacts.length+'位联系人准备建议。'+(scope.objectType==='customer'?'客户级建议需确认具体项目归属，各项目保持独立。':'CRM阶段为 **'+object.stage+'**；'+assessment.status+'。')+'以下内容仅供讨论，尚未创建CRM记录。\n\n';
 if(progress.length)text+='### 已知沟通背景\n'+progress.slice(0,3).map(r=>'- '+r.content+' ['+r.id+']').join('\n')+'\n\n';
 const fields:any[]=[];
 if(purpose==='task_suggestions'){
 if(tasks.length)text+='### 已有待办核对\n'+table('实际读取的已有待办',['记录','标题','状态','后续处理'],tasks.slice(0,12).map(r=>[r.id,r.title||r.name,r.status||'未知','先核对是否覆盖本轮目标，标题相似不直接认定重复']),'只列实际读取记录，不代表所有待办；完成、关闭或合并需由授权流程处理。')+'\n\n';
 const rows=actions.slice(0,3).map((title,i)=>{const exact=tasks.filter(r=>(r.title||r.name)===title&&r.status!=='completed'&&(scope.objectType!=='customer'||!r.entityId));const output=(assessment.questions?.[i]||'明确客户当前需求与下一决定')+'；取得客户反馈或确认资料';if(!exact.length)fields.push({title,description:'建议依据：'+(assessment.items||[]).map((x:any)=>x.title+'：'+x.status).join('；')+'。预期产出：'+output+'。创建前请核对是否已有同目标任务。',assigneeId:u.id,dueAt:at,priority:i===0?'P1':'P2'});return[title,exact.length?'优先核对/复用已有任务':'候选新增，先核对现有任务',i===0?'优先':'随后','销售主责，相关角色待确认',output,exact.map(r=>r.id).join('、')||'无精确同名匹配；不代表没有相关任务'];});
 text+='### 建议清单\n'+table('下一步待办建议',['建议事项','处理方式','优先顺序','建议责任','产出与完成判定','关联已有记录'],rows,'截止日期、实际负责人及必要性需确认；没有创建、关闭或修改任何任务。')+'\n\n下一步可继续调整优先级和内容；如确需新增，点击绿色“创建待办草稿”审阅字段，最终确认后才写入CRM。';
 }else{
 const goal=actions[0]||'核实客户目标与下一决策节点';const topic=object.name+'｜'+goal;
 text+='### 活动目标与参与人\n目标：'+goal+'，确认当前证据缺口及双方下一步承诺。\n\n';
 text+=contacts.length?contacts.slice(0,6).map(c=>'- '+c.name+' · '+(c.title||'角色待确认')+' ['+c.id+']；是否需要参会及决策权限待核实。').join('\n'):'技术、采购/业务、必要时财务角色待确认，不补造姓名。';
 text+='\n\n### 会前准备\n'+table('商务活动准备清单',['准备事项','主责角色','预期产出'],[['核对最近进展与既有活动','销售','确认此次沟通不重复，目标与上次反馈一致'],['整理需求基线、范围接口和证据缺口','销售与售前','客户待确认事项及资料清单'],['确认客户参会角色、日期和时区','销售','客户认可的参会及排期']],'排期尚待双方确认；当前MCP不发送邀请。')+'\n\n';
 text+='### 建议议程\n'+table('建议会议议程',['顺序','议题','关键问题','产出'],[['1','确认项目变化和沟通目标','近期需求、预算、计划有什么变化？','双方认可的本次目标'],['2',goal,assessment.questions?.[0]||'还缺哪些关键信息？','客户确认的证据或补证计划'],['3','评审路径与下一步',assessment.questions?.[1]||'谁负责何时作出下一决定？','双方责任人、时间与可检查产出']],'时长和议题为建议，不构成已安排活动。')+'\n\n';
 text+='### 沟通与会后闭环\n建议开场：“我们先回顾已确认信息，再集中核实关键缺口，最后约定双方下一步。”\n\n会后区分客户确认、待核实与我方建议；只有实际发生的反馈才写进展。可继续调整计划，点击绿色“创建商务活动草稿”后再编辑字段，确认后才记录到CRM。';
 fields.push({title:topic.slice(0,200),description:'活动目标：'+goal+'。会前核对客户资料、已有活动与联系人。议程：确认变化；澄清证据缺口；确认采购/决策路径；约定双方下一步。预期产出：客户确认信息、未决项及具名负责人和时间。参会及排期需销售确认。',scheduledAt:at,activityType:'meeting'});
 }
 if(purpose==='task_suggestions'&&!fields.length)text=text.replace('下一步可继续调整优先级和内容；如确需新增，点击绿色“创建待办草稿”审阅字段，最终确认后才写入CRM。','当前建议均有精确同名的未完成任务，先核对与复用；本轮未提供新增草稿入口，可在对话中说明确需新增的事项。');
 return{text,fields};
}
