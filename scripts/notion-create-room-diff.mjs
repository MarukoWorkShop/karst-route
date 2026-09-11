#!/usr/bin/env node
/**
 * 在「人数验算」分区下建「报价·房差算法」表，并按按日酒店灌入：
 *   当日房差 = 双人间价 × 间数 ÷ 同房人数（默认2，对齐报价单附注）
 *   线路房差 = 各日加总
 *
 *   node scripts/notion-create-room-diff.mjs
 *   （之后 npm run content:notion 会刷新数字）
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("需要 NOTION_TOKEN");
  process.exit(1);
}

const cfgPath = path.join(root, "content/notion.yaml");
const cfg = parseYaml(fs.readFileSync(cfgPath, "utf8"));
const dash = (id) => {
  const s = String(id).replace(/-/g, "");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
};

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

function title(s) {
  return { title: [{ text: { content: String(s ?? "") } }] };
}
function rt(s) {
  return { rich_text: [{ text: { content: String(s ?? "") } }] };
}
function num(n) {
  return { number: n };
}
function sel(name) {
  return { select: { name } };
}

const parentPageId = cfg.pricingSections?.validate;
if (!parentPageId) {
  console.error("notion.yaml 缺少 pricingSections.validate");
  process.exit(1);
}

// 优先挂在「人数验算」分区页；若归档则解档后再挂
try {
  const p = await notion(`/pages/${dash(parentPageId)}`);
  if (p.archived) {
    await notion(`/pages/${dash(parentPageId)}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: false }),
    });
    console.log("unarchived validate section");
  }
} catch (e) {
  console.warn("validate section check:", e.message);
}

const createParent = { type: "page_id", page_id: dash(parentPageId) };
console.log("parent", createParent);

let roomDiffId = cfg.databases?.pricingRoomDiff;
if (roomDiffId) {
  console.log("已有 pricingRoomDiff", roomDiffId, "— 跳过建表，仅确认存在");
  try {
    await notion(`/databases/${dash(roomDiffId)}`);
  } catch {
    roomDiffId = null;
  }
}

if (!roomDiffId) {
  console.log("建表：报价·房差算法…");
  const db = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: createParent,
      title: [{ type: "text", text: { content: "人数验算 · 房差算法表" } }],
      description: [
        {
          type: "text",
          text: {
            content:
              "每人每天按一间房（双人间价×间数）；有酒店的行程日一行，线路合计行单独列出。同步：npm run content:notion",
          },
        },
      ],
      properties: {
        标题: { title: {} },
        线路: {
          select: {
            options: [
              { name: "r1", color: "blue" },
              { name: "r2", color: "green" },
              { name: "r3", color: "orange" },
            ],
          },
        },
        行类: {
          select: {
            options: [
              { name: "按日", color: "gray" },
              { name: "线路合计", color: "yellow" },
            ],
          },
        },
        日序: { number: { format: "number" } },
        酒店名称: { rich_text: {} },
        酒店代号: { rich_text: {} },
        双人间价: { number: { format: "number" } },
        间数: { number: { format: "number" } },
        当日房差: { number: { format: "number" } },
        线路房差: { number: { format: "number" } },
        口径说明: { rich_text: {} },
        状态: {
          select: {
            options: [
              { name: "已发布", color: "green" },
              { name: "草稿", color: "gray" },
            ],
          },
        },
      },
    }),
  });
  roomDiffId = db.id.replace(/-/g, "");
  console.log("  created", roomDiffId);

  try {
    const parentId = createParent.page_id;
    await notion(`/blocks/${parentId}/children`, {
      method: "PATCH",
      body: JSON.stringify({
        children: [
          {
            type: "heading_3",
            heading_3: {
              rich_text: [{ type: "text", text: { content: "房差算法表" } }],
            },
          },
          {
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "每人每天按一间房（双人间价×间数）加总；与人数验算并列，供儿童价=成人−房差对照。",
                  },
                },
              ],
            },
          },
          {
            type: "link_to_page",
            link_to_page: { type: "database_id", database_id: dash(roomDiffId) },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn("  link_to_page 失败（可手动挂）", e.message);
  }

  let text = fs.readFileSync(cfgPath, "utf8");
  if (/pricingRoomDiff:/.test(text)) {
    text = text.replace(/pricingRoomDiff:\s*\S+/, `pricingRoomDiff: ${roomDiffId}`);
  } else {
    text = text.replace(
      /(pricingValidate:\s*\S+)/,
      `$1\n  pricingRoomDiff: ${roomDiffId}`,
    );
  }
  fs.writeFileSync(cfgPath, text);
  console.log("  wrote notion.yaml pricingRoomDiff");
}

console.log("灌入/刷新请跑: npm run content:notion");
console.log("done", roomDiffId);
