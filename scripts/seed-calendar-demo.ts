import {allRecords,record,saveRecord,db,now} from '../apps/server/src/db.ts';
import {users,canAccess} from '../apps/server/src/crm.ts';
import {businessDay} from '../packages/workbench.ts';
const today=businessDay(now()),date=(offset:number)=>new Date(Date.parse(today+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);
const titles=['客户需求与场地条件确认会','储能方案技术澄清会','项目里程碑与责任分工会','客户采购计划沟通会','投标材料内部评审会','并网条件与实施计划讨论','项目周例会','商务条款沟通会'];
let created=0;for(const user of users().filter(u=>u.role==='sales')){const projects=allRecords('opportunity').filter(p=>canAccess(user,p.customerId)&&p.ownerId===user.id);if(!projects.length)continue;for(let i=0;i<titles.length;i++){const project=projects[i%projects.length],day=date([0,0,1,2,4,6,10,17][i]),id='ACT-CALENDAR-DEMO-'+user.id+'-'+today+'-'+i;if(record(id))continue;saveRecord({id,type:'activity',customerId:project.customerId,entityType:'opportunity',entityId:project.id,name:'[演示] '+titles[i],description:'日历演示会议：'+project.name+'。仅用于展示日、周、月安排。',scheduledAt:day+'T'+(i%2?'14:30':'09:00')+':00+08:00',status:'planned',createdBy:user.id,ownerId:user.id,updatedAt:now(),demo:true});created++;}}
console.log(JSON.stringify({day:today,created}));db.close();
