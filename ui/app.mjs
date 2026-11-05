/**
 * [INPUT]: 官方 MCP Apps bridge 的工具入参、结果和宿主主题/语言
 * [OUTPUT]: 只读内联研究/媒体视图与原任务的受限刷新
 * [POS]: ChatGPT 结果组件；不拥有凭证、不执行 start、不把客户端展示当账务事实
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { App, applyDocumentTheme } from "@modelcontextprotocol/ext-apps";
import { createElement, RefreshCw, ExternalLink, Download, Check, Clock, CircleAlert } from "lucide";
import { projectResult, displayValue, publicUrl, record } from "./view-model.mjs";

const copy = {
  en: { waiting: "Waiting for result", result: "Saved result", task: "Task", refresh: "Refresh", open: "Open", download: "Download", details: "Details", reported: "Reported charge", unknown: "Not reported", sample: "Sample", of: "of", available: "Available items", noData: "Data unavailable", actual: "Actual size", failed: "Result unavailable", queued: "Queued", processing: "Processing", running: "Processing", submitted: "Submitted", succeeded: "Completed", cancelled: "Cancelled", expired: "Expired", requires_action: "Action required", storyboard_ready: "Review required", submittedStep: "Submitted", processingStep: "Processing", doneStep: "Ready", id: "Request / task ID", reconnect: "Connection unavailable", reportedData: "Returned data" },
  zh: { waiting: "等待结果", result: "已保存的结果", task: "任务", refresh: "刷新", open: "打开", download: "下载", details: "详情", reported: "返回费用", unknown: "未返回", sample: "样本", of: "/", available: "可见条目", noData: "数据不可用", actual: "实际尺寸", failed: "结果不可用", queued: "排队中", processing: "处理中", running: "处理中", submitted: "已提交", succeeded: "已完成", cancelled: "已取消", expired: "已过期", requires_action: "需要确认", storyboard_ready: "等待审核", submittedStep: "已提交", processingStep: "处理中", doneStep: "已完成", id: "请求 / 任务 ID", reconnect: "连接不可用", reportedData: "返回数据" },
  ja: { waiting: "結果を待機中", result: "保存済みの結果", task: "タスク", refresh: "更新", open: "開く", download: "ダウンロード", details: "詳細", reported: "報告された料金", unknown: "未取得", sample: "サンプル", of: "/", available: "表示件数", noData: "データなし", actual: "実際のサイズ", failed: "結果を取得できません", queued: "待機中", processing: "処理中", running: "処理中", submitted: "送信済み", succeeded: "完了", cancelled: "キャンセル済み", expired: "期限切れ", requires_action: "確認が必要", storyboard_ready: "確認待ち", submittedStep: "送信済み", processingStep: "処理中", doneStep: "完了", id: "リクエスト / タスク ID", reconnect: "接続できません", reportedData: "取得データ" },
};
const root = document.getElementById("app");
const app = new App({ name: "BeatAPI results", version: "1.1.0" }, {}, { autoResize: true });
let input = {}, result = null, hostContext = {}, language = "en", busy = false, nextRefreshAt = 0, timer;
const t = key => copy[language][key] ?? key;
const fieldLabels = {
  en: { keyword: "Keyword", search_volume: "Search volume", difficulty: "Difficulty", source: "Source", country: "Country", language: "Language", observation_date: "Observed on" },
  zh: { keyword: "关键词", search_volume: "搜索量", difficulty: "难度", source: "来源", country: "国家", language: "语言", observation_date: "观测日期" },
  ja: { keyword: "キーワード", search_volume: "検索数", difficulty: "難易度", source: "出典", country: "国", language: "言語", observation_date: "観測日" },
};
const fieldLabel = key => fieldLabels[language][key] ?? key.replaceAll("_", " ");
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined && text !== null) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const icon = definition => createElement(definition, { width: 16, height: 16, "aria-hidden": "true", "stroke-width": 1.8 });
function link(url, label, definition) {
  const anchor = node("a", undefined, "icon-button");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.title = label;
  anchor.setAttribute("aria-label", label);
  anchor.append(icon(definition));
  return anchor;
}
function context(value) {
  hostContext = { ...hostContext, ...value };
  const locale = hostContext.locale ?? navigator.language;
  language = locale.startsWith("zh") ? "zh" : locale.startsWith("ja") ? "ja" : "en";
  document.documentElement.lang = language;
  applyDocumentTheme(hostContext.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  render();
}
function receive(value) {
  result = value;
  const view = projectResult(value, input);
  nextRefreshAt = view.active ? Date.now() + view.pollAfter * 1000 : 0;
  render();
}
function render() {
  clearTimeout(timer);
  root.replaceChildren();
  const view = result ? projectResult(result, input) : null;
  const header = node("header");
  const identity = node("div", undefined, "identity");
  identity.append(node("span", "BeatAPI", "brand"), node("h1", view?.title ?? t(view ? "result" : "waiting")));
  header.append(identity);
  const actions = node("div", undefined, "actions");
  if (view) {
    const status = node("span", t(view.status), `status ${view.status}`);
    status.prepend(icon(view.status === "succeeded" ? Check : view.status === "failed" ? CircleAlert : Clock));
    actions.append(status);
  }
  let refresh;
  if (view?.refresh && app.getHostCapabilities()?.serverTools) {
    refresh = node("button", undefined, "icon-button");
    refresh.type = "button";
    refresh.append(icon(RefreshCw));
    refresh.onclick = async () => {
      if (busy || Date.now() < nextRefreshAt) return;
      busy = true;
      render();
      try { receive(await app.callServerTool(view.refresh)); }
      catch { receive({ isError: true, structuredContent: { error: { message: t("reconnect") } } }); }
      finally { busy = false; render(); }
    };
    actions.append(refresh);
  }
  header.append(actions);
  root.append(header);
  if (!view) {
    const skeleton = node("div", undefined, "skeleton");
    skeleton.setAttribute("aria-label", t("waiting"));
    skeleton.append(node("div"), node("div"), node("div"));
    root.append(skeleton);
    return;
  }
  if (view.id && input.task_id && (view.active || view.status === "succeeded")) {
    const stages = node("ol", undefined, "stages");
    const step = view.status === "succeeded" ? 2 : ["processing", "running"].includes(view.status) ? 1 : 0;
    ["submittedStep", "processingStep", "doneStep"].forEach((key, i) => {
      const item = node("li", t(key), i <= step ? "reached" : "");
      if (i === step) item.setAttribute("aria-current", "step");
      stages.append(item);
    });
    root.append(stages);
  }
  if (view.error) root.append(node("p", view.error, "error"));
  if (!view.hasData) root.append(node("p", t("noData"), "muted"));
  if (view.summary) root.append(node("p", view.summary.slice(0, 4000), "summary"));
  for (const media of view.media) {
    const figure = node("figure");
    if (media.inline) {
      const player = node(media.type === "image" ? "img" : media.type);
      player.src = media.url;
      if (media.type === "image") player.alt = view.title ?? "BeatAPI";
      else { player.controls = true; player.preload = "metadata"; }
      if (media.type === "video") player.playsInline = true;
      figure.append(player);
      if (media.type === "video" || media.type === "image") {
        const dimensions = node("span", t("unknown"), "muted");
        player.addEventListener(media.type === "image" ? "load" : "loadedmetadata", () => {
          const width = player.videoWidth ?? player.naturalWidth;
          const height = player.videoHeight ?? player.naturalHeight;
          dimensions.textContent = `${t("actual")} ${width} × ${height}${player.duration && Number.isFinite(player.duration) ? ` · ${player.duration.toFixed(1)}s` : ""}`;
        });
        figure.append(dimensions);
      }
    }
    const mediaActions = node("figcaption");
    mediaActions.append(node("span", media.type.toUpperCase(), "muted"), link(media.url, t("open"), ExternalLink));
    if (app.getHostCapabilities()?.downloadFile) {
      const download = node("button", undefined, "icon-button");
      download.type = "button";
      download.title = t("download");
      download.setAttribute("aria-label", t("download"));
      download.append(icon(Download));
      download.onclick = async () => {
        download.disabled = true;
        try { await app.downloadFile({ contents: [{ type: "resource_link", uri: media.url, name: new URL(media.url).pathname.split("/").pop() || "BeatAPI" }] }); }
        catch { download.title = t("failed"); }
        finally { download.disabled = false; }
      };
      mediaActions.append(download);
    }
    figure.append(mediaActions);
    root.append(figure);
  }
  if (view.rows.length) {
    root.append(node("p", `${t("sample")} ${view.rows.length}${view.total === null ? "" : ` ${t("of")} ${view.total}`}`, "section-label"));
    const scroll = node("div", undefined, "table-scroll");
    const table = node("table");
    table.setAttribute("aria-label", t("reportedData"));
    const headings = node("tr");
    view.columns.forEach(key => headings.append(node("th", fieldLabel(key))));
    const head = node("thead"); head.append(headings); table.append(head);
    const body = node("tbody");
    view.rows.forEach(row => {
      const tr = node("tr");
      view.columns.forEach(key => {
        const cell = node("td");
        const url = publicUrl(row[key]);
        if (url) cell.append(link(url, t("open"), ExternalLink));
        else cell.textContent = (displayValue(row[key]) ?? t("unknown")).slice(0, 240);
        tr.append(cell);
      });
      body.append(tr);
    });
    table.append(body); scroll.append(table); root.append(scroll);
  }
  if (view.fields.length) {
    const metrics = node("dl", undefined, "metrics");
    view.fields.forEach(([key, value]) => {
      const pair = node("div"); pair.append(node("dt", fieldLabel(key)), node("dd", displayValue(value))); metrics.append(pair);
    });
    root.append(metrics);
  }
  const footer = node("footer");
  footer.append(node("span", t("reported"), "muted"), node("strong", view.charged === null ? t("unknown") : new Intl.NumberFormat(language, { style: "currency", currency: "USD", maximumFractionDigits: 6 }).format(view.charged)));
  root.append(footer);
  if (view.id) {
    const details = node("details");
    details.append(node("summary", t("details")), node("span", t("id"), "muted"), node("code", view.id));
    root.append(details);
  }
  if (refresh) {
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
      refresh.disabled = busy || seconds > 0;
      refresh.title = `${t("refresh")}${seconds ? ` (${seconds}s)` : ""}`;
      refresh.setAttribute("aria-label", refresh.title);
      refresh.classList.toggle("busy", busy);
      if (seconds) timer = setTimeout(tick, 500);
    };
    tick();
  }
}

app.ontoolinput = value => { input = record(value.arguments); render(); };
app.ontoolresult = receive;
app.ontoolcancelled = () => receive({ isError: true, structuredContent: { error: { message: t("cancelled") } } });
app.onerror = () => { if (!result) receive({ isError: true, structuredContent: { error: { message: t("reconnect") } } }); };
app.onhostcontextchanged = context;
context();
app.connect().then(() => context(app.getHostContext())).catch(() => {
  receive({ isError: true, structuredContent: { error: { message: t("reconnect") } } });
});
