import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { DayStop, Tx } from "@/types";
import { about } from "@/content/about";
import { copy } from "@/i18n/copy";

export type BriefRow = { label: string; value: string };

export type BriefDay = {
  num: string;
  city: string;
  stay: string;
  bullets: string[];
  transport?: string;
  lodging?: string;
  dining?: string[];
  drive?: string;
  blurb?: string;
  date?: string;
};

export type BriefPdfInput = {
  filename: string;
  kicker: string;
  title: string;
  generated: string;
  requestTitle: string;
  rows: BriefRow[];
  itineraryTitle: string;
  days: BriefDay[];
  labels: {
    highlights: string;
    transport: string;
    stay: string;
    dining: string;
    drive: string;
    blurb: string;
  };
  footer: string;
};

export function todayIso(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(start: string, offset: number) {
  const [y, m, d] = start.split("-").map(Number);
  if (!y || !m || !d) return start;
  return todayIso(new Date(y, m - 1, d + offset));
}

export function formatDayDate(iso: string, locale: "en" | "zh") {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  if (locale === "zh") {
    const wd = ["日", "一", "二", "三", "四", "五", "六"][dt.getDay()];
    return `${y}年${m}月${d}日 周${wd}`;
  }
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function stampDays(
  days: BriefDay[],
  startIso: string | undefined,
  locale: "en" | "zh",
): BriefDay[] {
  if (!startIso || !/^\d{4}-\d{2}-\d{2}$/.test(startIso)) return days;
  return days.map((day, i) => ({
    ...day,
    date: formatDayDate(addDaysIso(startIso, i), locale),
  }));
}

export function daysToBrief(
  stops: DayStop[],
  t: (tx: Tx) => string,
): BriefDay[] {
  return stops.map((day, i) => ({
    num: String(day.day || i + 1).padStart(2, "0"),
    city: t(day.city),
    stay: t(day.stay),
    bullets: day.bullets.map((b) => t(b)),
    transport: day.transport ? t(day.transport) : "",
    lodging: day.lodging ? t(day.lodging) : "",
    dining: (day.dining ?? []).map((d) => t(d)),
    drive: day.drive ? t(day.drive) : "",
    blurb: day.blurb ? t(day.blurb) : "",
  }));
}

export function pdfChrome(t: (tx: Tx) => string) {
  return {
    requestTitle: t(copy.plan.pdfRequest),
    itineraryTitle: t(copy.plan.pdfItinerary),
    labels: {
      highlights: t(copy.plan.pdfHighlights),
      transport: t(copy.tours.book.transport),
      stay: t(copy.tours.book.stay),
      dining: t(copy.tours.book.dining),
      drive: t(copy.plan.pdfDrive),
      blurb: t(copy.plan.pdfBlurb),
    },
    footer: t(copy.plan.pdfDisclaimer),
  };
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowHtml(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 12px 8px 0;font-size:11px;color:#5e7368;width:132px;vertical-align:top;white-space:nowrap;">${esc(label)}</td>
    <td style="padding:8px 0;font-size:13px;color:#1e3329;font-weight:500;line-height:1.5;">${esc(value)}</td>
  </tr>`;
}

function metaLine(label: string, value: string) {
  if (!value) return "";
  return `<div style="margin-top:8px;font-size:12px;line-height:1.55;color:#1e3329;">
    <span style="color:#5e7368;">${esc(label)} · </span>${esc(value)}
  </div>`;
}

function dayHtml(day: BriefDay, labels: BriefPdfInput["labels"]) {
  const bullets = day.bullets
    .map(
      (b) =>
        `<div style="display:flex;gap:8px;margin:0 0 5px;align-items:flex-start;">
          <span style="color:#2f5344;flex-shrink:0;">·</span>
          <span>${esc(b)}</span>
        </div>`,
    )
    .join("");
  const dining = day.dining?.length
    ? metaLine(labels.dining, day.dining.join(" · "))
    : "";
  return `<section data-pdf-keep style="border:1px solid #d9d6cc;border-radius:10px;padding:16px 18px;margin:0 0 12px;background:#fdfbf6;break-inside:avoid;page-break-inside:avoid;">
    <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
      <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;color:#2f5344;">DAY ${esc(day.num)}</span>
      <span style="font-size:15px;font-weight:500;color:#1e3329;">${esc(day.city)}</span>
    </div>
    <div style="font-size:12px;color:#5e7368;margin-bottom:10px;">${esc(day.date ? `${day.date} · ${day.stay}` : day.stay)}</div>
    ${day.blurb ? `<p style="font-size:12.5px;line-height:1.6;color:#1e3329;margin:0 0 10px;">${esc(day.blurb)}</p>` : ""}
    ${
      bullets
        ? `<div style="font-size:11px;color:#a88c56;letter-spacing:0.06em;margin-bottom:6px;">${esc(labels.highlights)}</div>
           <div style="font-size:13px;line-height:1.5;color:#1e3329;">${bullets}</div>`
        : ""
    }
    ${metaLine(labels.transport, day.transport ?? "")}
    ${metaLine(labels.stay, day.lodging ?? "")}
    ${dining}
    ${day.drive ? metaLine(labels.drive, day.drive) : ""}
  </section>`;
}

function brandMark() {
  const cut = (s: string) => s.split("—")[0].trim();
  const en = cut(about.siteTitle.en).toUpperCase();
  const zh = cut(about.siteTitle.zh);
  return [en, zh].filter(Boolean).join(" · ");
}

function documentHtml(doc: BriefPdfInput) {
  const rows = doc.rows.map((r) => rowHtml(r.label, r.value)).join("");
  const days = doc.days.map((d) => dayHtml(d, doc.labels)).join("");
  const requestBlock =
    doc.rows.length > 0
      ? `<div style="font-size:11px;font-weight:500;letter-spacing:0.08em;color:#a88c56;margin-bottom:8px;">${esc(doc.requestTitle)}</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;border-top:1px solid #d9d6cc;">${rows}</table>`
      : "";
  return `<div style="width:794px;box-sizing:border-box;padding:36px 40px 48px;background:#faf8f2;color:#1e3329;font-family:'PingFang SC','Hiragino Sans GB','Noto Sans SC','Microsoft YaHei',sans-serif;">
    <div style="font-size:11px;letter-spacing:0.16em;color:#a88c56;font-weight:500;">${esc(brandMark())}</div>
    <div style="margin-top:10px;display:inline-block;font-size:10px;letter-spacing:0.08em;color:#2f5344;border:1px solid #2f5344;border-radius:999px;padding:3px 10px;">${esc(doc.kicker)}</div>
    <h1 style="margin:10px 0 4px;font-size:22px;font-weight:500;line-height:1.35;">${esc(doc.title)}</h1>
    <div style="font-size:11px;color:#5e7368;margin-bottom:22px;">${esc(doc.generated)}</div>
    ${requestBlock}
    <div style="font-size:11px;font-weight:500;letter-spacing:0.08em;color:#a88c56;margin:8px 0 12px;">${esc(doc.itineraryTitle)}</div>
    ${days}
    <p style="margin:18px 0 0;font-size:11px;line-height:1.55;color:#5e7368;">${esc(doc.footer)}</p>
  </div>`;
}

const CREAM = "#faf8f2";

type KeepBlock = { top: number; bottom: number };

/**
 * 分页切口（画布像素，从 0 到 height）。
 * 切口尽量落在日程卡片之间；卡片本身高过一页时才允许从中切开。
 */
function planPdfCuts(height: number, pagePx: number, blocks: KeepBlock[]): number[] {
  const end = Math.max(0, Math.ceil(height));
  const page = Math.max(1, pagePx);
  const cuts = [0];
  let y = 0;
  while (y < end - 1) {
    let next = Math.min(end, y + page);
    if (next >= end - 1) {
      cuts.push(end);
      break;
    }
    const split = blocks.find((b) => b.top < next - 1 && b.bottom > next + 1);
    if (split && split.bottom - split.top <= page && split.top >= y + 16) {
      next = Math.max(y + 16, split.top - 1);
    }
    next = Math.floor(next);
    if (next <= y) next = Math.min(end, Math.floor(y + page));
    cuts.push(Math.min(end, next));
    y = cuts[cuts.length - 1];
  }
  return cuts;
}

function slicePage(src: HTMLCanvasElement, y0: number, y1: number, pagePx: number) {
  const page = document.createElement("canvas");
  page.width = src.width;
  page.height = Math.max(1, Math.ceil(pagePx));
  const ctx = page.getContext("2d");
  if (!ctx) return page;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, page.width, page.height);
  const sy = Math.max(0, Math.floor(y0));
  const sh = Math.max(0, Math.min(src.height - sy, Math.floor(y1) - sy));
  if (sh > 0) ctx.drawImage(src, 0, sy, src.width, sh, 0, 0, src.width, sh);
  return page;
}

async function rasterBrief(input: BriefPdfInput) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#faf8f2;z-index:-1;";
  host.innerHTML = documentHtml(input);
  document.body.appendChild(host);

  try {
    const root = host.firstElementChild as HTMLElement;
    const canvas = await html2canvas(root, {
      scale: 2,
      backgroundColor: CREAM,
      useCORS: true,
      logging: false,
      windowWidth: 794,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const printW = pageW - margin * 2;
    const pageInnerH = pageH - margin * 2;
    const pagePx = pageInnerH * (canvas.width / printW);
    const rootRect = root.getBoundingClientRect();
    const scaleY = rootRect.height > 0 ? canvas.height / rootRect.height : 2;
    const blocks: KeepBlock[] = [...root.querySelectorAll("[data-pdf-keep]")].map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: (rect.top - rootRect.top) * scaleY,
        bottom: (rect.bottom - rootRect.top) * scaleY,
      };
    });
    const cuts = planPdfCuts(canvas.height, pagePx, blocks);
    const pages = cuts.slice(0, -1).map((y, i) => slicePage(canvas, y, cuts[i + 1], pagePx));
    return { pdf, printW, pageInnerH, pages };
  } finally {
    host.remove();
  }
}

export async function downloadBriefPdf(input: BriefPdfInput) {
  const { pdf, printW, pageInnerH, pages } = await rasterBrief(input);
  pages.forEach((page, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(page.toDataURL("image/jpeg", 0.92), "JPEG", 8, 8, printW, pageInnerH);
  });
  pdf.save(input.filename);
}
