import fs from "node:fs/promises";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const root = "D:/AgricultureAgentProjectAgenticAi";
const rendered = path.join(root, "tmp", "ppt-build", "rendered");
const output = path.join(root, "output", "Agricultural_Advisory_Agent_Project_Class_Presentation.pptx");
const cover = path.join(root, "assets", "presentation", "farmer-tablet-cover.png");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Agricultural Advisory Agent Project";
pptx.subject = "Class presentation";
pptx.title = "Agricultural Advisory Agent Project";
pptx.company = "Agricultural Advisory Agent Project";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  lang: "en-IN",
};
pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";

await fs.mkdir(path.dirname(output), { recursive: true });
for (let index = 1; index <= 12; index += 1) {
  const slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  if (index === 1) {
    slide.addImage({ path: cover, x: 0, y: 0, w: 13.333333, h: 7.5 });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 6.77, h: 7.5, fill: { color: "062C22", transparency: 3 }, line: { color: "062C22", transparency: 100 } });
    slide.addText("Agricultural Advisory\nAgent Project", { x: 0.75, y: 1.80, w: 5.4, h: 1.35, fontFace: "Arial", fontSize: 31, bold: true, color: "FFFFFF", breakLine: false, margin: 0 });
    slide.addText("A real-data, multi-agent web application for farm decisions", { x: 0.78, y: 3.55, w: 4.8, h: 0.55, fontFace: "Arial", fontSize: 16, color: "D7F5E7", margin: 0 });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.78, y: 4.72, w: 1.78, h: 0.38, rectRadius: 0.08, fill: { color: "2F855A" }, line: { color: "2F855A", transparency: 100 } });
    slide.addText("CLASS PRESENTATION", { x: 0.88, y: 4.81, w: 1.58, h: 0.15, fontFace: "Arial", fontSize: 7.8, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    slide.addText("Weather  •  market signals  •  schemes  •  risk alerts", { x: 0.78, y: 5.57, w: 4.85, h: 0.25, fontFace: "Arial", fontSize: 11.5, color: "C5E7D5", margin: 0 });
  } else {
    const filename = path.join(rendered, `slide-${String(index).padStart(2, "0")}.png`);
    slide.addImage({ path: filename, x: 0, y: 0, w: 13.333333, h: 7.5 });
  }
  slide.addNotes(`Rendered editable-source slide ${index}. Source content and diagrams are maintained in tmp/ppt-build/generate_presentation.mjs.`);
}
await pptx.writeFile({ fileName: output });
console.log(output);
