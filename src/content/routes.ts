import { parse } from "yaml";
import type { RouteId, Tx } from "@/types";
import { EXCL_LABELS, INCL_LABELS, type ExclId, type InclId } from "@/data/tourFacts";
import { inferSrc, txOf } from "@/content/helpers";

/**
 * 第一层内容解耦：路线内容写在仓库根目录的 content/routes/*.yaml，构建时同步读取。
 *
 * 工作流（非技术人员也能操作）：
 *   GitHub 网页进入仓库 → 编辑 content/routes/r3.yaml → 页面底部 Commit
 *   → Actions 自动构建并部署 → 约 1 分钟后面上生效，全程不用改代码。
 *
 * 安全网：文件缺失、YAML 语法错误、或某个字段没填 —— 都会逐字段回退到调用方
 * 传入的 fallback（代码里的默认值），页面不会白屏或报错。
 */

export type RouteContent = {
  badge: Tx;
  name: Tx;
  tagline: Tx;
  regions: Tx;
  feature: Tx;
  days: Tx;
  entry: Tx;
  exit: Tx;
  audience: Tx;
  price: Tx;
  /** public/ 下的相对路径，例如 tours/r1-kunming-exit.jpg */
  cover: string;
  included: InclId[];
  excluded: ExclId[];
};

const files = import.meta.glob("../../content/routes/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const parsed: Partial<Record<RouteId, Record<string, unknown>>> = {};

for (const [path, raw] of Object.entries(files)) {
  const id = path.split("/").pop()?.replace(/\.ya?ml$/, "") as RouteId | undefined;
  if (!id) continue;
  try {
    parsed[id] = (parse(raw) ?? {}) as Record<string, unknown>;
  } catch (err) {
    // YAML 语法错误：跳过该文件，回退到代码默认值
    console.warn(`[content] ${path} 解析失败，已回退到代码默认值`, err);
  }
}

/** 只保留合法 id，过滤掉 YAML 里写错的值 */
function idsOf<T extends string>(
  value: unknown,
  valid: readonly string[],
  fallback: T[],
): T[] {
  if (Array.isArray(value)) {
    const clean = value.filter(
      (v): v is T => typeof v === "string" && valid.includes(v.trim()),
    );
    if (clean.length > 0) return clean;
  }
  return fallback;
}

const VALID_INCL = Object.keys(INCL_LABELS);
const VALID_EXCL = Object.keys(EXCL_LABELS);

function coverOf(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim().replace(/^\//, "") : fallback;
}

/** 取某条路线的内容：YAML 优先，逐字段回退到 fallback */
export function routeContent(id: RouteId, fallback: RouteContent): RouteContent {
  const src = parsed[id];
  if (!src) return fallback;
  const fileSrc = inferSrc(src, "zh");
  return {
    badge: txOf(src.badge, fallback.badge, fileSrc),
    name: txOf(src.name, fallback.name, fileSrc),
    tagline: txOf(src.tagline, fallback.tagline, fileSrc),
    regions: txOf(src.regions, fallback.regions, fileSrc),
    feature: txOf(src.feature, fallback.feature, fileSrc),
    days: txOf(src.days, fallback.days, fileSrc),
    entry: txOf(src.entry, fallback.entry, fileSrc),
    exit: txOf(src.exit, fallback.exit, fileSrc),
    audience: txOf(src.audience, fallback.audience, fileSrc),
    price: txOf(src.price, fallback.price, fileSrc),
    cover: coverOf(src.cover, fallback.cover),
    included: idsOf<InclId>(src.included, VALID_INCL, fallback.included),
    excluded: idsOf<ExclId>(src.excluded, VALID_EXCL, fallback.excluded),
  };
}

/** 已提供 YAML 的路线 id（调试 / 排查用） */
export const yamlRouteIds = Object.keys(parsed) as RouteId[];
