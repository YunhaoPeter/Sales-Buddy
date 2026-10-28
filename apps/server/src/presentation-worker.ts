import {readFileSync,writeFileSync} from 'node:fs';
import {createPptx,renderPptx,assemblePptx,inspectPptx} from './presentation-engine.ts';
try{
 const request=JSON.parse(readFileSync(process.argv[2],'utf8'));
 let result:any;
 if(request.operation==='create')result=await createPptx(request.contents,request.output,request.previews);
 else if(request.operation==='render')result=await renderPptx(request.file,request.previews);
 else if(request.operation==='assemble'){result=await assemblePptx(request.selected,request.output);if(request.previews)await renderPptx(request.output,request.previews);}
 else if(request.operation==='inspect')result=await inspectPptx(readFileSync(request.file));
 else throw new Error('不支持的PPT处理操作');
 writeFileSync(request.result,JSON.stringify({ok:true,result}));process.exit(0);
}catch(e:any){console.error(String(e.message).slice(0,600));process.exit(1);}
