import {test,expect} from '@playwright/test';
async function login(page:any,request:any){const session=await(await request.post('/api/mock-session',{data:{userId:'U-018'}})).json();await page.addInitScript((token:string)=>localStorage.setItem('sb-token',token),session.token);return{Authorization:'Bearer '+session.token};}

test('普通对话与领航员输入区在手机和PC使用相同尺寸和样式',async({page,request})=>{
 await login(page,request);
 for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
  await page.setViewportSize(viewport);await page.goto('/home');
  await page.getByRole('navigation',{name:viewport.width<820?'移动端主导航':'主导航',exact:true}).getByRole('button',{name:'对话',exact:true}).click();
  await expect(page.getByLabel('普通对话输入')).toBeVisible();
  const measure=()=>page.locator('.chat-composer').evaluate(el=>{const s=getComputedStyle(el),t=getComputedStyle(el.querySelector('textarea')!),b=getComputedStyle(el.querySelector('.send')!);return{height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width,radius:s.borderRadius,padding:s.padding,border:s.borderColor,font:t.fontSize,input:t.height,button:b.width};});
  const general=await measure();await page.goto('/advisor/opportunity/OP-UK-026');await page.getByRole('button',{name:'新建对话',exact:true}).click();await expect(page.getByLabel('发送问题')).toBeVisible();const navigator=await measure();
  if(viewport.width<820)expect(general.width).toEqual(navigator.width);expect(general.width).toBeLessThanOrEqual(680);expect(navigator.width).toBeLessThanOrEqual(680);const {width:gw,...gs}=general,{width:nw,...ns}=navigator;expect(gs).toEqual(ns);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('移动M乘P默认展示当前建议，浏览不修改阶段，并可展开完整矩阵',async({page,request})=>{
 const headers=await login(page,request),scope=encodeURIComponent(JSON.stringify({objectType:'opportunity',objectId:'OP-UK-026',customerId:'C-UK-0086'}));
 const state=await(await request.get('/api/navigator/state?scope='+scope,{headers})).json();
 await page.route('**/api/navigator/state?*',async route=>{const response=await route.fetch();const p=await response.json();await route.fulfill({json:{...p,assessed:true,stages:{M:'M2',P:'P2',T:'T1'}}});});
 await page.setViewportSize({width:390,height:844});await page.goto('/advisor/opportunity/OP-UK-026');await page.getByRole('button',{name:'新建对话',exact:true}).click();await page.locator('.navigator-composer-bubbles').getByRole('button',{name:'MPT画布',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'项目画像矩阵',exact:true}),explorer=dialog.getByLabel('移动端M乘P阶段浏览');
 await expect(explorer.getByLabel('所选阶段建议')).toContainText('M2 × P2');await expect(explorer.getByLabel('所选阶段建议')).toContainText('当前项目');await expect(dialog.locator('.nav-matrix-scroll')).toBeHidden();
 await explorer.getByLabel('浏览M阶段').selectOption('M4');await explorer.getByLabel('浏览P阶段').selectOption('P1');
 await expect(explorer.getByLabel('所选阶段建议')).toContainText('M4 × P1');await expect(explorer.getByLabel('所选阶段建议')).toContainText('浏览阶段');
 await explorer.getByRole('button',{name:'回到当前'}).click();await expect(explorer.getByLabel('所选阶段建议')).toContainText('M2 × P2');
 await explorer.locator('.mpt-mini-map summary').click();await expect(explorer.locator('.mpt-mini-grid button')).toHaveCount(36);
 await explorer.getByRole('button',{name:'查看M3与P4阶段建议',exact:true}).click();await expect(explorer.getByLabel('所选阶段建议')).toContainText('M3 × P4');
 expect(await explorer.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await explorer.getByRole('button',{name:'回到当前'}).click();await dialog.evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:'runtime/reports/screenshots/mobile-mpt-explorer.png'});
 await explorer.getByRole('button',{name:/展开完整矩阵/}).click();await expect(dialog.locator('.nav-matrix-scroll')).toBeVisible();
 await explorer.getByRole('button',{name:/收起完整矩阵/}).click();await expect(dialog.locator('.nav-matrix-scroll')).toBeHidden();
 const after=await(await request.get('/api/navigator/state?scope='+scope,{headers})).json();expect(after.stages).toEqual(state.stages);expect(after.version).toEqual(state.version);
 await page.setViewportSize({width:1440,height:1000});await expect(explorer).toBeHidden();await expect(dialog.locator('.nav-matrix-scroll')).toBeVisible();
});
