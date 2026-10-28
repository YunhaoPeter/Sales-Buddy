import {test} from 'node:test';
import assert from 'node:assert/strict';
import {splitInlineFollowups} from '../apps/server/src/inline-followups.ts';
test('同轮输出拆分正文与完整追问，保留图表及长问题',()=>{
 const question='针对当前客户的采购评审背景，'.repeat(20)+'下一次沟通应如何推进？';
 const body='## 建议\n确认下一评审节点。\n```echarts\n{"type":"table"}\n```';
 const result=splitInlineFollowups(body+'\n```salesbuddy-followups\n'+JSON.stringify({questions:[{question,entityIds:['OP-UK-026']}]})+'\n```');
 assert.equal(result.text,body);assert.equal(result.questions[0].question,question);
});
test('追问格式损坏或缺失不会污染销售正文',()=>{
 assert.deepEqual(splitInlineFollowups('正常正文\n```salesbuddy-followups\n{坏数据'),{text:'正常正文',questions:[]});
 assert.deepEqual(splitInlineFollowups('正常正文'),{text:'正常正文',questions:[]});
});
