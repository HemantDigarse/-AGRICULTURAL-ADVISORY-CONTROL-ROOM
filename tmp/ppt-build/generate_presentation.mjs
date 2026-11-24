import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:/AgricultureAgentProjectAgenticAi";
const skillDir = "C:/Users/santo/.codex/plugins/cache/openai-primary-runtime/presentations/26.1123.11515/skills/presentations";
const runtimePython = "C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1123-915-0_26.1123.915.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe";
const buildDir = path.join(workspaceDir, "tmp", "ppt-build");
const stagingDir = path.join(workspaceDir, ".codex-finalizer");
const outputDir = path.join(workspaceDir, "output");
const finalPath = path.join(outputDir, "Agricultural_Advisory_Agent_Project_Class_Presentation.pptx");
const coverImage = path.join(workspaceDir, "assets", "presentation", "farmer-tablet-cover.png");

const C = {
  ink: "#102A43", muted: "#486581", pale: "#F0F7F4", white: "#FFFFFF",
  green: "#146C43", green2: "#2F855A", lime: "#B7E4C7", amber: "#E9A820",
  blue: "#2166A5", sky: "#DDEFFC", red: "#B42318", gray: "#D9E2EC", dark: "#0B3D2E",
};

const p = { left: 64, top: 48, width: 1152, height: 624 };
const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function box(slide, left, top, width, height, fill, radius = "rounded-xl", line = "none") {
  const options = { geometry: radius === "none" ? "rect" : "roundRect", position: { left, top, width, height }, fill, line: line === "none" ? { style: "solid", fill: "none", width: 0 } : { style: "solid", fill: line, width: 1 } };
  if (radius !== "none") options.borderRadius = radius;
  return slide.shapes.add(options);
}

function text(slide, value, left, top, width, height, style = {}) {
  const shape = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  shape.text = value;
  shape.text.style = { fontFamily: "Arial", fontSize: "20pt", color: C.ink, ...style };
  return shape;
}

function heading(slide, title, sub = "") {
  text(slide, title, p.left, 46, 900, 48, { fontSize: "31pt", bold: true, color: C.ink });
  if (sub) text(slide, sub, p.left, 100, 1040, 28, { fontSize: "15pt", color: C.muted });
  box(slide, p.left, 132, 94, 5, C.green, "none");
}

function footer(slide, number) {
  text(slide, "Agricultural Advisory Agent Project", 64, 681, 500, 18, { fontSize: "10pt", color: C.muted });
  text(slide, String(number).padStart(2, "0"), 1175, 681, 40, 18, { fontSize: "10pt", bold: true, color: C.green, align: "right" });
}

function note(slide, value) { slide.speakerNotes.text = value; }

function bullet(slide, value, left, top, width, accent = C.green, fontSize = "18pt") {
  box(slide, left, top + 8, 9, 9, accent, "none");
  text(slide, value, left + 22, top, width - 22, 54, { fontSize, color: C.ink, breakLine: false });
}

function processStep(slide, x, y, w, h, label, desc, fill) {
  box(slide, x, y, w, h, fill, "rounded-xl");
  text(slide, label, x + 16, y + 14, w - 32, 43, { fontSize: "17pt", bold: true, color: C.ink, align: "center" });
  text(slide, desc, x + 16, y + 67, w - 32, h - 77, { fontSize: "12.5pt", color: C.muted, align: "center" });
}

function connector(slide, x, y, width) {
  box(slide, x, y, width, 4, C.green, "none");
  box(slide, x + width - 6, y - 5, 10, 14, C.green, "none");
}

async function imageBytes(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

// 1. Cover
{
  const s = presentation.slides.add();
  s.background.fill = C.dark;
  s.images.add({ blob: await imageBytes(coverImage), contentType: "image/png", alt: "Illustrative farmer using a tablet in a crop field", fit: "cover", position: { left: 0, top: 0, width: 1280, height: 720 } });
  box(s, 0, 0, 650, 720, "#062C22", "none");
  text(s, "Agricultural Advisory\nAgent Project", 72, 175, 540, 150, { fontSize: "43pt", bold: true, color: C.white });
  text(s, "A real-data, multi-agent web application for farm decisions", 75, 353, 485, 64, { fontSize: "21pt", color: "#D7F5E7" });
  box(s, 75, 454, 170, 36, "#2F855A", "rounded-xl");
  text(s, "CLASS PRESENTATION", 88, 462, 145, 20, { fontSize: "11pt", bold: true, color: C.white, align: "center" });
  text(s, "Weather  •  market signals  •  schemes  •  risk alerts", 75, 534, 460, 25, { fontSize: "15pt", color: "#C5E7D5" });
  note(s, "Cover image generated with OpenAI ImageGen for illustration. It is not a photograph of a specific farm or farmer.");
}

// 2. Problem statement
{
  const s = presentation.slides.add(); s.background.fill = C.white;
  heading(s, "Problem Statement", "Farmers need one trusted decision view when weather, market conditions, and schemes change.");
  text(s, "A farmer often has to combine incomplete information manually.", 64, 170, 660, 44, { fontSize: "25pt", bold: true, color: C.ink });
  const items = [
    ["Weather uncertainty", "Rain, heat, humidity, and wind change irrigation and crop-risk decisions."],
    ["Market timing", "Mandi prices differ by crop and location, so selling decisions need current evidence."],
    ["Scheme discovery", "Government support is hard to find when eligibility and crop context are separate."],
    ["Actionable advice", "Generic advisories do not explain why a recommendation fits the farmer’s situation."],
  ];
  items.forEach((item, i) => { const y = 245 + i * 87; box(s, 80, y, 45, 45, i === 0 ? C.sky : C.pale, "rounded-xl"); text(s, String(i + 1), 92, y + 8, 22, 22, { fontSize: "18pt", bold: true, color: C.green, align: "center" }); text(s, item[0], 148, y, 280, 25, { fontSize: "18pt", bold: true }); text(s, item[1], 148, y + 30, 510, 42, { fontSize: "16pt", color: C.muted }); });
  box(s, 760, 194, 378, 338, "#EAF4EE", "rounded-xl");
  text(s, "Decision gap", 798, 228, 300, 36, { fontSize: "27pt", bold: true, color: C.dark, align: "center" });
  text(s, "Separate sources\n↓\nManual interpretation\n↓\nDelayed farm action", 805, 300, 290, 170, { fontSize: "19pt", bold: true, color: C.green, align: "center" });
  footer(s, 2);
  note(s, "Problem framing based on the project scope and user requirements. No external statistics are claimed on this slide.");
}

// 3. Solution
{
  const s = presentation.slides.add(); s.background.fill = C.pale;
  heading(s, "Solution Overview", "The application turns farmer inputs and live data into a traceable advisory.");
  text(s, "One authenticated workspace connects the user to specialised AI agents.", 64, 170, 1000, 42, { fontSize: "24pt", bold: true });
  processStep(s, 80, 280, 195, 150, "Farmer input", "Crop, city, state, growth stage", "#FFFFFF");
  connector(s, 280, 352, 46);
  processStep(s, 330, 280, 195, 150, "Live context", "Weather, recent history, mandi records", "#DDEFFC");
  connector(s, 530, 352, 46);
  processStep(s, 580, 280, 195, 150, "Agent analysis", "Crop, risk, scheme, market reasoning", "#E6F5EA");
  connector(s, 780, 352, 46);
  processStep(s, 830, 280, 250, 150, "Advisory report", "Recommendations, alerts, evidence, confidence", "#FFF4D8");
  text(s, "Design principle: live mode fails clearly when a required data source is unavailable. It does not silently label mock data as live.", 105, 510, 1010, 50, { fontSize: "18pt", color: C.muted, italic: true, align: "center" });
  footer(s, 3);
  note(s, "Implementation source: backend/app/services/weather_service.py, market_service.py, and coordinator_agent.py. Live-mode error transparency is a project design decision.");
}

// 4. Features
{
  const s = presentation.slides.add(); s.background.fill = C.white;
  heading(s, "Implemented Features", "Features were built across the React client, FastAPI services, and the agent orchestration layer.");
  const features = [
    ["User accounts", "Register, log in, protected APIs, secure session token."],
    ["Live weather", "Current conditions, five-day forecast, and 14-day history."],
    ["Market intelligence", "AGMARKNET records, price average, trend, and sell or hold guidance."],
    ["Scheme matching", "RAG retrieves relevant government scheme information."],
    ["Risk alerts", "Weather, market, pest, and disease checks produce prioritised alerts."],
    ["Live workflow", "SSE streams the progress of every agent to the dashboard."],
  ];
  features.forEach((f, i) => { const col = i % 2; const row = Math.floor(i / 2); const x = 88 + col * 545; const y = 190 + row * 128; box(s, x, y, 480, 95, row === 1 ? "#F1F8F3" : "#F7FAFC", "rounded-xl", C.gray); box(s, x + 20, y + 22, 13, 52, i % 2 ? C.blue : C.green, "none"); text(s, f[0], x + 55, y + 17, 360, 28, { fontSize: "20pt", bold: true }); text(s, f[1], x + 55, y + 49, 390, 26, { fontSize: "15pt", color: C.muted }); });
  footer(s, 4);
  note(s, "Implementation source: backend/app/api/auth.py, backend/app/services/weather_service.py, backend/app/services/market_service.py, backend/app/agents/scheme_agent.py, backend/app/agents/risk_alert_agent.py, frontend/src/hooks/useAdvisoryStream.js.");
}

// 5. Architecture
{
  const s = presentation.slides.add(); s.background.fill = C.pale;
  heading(s, "Architecture", "The system separates user experience, APIs, shared state, specialist agents, and external data sources.");
  const cols = [
    ["React + Vite", "Login, dashboard, forms, live agent status", "#DDEFFC"],
    ["FastAPI", "REST endpoints, validation, authentication, SSE", "#E6F5EA"],
    ["Blackboard", "Shared request state, events, completed outputs", "#FFF4D8"],
    ["Agent layer", "Weather, market, crop, scheme, risk, coordinator", "#F5E8FF"],
    ["Data services", "OpenWeatherMap or Open-Meteo, data.gov.in, ChromaDB", "#F7FAFC"],
  ];
  cols.forEach((c, i) => { const x = 55 + i * 235; processStep(s, x, 240, 190, 190, c[0], c[1], c[2]); if (i < cols.length - 1) connector(s, x + 194, 331, 33); });
  text(s, "Persistence: SQLAlchemy with SQLite stores users and advisory-related records. ChromaDB persists semantic scheme retrieval when available.", 94, 505, 1080, 45, { fontSize: "18pt", color: C.muted, align: "center" });
  footer(s, 5);
  note(s, "Implementation source: frontend/src, backend/app/main.py, backend/app/orchestration/blackboard.py, backend/app/agents, backend/app/database, backend/app/rag. Data-source documentation: https://open-meteo.com/en/docs ; https://openweathermap.org/api ; https://data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi");
}

// 6. RAG
{
  const s = presentation.slides.add(); s.background.fill = C.white;
  heading(s, "RAG Pipeline for Scheme Matching", "Retrieval-augmented generation grounds scheme recommendations in stored scheme content.");
  const steps = [
    ["1", "Ingest", "Seed or add scheme documents with metadata."],
    ["2", "Embed", "Create vectors with sentence-transformers in live mode."],
    ["3", "Index", "Persist documents in the ChromaDB collection."],
    ["4", "Retrieve", "Query with crop, state, and farmer context."],
    ["5", "Match", "Scheme Agent ranks results and returns eligibility clues."],
  ];
  steps.forEach((d, i) => { const x = 76 + i * 226; box(s, x, 260, 188, 185, i === 2 ? "#E6F5EA" : "#F7FAFC", "rounded-xl", C.gray); box(s, x + 65, 225, 58, 58, C.green, "rounded-xl"); text(s, d[0], x + 79, 238, 30, 26, { fontSize: "20pt", bold: true, color: C.white, align: "center" }); text(s, d[1], x + 20, 306, 148, 26, { fontSize: "19pt", bold: true, align: "center" }); text(s, d[2], x + 18, 346, 152, 72, { fontSize: "14pt", color: C.muted, align: "center" }); if (i < steps.length - 1) connector(s, x + 188, 350, 38); });
  text(s, "Fallback behaviour: if ChromaDB is unavailable, the service performs keyword matching from an in-memory scheme store. RAG currently supports scheme retrieval, not every crop recommendation.", 102, 520, 1076, 54, { fontSize: "18pt", color: C.ink, align: "center" });
  footer(s, 6);
  note(s, "Implementation source: backend/app/rag/embedding_service.py, backend/app/rag/retrieval_service.py, backend/app/agents/scheme_agent.py. Terminology: Retrieval-Augmented Generation (RAG) retrieves context before an agent produces its response.");
}

// 7. Agent workflow
{
  const s = presentation.slides.add(); s.background.fill = C.pale;
  heading(s, "Multi-Agent Workflow", "The orchestrator runs independent work in parallel, then the coordinator produces one advisory.");
  text(s, "Phase 1", 86, 184, 210, 26, { fontSize: "16pt", bold: true, color: C.green, align: "center" });
  text(s, "Phase 2", 380, 184, 370, 26, { fontSize: "16pt", bold: true, color: C.blue, align: "center" });
  text(s, "Phase 3", 788, 184, 380, 26, { fontSize: "16pt", bold: true, color: C.green, align: "center" });
  processStep(s, 85, 230, 205, 130, "Intake Agent", "Validates crop, location, growth stage", "#FFFFFF");
  connector(s, 295, 291, 54);
  processStep(s, 355, 230, 180, 130, "Weather Agent", "Fetches weather and risk", "#DDEFFC");
  processStep(s, 565, 230, 180, 130, "Market Agent", "Fetches mandi price trend", "#F5E8FF");
  connector(s, 750, 291, 45);
  processStep(s, 790, 230, 130, 130, "Crop", "Agronomy", "#E6F5EA");
  processStep(s, 930, 230, 130, 130, "Risk", "Alerts", "#FFF4D8");
  processStep(s, 1070, 230, 150, 130, "Scheme", "RAG", "#F7FAFC");
  connector(s, 615, 408, 110);
  processStep(s, 480, 455, 390, 112, "Coordinator Agent", "Combines weather, market, crop, scheme, and risk outputs into one advisory report.", "#FFFFFF");
  text(s, "Phase 2 and Phase 3 use asyncio.gather for concurrent execution. SSE publishes agent status events to the React client.", 165, 598, 950, 32, { fontSize: "17pt", color: C.muted, align: "center" });
  footer(s, 7);
  note(s, "Implementation source: backend/app/api/advisory.py, backend/app/orchestration/orchestrator.py, backend/app/orchestration/blackboard.py. Phase 2 uses Weather and Market in parallel. Phase 3 uses Crop, Risk, and Scheme agents in parallel.");
}

// 8. Example
{
  const s = presentation.slides.add(); s.background.fill = C.white;
  heading(s, "Worked Example: Wheat Advisory", "Illustrative run showing how the agents use context. The slide does not claim a real-time recommendation.");
  box(s, 78, 190, 286, 310, "#F7FAFC", "rounded-xl", C.gray);
  text(s, "Farmer request", 108, 222, 210, 32, { fontSize: "23pt", bold: true, color: C.green });
  bullet(s, "Crop: wheat", 110, 308, 205, C.green, "14pt");
  bullet(s, "Location: Pune, Maharashtra", 110, 364, 220, C.green, "14pt");
  bullet(s, "Stage: vegetative growth", 110, 434, 210, C.green, "14pt");
  box(s, 416, 190, 360, 310, "#EAF4EE", "rounded-xl");
  text(s, "Agent evidence", 445, 222, 270, 32, { fontSize: "23pt", bold: true, color: C.green });
  bullet(s, "Weather Agent: current, forecast, 14-day history", 448, 276, 290, C.blue, "14pt");
  bullet(s, "Market Agent: recent AGMARKNET mandi records", 448, 345, 290, C.blue, "14pt");
  bullet(s, "Scheme Agent: retrieves crop and state matched schemes", 448, 414, 290, C.blue, "14pt");
  box(s, 828, 190, 350, 310, "#FFF4D8", "rounded-xl");
  text(s, "Advisory output", 858, 222, 250, 32, { fontSize: "23pt", bold: true, color: "#8A5A00" });
  bullet(s, "Irrigation guidance tied to weather conditions", 860, 308, 275, C.amber, "14pt");
  bullet(s, "Risk alerts for thresholds observed in the inputs", 860, 370, 275, C.amber, "14pt");
  bullet(s, "Scheme links and a market-oriented action note", 860, 438, 275, C.amber, "14pt");
  text(s, "The coordinator must explain the evidence and limits. A production response should include the actual date, data source, and confidence.", 120, 555, 1045, 36, { fontSize: "18pt", color: C.muted, align: "center" });
  footer(s, 8);
  note(s, "Example is illustrative and intentionally avoids inventing real-time weather or market values. It reflects fields handled by backend/app/agents and the advisory endpoint.");
}

// 9. Security and reliability
{
  const s = presentation.slides.add(); s.background.fill = C.pale;
  heading(s, "Security and Reliability", "The application includes basic controls that make user data and results easier to trust.");
  const capabilities = [
    ["Authentication", "Registration and login. Protected application APIs require a signed bearer token."],
    ["Password storage", "PBKDF2-HMAC with a random salt and 600,000 iterations. Passwords are never stored as plain text."],
    ["Request isolation", "Each advisory request uses an independent blackboard state and event queue."],
    ["Transparent failure", "Live mode raises an error when a required live source fails instead of returning simulated data."],
  ];
  capabilities.forEach((c, i) => { const y = 185 + i * 96; box(s, 104, y, 1050, 72, i % 2 ? "#FFFFFF" : "#F7FAFC", "rounded-xl", C.gray); text(s, c[0], 138, y + 20, 240, 26, { fontSize: "20pt", bold: true, color: C.green }); text(s, c[1], 400, y + 16, 700, 38, { fontSize: "16pt", color: C.ink }); });
  text(s, "Operational note: keep API keys in backend/.env and exclude that file from source control.", 210, 590, 860, 28, { fontSize: "17pt", color: C.red, bold: true, align: "center" });
  footer(s, 9);
  note(s, "Implementation source: backend/app/security.py, backend/app/main.py, backend/app/orchestration/blackboard.py, backend/.env.example. Security controls shown are implementation details, not a security certification.");
}

// 10. Data sources and configuration
{
  const s = presentation.slides.add(); s.background.fill = C.white;
  heading(s, "Real-Data Configuration", "Live mode needs a correct backend environment file and valid provider keys.");
  const sourceRows = [
    ["Current weather + 5-day forecast", "OpenWeatherMap if WEATHER_API_KEY exists, otherwise Open-Meteo", "Open-Meteo can operate without a key"],
    ["14-day weather history", "Open-Meteo archive API", "Used in weather-aware advisory calculations"],
    ["Mandi market records", "data.gov.in AGMARKNET API", "Requires DATA_GOV_API_KEY"],
    ["Narrative enhancement", "Optional OpenAI API", "No key uses rule-based live advisory logic"],
  ];
  text(s, "Data function", 95, 190, 330, 24, { fontSize: "16pt", bold: true, color: C.muted });
  text(s, "Provider path", 442, 190, 405, 24, { fontSize: "16pt", bold: true, color: C.muted });
  text(s, "Configuration", 875, 190, 270, 24, { fontSize: "16pt", bold: true, color: C.muted });
  sourceRows.forEach((row, i) => { const y = 230 + i * 80; box(s, 78, y, 1110, 70, i % 2 ? "#F7FAFC" : "#EAF4EE", "rounded-xl"); text(s, row[0], 95, y + 14, 320, 44, { fontSize: "15pt", bold: true }); text(s, row[1], 442, y + 13, 395, 48, { fontSize: "14pt", color: C.ink }); text(s, row[2], 875, y + 13, 275, 48, { fontSize: "14pt", color: C.muted }); });
  box(s, 130, 570, 1020, 49, "#FFF4D8", "rounded-xl");
  text(s, "Current local check: backend/.env is missing. Create it from backend/.env.example, then restart the backend.", 155, 583, 970, 23, { fontSize: "16pt", bold: true, color: "#8A5A00", align: "center" });
  footer(s, 10);
  note(s, "Project configuration check on 25 November 2026 found no backend/.env file. Source docs: https://open-meteo.com/en/about ; https://open-meteo.com/en/docs/historical-weather-api ; https://openweathermap.org/api ; https://data.gov.in/help ; https://data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi. Never put actual secrets in slides or source control.");
}

// 11. Future work
{
  const s = presentation.slides.add(); s.background.fill = C.pale;
  heading(s, "Next Steps", "The architecture supports a path from live information retrieval to measured prediction quality.");
  const rows = [
    ["Historical price model", "Ingest consistent mandi history, define a baseline, then evaluate forecasting error before using price predictions."],
    ["Farm profile", "Add farm size, soil test values, irrigation access, and crop variety to personalise recommendations."],
    ["Evidence and feedback", "Store advisory outcomes and farmer feedback to audit usefulness and improve the rules or model."],
    ["Production hardening", "Use a managed database, secret manager, rate limits, logging, and monitoring before wider deployment."],
  ];
  rows.forEach((r, i) => { const y = 195 + i * 95; box(s, 118, y, 1040, 71, C.white, "rounded-xl", C.gray); box(s, 118, y, 170, 71, i === 0 ? C.green : C.blue, "rounded-xl"); text(s, r[0], 132, y + 17, 142, 43, { fontSize: "14pt", bold: true, color: C.white, align: "center" }); text(s, r[1], 315, y + 16, 800, 42, { fontSize: "17pt", color: C.ink }); });
  footer(s, 11);
  note(s, "Future work is a proposal, not an implemented feature. It follows naturally from the project’s existing data adapters, blackboard architecture, and advisory history capabilities.");
}

// 12. Conclusion
{
  const s = presentation.slides.add(); s.background.fill = C.dark;
  text(s, "Agricultural Advisory Agent Project", 100, 150, 1080, 65, { fontSize: "42pt", bold: true, color: C.white, align: "center" });
  text(s, "A secure, explainable workflow that brings live farm context and specialised agents into one advisory experience.", 188, 260, 905, 64, { fontSize: "23pt", color: "#D7F5E7", align: "center" });
  box(s, 468, 410, 344, 68, "#2F855A", "rounded-xl");
  text(s, "Questions and discussion", 500, 428, 280, 28, { fontSize: "22pt", bold: true, color: C.white, align: "center" });
  text(s, "Thank you", 565, 555, 150, 30, { fontSize: "19pt", color: "#A9D9B8", align: "center" });
  note(s, "Closing slide. The deck presents the project’s implemented architecture and clearly separates current functionality from proposed next steps.");
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(buildDir, { recursive: true });
  await fs.mkdir(stagingDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  const renderDir = path.join(buildDir, "rendered");
  await fs.mkdir(renderDir, { recursive: true });
  for (const [i, slide] of presentation.slides.items.entries()) {
    await writeBlob(path.join(renderDir, `slide-${String(i + 1).padStart(2, "0")}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
  }
  await writeBlob(path.join(renderDir, "montage.webp"), await presentation.export({ format: "webp", montage: true }));
  if (false) {
    const candidatePath = path.join(stagingDir, "agricultural-advisory-candidate.pptx");
    await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
    const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools", "artifact_tool_utils.mjs")).href);
    const result = await finalizePresentation({
    explicitTotalSlideCount: 12,
    workspaceDir,
    candidatePath,
    finalPath,
    pythonExecutable: runtimePython,
    integrityValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
    fontPolicy: { basis: "design", families: ["Arial"] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(stagingDir, "agricultural-advisory.validation.json"),
    });
    console.log(JSON.stringify({ finalPath, slides: presentation.slides.items.length, warnings: result.warnings || [] }, null, 2));
  }
}

try {
  await main();
} catch (error) {
  console.error(error?.stack || String(error));
}
