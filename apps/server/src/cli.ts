import {seed} from './seed.ts';import {reindex,initKnowledge} from './knowledge.ts';
const cmd=process.argv[2];if(cmd==='reset'&&!process.argv.includes('--confirm=RESET_MOCK')){console.error('仅重置Mock数据。确认后执行：npm run scenario:reset -- --confirm=RESET_MOCK');process.exit(1);}seed(cmd==='reset');if(cmd==='reindex')reindex();else initKnowledge();console.log(cmd+' completed');

