/**
 * [INPUT]: 完整修订候选、共享执行指引及 Schema 节点遍历
 * [OUTPUT]: 固定 988 能力/约束的单变量诊断快照与差异证明
 * [POS]: 仅诊断；删除参数说明的极限对照不作为发布候选
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { remoteExecutionGuidance } from "../../scripts/remote-presentation.mjs";
import { schemaAssertions, shareRemoteExecutionGuidance, reviseRemoteTools } from "../../scripts/remote-metadata.mjs";
import { schemaNodes } from "../../scripts/remote-schema.mjs";
const {values}=parseArgs({options:{profile:{type:"string"},padding:{type:"string"},"refresh-presentation":{type:"boolean"},revision:{type:"string"}}});
const profile=values.profile;
if(values.revision&&(!values["refresh-presentation"]||!/^[a-z0-9-]{1,32}$/.test(values.revision)))throw Error("Revision requires a presentation refresh and a safe artifact label");
if(!["shared-guidance","repeated-guidance","annotation-minimal"].includes(profile)) throw Error("Choose --profile shared-guidance, repeated-guidance or annotation-minimal");
const padding=Number(values.padding ?? 0);
if(!Number.isSafeInteger(padding)||padding<0||padding>512)throw Error("Diagnostic padding must be 0..512 bytes per tool");
const dir=fileURLToPath(new URL(".",import.meta.url));
const original=JSON.parse(readFileSync(resolve(dir,"../artifacts/mcp-metadata-revision-20261108/candidate-snapshot.json")));
if(values["refresh-presentation"]&&profile!=="shared-guidance")throw Error("Presentation refresh is separate from single-variable controls");
const source=values["refresh-presentation"]?{...original,tools:reviseRemoteTools(original.tools,JSON.parse(readFileSync(resolve(dir,"../../dist/submission/local-repair-catalog.contracts.json"))))}:original;
const snapshot=shareRemoteExecutionGuidance(source);
if(profile==="repeated-guidance")snapshot.tools=structuredClone(original.tools);
if(profile==="repeated-guidance")assert.deepEqual(snapshot.tools,original.tools);
let shared=0;
for(const [i,tool] of snapshot.tools.entries()) {
  if(tool._meta?.["beatapi/capability"]) {
    assert.equal(profile==="repeated-guidance"?tool.description:tool.description+" "+remoteExecutionGuidance,source.tools[i].description);shared++;
  }
  if(profile==="annotation-minimal") for(const schema of [tool.inputSchema,tool.outputSchema])
    for(const [node] of schemaNodes(schema)) for(const key of ["description","title","examples","example","$comment"]) delete node[key];
  if(padding)tool._meta={...tool._meta,"beatapi/diagnosticPadding":"x".repeat(padding)};
}
assert.equal(snapshot.tools.length,988);
for(const [i,tool] of snapshot.tools.entries()) {
  const old=original.tools[i];assert.equal(tool.name,source.tools[i].name);
  for(const key of ["inputSchema","outputSchema"])assert.deepEqual(schemaAssertions(tool[key]),schemaAssertions(old[key]));
  for(const key of ["annotations","securitySchemes"])assert.deepEqual(tool[key],old[key]);
  const meta=structuredClone(tool._meta);if(padding)delete meta["beatapi/diagnosticPadding"];
  assert.deepEqual(meta,old._meta);
  if(profile!=="annotation-minimal")assert.deepEqual(tool.inputSchema,old.inputSchema);
}
assert.deepEqual(snapshot.contents,original.contents);assert.deepEqual(snapshot.resources,original.resources);
assert.equal(new Set(snapshot.tools.map(t=>t.name)).size,988);
const caseName=(values["refresh-presentation"]?"refreshed-":"")+profile+(padding?`-pad-${padding}`:"")+(values.revision?`-${values.revision}`:"");
const out=resolve(dir,"../artifacts/mcp-aggregate-diagnosis-20261108",caseName);mkdirSync(out,{recursive:true});
const json=JSON.stringify(snapshot);
if(existsSync(join(out,"portal.json"))&&readFileSync(join(out,"snapshot.json"),"utf8")!==json)throw Error("Scanned snapshots are immutable; choose a new --revision label");
writeFileSync(join(dir,"snapshot.json"),json);writeFileSync(join(out,"snapshot.json"),json);
const renames=snapshot.tools.flatMap((tool,i)=>tool.name===original.tools[i].name?[]:[{oldName:original.tools[i].name,name:tool.name,reference:tool._meta["beatapi/capability"].reference}]);
writeFileSync(join(out,"renames.json"),JSON.stringify(renames,null,2));
const report={profile,caseName,diagnosticPaddingPerTool:padding,generatedAt:new Date().toISOString(),toolCount:988,sharedInstructionsTools:shared,renamedTools:renames.length,beforeBytes:Buffer.byteLength(JSON.stringify(original.tools)),descriptorBytes:Buffer.byteLength(JSON.stringify(snapshot.tools)),instructionsBytes:Buffer.byteLength(snapshot.instructions),sha256:createHash("sha256").update(json).digest("hex"),allConstraintsDefaultsScopesAndUIUnchanged:true,namesUnchanged:renames.length===0,parameterDescriptionsPreserved:profile!=="annotation-minimal",diagnosticOnly:profile!=="shared-guidance"||padding>0};
writeFileSync(join(out,"preparation.json"),JSON.stringify(report,null,2));console.log(report);
