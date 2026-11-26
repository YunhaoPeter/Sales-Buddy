/** Eleven-column Excel compatibility: channel is COME3.0 or 邮箱:<address>. */
export function resourceContact(row:string[]){
 const name=row[8]||'',employeeId=row[9]||'',raw=(row[10]||'').trim();
 const email=raw.match(/[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0]||'';
 const channel=email?'邮箱':/^COME3\.0$/i.test(raw)?'COME3.0':null;
 const available=!!name&&/^\d{6,12}$/.test(employeeId)&&!/[待补]/.test(name)&&!!channel;
 return{name,employeeId,channel,email,available,isDemo:/演示/.test(row[7]||'')||/demo|example/i.test(email)};
}
export function encodeResourceChannel(channel:string,email=''){
 if(channel==='COME3.0')return channel;
 if(channel==='邮箱'&&/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))return'邮箱：'+email;
 throw new Error('请选择COME3.0或填写有效邮箱');
}
