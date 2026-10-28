import {test,expect} from '@playwright/test';
test('Gulf客户先选项目，再按项目阶段逐项确认并更新画像',async({request})=>{
 const login=await(await request.post('/api/mock-session',{data:{userId:'U-020'}})).json(),headers={Authorization:'Bearer '+login.token};
 const c=await(await request.post('/api/conversations',{headers,data:{scope:{objectType:'customer',objectId:'C-AE-008',customerId:'C-AE-008'}}})).json();
 async function ask(question:string){const r=await request.post('/api/conversations/'+c.id+'/messages',{headers,data:{question}});expect(r.ok()).toBeTruthy();let answer:any;await expect.poll(async()=>{const h=await(await request.get('/api/conversations/'+c.id,{headers})).json();answer=h.messages.find((m:any)=>m.role==='assistant'&&m.userQuestion===question);return !!answer;},{timeout:30000}).toBe(true);return answer;}
 const first=await ask('分析当前现状，下一步怎么推？');expect(first.projectInterview.kind).toBe('choose_project');expect(first.text).toContain('OP-008');expect(first.text).toContain('OP-020');
 const picked=await ask('先看OP-008');expect(picked.projectInterview.targetScope.objectId).toBe('OP-008');expect(picked.projectInterview.firstUse).toBe(true);expect(picked.text).toContain('首次使用');expect(picked.projectInterview.focus.dimension).toBe('assessed_stage');
 await ask('是的');await expect.poll(async()=>{const p=await(await request.post('/api/project-portraits/resolve',{headers,data:{scope:{objectType:'opportunity',objectId:'OP-008',customerId:'C-AE-008'}}})).json();return p.fields.assessed_stage?.value;}).toContain('S2');
 const h=await(await request.get('/api/conversations/'+c.id,{headers})).json();expect(h.projectPortraitScope.objectId).toBe('OP-008');expect(h.messages.find((m:any)=>m.userQuestion==='是的').projectInterview.focus.dimension).toBe('technical');
});
