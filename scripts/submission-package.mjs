/**
 * [INPUT]: 依赖本地 Codex manifest 与 package 版本；不继承本地 MCP 接线。
 * [OUTPUT]: 提供 Skill 草稿 manifest 生成与公开字段结构校验。
 * [POS]: submission 构建与测试共享的纯数据边界，防止本地配置进入公共 ZIP。
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
export function createSkillDraftManifest(local, version, releaseNotes) {
  const manifest = {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: local.name,
    version,
    description: "BeatAPI workflows for configured MCP or local CLI environments.",
    author: local.author,
    homepage: local.homepage,
    repository: local.repository,
    license: local.license,
    keywords: local.keywords,
    extensions: {
      "com.openai": {
        interface: {
          ...local.interface,
          longDescription:
            "Use BeatAPI to discover model and data capabilities, inspect input contracts, and carry out user-authorized media workflows. Check balance and task progress, retrieve results, and handle actionable API errors. This Skills-only draft does not supply an MCP connection and requires compatible BeatAPI MCP tools already supplied by the host. The synchronized Skill references beatapi@0.4.0, which was unavailable in the public npm registry when checked on 2026-10-07; its CLI fallback is blocked until the canonical Skill and a published CLI agree. Future CLI setup uses authentication outside chat and an absolute BEATAPI_CLI_PATH. Service calls may consume the user's BeatAPI balance. Never paste API keys into conversations. Local execution and persistent credentials require additional public-directory review; building this package does not establish submission eligibility.",
        },
        publication: { release_notes: releaseNotes },
      },
    },
  };
  validateSkillDraftManifest(manifest);
  return manifest;
}

export function validateSkillDraftManifest(manifest) {
  const ui = manifest.extensions?.["com.openai"]?.interface;
  if (!ui) throw new Error("Missing public interface metadata.");
  for (const [field, max] of Object.entries({ displayName: 30, shortDescription: 30, longDescription: 4000 })) {
    if (typeof ui[field] !== "string" || !ui[field].trim() || ui[field].length > max) {
      throw new Error(`Invalid ${field}: must contain 1-${max} characters.`);
    }
  }
  for (const field of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    const url = new URL(ui[field]);
    if (url.protocol !== "https:" || url.username || url.password || url.href.length > 1024) {
      throw new Error(`Invalid public URL: ${field}.`);
    }
  }
  if (manifest.apps != null || manifest.extensions["com.openai"].apps != null || manifest.mcpServers != null || manifest.skills != null) {
    throw new Error("Portable Skill drafts must not inherit host-specific wiring.");
  }
  const prompts = Array.isArray(ui.defaultPrompt) ? ui.defaultPrompt : [ui.defaultPrompt];
  if (prompts.length > 3 || prompts.some((p) => typeof p !== "string" || !p.trim() || p.length > 128 || /[\r\n]/.test(p))) {
    throw new Error("Invalid starter prompts.");
  }
  if (new Set(prompts.map((p) => p.trim().replace(/\s+/g, " "))).size !== prompts.length) {
    throw new Error("Duplicate starter prompts.");
  }
}
