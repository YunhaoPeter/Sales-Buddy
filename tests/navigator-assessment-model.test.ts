import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdirSync,mkdtempSync} from 'node:fs';
import {resolve,join} from 'node:path';
test('正式模式MPT评估与更新零模型调用，最终确认才更新画像并保留原话',async()=>{
 mkdirSync(resolve('runtime/test-runs'),{recursive:true});const root=mkdtempSync(resolve('runtime/test-runs/data-test-assessment-direct-'));
 process.env.DATABASE_PATH=join(root,'app.sqlite');process.env.MEMORY_ROOT=join(root,'memory');process.env.SALES_BUDDY_TEST_MODE='0';
 let requests=0;const server=createServer((_req,res)=>{requests++;res.writeHead(500);res.end('An assessment must not call a model');});
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address() as any;process.env.MODEL_API_BASE_URL='http://127.0.0.1:'+address.port+'/v1';process.env.MODEL_API_KEY='fixture-local-only';process.env.MODEL_NAME='fixture-model';
 const D=await import('../apps/server/src/db.ts');
 try{
 const C=await import('../apps/server/src/crm.ts'),K=await import('../apps/server/src/navigator-knowledge.ts'),N=await import('../apps/server/src/navigator.ts'),P=await import('../apps/server/src/structured-profiles.ts');(await import('../apps/server/src/seed.ts')).seed();await K.initNavigatorKnowledge();const u=C.user('U-018'),scope={objectType:'opportunity' as const,objectId:'OP-UK-026',customerId:'C-UK-0086'};
 let a=N.startAssessment(u,scope,true),firstQuestion='';
 for(const stage of ['M1','P2','T2']){
  a=await N.answerAssessment(u,a.id,{revision:a.revision,stage});if(stage==='M1')firstQuestion=a.questions[0].title;
  a=await N.answerAssessment(u,a.id,{revision:a.revision,submit:true,answers:[{index:0,state:'confirmed',text:'用户填写的原始详细内容：此项已确认，其余尚不了解。'}]});
  assert.equal(a.round,0);assert.notEqual(a.status,'review');assert.deepEqual(a.results[stage[0]].followup,[]);assert.equal(N.navigatorState(u,scope).assessed,false);
 }
 assert.equal(a.status,'summary');assert.equal(requests,0);let p=N.confirmAssessment(u,a.id,a.revision);
 assert.deepEqual(p.stages,{M:'M1',P:'P2',T:'T2'});assert.equal(D.record(scope.objectId).stage,'S3');
 assert.ok(p.facts.some((f:any)=>f.title===firstQuestion&&f.description.startsWith('用户填写的原始详细内容')));assert.ok(p.facts.some((f:any)=>f.status==='unknown'&&f.description===''));
 const details=P.readStructuredProfile(u,'project',scope.objectId);assert.ok(details.assessmentAnswers.some((f:any)=>f.title===firstQuestion));assert.match(P.renderStructuredMarkdown(details),/我的MPT填写记录/);
 assert.equal(P.readStructuredProfile(C.user('U-ADMIN'),'project',scope.objectId).assessmentAnswers.length,0);
 const oldVersion=p.version;a=N.startAssessment(u,scope,true,{M:'M2',P:'P2',T:'T2'});assert.deepEqual(a.axes,['M']);
 a=await N.answerAssessment(u,a.id,{revision:a.revision,submit:true,answers:[{index:0,state:'unknown',text:'暂未取得可核对材料'}]});assert.equal(a.status,'summary');assert.equal(N.navigatorState(u,scope).version,oldVersion);
 p=N.confirmAssessment(u,a.id,a.revision);assert.deepEqual(p.stages,{M:'M2',P:'P2',T:'T2'});assert.equal(requests,0);assert.ok(p.facts.some((f:any)=>f.description==='暂未取得可核对材料'));
 }finally{D.db.close();await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
