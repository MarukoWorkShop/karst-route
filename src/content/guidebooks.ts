import { parse } from "yaml";
import type { RouteId, Tx } from "@/types";
import { inferSrc, txOf } from "@/content/helpers";

export type RouteGuidebook = {
  /** public/ 相对路径；空表示暂无静态路书 */
  file: string;
  title: Tx;
  /** 浏览器下载时的文件名；空则用路径末段 */
  downloadName: string;
};

const emptyTx = (en: string, zh: string): Tx => ({ en, zh });

const FALLBACK: Record<RouteId, RouteGuidebook> = {
  r1: {
    file: "guidebooks/r1/YouXian-ThreeLands-14D-Bilingual-Itinerary.pdf",
    title: emptyTx("Three Lands — 14D bilingual itinerary", "三境 14日 双语路书"),
    downloadName: "YouXian-ThreeLands-14D-Bilingual-Itinerary.pdf",
  },
  r2: {
    file: "",
    title: emptyTx("Route 2 itinerary", "路线二路书"),
    downloadName: "",
  },
  r3: {
    file: "guidebooks/r3/YouXian-Chongzuo-Weizhou-7D6N-Bilingual-Itinerary.pdf",
    title: emptyTx(
      "Chongzuo · Weizhou — 7D6N bilingual itinerary",
      "崇左·涠洲 7天6晚 双语路书",
    ),
    downloadName: "YouXian-Chongzuo-Weizhou-7D6N-Bilingual-Itinerary.pdf",
  },
};

const rawModules = import.meta.glob("../../content/guidebooks.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const raw = Object.values(rawModules)[0];

function parseGuidebooks(): Record<RouteId, RouteGuidebook> {
  const out: Record<RouteId, RouteGuidebook> = { ...FALLBACK };
  if (!raw) return out;
  try {
    const doc = (parse(raw) ?? {}) as Record<string, unknown>;
    const fileSrc = inferSrc(doc, "zh");
    const routes = (doc.routes && typeof doc.routes === "object" ? doc.routes : {}) as Record<
      string,
      Record<string, unknown>
    >;
    for (const id of ["r1", "r2", "r3"] as RouteId[]) {
      const row = routes[id];
      const fb = FALLBACK[id];
      if (!row || typeof row !== "object") {
        out[id] = fb;
        continue;
      }
      const file = typeof row.file === "string" ? row.file.trim().replace(/^\//, "") : "";
      const downloadName =
        typeof row.downloadName === "string" ? row.downloadName.trim() : fb.downloadName;
      out[id] = {
        file: file || fb.file,
        title: txOf(row.title, fb.title, fileSrc),
        downloadName: downloadName || (file ? file.split("/").pop() ?? "" : fb.downloadName),
      };
    }
  } catch (err) {
    console.warn("[content] guidebooks.yaml 解析失败，已回退默认", err);
  }
  return out;
}

export const routeGuidebooks = parseGuidebooks();

export function guidebookFile(routeId: RouteId): string | null {
  const f = routeGuidebooks[routeId]?.file?.trim();
  return f ? f : null;
}
