import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
// Full P11 export/render tests require a separately provisioned Artifact runtime.
const files=readdirSync('tests').filter(f=>f.endsWith('.test.ts')&&f!=='meetings.test.ts').sort().map(f=>'tests/'+f);
console.log('Portable suite: excludes meetings.test.ts (native presentation runtime required).');
const result=spawnSync(process.execPath,['--import','tsx','--test',...files],{stdio:'inherit',env:{...process.env,DOTENV_CONFIG_PATH:'.env.ci-not-present',EXA_SEARCH_ENABLED:'false'}});
if(result.error){console.error(result.error.message);process.exit(1);}process.exit(result.status??1);
