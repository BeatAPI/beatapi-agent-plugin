/**
 * [INPUT]: 网关 JSON Schema、Ajv 2020-12 与标准格式；不读取账户或执行能力
 * [OUTPUT]: 公共结果 envelope、Schema 节点遍历、公开输入策略、注解规范化和送审前自校验
 * [POS]: MCP 编译/发布检查的共享契约边界；不修改原契约、入参或后台验证规则
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const validator = addFormats(new Ajv({ strict: false, allErrors: true, logger: false }));
const standardFormats = new Set(["date-time", "date", "time", "duration", "email", "idn-email", "hostname", "idn-hostname", "ipv4", "ipv6", "uri", "uri-reference", "iri", "iri-reference", "uri-template", "json-pointer", "relative-json-pointer", "regex", "uuid"]);
const credentialField = /^(api_?key|authorization|cookie|password|secret|client_?secret|access_?token|refresh_?token)$/i;

// data 随能力变化；这里只约定网关已有 envelope，不伪造模型或数据平台的返回字段。
export const resultOutputSchema = {
  type: "object",
  properties: {
    data: { description: "Capability-specific result data; inspect the selected capability for its shape." },
    error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" } }, additionalProperties: true },
    next: { type: "object", additionalProperties: true },
  },
  additionalProperties: true,
};

export function* schemaNodes(schema, path = "#") {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return;
  yield [schema, path];
  for (const key of ["properties", "patternProperties", "$defs", "definitions", "dependentSchemas", "dependencies"])
    for (const [name, value] of Object.entries(schema[key] ?? {})) yield* schemaNodes(value, `${path}/${key}/${name}`);
  for (const key of ["allOf", "anyOf", "oneOf", "prefixItems"])
    for (const [i, value] of (schema[key] ?? []).entries()) yield* schemaNodes(value, `${path}/${key}/${i}`);
  for (const key of ["items", "additionalItems", "additionalProperties", "not", "if", "then", "else", "contains", "propertyNames", "unevaluatedProperties", "unevaluatedItems", "contentSchema"])
    if (Array.isArray(schema[key])) {
      for (const [i, value] of schema[key].entries()) yield* schemaNodes(value, `${path}/${key}/${i}`);
    } else yield* schemaNodes(schema[key], `${path}/${key}`);
}

export function unsupportedPublicInputSchema(schema) {
  return [...schemaNodes(schema)].some(([node]) => Object.hasOwn(node, "$ref") || Object.hasOwn(node, "$dynamicRef") ||
    node.format === "password" || node.writeOnly === true || Object.keys(node.properties ?? {}).some(key => credentialField.test(key)));
}

export function normalizePublicSchema(schema) {
  const copy = structuredClone(schema);
  for (const [node] of [...schemaNodes(copy)].toReversed()) {
    if (node.format && !standardFormats.has(node.format)) {
      node.description = [node.description, `Expected format: ${node.format}.`].filter(Boolean).join(" ");
      delete node.format;
    }
    const annotation = node.examples;
    delete node.examples;
    const valid = validator.compile(node);
    if (Object.hasOwn(node, "default") && !valid(node.default)) delete node.default;
    let examples = [];
    if (Array.isArray(annotation)) examples = annotation;
    else if (annotation !== undefined) {
      if (valid(annotation)) examples = [annotation];
      else if (annotation && typeof annotation === "object")
        examples = Object.values(annotation).filter(x => x && typeof x === "object" && Object.hasOwn(x, "value")).map(x => x.value);
    }
    if (Object.hasOwn(node, "example")) { examples.push(node.example); delete node.example; }
    examples = examples.filter(x => valid(x));
    if (examples.length) node.examples = examples;
    else delete node.examples;
  }
  return copy;
}

export function validatePublicSchema(schema, label) {
  if (!validator.validateSchema(schema)) throw new Error(`${label}: invalid JSON Schema: ${validator.errorsText()}`);
  validator.compile(schema);
  for (const [node, path] of schemaNodes(schema)) {
    if (node.format && !standardFormats.has(node.format)) throw new Error(`${label}${path}: unsupported format ${node.format}`);
    const valid = validator.compile(node);
    if (Object.hasOwn(node, "default") && !valid(node.default)) throw new Error(`${label}${path}: default does not match its schema`);
    if (node.examples && (!Array.isArray(node.examples) || node.examples.some(x => !valid(x)))) throw new Error(`${label}${path}: examples do not match their schema`);
  }
}
