export type MessageOrigin='user_input'|'suggestion_click'|'tool_shortcut'|'system'|'legacy_unknown';
export type MemorySource={id:string;text:string;origin:MessageOrigin;createdAt:string;userId:string;scope:any;answerId?:string;questionContext?:{dimension:string;question:string;crmStage:string}|null};
export function isInternalText(text:string){return /不生成创建表单|不创建记录|只返回JSON|字段只能来自模板|请结合当前客户或项目的信息|根据本轮建议准备|仅记录用户已明确反馈|CRM可执行动作|结构化表格.*完成判定|(?:回归|组件|布局|日志)验证/.test(text);}
export function classifyLegacyMessage(message:any,run?:any):MessageOrigin{
 if(message.origin)return message.origin;
 if(run?.parentAnswerId||isInternalText(message.content||''))return 'legacy_unknown';
 // Old storage did not distinguish typed text from system-created messages.
 // Only explicit self-statements with human provenance can be proposed for reconstruction.
 return 'legacy_unknown';
}
