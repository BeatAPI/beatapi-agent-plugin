# 六项展示修复正式发布与复扫

> 2026-11-09，北京时间。按用户授权先备份与核对回滚，再上线六项已诊断修复、刷新同一正式草稿并扫描；不提交审核。

后续：本轮四项抖音反馈与随后四项星图修复已另获授权在 `243229fdf` 正式发布；最新正式扫描见 `MCP-FORMAL-EIGHT-RELEASE-2026-11-09.md`，本文件保留原轮次结果。

## 结果

- main 提交 `1dcbae3a8e7eb3d36c4b90f692922c947daeeb1b` 已推送并部署。[工作流 42612207984](https://github.com/fengshao1227/beat-new-api/actions/runs/42612207984) success，日志 20:02:27 确认 `green live at 1dcbae3a8`，公共健康 200，匿名 Craft 路由按预期要求认证。
- 正式端点完整 **986 个描述符**与独立诊断过的六项修复候选逐项相等，982 个固定执行绑定保留；所有参数、权限、共享指引、读取枚举和 UI 保留。
- 同一正式草稿扫描 **986/986 complete**，共享 instructions complete 且无 findings，problem=null、activeRun=null，没有 unknown。
- 六项名称/说明目标的 **全部 findings 均为空**。两个发现工具的“执行未公开操作”具体指控未再出现，但各保留一条通用 needs_investigation 提示；不能说它们已经获准发布。
- 本轮另标记 **4 条抖音工具名称反馈**，以及 **151 条通用进一步审核提示**，allToolsPass=null。四个工具的定义本轮未修改，不等于出现四项新运行故障；仍须核实其名称语义。
- 门户保持 Configured / Authorized / Domain verified / Not submitted / Not published。未提交审核、申诉或发布。

## 备份与回滚

本轮基于远端最新成功部署 `4db0f1a66b73860f1b571c8685c68763a8a02663`，保留其旧容器后台退役修复，不使用过期分支覆盖它。

备份位于 `artifacts/mcp-formal-six-release-20261109/`：

- `catalog-before.json`：发布前 986 内置目录逐字备份，SHA256 `5ba6ad38fcb5f6e843e0c6255af7f2c04a7c58d8973fe662896f16230ef6fcba`。
- `result-schema-before.json`：未改动的结果声明备份，SHA256 `225091fad6e7cd31bc81275de0569af3d28b926c5f78577a8b7d3a08b0ab6141`。
- 两份备份与基线 Git 对象逐字相等；另保存发布前线上完整目录、指引/组件快照及当前正式草稿 ZIP。
- `rollback.patch` 反向检查通过，但未实际执行回滚。

回滚须在最新主线上只 revert 本次 `1dcbae3a8` 提交并走现有蓝绿流程，或只恢复本轮目录备份并同步模块地图后提交部署。不能 reset/强推旧版本，也不能撤销独立的部署或业务修复。完整步骤见 `ROLLBACK.md`；恢复网关后还需核对旧目录并重新扫描同一草稿，OpenAI 已保存的定义不会自动回退。没有数据库迁移，不声称已执行生产回滚演练。

## 改动与验证

网关提交仅两文件：`service/beatmcp/catalog_default.json` 与 `service/beatmcp/AGENTS.md`。目录保留既有单空格格式，避免整份 JSON 格式化噪音；差异只有六项 name/title/description 及四个绑定键名。

生产前后按稳定 reference 对照：六项展示变化、四个技术名迁移、另 980 个 SDK 描述符完整相等。全部 input/output Schema、默认值、枚举、nullable、边界、additionalProperties、幂等约束、scopes、annotations、schemaHash、执行模式与绑定值不变。未改网关运行代码、数据库、OAuth、价格/计费、任务归属、原 REST、本地工具或 UI。四个旧技术名不自动提供别名，客户端需刷新发现结果。

本轮重新通过 18 项展示/保真回归、完整 MCP race 回归（显式加载候选并使用真实 SDK）、三项隔离 router race 回归、反向补丁与 diff 检查。正式镜像构建及蓝绿健康门禁通过。不把定向回归说成全仓库测试。

正式元数据读回通过后启动扫描；Actions 随后完成旧连接 drain 并成功退出。旧 blue 仍有一条连接时由既有部署脚本转为后台退役，本轮没有修改或中断该部署机制。

## 同一草稿更新

保留 `plugin_asdk_app_6aed1b32cb0c81919339954cee14a350`、app、beatapi MCP key、正式 endpoint、`beatapi-chatgpt` OAuth 和原 0.4.0 草稿。

重新下载当前公开 ZIP，核对 5 个正向、3 个负向案例及 MCP 配置：案例涉及的工具全部存在，包与 Skill 没有引用本轮四个旧名称。因此不重复上传相同 ZIP，不重置声明或审核账号字段；通过同一草稿 Rescan 刷新 MCP 定义。门户保存的 986 个 action_name/title/description/input/output Schema、annotations 和认证声明与新目录逐项相等，共享指引相等。

门户初次出现动态模块拉取失败，恢复后才继续；首次 ZIP 下载等待超时后检查页面并重试，最终下载成功。这些均不是重扫请求；正式 Rescan 只触发一次，没有重连账户或读取审核凭证。

## 正式扫描记录

- scan：`asdk_app_6aed1b32cb0c81919339954cee14a350~AppsSDKContinuousScan_f3405b6b0e548191bf333accd521af13`。
- attempt：`01a1c02f-349f-7e10-9866-067d7f183666`。
- Rescan 20:01:17；scan_time 20:04:02；completedAt 20:05:25。
- 六项修复目标均 complete 且全部 findings 为空；两个发现工具仅有通用复核提示，不再有隐藏执行的具体理由。

新标记的四项均为“工具名不清楚”，原说明如下，尚未在本轮继续修改：

| reference | 原说明 |
| --- | --- |
| data:douyin.app.v3.fetch_multi_video_high_quality_play_url | 批量获取视频的最高画质播放链接 |
| data:douyin.app.v3.fetch_share_info_by_share_code | 根据分享口令获取分享信息 |
| data:douyin.app.v3.fetch_video_high_quality_play_url | 获取视频的最高画质播放链接 |
| data:douyin.app.v3.generate_douyin_video_share_qrcode | 生成抖音视频分享二维码 |

四项定义均与发布前逐字段相等，依据在 `new-findings.json`。151 条通用提示与四条具体反馈分开统计；不通过删能力、放松参数或更改权限来规避扫描。

扫描结束后再次匿名读取全量 986 描述符、指引和 UI，仍与发布候选相等，健康与域名验证均为 200。完整证据见 `comparison.json`、`portal-after.json`、`verification.json`、`release.json` 和 `post-scan-health.json`。本轮止于部署与正式重扫，未提交审核或继续修改这四项新反馈。

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
