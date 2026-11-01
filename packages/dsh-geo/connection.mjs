// [INPUT] Local MCP endpoint and private credential file. [OUTPUT] Validated connection material or a safe setup state.
// [POS] BeatGEO connection policy. [PROTOCOL] Loopback only; no credentials in tool arguments or diagnostics.
import { readFile, lstat } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
export function endpoint(value = 'http://localhost:3140/api/mcp') {
  const url = new URL(value);
  if(url.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||url.username||url.password||url.pathname!=='/api/mcp'||url.search||url.hash) throw new Error('Use a loopback HTTP /api/mcp endpoint without credentials, query or fragment.');
  return url;
}
export async function readToken(file, environmentToken) {
  if(environmentToken) return validToken(environmentToken);
  if(!file||!isAbsolute(file)) throw new Error('Configure an absolute private MCP credential file or the Harness credential reference.');
  let info, content;
  try {info=await lstat(file);if(info.isSymbolicLink()||!info.isFile()||info.size>8192)throw new Error();if(process.platform!=='win32'&&(info.mode&0o077))throw new Error();content=await readFile(file,'utf8');}catch{throw new Error('MCP credential file is unavailable or not private. Use an ordinary file with chmod 600.');}
  const match=content.match(/^BEAT_GEO_MCP_TOKEN\s*=\s*(.+)$/m);
  if(!match)throw new Error('Private file must contain BEAT_GEO_MCP_TOKEN=<dashboard-issued MCP key>.');
  return validToken(match[1].trim().replace(/^(['"])(.*)\1$/,'$2'));
}
function validToken(value){if(typeof value!=='string'||!value.trim()||value.length>4096||/[\r\n\x00-\x20]/.test(value))throw new Error('MCP credential is missing or invalid.');return value;}
