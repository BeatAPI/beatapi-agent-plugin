/**
 * [INPUT]: 上轮已发布公开快照、同源能力契约、统一展示刷新/紧凑投影
 * [OUTPUT]: 精确保留 988 个工具及约束的扫描快照、独立诊断 ZIP 和逐项证据
 * [POS]: 仅本地准备，不刷新目录范围、不读取凭证、不部署网关
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { reviseRemoteTools, compactRemoteCatalog, schemaAssertions } from "../../scripts/remote-metadata.mjs";

const dir=fileURLToPath(new URL(".",import.meta.url));
const source=JSON.parse(readFileSync(resolve(dir,"../artifacts/mcp-scan-controls-20261108/catalog-snapshot.json")));
const contracts=JSON.parse(readFileSync(resolve(dir,"../../dist/submission/local-repair-catalog.contracts.json")));
const findings=JSON.parse(readFileSync(resolve(dir,"../artifacts/mcp-scan-controls-20261108/actionable-findings.json")));
const revised={...structuredClone(source),tools:reviseRemoteTools(source.tools,contracts)};
const candidate=compactRemoteCatalog(revised);
assert.equal(candidate.tools.length,source.tools.length);
const changes=[];
const renames=[];
for(const [i,old] of source.tools.entries()) {
  const tool=candidate.tools[i];
  for(const key of ["inputSchema","outputSchema"]) assert.deepEqual(schemaAssertions(tool[key]),schemaAssertions(old[key]),`${old.name} ${key}`);
  for(const key of ["annotations","securitySchemes","_meta"]) assert.deepEqual(tool[key],old[key],`${old.name} ${key}`);
  const finding=findings.find(f=>f.name===old.name);
  if(tool.name!==old.name)renames.push({oldName:old.name,name:tool.name,reference:tool._meta["beatapi/capability"].reference});
  if(finding) {
    assert.notEqual(tool.description,old.description,old.name);
    if(finding.reason.includes("name"))assert.notEqual(tool.name,old.name,old.name);
    changes.push({oldName:old.name,name:tool.name,reference:tool._meta["beatapi/capability"].reference,title:tool.title,description:tool.description,previousReason:finding.reason});
  }
}
assert.equal(new Set(candidate.tools.map(t=>t.name)).size,candidate.tools.length);
assert.equal(changes.length,53);
assert.deepEqual(candidate.resources,source.resources);
assert.deepEqual(candidate.contents,source.contents);
const out=resolve(dir,"../artifacts/mcp-metadata-revision-20261108");mkdirSync(out,{recursive:true});
const json=JSON.stringify(candidate);
writeFileSync(join(dir,"snapshot.json"),json);
writeFileSync(join(out,"candidate-snapshot.json"),json);
writeFileSync(join(out,"53-tool-changes.json"),JSON.stringify(changes,null,2));
writeFileSync(join(out,"all-tool-renames.json"),JSON.stringify(renames,null,2));
const before=Buffer.byteLength(JSON.stringify(source.tools)),after=Buffer.byteLength(JSON.stringify(candidate.tools));
const report={generatedAt:new Date().toISOString(),toolCount:candidate.tools.length,reviewedChanges:changes.length,renamedTools:renames.length,reviewedToolRenames:changes.filter(c=>c.name!==c.oldName).length,beforeBytes:before,afterBytes:after,reductionPercent:Number(((1-after/before)*100).toFixed(2)),candidateSha256:createHash("sha256").update(json).digest("hex"),allInputAndOutputAssertionsEqual:true,allFixedReferencesScopesAnnotationsAndUIEqual:true};
writeFileSync(join(out,"preservation-report.json"),JSON.stringify(report,null,2));
const stage=join(out,"package");mkdirSync(join(stage,"assets"),{recursive:true});
copyFileSync(resolve(dir,"../../assets/icon.png"),join(stage,"assets/icon.png"));
const manifest={
  $schema:"https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",name:"beatapi-metadata-revision",version:"0.1.0",
  description:"Private metadata-only scan diagnostic. Not for publication.",author:{name:"Logiavox LLC",url:"https://beatapi.io"},license:"MIT",
  extensions:{"com.openai":{interface:{displayName:"BeatAPI Metadata Revision",shortDescription:"Private metadata diagnostic",longDescription:"Temporary metadata-only scan diagnostic. No business execution, account access or paid requests. Do not publish or submit for review.",developerName:"Logiavox LLC",category:"Developer Tools",capabilities:["Read"],websiteURL:"https://beatapi.io",supportURL:"https://github.com/BeatAPI/beatapi-agent-plugin/issues",privacyPolicyURL:"https://beatapi.io/privacy-policy",termsOfServiceURL:"https://beatapi.io/terms-of-service",logo:"./assets/icon.png",composerIcon:"./assets/icon.png"},publication:{release_notes:"Private metadata revision diagnostic. Not a production release."}}},
};
writeFileSync(join(stage,"plugin.json"),JSON.stringify(manifest,null,2));
writeFileSync(join(stage,"mcp.json"),JSON.stringify({$schema:"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",mcpServers:{diagnostic:{type:"streamable-http",url:"https://api.beatapi.io/mcp/scan-controls/single-text",extensions:{"com.openai":{auth:{type:"none"}}}}}},null,2));
execFileSync("zip",["-X","-q","-r",join(out,"metadata-revision.zip"),"plugin.json","mcp.json","assets"],{cwd:stage});
console.log(report);
