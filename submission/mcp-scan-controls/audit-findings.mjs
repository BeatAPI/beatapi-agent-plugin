/**
 * [INPUT]: 最后一次完整扫描的固定快照、21 项反馈、历史扫描和同版本能力契约
 * [OUTPUT]: 逐项处置依据、988 工具无损候选及离线参数/调度验证；不改诊断部署输入
 * [POS]: 本地复核证据生成器，不访问网络、不执行业务、不修改历史扫描证据
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { reviseRemoteTools, shareRemoteExecutionGuidance } from "../../scripts/remote-metadata.mjs";
import { createRemoteDispatcher } from "../../scripts/remote-capabilities.mjs";

const root=resolve(import.meta.dirname,"../..");
const archive=resolve(root,"submission/artifacts/mcp-aggregate-diagnosis-20261108");
const out=resolve(root,"submission/artifacts/mcp-feedback-audit-20261108");
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const hash=value=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
const baseline=read(resolve(archive,"refreshed-shared-guidance-v2/snapshot.json"));
const feedback=read(resolve(archive,"remaining-findings.json"));
const contracts=read(resolve(root,"dist/submission/local-repair-catalog.contracts.json"));
const byReference=new Map(contracts.map(c=>[c.reference,c]));
const cases=["shared-guidance","shared-guidance-pad-64","refreshed-shared-guidance","refreshed-shared-guidance-v2"];
const history=cases.map(label=>({label,portal:read(resolve(archive,label,"portal.json")),snapshot:read(resolve(archive,label,"snapshot.json"))}));
const corrected=new Set(["data:tiktok.web.device_register","data:tiktok.web.fetch_live_im_fetch","data:weibo.web_v2.fetch_all_groups"]);
const candidate=shareRemoteExecutionGuidance({...baseline,tools:reviseRemoteTools(baseline.tools,contracts)});
assert.equal(feedback.length,21);assert.equal(candidate.tools.length,988);
const changes=[];
for(const [i,old] of baseline.tools.entries()){
  const tool=candidate.tools[i],ref=old._meta?.["beatapi/capability"]?.reference;
  for(const key of ["inputSchema","outputSchema","annotations","securitySchemes","_meta"])assert.deepEqual(tool[key],old[key]);
  if(!corrected.has(ref))assert.deepEqual(tool,old);
  else {
    assert.notEqual(tool.description,old.description);
    if(tool.name!==old.name)changes.push({reference:ref,oldName:old.name,name:tool.name});
  }
  assert.match(tool.name,/^[A-Za-z0-9_-]{1,64}$/);
  assert.doesNotMatch(tool.description,/tikhub|docs\.tikhub|api\.tikhub/i);
}
assert.equal(new Set(candidate.tools.map(t=>t.name)).size,988);
for(const key of ["instructions","resources","contents"])assert.deepEqual(candidate[key],baseline[key]);
const bindings=Object.fromEntries(candidate.tools.filter(t=>t._meta?.["beatapi/capability"]).map(t=>[t.name,t._meta["beatapi/capability"]]));
const dispatch=createRemoteDispatcher({tools:candidate.tools,bindings});
const oldBindings=Object.fromEntries(baseline.tools.filter(t=>t._meta?.["beatapi/capability"]).map(t=>[t.name,t._meta["beatapi/capability"]]));
const beforeDispatch=createRemoteDispatcher({tools:baseline.tools,bindings:oldBindings});
const dispositions=feedback.map(f=>{
  const i=baseline.tools.findIndex(t=>t.name===f.name);assert.ok(i>=0);
  const old=baseline.tools[i],tool=candidate.tools[i],reference=old._meta["beatapi/capability"].reference,c=byReference.get(reference);
  assert.equal(c.schema_hash,old._meta["beatapi/capability"].schemaHash);
  const result={name:f.name,reference,feedback:f.reasons,priorDescription:old.description,newName:tool.name,newTitle:tool.title,newDescription:tool.description};
  if(corrected.has(reference)){
    const input=reference.endsWith("fetch_live_im_fetch")?{room_id:"123",user_unique_id:"viewer",resp_content_type:"json"}:{};
    const args={input,idempotency_key:"offline-metadata-audit"};
    assert.deepEqual(dispatch(tool.name,args),beforeDispatch(old.name,args));
    return {...result,disposition:"confirmed_metadata_defect_fixed_locally",policyDecisionRequired:reference.endsWith("device_register"),dispatchVerifiedWithoutExecution:true};
  }
  assert.ok(c.categories.includes("text"));assert.equal(c.execution.mode,"sync");assert.equal(c.execution.executable,true);
  assert.equal(c.reference,`model:${c.id}`);assert.equal(tool.title,c.title);
  assert.equal(c.output_schema.properties.object.const,"text.result");
  assert.equal(c.output_schema.properties.output_text.type,"string");
  assert.match(tool.name,/^beatapi_generate_text_/);assert.ok(tool.inputSchema.properties.input.properties.input);
  assert.deepEqual(tool,old);
  const scanHistory=history.map(({label,portal,snapshot})=>{
    const descriptor=structuredClone(snapshot.tools.find(t=>t.name===old.name));
    delete descriptor._meta["beatapi/diagnosticPadding"];
    assert.deepEqual(descriptor,old);
    const reviewed=portal.tools.find(t=>t.name===old.name);
    assert.equal(reviewed.review,"complete");assert.equal(portal.runtime.last_attempt.problem,null);
    for(const field of ["name","title","description","input_json_schema","output_json_schema"])assert.deepEqual(reviewed.definition[field],history[0].portal.tools.find(t=>t.name===old.name).definition[field]);
    return {case:label,scanId:portal.scan_id,attemptId:portal.runtime.last_attempt.id,completedAt:portal.runtime.last_attempt.completed_at,review:reviewed.review,nameFinding:reviewed.findings.some(x=>x.reasoning.includes("name appears unclear")),descriptorSha256:hash(descriptor)};
  });
  assert.deepEqual(scanHistory.map(s=>s.nameFinding),[false,false,false,true]);
  const prompt={input:{input:"Summarize this supplied text.",instructions:"Reply briefly.",max_output_tokens:16,temperature:0},idempotency_key:"offline-metadata-audit"};
  const request=dispatch(tool.name,prompt);assert.equal(request.reference,reference);assert.deepEqual(request.input,prompt.input);
  assert.deepEqual(request,beforeDispatch(old.name,prompt));
  assert.throws(()=>dispatch(tool.name,{...prompt,input:{input:42}}),/Invalid tool arguments/);
  assert.throws(()=>dispatch(tool.name,{...prompt,input:{input:"x",max_output_tokens:0}}),/Invalid tool arguments/);
  return {...result,disposition:"suspected_contextual_false_positive_retain_name",schemaHash:c.schema_hash,inputSchemaSha256:hash(tool.inputSchema),nativeOutputSchemaSha256:hash(c.output_schema),descriptorSha256:hash(tool),routeVariantLabel:/-(free|hc)$/.test(c.reference.split(":")[1]),scanHistory,dispatchVerifiedWithoutExecution:true,limits:"Unchanged per-tool metadata is not an identical whole-catalog A/A experiment or proof of vendor model identity/live availability."};
});
assert.equal(dispositions.filter(x=>x.disposition.startsWith("confirmed")).length,3);
assert.equal(dispositions.filter(x=>x.disposition.startsWith("suspected")).length,18);
assert.equal(changes.length,1);
mkdirSync(out,{recursive:true});
for(const [file,value] of Object.entries({"candidate-snapshot.json":candidate,"dispositions.json":dispositions,"renames.json":changes,"preservation.json":{generatedAt:new Date().toISOString(),toolCount:988,concreteFeedbackCount:21,localMetadataFixes:3,retainedModelNames:18,renamedTools:1,allSchemasDefaultsInputDescriptionsScopesAnnotationsBindingsAndUIExactlyEqual:true,other985DescriptorsExactlyEqual:true,candidateSha256:hash(candidate),notDeployed:true,noBusinessCalls:true,noPortalRescan:true,noReviewSubmission:true}}))writeFileSync(resolve(out,file),JSON.stringify(value,null,2)+"\n");
console.log({tools:988,localMetadataFixes:3,retainedModelNames:18,renamedTools:1,parameterAndDispatchChecks:"passed",output:out});
