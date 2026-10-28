# 对话表格与ECharts输出协议
日期：2026-10-25。

## 历史修复
统一AnswerContent启用GFM，历史Markdown管道表格渲染为数据表卡；不改写原始消息。修复段落与标题粘连，代码块保持原样。宽表横向滚动，长单元格换行，支持搜索、8行分页与CSV导出；公式前缀转义。

## 新输出
Agent使用echarts代码块及严格JSON。type=table是本应用配套数据表组件协议，不是ECharts原生series；文字策略、证据和任务清单使用它。type=chart的option使用ECharts的bar/line/pie基础配置，由客户端白名单校验，SVG呈现，ResizeObserver适应栏宽变化并在卸载时释放实例。未知数值不改为0。
- table：title、columns[{key,label}]、rows[{字段:值}]、可选caption；最多20列200行。
- chart：title、option{xAxis:{data:[]},yAxis:{name},series:[{type,name,data:[]}]},可选caption。bar/line需要类别与数值一一对应；pie使用name/value项。
不执行模型生成的JS、formatter函数、HTML或外链图像。流式JSON未完成时显示生成状态；最终无效时保留原文并提示，不让整条回答消失。

## 验证
单元测试覆盖协议、异常数据、CSV及标题修复；浏览器验证最近真实回复、宽表、搜索、分页、CSV、ECharts SVG和异常回退。真实模型单条验证通过，见rich-output-live-result.json；不是30题业务验收。
