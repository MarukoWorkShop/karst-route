#!/usr/bin/env node
/**
 * 按日一行：补齐二期列（幂等键 / 生成来源 / 人工锁定）
 *   npm run content:notion:patch-scaffold-cols
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { dashUuid, loadDotenv } from "./lib/pricing-from-itinerary.mjs";

loadDotenv();
const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("需要 NOTION_TOKEN");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(process.cwd(), "content/notion.yaml"), "utf8"));
const dbId = cfg.databases?.pricingDaySheet;
if (!dbId) {
  console.error("缺少 pricingDaySheet");
  process.exit(1);
}

async function notion(urlPath, init = {}) {
  const res = await fetch(`https://api.notion.com/v1${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${urlPath}: ${JSON.stringify(body)}`);
  return body;
}

const meta = await notion(`/databases/${dashUuid(dbId)}`);
const existing = meta.properties || {};
const toAdd = {};
if (!existing["幂等键"]) toAdd["幂等键"] = { rich_text: {} };
if (!existing["人工锁定"]) toAdd["人工锁定"] = { checkbox: {} };
if (!existing["生成来源"]) {
  toAdd["生成来源"] = {
    select: {
      options: [
        { name: "manual", color: "gray" },
        { name: "itinerary_stub", color: "blue" },
      ],
    },
  };
}
if (!existing["日序"]) toAdd["日序"] = { number: {} };
if (!existing["日标题"]) toAdd["日标题"] = { rich_text: {} };
if (!existing["线路"]) {
  toAdd["线路"] = {
    select: {
      options: [
        { name: "r1", color: "green" },
        { name: "r2", color: "yellow" },
        { name: "r3", color: "orange" },
      ],
    },
  };
}

if (!Object.keys(toAdd).length) {
  console.log("列已齐全，无需修改");
  process.exit(0);
}

await notion(`/databases/${dashUuid(dbId)}`, {
  method: "PATCH",
  body: JSON.stringify({ properties: toAdd }),
});
console.log("已添加列：", Object.keys(toAdd).join(", "));
