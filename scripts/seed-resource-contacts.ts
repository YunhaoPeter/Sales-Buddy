import {initNavigatorKnowledge,seedResourceContactExamples} from '../apps/server/src/navigator-knowledge.ts';
import {db} from '../apps/server/src/db.ts';
await initNavigatorKnowledge();console.log('Resource contact demo preparation:',seedResourceContactExamples());db.close();
