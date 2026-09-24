import { useState } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { conciergeContact, hasFallbackChannel } from "@/data/concierge";
import { asset } from "@/lib/asset";
import { downloadBriefPdf, pdfChrome, type BriefRow } from "@/lib/briefPdf";
import { IconDownload } from "@/components/plan/PlanUi";

/**
 * 询单发送失败时的兜底：直接联系管家 + 把已填内容下载成 PDF。
 * 联系方式来自 content/concierge.yaml，未配置的通道不显示。
 */
export function ConciergeFallback({
  rows,
  filename,
  kicker,
  title,
}: {
  rows: BriefRow[];
  filename: string;
  kicker: string;
  title: string;
}) {
  const { t, locale } = useLocale();
  const c = conciergeContact;
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState(false);
  const [copied, setCopied] = useState(false);

  const channels = [
    c.wechatQr || c.wechatId ? "wechat" : "",
    c.whatsapp ? "whatsapp" : "",
    c.email ? "email" : "",
  ].filter(Boolean);

  async function downloadBrief() {
    setPdfBusy(true);
    setPdfErr(false);
    try {
      await downloadBriefPdf({
        filename,
        kicker,
        title,
        generated: t(copy.plan.pdfGenerated).replace(
          "{d}",
          new Date().toLocaleString(locale === "zh" ? "zh-CN" : "en-GB"),
        ),
        rows,
        days: [],
        ...pdfChrome(t),
      });
    } catch {
      setPdfErr(true);
    } finally {
      setPdfBusy(false);
    }
  }

  function copyWechat() {
    if (!c.wechatId) return;
    void navigator.clipboard
      ?.writeText(c.wechatId)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => setCopied(false));
  }

  return (
    <div className="mt-2.5 rounded-[10px] border border-line bg-bone/40 px-4 py-3.5">
      <p className="text-[13px] font-medium text-ink">{t(copy.plan.fallbackTitle)}</p>
      {c.note[locale] ? (
        <p className="mt-1 text-[12px] leading-5 text-ink-soft">{c.note[locale]}</p>
      ) : null}

      {channels.length ? (
        <div className="mt-3 flex flex-col gap-2.5">
          {c.wechatQr || c.wechatId ? (
            <div className="flex items-start gap-3">
              {c.wechatQr ? (
                <img
                  src={asset(c.wechatQr)}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-md border border-line bg-surface object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="min-w-0">
                <p className="text-[12px] text-ink-soft">{t(copy.plan.fallbackWechat)}</p>
                {c.wechatId ? (
                  <button
                    type="button"
                    onClick={copyWechat}
                    className="mt-0.5 inline-flex items-center gap-1.5 text-[14px] font-medium text-cta transition hover:underline"
                  >
                    {c.wechatId}
                    <span className="text-[11px] font-normal text-ink-soft">
                      {copied ? t(copy.plan.copied) : t(copy.plan.copyHint)}
                    </span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {c.whatsapp ? (
            <a
              href={`https://wa.me/${c.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="text-[13.5px] font-medium text-cta transition hover:underline"
            >
              {t(copy.plan.fallbackWhatsapp)}
            </a>
          ) : null}

          {c.email ? (
            <a
              href={`mailto:${c.email}`}
              className="text-[13.5px] font-medium text-cta transition hover:underline"
            >
              {c.email}
            </a>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        disabled={pdfBusy}
        onClick={() => void downloadBrief()}
        className="mt-3.5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border-[1.5px] border-cta px-4 text-[13px] font-medium text-cta transition hover:bg-cta/8 disabled:opacity-60"
      >
        <IconDownload />
        {pdfBusy ? t(copy.plan.pdfPreparing) : t(copy.plan.fallbackDownload)}
      </button>
      {pdfErr ? <p className="mt-1.5 text-[12px] text-danger">{t(copy.plan.pdfFailed)}</p> : null}
    </div>
  );
}

/** 没有任何联系方式时，只保留 PDF 下载这一个兜底 */
export const fallbackAvailable = hasFallbackChannel();
