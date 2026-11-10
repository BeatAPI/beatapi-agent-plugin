/**
 * [INPUT]: Cloudflare 发往精确验证地址的 HTTP 请求
 * [OUTPUT]: GET/HEAD 的公开所有权 Token；其他地址和写请求明确拒绝
 * [POS]: 与业务网关隔离的纯静态验证响应，不持有密钥、不访问源站
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
const challengeURL = "https://api.beatapi.io/.well-known/openai-apps-challenge";
const token = "7hcq-PF2w8_e5fKtZnSOvhSDzBPS_ezdue8CH3zNU7I";

export default {
  fetch(request) {
    if (request.url !== challengeURL) return new Response("Not found", { status: 404 });
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    return new Response(request.method === "HEAD" ? null : token, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  },
};
