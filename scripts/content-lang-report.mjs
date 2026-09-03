#!/usr/bin/env node
/**
 * List content YAML fields missing a served language.
 * Usage: node scripts/content-lang-report.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const root = path.resolve(process.cwd(), "content");
const langsFile = path.join(root, "langs.yaml");
const served = parse(fs.readFileSync(langsFile, "utf8"))?.served ?? ["en", "zh"];

function walkFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkFiles(p, acc);
    else if (name.endsWith(".yaml") && name !== "langs.yaml") acc.push(p);
  }
  return acc;
}

function walkTx(node, trail, fileSrc, hits) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkTx(item, `${trail}[${i}]`, fileSrc, hits));
    return;
  }
  if (!node || typeof node !== "object") return;
  const hasEn = typeof node.en === "string";
  const hasZh = typeof node.zh === "string";
  if (hasEn || hasZh) {
    const src = typeof node.src === "string" && node.src.trim() ? node.src.trim() : fileSrc;
    const missing = served.filter((lang) => typeof node[lang] !== "string" || !String(node[lang]).trim());
    hits.push({ trail, src, missing, native: node[src] ?? "" });
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "src" || key === "en" || key === "zh") continue;
    if (served.includes(key)) continue;
    walkTx(value, trail ? `${trail}.${key}` : key, fileSrc, hits);
  }
}

const gaps = [];
for (const file of walkFiles(root)) {
  const rel = path.relative(process.cwd(), file);
  const data = parse(fs.readFileSync(file, "utf8")) ?? {};
  const fileSrc = typeof data.src === "string" && data.src.trim() ? data.src.trim() : "zh";
  const hits = [];
  walkTx(data, "", fileSrc, hits);
  for (const hit of hits) {
    if (hit.missing.length > 0) gaps.push({ file: rel, ...hit });
  }
}

if (gaps.length === 0) {
  console.log(`OK 全部 ${served.join(" / ")} 已齐（${walkFiles(root).length} 个内容文件）`);
  process.exit(0);
}

console.log(`缺语言 ${gaps.length} 处（站点语言：${served.join(", ")}）\n`);
for (const g of gaps) {
  const preview = String(g.native).replace(/\s+/g, " ").slice(0, 60);
  console.log(`- ${g.file}  ${g.trail}  src=${g.src}  缺 ${g.missing.join(",")}  原文: ${preview}`);
}
process.exit(1);
