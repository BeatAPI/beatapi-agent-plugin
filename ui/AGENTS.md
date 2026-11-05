# ui/
> L2 | 父级: ../AGENTS.md

成员清单
view-model.mjs: 将真实工具结果投影为有限的媒体/研究视图，保留未知值、错误和样本边界；不执行操作或拼接来源 URL。
app.mjs: 官方 MCP Apps bridge 的内联组件，原生媒体、宿主能力感知下载、主题/语言与受限的只读刷新；不调用付费 start 或处理凭证。
styles.css: 紧凑内联结果布局、窄屏与暗色适配；稳定控件尺寸，不复用独立网站后台样式。

构建由 scripts/build-chatgpt-ui.mjs 负责，生成静态单文件 HTML，网关只嵌入该构建产物。
UI 不能作为鉴权、计费或执行成功的权威来源。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
