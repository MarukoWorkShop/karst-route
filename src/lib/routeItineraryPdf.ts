import type { RouteId, Tx } from "@/types";
import { routes } from "@/data/itinerary";
import { copy } from "@/i18n/copy";
import { daysToBrief, downloadBriefPdf, pdfChrome } from "@/lib/briefPdf";
import { asset } from "@/lib/asset";
import { guidebookFile, routeGuidebooks } from "@/content/guidebooks";

const GENERATED_FILENAMES: Record<RouteId, string> = {
  r1: "karst-r1-three-realms-itinerary.pdf",
  r2: "karst-r2-southern-loop-itinerary.pdf",
  r3: "karst-r3-chongzuo-weizhou-itinerary.pdf",
};

const NAMES = {
  r1: copy.tours.r1Name,
  r2: copy.tours.r2Name,
  r3: copy.tours.r3Name,
} as const;

const TABS = {
  r1: copy.tours.r1Tab,
  r2: copy.tours.r2Tab,
  r3: copy.tours.r3Tab,
} as const;

/** 有静态路书文件时直接下载；否则即时生成简版行程 PDF。 */
export async function downloadRouteItineraryPdf(
  routeId: RouteId,
  t: (tx: Tx) => string,
  locale: "en" | "zh",
) {
  const staticPath = guidebookFile(routeId);
  if (staticPath) {
    const meta = routeGuidebooks[routeId];
    const filename =
      meta.downloadName?.trim() ||
      staticPath.split("/").pop() ||
      GENERATED_FILENAMES[routeId];
    const href = asset(`/${staticPath}`);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const route = routes[routeId];
  await downloadBriefPdf({
    filename: GENERATED_FILENAMES[routeId],
    kicker: t(copy.tours.days),
    title: `${t(NAMES[routeId])} · ${t(TABS[routeId])}`,
    generated: t(copy.plan.pdfGenerated).replace(
      "{d}",
      new Date().toLocaleString(locale === "zh" ? "zh-CN" : "en-GB"),
    ),
    rows: [],
    days: daysToBrief(route.days, t),
    ...pdfChrome(t),
  });
}
