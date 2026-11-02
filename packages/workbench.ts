import type {Scope,SourceRef} from './contracts/index.ts';
export type CueFeedback='like'|'dislike'|null;
export type MagicCueItem={id:string;userId:string;scope:Scope;key:string;title:string;description:string;priority:number;rank?:number;sources:SourceRef[];createdAt:string;updatedAt:string;origin:'ai_generated';status:'in_progress'|'completed';feedback:CueFeedback};
export type DailyBriefing={id:string;userId:string;day:string;title:string;description:string;cueIds:string[];createdAt:string;origin:'ai_generated'};
export type WorkbenchGeneration={id:string;userId:string;day:string;status:'running'|'completed'|'failed';startedAt:string;completedAt?:string;error?:string};
export function businessDay(value:string|Date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
export function businessHour(value:string|Date=new Date()){return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hourCycle:'h23'}).format(new Date(value)));}
