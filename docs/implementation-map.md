# 建设方案执行映射
日期：2026-10-25。原方案保留，以下记录实际代码位置与完成状态。

|里程碑|状态|实现与证据|
|---|---|---|
|M0 业务与接口基线|完成首版|packages/contracts、docs/data-model.md、docs/mcp-contract.md|
|M1 Mock CRM与真实MCP|完成本地验证|apps/server/src/db.ts、seed.ts、crm.ts、mcp.ts；真实HTTP测试|
|M2 知识与阶段规则|基线完成，专家审核待办|knowledge目录、knowledge.ts；30来源摘要+45归纳卡、9阶段、四区域|
|M3 第一条live闭环|代码完成，运行被配置阻塞|model.ts、agent.ts；需本地填写API配置，执行0题|
|M4 P10前端完整交互|核心旅程完成|apps/web/src/main.tsx、style.css；3条浏览器验收及截图|
|M5 持续记忆与后台|首版完成|memory.ts；用户/对象隔离、版本、审核、排除、失败重试|
|M6 评估与交付|本地验收完成，模型/业务验收待办|65项测试、生产构建、浏览器报告；live-results明确blocked|

## 主要工程取舍
使用SQLite/FTS5与单个Express进程，便于本机启动和数据检查。统一物理记录表不合并线索和商机身份。无需为全部销售问题预设独立Prompt；使用统一Agent、阶段Profile、业务手册、工具合同和动作类型。动态模型输出经参数校验与用户确认才可写CRM。Replay仅用于演示工程链路。

## 接手顺序
1. 阅读README及acceptance-report；启动本地应用，按scenario-guide体验。
2. 配置在线模型并验证一条live链路，检查MCP日志、来源、记忆和确认后创建。
3. 运行30题在线评估；技术通过和专家业务评分分开。
4. 补充真实产品边界、案例、阶段SOP、商务政策、区域合规资料并审核知识。
5. 按mcp-contract替换真实CRM适配；做用户认证、权限与生产部署验收。
