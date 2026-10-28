import {z} from 'zod';
export const scopeSchema=z.object({objectType:z.enum(['customer','lead','opportunity']),objectId:z.string().min(1),customerId:z.string().min(1)});
export type Scope=z.infer<typeof scopeSchema>;
export type Mode='replay'|'live';
export type User={id:string;name:string;role:'sales'|'manager'|'admin';teamId:string};
export type RecordData={id:string;type:string;customerId:string;name:string;updatedAt:string;[key:string]:unknown};
export type SourceRef={recordId:string;entityType:string;title:string;customerId:string;updatedAt:string;capturedAt:string;sourceKind:string;excerpt?:string;[key:string]:unknown};
export type Step={id:string;title:string;status:'pending'|'running'|'completed'|'failed'|'waiting_confirmation'};
export type Workbench={scope:Scope;goal:string;steps:Step[];sources:SourceRef[];dataStatus:string};
export type SuggestedAction={id:string;actionType:'followup'|'analyze'|'generate_plan'|'prepare_communication'|'prepare_task'|'prepare_activity'|'prepare_progress'|'create_task_draft'|'create_activity_draft';label:string;goal:string;presentation?:'question'|'create';entityIds?:string[]};
export function isCreateAction(action:Pick<SuggestedAction,'actionType'>){return ['create_task_draft','create_activity_draft','prepare_progress'].includes(action.actionType);}
export type Draft={id:string;version:number;kind:'task'|'activity'|'lead_progress'|'opportunity_progress';scope:Scope;fields:Record<string,unknown>;status:string;answerId:string;userId:string;[key:string]:unknown};
export class AppError extends Error{constructor(public code:string,message:string,public http=400){super(message)}}
export const stageNames=['线索导入','需求引导','机会点跟踪','售前项目','投标','合同','交付','验收','回款'];
export const stages=stageNames.map((name,i)=>({id:`S${i}`,name,entityType:i===0?'lead':'opportunity'}));
