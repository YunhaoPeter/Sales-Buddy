# 数据模型与真实CRM映射
## 已实现的核心约束
- customer、lead、opportunity独立type与id，没有project实体。
- S0只允许lead；opportunity只允许S1—S8。
- lead_progress必须关联未转换lead；opportunity_progress必须关联opportunity。
- customer_id与entity_id受外键约束；Scope额外校验真实实体类型和客户归属。
- 创建字段白名单禁止覆盖ID、实体类型、客户、创建人及状态。
- Actor由本地会话令牌传入；模型工具参数不能指定身份。
- 转换由管理员控制台执行，保留原Lead、进展及转换关系。新对话应在商机中发起。
- 商机Memory可引用转化前线索的当前用户记忆，保留原始Scope。
- 转化前会话通过详情API的predecessorConversations返回；首版前端尚未提供单独的转化前历史分组导航。

## 主要表
records、users、documents、events、knowledge、knowledge_fts、metadata。
documents按collection存储会话、回答、工作台、运行、MCP日志、创建草稿/账本、Memory与版本、评估等。
使用一张文档集合表是本地Mock的简化，生产对接时应根据真实字段与性能要求拆表。

## 接入真实CRM前需要
各工具名称和Schema、分页、权限错误、负责人字段、创建必填项、真实幂等机制、线索转化映射、记录时间与版本规则。
目前资讯/会议/附件查询为可用Mock扩展，不代表真实CRM已提供对应接口。

