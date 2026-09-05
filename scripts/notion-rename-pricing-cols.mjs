#!/usr/bin/env node
/**
 * 把 Notion 定价三表的英文列名改成主理人可读的中文列首。
 * 同步脚本会同时认新旧列名。
 *
 * Usage: node scripts/notion-rename-pricing-cols.mjs
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
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

const token = process.env.NOTION_TOKEN?.trim();
if (!token) {
  console.error("缺少 NOTION_TOKEN");
  process.exit(1);
}

const cfg = parseYaml(fs.readFileSync(path.join(root, "content/notion.yaml"), "utf8"));
const VERSION = "2022-06-28";

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${url}\n${JSON.stringify(data, null, 2)}`);
  return data;
}

/** 旧英文列名 → 新中文列名 */
const RENAMES = {
  pricing: {
    id: "线路",
    status: "估算开关",
    source: "数据口径说明",
    band1Max: "车档1·人数上限",
    band1Price: "车档1·整车包价(元)",
    band2Max: "车档2·人数上限",
    band2Price: "车档2·整车包价(元)",
    band3Max: "车档3·人数上限",
    band3Price: "车档3·整车包价(元)",
    band4Max: "车档4·人数上限",
    band4Price: "车档4·整车包价(元)",
    leader: "领队成本(元/团)",
    ops: "运营税费(元/团)",
    reserve: "储备金(元/团)",
    margin: "加成率(如0.2=加20%)",
    roundBase: "报价取整基数(元)",
    note: "备注",
  },
  pricingModules: {
    route: "线路",
    moduleId: "模块代号",
    name_zh: "模块名称·中文",
    name_en: "模块名称·英文",
    basis: "口径备注(不参与计算)",
    adult: "成人人均成本(元)",
    child: "儿童人均成本(元)",
    note: "备注",
  },
  pricingAnchors: {
    route: "线路",
    n: "人数档(如2/4/6)",
    adult: "成人发布价(元)",
    child: "儿童发布价(元)",
    note: "备注",
  },
};

const DB_TITLES = {
  pricing: "线路定价参数",
  pricingModules: "成本模块",
  pricingAnchors: "报价锚点",
};

/** status / basis 选项：旧 → 新（更易懂；同步时会映射回英文码） */
const OPTION_RENAMES = {
  pricing: {
    估算开关: {
      none: "关闭·网站不显示估算",
      demo: "演示·仅供参考",
      confirmed: "正式·可对外",
    },
  },
  pricingModules: {
    "口径备注(不参与计算)": {
      per_person: "按人",
      per_room_night: "按间夜均摊",
      per_group_per_head: "团费人均",
    },
    模块代号: {
      stay: "stay·住宿",
      tickets: "tickets·门票体验",
      dining: "dining·餐食",
      localTransport: "localTransport·境内交通",
      crossBorder: "crossBorder·跨境交通",
      insurance: "insurance·保险",
      welcome: "welcome·伴手礼服务包",
    },
  },
};

for (const key of ["pricing", "pricingModules", "pricingAnchors"]) {
  const id = cfg.databases[key];
  if (!id) continue;
  const db = await api("GET", `https://api.notion.com/v1/databases/${id}`);
  const props = db.properties || {};
  const patchProps = {};

  // 1) 重命名列
  const map = RENAMES[key] || {};
  for (const [oldName, newName] of Object.entries(map)) {
    if (!props[oldName]) {
      // 可能已改过
      if (props[newName]) console.log(`  skip rename ${oldName} → already ${newName}`);
      else console.log(`  missing column ${oldName}`);
      continue;
    }
    if (oldName === newName) continue;
    patchProps[oldName] = { name: newName };
  }

  if (Object.keys(patchProps).length) {
    await api("PATCH", `https://api.notion.com/v1/databases/${id}`, { properties: patchProps });
    console.log(`renamed columns on ${key}:`, Object.keys(patchProps).join(", "));
  }

  // 刷新 schema
  const db2 = await api("GET", `https://api.notion.com/v1/databases/${id}`);
  const props2 = db2.properties || {};

  // 2) 重命名 select 选项（保留 option id）
  const optMaps = OPTION_RENAMES[key] || {};
  for (const [colName, valueMap] of Object.entries(optMaps)) {
    const prop = props2[colName];
    if (!prop || prop.type !== "select") {
      console.log(`  skip options ${colName} (not found)`);
      continue;
    }
    const options = (prop.select.options || []).map((o) => {
      const next = valueMap[o.name];
      return next && next !== o.name ? { id: o.id, name: next, color: o.color } : { id: o.id, name: o.name, color: o.color };
    });
    // 补上缺失的 confirmed / per_group 等
    for (const [oldV, newV] of Object.entries(valueMap)) {
      if (!options.some((o) => o.name === newV || o.name === oldV)) {
        options.push({ name: newV, color: "default" });
      }
    }
    await api("PATCH", `https://api.notion.com/v1/databases/${id}`, {
      properties: { [colName]: { select: { options } } },
    });
    console.log(`  options updated: ${colName}`);
  }

  // 3) 表标题
  const title = DB_TITLES[key];
  const curTitle = (db2.title || []).map((t) => t.plain_text).join("");
  if (title && curTitle !== title) {
    await api("PATCH", `https://api.notion.com/v1/databases/${id}`, {
      title: [{ type: "text", text: { content: title } }],
    });
    console.log(`  title → ${title}`);
  }

  console.log("OK", key, "→", `https://www.notion.so/${id.replace(/-/g, "")}`);
}

console.log("\n完成。请到 Notion 刷新页面查看新列名。");
