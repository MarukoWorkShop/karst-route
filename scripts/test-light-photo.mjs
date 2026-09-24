import fs from "node:fs";
import { parse } from "yaml";

// 与 src/lib/fx.ts 的 FALLBACK_RATES 保持一致
const RATES = { CNY: 1 / 0.138, EUR: 0.92 };
const usd = (cny) => Math.round(cny / RATES.CNY);
const eur = (cny) => Math.round((cny / RATES.CNY) * RATES.EUR);

let fail = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "ok  " : "FAIL"} ${msg}`);
  if (!cond) fail++;
};

const exp = parse(fs.readFileSync("content/experiences.yaml", "utf8"));
const skus = parse(fs.readFileSync("content/light-skus.yaml", "utf8"));
const photo = exp.items.find((i) => i.id === "photo");

console.log("— 栏目 photo —");
ok(!!photo, "photo 栏目存在");
ok(photo.title.zh === "影视级专业旅拍", `标题：${photo.title.zh}`);
ok(photo.title.en === "Cinematic Photo Shoots", `标题(en)：${photo.title.en}`);
ok(
  photo.tagline.zh === "在美景与完全放松的氛围中拍大片",
  `封面卡片文案：${photo.tagline.zh}`,
);
ok(
  photo.highlights.some((h) => h.zh.includes("亲子线")) &&
    photo.highlights.some((h) => h.zh.includes("商拍线")),
  "亮点同时覆盖亲子线与商拍线",
);
for (const k of ["duration", "group", "season"]) {
  ok(photo[k].zh === "与管家确认", `${k} = ${photo[k].zh}`);
  ok(photo[k].en === "Confirm with your concierge", `${k} (en) = ${photo[k].en}`);
}
const files = [photo.cover, ...photo.gallery];
for (const f of files) {
  ok(fs.existsSync(`public/${f}`), `图片存在 public/${f}`);
}
ok(
  !JSON.stringify(photo).includes("脏乱差"),
  "内部注明（脏乱差等）未出现在对外文案",
);

console.log("\n— 旅拍 SKU 与汇率 —");
// 旅拍 = 两个产品：亲子【漓水渔歌】¥2,100 起 · 商拍【渔舟唱早】¥6,999
const want = {
  "fisherman-family": 2100,
  "fisherman-dawn": 6999,
};
const gone = ["fisherman-family-1", "fisherman-family-2", "fisherman-family-3", "fisherman-commercial"];
for (const id of gone) {
  ok(!skus.items.some((i) => i.id === id), `旧 SKU ${id} 已移除`);
}
for (const [id, cny] of Object.entries(want)) {
  const s = skus.items.find((i) => i.id === id);
  if (!s) {
    ok(false, `${id} 存在`);
    continue;
  }
  ok(s.price?.unit === "flat" && s.price.flatCny === cny, `${id} ¥${cny}（unit=flat）`);
  ok(s.category === "photo", `${id} category=photo`);
  console.log(`     英文显示 ≈ $${usd(cny)} · €${eur(cny)}`);
  ok(!!(s.priceNote?.zh && s.priceNote?.en), `${id} 价格备注中英齐全`);
  const imgs = (s.images ?? []).map((x) => x.replace(/#contain$/, ""));
  ok(imgs.length > 0, `${id} 有图片`);
  for (const im of imgs) {
    ok(fs.existsSync(`public/${im}`), `  图片存在 public/${im}`);
  }
  if (id === "fisherman-dawn") {
    ok(
      (s.images ?? []).some((x) => x.endsWith("#contain")),
      "渔舟唱早含竖版海报（#contain 完整显示）",
    );
  }
}

// 旅拍整体：栏目图 + 两个产品图，同一张图只允许出现一次
const strip = (x) => String(x).replace(/#contain$/, "");
const photoImgs = [photo.cover, ...(photo.gallery ?? [])].filter(Boolean).map(strip);
const skuImgs = skus.items
  .filter((i) => i.category === "photo")
  .flatMap((i) => (i.images ?? []).map(strip));
const all = [...photoImgs, ...skuImgs];
const dup = all.filter((x, i) => all.indexOf(x) !== i);
ok(dup.length === 0, `旅拍图片无重复（${all.length} 处引用 / ${new Set(all).size} 张图）${dup.length ? " · 重复：" + [...new Set(dup)].join(", ") : ""}`);

console.log(fail === 0 ? "\n全部通过 ✓" : `\n失败 ${fail} 项`);
process.exit(fail === 0 ? 0 : 1);
