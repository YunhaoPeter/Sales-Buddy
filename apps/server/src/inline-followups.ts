export const INLINE_FOLLOWUPS_PROMPT=`最终回答先输出销售可见的Markdown正文，再在最末尾输出一个且仅一个如下代码块：
\`\`\`salesbuddy-followups
{"questions":[{"question":"用户可以进一步讨论的完整问题","entityIds":["当前上下文中的实体ID"]}]}
\`\`\`
生成2至3个基于本次提问、回答结论与当前客户/项目实体的进一步问题。不要重复已回答内容或固定功能菜单，不编造事实。问题完整表述，不缩写为短标题，不为按钮长度刻意精简；每题围绕一个清晰主题，可包含必要背景。entityIds只引用当前可信上下文中的客户、项目或CRM记录ID。除非主问题要求，否则不推荐数据清理。不得返回创建指令。问候或简单确认可返回questions空数组。该代码块仅供应用解析，不在正文重复列出这些问题。`;
export function splitInlineFollowups(raw:string):{text:string;questions:any[]}{
 const pattern=/```salesbuddy-followups\s*\n([\s\S]*?)(?:```|$)/g;
 let questions:any[]=[];
 const text=raw.replace(pattern,(_,json)=>{try{const value=JSON.parse(json.trim());if(Array.isArray(value.questions))questions=value.questions;}catch{}return '';}).trim();
 return{text,questions};
}
