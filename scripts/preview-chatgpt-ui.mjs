/**
 * [INPUT]: 已构建组件和官方 MCP Apps AppBridge
 * [OUTPUT]: 仅回环地址的本机模拟宿主，支持状态、主题与语言预览
 * [POS]: 人工布局验收入口；不连接 BeatAPI，不产生查询或生成费用
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const host = `import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
const frame = document.querySelector('iframe');
let bridge, calls = 0;
const input = {reference:'model:minimax-h3-normal',task_id:'local-preview-only'};
function fixture() {
 const state = document.querySelector('#state').value;
 if (state === 'research') return {structuredContent:{data:{request_id:'local-preview-only',output:{items:[{keyword:'video api',search_volume:1200,difficulty:24,source:'https://beatapi.io'},{keyword:'image api',search_volume:null,difficulty:0}],items_total:12,country:'US',language:'en',observation_date:'2026-11-05'},usage:{cost_usd:0.01}}}};
 if (state === 'failed') return {isError:true,structuredContent:{error:{message:'Local preview: first-frame mode uses the first image’s aspect ratio. Choose a matching first frame or reference-image mode.'}}};
 return {structuredContent:{data:{id:input.task_id,model:'MiniMax H3 Normal',status:state,poll_after_seconds:1,output:state==='succeeded'?{media:[{type:'video',url:'https://media.beatapi.io/outputs/task_gJX9Fi5hXKFUrVP0BEmkrTv0WWy85Sgw/0.mp4'}]}:{},usage:{}}}};
}
async function publish() {
 if (!bridge) return;
 bridge.setHostContext({theme:document.querySelector('#theme').value,locale:document.querySelector('#language').value});
 await bridge.sendToolInput({arguments:document.querySelector('#state').value==='research'?{reference:'data:seo.keyword_overview',request_id:'local-preview-only'}:input});
 await bridge.sendToolResult(fixture());
}
bridge = new AppBridge(null,{name:'Local preview',version:'1.0.0'},{serverTools:{},openLinks:{}},{hostContext:{theme:'light',locale:'zh-CN'}});
bridge.oninitialized = publish;
bridge.onsizechange = ({height}) => frame.style.height = Math.max(height,250)+'px';
bridge.oncalltool = async ({name,arguments:args}) => {
 if (!['beatapi_get_capability_task','beatapi_get_capability_result'].includes(name) || (args.task_id??args.request_id)!=='local-preview-only') throw new Error('Only the existing preview result can be read');
 document.querySelector('#calls').textContent=String(++calls);
 await new Promise(resolve=>setTimeout(resolve,200));
 return fixture();
};
for (const select of document.querySelectorAll('select')) select.onchange=publish;
await bridge.connect(new PostMessageTransport(frame.contentWindow,frame.contentWindow));
frame.src='/widget';`;
const bundled = await build({ stdin: { contents: host, resolveDir: root }, bundle: true, write: false, format: "esm", platform: "browser" });
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BeatAPI local preview</title><style>body{margin:0;background:#f4f5f6;font:14px system-ui;color:#17191c}header{padding:16px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;border-bottom:1px solid #ddd}label{display:flex;gap:6px;align-items:center}main{max-width:780px;margin:24px auto;padding:0 12px}iframe{width:100%;border:0;display:block}p{margin:0}select{padding:6px}</style></head><body><header><strong>LOCAL PREVIEW</strong><label>State<select id="state"><option value="processing">Processing</option><option value="succeeded">Existing video</option><option value="research">Research fixture</option><option value="failed">Failure</option></select></label><label>Theme<select id="theme"><option>light</option><option>dark</option></select></label><label>Language<select id="language"><option>zh-CN</option><option>en</option><option>ja</option></select></label><p>Read-only calls: <span id="calls">0</span></p></header><main><iframe title="BeatAPI results"></iframe></main><script type="module" src="/host.js"></script></body></html>`;
const server = createServer((req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (!["/", "/host.js", "/widget"].includes(path)) { res.writeHead(404).end(); return; }
  res.setHeader("Content-Type", path === "/host.js" ? "text/javascript" : "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(path === "/host.js" ? bundled.outputFiles[0].text : path === "/widget" ? readFileSync(resolve(root, "dist/chatgpt-ui/results.html")) : html);
});
server.on("error", error => { if (error.code === "EADDRINUSE") server.listen(0, "127.0.0.1"); else throw error; });
server.listen(4781, "127.0.0.1", () => console.log(`BeatAPI local preview: http://127.0.0.1:${server.address().port}`));
