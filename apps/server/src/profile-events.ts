import {createHash} from 'node:crypto';
import {z} from 'zod';
import type {MemorySource} from './message-source.ts';
import {businessDay} from '../../../packages/workbench.ts';
const eventSchema=z.object({eventId:z.string().optional(),title:z.string().trim().min(1).max(80),summary:z.string().trim().min(1).max(1000),quote:z.string().trim().min(1).max(1000),occurredOn:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),impact:z.string().max(300).optional()});
export function collectProfileEvent(d:any,raw:any,source:MemorySource){
 const parsed=eventSchema.safeParse(raw);if(!parsed.success)return false;const p=parsed.data;
 if(!source.text.includes(p.quote)||/[？?]|假设|如果|希望|建议|帮我|请问|请帮/.test(p.quote)||!/(已|确认|决定|调整|变更|延期|取消|取得|完成|收到|明确|批复)/.test(p.quote))return false;
 if(/计划|将于|将会|预计|定于/.test(p.quote)&&!/调整|变更|延期|取消|改为/.test(p.quote))return false;
 if(/(?:尚未|还没|没有|未曾)(?:确认|取得|收到|完成|批复)/.test(p.quote)&&!/(已提交|已完成|已取得|已确认|已收到|决定|变更|延期|取消)/.test(p.quote))return false;
 const key='timeline.events',entries=d.fields[key]||[],previous=p.eventId?entries.find((e:any)=>e.id===p.eventId):entries.find((e:any)=>e.source?.quote===p.quote);
 if(p.eventId&&!previous)return false;
 if(previous?.status==='disabled'||previous?.manualAt&&Date.parse(source.createdAt)<=Date.parse(previous.manualAt)||previous?.source?.at&&Date.parse(source.createdAt)<Date.parse(previous.source.at))return false;
 let occurredOn=p.occurredOn||null;
 if(occurredOn){const t=Date.parse(occurredOn+'T00:00:00Z');const explicit=p.quote.includes(occurredOn)||p.quote.includes(occurredOn.replace(/-/g,'/'))||p.quote.includes(Number(occurredOn.slice(5,7))+'月'+Number(occurredOn.slice(8))+'日');const today=businessDay(source.createdAt);if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==occurredOn||occurredOn>today||!explicit)occurredOn=null;}
 if(!occurredOn&&previous?.event?.occurredOn)occurredOn=previous.event.occurredOn;
 const event={title:p.title,occurredOn,impact:p.impact||previous?.event?.impact||'',recordedAt:previous?.event?.recordedAt||source.createdAt};
 if(previous?.content===p.summary&&JSON.stringify(previous.event)===JSON.stringify(event))return false;
 const entry={id:previous?.id||'event-'+createHash('sha256').update(source.userId+':'+source.scope.objectId+':'+p.quote).digest('hex').slice(0,24),content:p.summary,status:'pending_verification',source:{messageId:source.id,quote:p.quote,at:source.createdAt},updatedAt:new Date().toISOString(),event};
 const saved=previous?.status==='effective'&&previous.content!==entry.content?{...previous,status:'conflict',alternative:entry,updatedAt:entry.updatedAt}:entry;
 d.fields[key]=[...entries.filter((e:any)=>e.id!==entry.id),saved];d.changes.push({at:entry.updatedAt,field:key,entryId:entry.id,action:previous?'补充关键事项':'新增关键事项',content:entry.content,source:entry.source});return true;
}
export function conservativeProjectEvents(source:MemorySource){
 if(source.origin!=='user_input')return[];
 return source.text.split(/[。；;\n]/).map(x=>x.trim()).filter(x=>x.length>=6&&x.length<=1000&&/客户|采购|决策|并网|许可|资金|融资|评审|投标|招标|签约|合同|规模|容量|需求|供货/.test(x)&&/已确认|已取得|已完成|已提交|已收到|已批复|已决定|变更|调整|延期|取消/.test(x)).slice(0,3).map(quote=>({dimension:'event',title:/延期|调整|变更|取消/.test(quote)?'项目关键事项发生调整':/并网|接入/.test(quote)?'并网与接入取得新进展':/许可|批复/.test(quote)?'项目许可取得新进展':/资金|融资/.test(quote)?'项目资金情况更新':/采购|决策/.test(quote)?'客户确认采购与决策安排':/合同|签约/.test(quote)?'合同签约取得新进展':/评审|投标|招标/.test(quote)?'项目评审与招标进展更新':/需求|规模|容量|供货/.test(quote)?'客户确认需求与供货范围':'客户确认项目关键信息',summary:quote,quote,occurredOn:quote.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0]||null}));
}
export const PROFILE_EVENT_INSTRUCTION='projectUpdates还可使用blocker（只收当前影响推进的明确卡点，说明问题/已知情况/影响）、action（用户明确承诺的动作/对接人/责任人/日期/产出，未知留空）、contact（日常对接人）、supporter（实际支持行为）四种dimension，不能把AI建议提取为用户计划。另返回projectEvents数组，最多3项：{eventId?:string,title:string,summary:string,quote:string,occurredOn:string|null,impact?:string}。只记录本轮用户明确陈述且对项目推进有意义的已发生事件：需求/规模/供货范围变化，决策采购角色确认，关键条件取得结果，采购评审签约节点或日期调整，客户重要反馈决定。普通问答、AI建议、未来计划及仅描述未知不进入时间线。quote逐字引用本轮用户原话，事项日期只在原话明确给出实际发生日期时填YYYY-MM-DD，否则null，绝不能把消息日期当事项日期。影响无明确依据则留空。同一已存在事件的新细节用existingEvents中的eventId补充，不因措辞不同再新增；新的实质进展才追加。不要声称事件已独立核实。';
