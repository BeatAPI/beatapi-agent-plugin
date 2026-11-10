# 独立扫描对照

用户授权的临时测试，不提交审核。独立 Worker 和独立插件草稿，不修改正式端点或正式草稿。

固定路径变体：baseline 为一个最小只读工具；single-text/single-ui 为相同真实工具的无 UI/原 UI 对照；full-text/full-ui 为完整真实目录的无 UI/原 UI 对照。所有客户端看到相同元数据，不按 UA 或身份隐藏功能。

真实描述符来自匿名公开快照；移除 UI 时只去除 UI 关联元数据与资源。保留其他 Schema 和授权声明，因此完整目录仍包含 OAuth 工具声明，诊断连接本身匿名。此测试只定位元数据扫描，不证明 OAuth 或业务运行通过。tools/call 永远拒绝，不转发、不计费。

`npm run prepare` 匿名读正式目录，生成 snapshot.json 和 artifacts 中的独立 ZIP；`npm test`、`npm run deploy:check` 后才可部署。按单变量顺序更新同一诊断草稿并扫描，每次保存 scan/attempt 和日志。结束删除本 Worker 的精确路由，保留正式路由与验证路由。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md

后续命名/说明修订使用 `node prepare-candidate.mjs`，直接投影上轮已发布快照，强制核对全部工具参数/默认值/权限/UI 不变。不能使用另一次较新全量编译结果替换它，因为能力范围及任务/结果引用枚举可能已经漂移。旧基线始终保存在 artifacts 中，候选只写本模块生成快照和独立证据目录。

实际门户不允许修改既有 MCP URL/集合，且新增服务器中只有首个获得可操作的关联 App。保留基线草稿和独立矩阵草稿，使用矩阵已连接的 `/single-text` 作为稳定诊断槽；由部署配置 `ACTIVE_CONTROL` 明确选择变体。所有客户端看到同一变体，每次保留 Worker 版本及 scan/attempt，扫描完成后才切下一组。此设置只作用于独立诊断槽，不作用于正式 MCP，也不是按客户端隐藏工具。

`count-only` 将最小基线描述符复制为 988 个唯一名称，用于单独检验数量；它不包含真实目录的 Schema、OAuth 声明或 UI，不能用其结果证明真实目录内容兼容。

数量对照完成后，`slice-起点-终点` 可在同一固定快照上做无 UI 的连续区间对照，区间采用左闭右开索引并校验边界。不修改任何被选描述符的业务 Schema，避免将累计体积与特定工具问题混为一谈。

完整目录的聚合对照使用 `prepare-aggregate.mjs --profile shared-guidance`，与正式构建共享同一个执行指引投影；原参数说明和约束/UI 均保留。`--padding 64` 只添加诊断元数据；`--profile repeated-guidance` 保留共享 instructions 并恢复原工具描述符，用于反向复现；`annotation-minimal` 是单独的极限说明注解对照，不得充作发布候选，本轮未部署该变体。

`--refresh-presentation --revision v2` 显式应用本地用途词典修订并另建证据目录。已有扫描响应的快照禁止被不同内容覆盖。先做原样对照，再做文案修订，不能同时更换工具集合、参数和 UI 后宣称找到某一个根因。扫描完成只意味着没有 unknown，不意味着可发布或通过审核。
