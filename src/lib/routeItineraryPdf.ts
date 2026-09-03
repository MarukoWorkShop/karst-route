import type { RouteId, Tx } from "@/types";
import { routes } from "@/data/itinerary";
import { copy } from "@/i18n/copy";
import { daysToBrief, downloadBriefPdf, pdfChrome } from "@/lib/briefPdf";

const FILENAMES: Record<RouteId, string> = {
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

export async function downloadRouteItineraryPdf(
  routeId: RouteId,
  t: (tx: Tx) => string,
  locale: "en" | "zh",
) {
  const route = routes[routeId];
  await downloadBriefPdf({
    filename: FILENAMES[routeId],
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
