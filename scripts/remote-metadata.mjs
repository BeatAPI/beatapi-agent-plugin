/**
 * [INPUT]: 已编译目录/已发布描述符、固定能力契约、统一公开范围策略及 Schema 遍历
 * [OUTPUT]: 展示刷新、公开范围投影、紧凑目录与共享执行指引
 * [POS]: 仅按统一策略删除被批准排除的工具/读取引用；其余参数、权限及历史枚举不重建
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { schemaNodes } from "./remote-schema.mjs";
import { describeRemoteCapability, remoteExecutionGuidance } from "./remote-presentation.mjs";
import { remoteCapabilityExclusions, taskTool, resultTool } from "./remote-capabilities.mjs";

export function restrictRemoteTools(tools) {
  const allowed=reference=>!Object.hasOwn(remoteCapabilityExclusions,reference);
  return tools.filter(tool=>allowed(tool._meta?.["beatapi/capability"]?.reference)).flatMap(tool=>{
    const copy=structuredClone(tool);
    if([taskTool,resultTool].includes(copy.name)) {
      const reference=copy.inputSchema.properties.reference;
      reference.enum=reference.enum.filter(allowed);
      if(!reference.enum.length)return [];
    }
    return [copy];
  });
}

export function shareRemoteExecutionGuidance(catalog) {
  const copy=structuredClone(catalog);
  const shared=copy.instructions?.split("\n").includes(remoteExecutionGuidance);
  for(const tool of copy.tools) {
    if(!tool._meta?.["beatapi/capability"])continue;
    const suffix=" "+remoteExecutionGuidance;
    if(tool.description.endsWith(suffix))tool.description=tool.description.slice(0,-suffix.length);
    else if(!shared)throw new Error(`Missing execution guidance: ${tool.name}`);
  }
  if(!shared)copy.instructions=[copy.instructions,remoteExecutionGuidance].filter(Boolean).join("\n");
  return copy;
}

export function reviseRemoteTools(tools, contracts) {
  const byReference=new Map(contracts.map(c=>[c.reference,c]));
  return tools.map(tool=>{
    const reference=tool._meta?.["beatapi/capability"]?.reference;
    if(!reference) return structuredClone(tool);
    const contract=byReference.get(reference);
    if(!contract) throw new Error(`Missing presentation contract: ${reference}`);
    if(contract.schema_hash!==tool._meta["beatapi/capability"].schemaHash) throw new Error(`Presentation contract version mismatch: ${reference}`);
    return {...structuredClone(tool),...describeRemoteCapability(contract,tool.name)};
  });
}

export function schemaAssertions(schema) {
  const copy=structuredClone(schema);
  for(const [node] of schemaNodes(copy)) for(const key of ["title","description","examples","example","$comment"]) delete node[key];
  return copy;
}

export function compactRemoteCatalog(catalog) {
  const copy=structuredClone(catalog);
  for(const tool of copy.tools) {
    for(const [node] of schemaNodes(tool.inputSchema)) for(const key of ["examples","example","$comment"]) delete node[key];
    for(const [node] of schemaNodes(tool.outputSchema)) for(const key of ["description","examples","example","$comment"]) delete node[key];
  }
  return copy;
}
