// [INPUT] BeatGEO's authenticated local MCP server. [OUTPUT] A stdio proxy of its actual permitted tool catalog.
// [POS] Workspace transport bridge. [PROTOCOL] No database writes, redirects, remote hosts or raw error logging.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { endpoint, readToken } from './connection.mjs';
const url=endpoint(process.env.BEAT_GEO_MCP_URL);
const client=new Client({name:'beatgeo-harness',version:'0.1.0'});
const server=new Server({name:'beatgeo',version:'0.1.0'},{capabilities:{tools:{}}});
const token=()=>readToken(process.env.BEAT_GEO_MCP_KEY_FILE,process.env.BEAT_GEO_MCP_TOKEN);
const safeFetch=async(input,init)=>{
  const target=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
  if(target.origin!==url.origin||target.pathname!==url.pathname)throw new Error('Unexpected MCP destination.');
  const headers=new Headers(init?.headers);headers.set('Authorization',`Bearer ${await token()}`);
  return fetch(input,{...init,headers,redirect:'error'});
};
let stage="credential";
async function main(){
  await token();
  stage="handshake";
  await client.connect(new StreamableHTTPClientTransport(url,{fetch:safeFetch}));
  server.setRequestHandler(ListToolsRequestSchema,async (request,extra)=>client.listTools(request.params,{signal:extra.signal}));
  server.setRequestHandler(CallToolRequestSchema,async (request,extra)=>{try{return await client.callTool(request.params,undefined,{signal:extra.signal});}catch{return{isError:true,content:[{type:'text',text:'BeatGEO operation failed. Check the local workspace, key scope and operation state before retrying.'}]};}});
  server.onclose=()=>{void client.close();};
  stage="stdio";
  await server.connect(new StdioServerTransport());
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{void Promise.allSettled([client.close(),server.close()]).then(()=>process.exit(0));});
main().catch(()=>{process.stderr.write(`BeatGEO ${stage} setup unavailable. `);process.stderr.write('BeatGEO connection unavailable. Start the local product and configure a private dashboard-issued MCP key. The BeatAPI billing key is not an MCP workspace key.\n');process.exitCode=1;});
