import {test} from 'node:test';
import assert from 'node:assert/strict';
import {partialMeetingReply} from '../packages/meeting-stream.ts';
test('会晤流只呈现reply，增量处理转义与未完成Unicode',()=>{
 assert.equal(partialMeetingReply('{"reply":"先明确\\n目标\\u4f60'), '先明确\n目标你');
 assert.equal(partialMeetingReply('{"reply":"先明确\\u4f'), '先明确');
 assert.equal(partialMeetingReply('{"reply":"讨论\\"角色\\"","ready":true,"brief":{"objective":"内部"}}'),'讨论"角色"');
 assert.equal(partialMeetingReply('{"ready":false}'),'');
});
