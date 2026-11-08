# MCP 元数据本地修复与影响评估

> 2026-11-08。仅本地实现和验证；未提交 Git、未推送、未部署、未修改线上配置、未上传门户、未提交审核，未发起付费任务。

## 核心实现

- `scripts/remote-schema.mjs` 统一公共输入策略、Schema 遍历、注解投影、输出 envelope 和自校验。只遍历 Schema 关键字，不把 examples/default 中的业务对象当成 Schema。
- 不匹配类型的 default 删除公开注解，不把字符串改成数字，也不改后台默认值。OpenAPI 命名示例解包为值；不合法的示例不发布。自定义 image-size 格式转为说明，原 pattern 保留。
- password/writeOnly 或凭证字段按同一规则排除整个能力，而不是悄悄删除字段后继续执行。编译器与发布校验共用规则，防止手工目录绕过。
- 每个执行、任务/结果读取、匿名发现工具均有 outputSchema。只约定网关真实 envelope，data 保留任意 JSON 形态，不伪造不同模型的结果字段。
- 构建器在写文件前自校验，显式 `--gateway-dir` 同源导出目录和 `result_schema.json`。Ajv 与 ajv-formats 改为直接固定的开发依赖，无新依赖版本下载或升级。
- 网关 MCP 层给旧目录缺失的 outputSchema 补共享 envelope，已有声明保留并校验；不要求旧目录立即迁移。新内置目录已修正注解、输出声明及秘密输入暴露。
- UI 资源补独立沙箱 origin `https://beatapi-agent-toolkit.oaiusercontent.com`。匿名发布预检现在分页读取工具及关联 HTML，验证输出声明、独立域、MIME 和既有最小 CSP；仍拒绝 tools/call、凭证、端点跳转及业务操作。

## 影响范围

本地网关目录以提交 `a67bdb6702118d8ad228daeb39c3aba7b0a940c2` 为基线，通过共享 Schema 投影修正，不混入这次公开目录抓取发现的新模型、重命名和 schemaHash 更新。

- 原 985 个目录工具改为 984 个，加 2 个匿名发现工具共 986 个。
- 唯一删除的公开 MCP 能力是 `data:youtube.web_v2.get_video_streams_v3`，其 proxy_url 声明 password/writeOnly。原 REST 接口不变。
- 其余 982 个执行绑定的 reference、operation、schemaHash、mode、statusSupported 完全相同。
- 其余工具 title、description、风险标记、OAuth scope、UI 绑定元数据逐项不变。
- 去除注解及已知 image-size 格式后，全部保留工具的输入验证约束与基线深度相等。调用值不转换，pattern、enum、required、条件约束均保留；未增加比例或模型专用限制。
- 原 REST、原生客户端三工具、价格/计费、OAuth、Origin 白名单、任务归属与幂等执行链代码未改。权限及支付结果仍由原网关实现负责。
- 目录 JSON 的较大行数差异主要来自每个工具新增共享输出声明和示例规范化，不是数百个新功能。

另用本轮匿名公开 Search 快照运行完整编译，987 个目录工具（加发现工具共 989）也通过本地校验及 Go SDK 分页；这一较新清单仅留在 dist 做兼容验证，未替换上述范围不变基线。

## 回归结果

- `npm run verify` 通过：48 个主测试、16 个 Harness 测试；含类型、同步锁、UI 构建、stdio MCP、发布源和跨宿主校验。
- 新增/扩展：非法 default、命名示例、对象示例不误判、格式与 pattern、输入及原对象不变、嵌套秘密输入和手工篡改目录拒绝、共享导出一致性、缺失发现输出声明、UI 域/MIME/CSP 失败、扫描不调用业务。
- `go test -race ./service/beatmcp -count=1` 通过；含旧目录补声明、已有声明保留、错误声明拒绝、数据对象/数组/null、错误 envelope 和真实 MCP 资源/刷新鉴权。
- 完整基线目录指定 `TEST_BEAT_MCP_CATALOG_PATH` 后，真实 Go SDK 分页读取全部 986 个工具通过；较新公开快照 989 个工具同样通过，无业务执行。
- router 的 MCP 钱包/OAuth/幂等、任务归属及关闭时路由回归共 3 项通过，使用临时 SQLite、回环 HTTPS 和模拟上游。
- 两仓库 `git diff --check` 通过；本地完整日志：`dist/submission/local-mcp-verify.log`。
- 初次普通沙箱测试因禁止监听 127.0.0.1 返回 EPERM；允许本机 mock 监听后原测试通过，没有为绕过环境限制删除测试或改业务实现。

## 仍须区分

这些修复消除了本地已确认的兼容性缺陷，不足以证明它们就是 OpenAI `Tool scan failed: The server encountered an internal error` 的唯一根因，更不代表线上扫描已通过。

独立 UI origin 是待联调配置值，尚未观察到 ChatGPT 接受并渲染该值；不代表我们拥有该 oaiusercontent 域名，也未进行 DNS 配置。依据官方 [MCP 参考](https://developers.openai.com/plugins/reference) 的宿主元数据要求，最终仍须以实际宿主验证为准。

后续发布前须确认网关实际选中的是内置目录还是后台上传目录。旧上传目录缺 outputSchema 会获兼容补充，但其中已有错误注解、秘密输入或旧输出声明不会被运行时偷偷重写，仍须审核并切换到新构建目录。公开契约存在既有清单漂移，若选择刷新全量目录，应另审新增/移除项，不能把更新模型混入本次元数据修复。

下一阶段须经用户授权才可部署、重新连接/宿主联调并重跑同一草稿扫描；当前不执行这些动作。

## 本地产物摘要

- 网关 `catalog_default.json` SHA-256：`4e0998e3689e11de23a9c69ea62d66849afab46e67e82337701f78dece332051`
- 网关 `result_schema.json` SHA-256：`ed58f49343f075bc75ba44b1428c07cde3845d9b18766e02d7f8045e852e9ea7`
- 范围不变目录：`dist/submission/local-repair-baseline-catalog.json`。
- 较新公开快照与编译结果：`dist/submission/local-repair-catalog.contracts.json`、`dist/submission/local-repair-current-validated.json`。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
