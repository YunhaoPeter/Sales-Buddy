# MCP合同与验证
端点：http://127.0.0.1:3001/mcp
协议：官方TypeScript SDK 1.x，Streamable HTTP（无状态、JSON响应）。另有 npm run mcp:stdio。
HTTP调用需要Mock会话的Bearer令牌。stdio通过MCP_USER_ID选择演示用户（默认U-018）。

## 查询
search_customers、get_customer、get_customer_organization、list_contacts、list_leads、get_lead、list_opportunities、get_opportunity、list_lead_progress、list_opportunity_progress、list_business_activities、list_tasks、list_customer_news、list_meeting_records、list_evidence_documents、get_records_by_refs。

列表输入：customerId、scope、query、stage、status、cursor、limit（最多30）。
单条输入：id。来源查询：ids（最多30）。
结果：status、records、recordRefs、nextCursor、total（列表）、requestId、asOf。

## 创建
create_task、create_business_activity、create_lead_progress、create_opportunity_progress。
输入：scope、fields、confirmationToken。
确认凭证由应用在用户确认草稿后发放，与身份、对象、草稿版本、字段及工具绑定。
重试凭证使用同一结果账本，不重复创建。字段不匹配或草稿已变更时拒绝。

不提供改阶段、完成待办、创建商机、发送邮件等Agent工具。
工具错误包括FORBIDDEN、NOT_FOUND、INVALID_ARGUMENT、TIMEOUT、UPSTREAM_UNAVAILABLE、CONFLICT、UNSUPPORTED_CAPABILITY。

## 实测
自动集成测试启动真实临时HTTP MCP服务并用官方Client连接，验证查询、创建与回查、越权、伪造确认、重复提交、响应丢失及工具故障。
stdio入口可启动；外部Inspector交互未纳入本轮浏览器测试。

