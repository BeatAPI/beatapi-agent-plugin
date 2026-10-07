/**
 * [INPUT]: 依赖 tools.ts 的固定工具定义，不读取远程能力目录
 * [OUTPUT]: 对外提供本地完整工具集与媒体审核候选工具集
 * [POS]: MCP 注册边界；限制审核范围，不改变网关权限或实现托管授权
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { toolDefinition, toolDefinitions } from "./tools.js";

export const mediaReviewTools = [
  "beatapi_list_workflows",
  "beatapi_get_usage",
  "beatapi_create_music_video",
  "beatapi_edit_music_video_shot",
  "beatapi_get_music_video_shot_media",
  "beatapi_compose_music_video",
  "beatapi_create_ecommerce_video",
  "beatapi_get_task",
] as const;

export function toolsForProfile(profile: string = "local") {
  if (profile === "local") return toolDefinitions;
  if (profile === "media-review") return mediaReviewTools.map(toolDefinition);
  throw new Error("Unknown MCP profile. Use local or media-review.");
}
