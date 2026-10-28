import {test} from 'node:test';
import assert from 'node:assert/strict';
import {strategyTopics,strategicDocuments,strategyResearchSources} from '../apps/server/src/strategic-knowledge.ts';
test('三类28个子分类完整，每类有独立活动、证据、产出和实践来源',()=>{assert.equal(strategyTopics.length,28);for(const [name,count] of [['定方向',10],['识风险',10],['递资源',8]] as const)assert.equal(strategyTopics.filter(t=>t.pillar===name).length,count);assert.equal(new Set(strategyTopics.map(t=>t.id)).size,28);for(const d of strategicDocuments){assert.ok(d.body.length>1000);for(const heading of ['事实与证据清单','关键活动','完成判定','适用边界','画像更新'])assert.ok(d.body.includes(heading),d.id+heading);assert.ok(d.researchSources!.every(s=>s.url.startsWith('https://')));assert.ok(d.researchSources!.length);}assert.ok(strategyResearchSources.length>=12);});
