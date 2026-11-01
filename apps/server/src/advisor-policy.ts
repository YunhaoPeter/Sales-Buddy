import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
export const ADVISOR_PROMPT_VERSION=4;
export const advisorPolicy=readFileSync(resolve('prompts/战略参谋.md'),'utf8');
