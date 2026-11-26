type Any=any;
/** Presentation-only regrouping preserves original keys, versions, visibility and stored records. */
export function projectProfileModules(modules:Any[],record:Any,users:(id:string)=>Any){
 const by=(id:string)=>modules.find(m=>m.id===id),field=(key:string)=>modules.flatMap(m=>m.fields).find(f=>f.key===key);
 const label=(key:string,name:string)=>({...field(key),label:name});
 const crm=(key:string,name:string,value:any)=>({key,label:name,readOnly:true,crmValue:value===undefined||value===null?'':String(value),crmUpdatedAt:record.updatedAt,entries:[]});
 const person=(id:string)=>{try{return id?users(id).name+' · '+id:'';}catch{return id||'';}};
 const make=(id:string,title:string,base:Any,fields:Any[])=>({...base,id,title,fields:fields.filter(Boolean)});
 const overview=make('identity','项目概况',by('identity'),[
  field('identity.name'),field('identity.id'),field('identity.customer'),crm('identity.owner','主责销售',person(record.primarySalesId||record.ownerId)),
  crm('identity.pm','主责PM',person(record.primaryPmId)),crm('identity.pd','主责PD',person(record.primaryPdId)),
  field('identity.site'),crm('identity.power','功率（MW）',record.powerMw),field('identity.capacity'),
  label('background.description','项目背景'),label('background.application','客户建设目的'),label('background.value','客户价值目标'),label('background.scope','我方供货范围')]);
 const current=make('mpt','当前阶段',by('mpt'),[field('stages.current'),field('mpt.position'),field('mpt.basis'),field('mpt.procurement')]);
 const stage=field('stages.'+String(record.stage||'').toLowerCase());
 if(stage?.entries?.some((e:Any)=>e.status!=='disabled'))current.fields.push({...stage,label:'当前阶段情况'});
 const populated=by('facts').fields.filter((f:Any)=>!['facts.blockers'].includes(f.key)&&f.entries.some((e:Any)=>e.status!=='disabled'));
 const blockers=make('facts','当前卡点',by('facts'),[field('facts.blockers'),...populated]);
 const actions=make('focus','下一步行动',by('focus'),[label('focus.commitments','具体动作、责任人与日期'),label('focus.tasks','关联CRM待办')]);
 for(const key of ['focus.topics','focus.resources'])if(field(key)?.entries.some((e:Any)=>e.status!=='disabled'))actions.fields.push({...field(key),label:key==='focus.topics'?'已有关注记录':'已有协作记录'});
 return[overview,current,make('relationships','关键人物与竞争',by('relationships'),by('relationships').fields),blockers,actions,make('timeline','关键事项时间线',by('timeline'),by('timeline').fields)];
}
