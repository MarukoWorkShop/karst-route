/**
 * Dump current light experience SKUs → content/light-skus.yaml
 * Run: npx vite-node scripts/dump-light-skus.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";
import { lightExperiences } from "../src/data/lightExperiences.ts";
import { LIGHT_SKU_PRICE, LIGHT_SKU_PRICE_NOTE } from "../src/lib/lightPrice.ts";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function imagePath(p) {
  const s = String(p);
  const m = s.match(/\/(light\/[^\s?#]+)/);
  if (m) return m[1];
  return s.replace(/^\//, "");
}

const items = [];
let sort = 0;
for (const cat of lightExperiences) {
  for (const kind of ["routes", "meals"]) {
    for (const r of cat[kind] ?? []) {
      sort += 10;
      const price = LIGHT_SKU_PRICE[r.id] ?? r.price ?? null;
      const note = LIGHT_SKU_PRICE_NOTE[r.id];
      items.push({
        id: r.id,
        category: cat.id,
        kind: kind === "meals" ? "meal" : "route",
        status: "live",
        sort,
        title: { en: r.title.en, zh: r.title.zh },
        blurb: (r.blurb ?? []).map((b) => ({ en: b.en, zh: b.zh })),
        images: (r.images ?? []).map(imagePath),
        ...(price ? { price } : {}),
        ...(note ? { priceNote: { en: note.en, zh: note.zh } } : {}),
      });
    }
  }
}

const out = path.join(root, "content", "light-skus.yaml");
const header = `# 轻体验 SKU 清单（可售小产品）
# 修改方式二选一：
#   1. Notion「轻体验清单」表 → npm run content:notion 同步回本文件
#   2. 直接改本文件
# 字段说明见 content/notion-import/README.md「轻体验清单」一节。
#
`;
fs.writeFileSync(out, header + stringify({ src: "zh", items }, { lineWidth: 0 }), "utf8");
console.log(`wrote ${items.length} skus → ${out}`);
console.log(items.map((i) => `${i.category}/${i.id}`).join("\n"));
