import {test} from 'node:test';import assert from 'node:assert/strict';
import {visibleStreamText} from '../apps/server/src/answer-stream.ts';
test('增量正文立即可见，私有追问代码块在任意分片边界都不泄露',()=>{
 const body='## 建议\n先核实并网条件。\n\n',tail='```salesbuddy-followups\n{"questions":[{"question":"下一步？"}]}\n```';let last='';
 for(const char of body+tail){last+=char;const visible=visibleStreamText(last);assert.ok(!visible.includes('salesbuddy'));assert.ok(!visible.includes('questions'));if(last.length<=body.length-2)assert.ok(visible.length>0);}
 assert.equal(visibleStreamText(body+tail),body.trimEnd());assert.equal(visibleStreamText('第一段'),'第一段');
});
test('普通可视化围栏和正文不被误吞',()=>{const text='```echarts\n{"type":"table"}\n```\n结束';assert.equal(visibleStreamText(text),text);});
