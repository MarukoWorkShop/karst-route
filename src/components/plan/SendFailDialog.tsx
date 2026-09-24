import { useEffect } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { ConciergeFallback } from "@/components/plan/ConciergeFallback";
import { IconSend } from "@/components/plan/PlanUi";
import type { BriefRow } from "@/lib/briefPdf";

/**
 * 询单发送失败时的居中大卡：
 *  - 说明是网络问题、可再试
 *  - 一键重试
 *  - 直接联系管家（二维码 / WhatsApp / 邮箱，来自 content/concierge.yaml）
 *  - 把已填的旅行计划下载成 PDF，不依赖网络
 */
export function SendFailDialog({
  open,
  sending,
  rows,
  filename,
  kicker,
  title,
  onRetry,
  onClose,
}: {
  open: boolean;
  sending: boolean;
  rows: BriefRow[];
  filename: string;
  kicker: string;
  title: string;
  onRetry: () => void;
  onClose: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, sending, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(copy.plan.failDialogTitle)}
    >
      <button
        type="button"
        aria-label={t(copy.nav.close)}
        className="absolute inset-0 bg-[rgba(22,36,30,0.55)] backdrop-blur-[2px]"
        onClick={() => !sending && onClose()}
      />
      <div className="relative z-[1] flex max-h-[min(88dvh,860px)] w-full max-w-[560px] flex-col overflow-y-auto overscroll-contain rounded-xl bg-surface shadow-[0_24px_64px_rgba(16,28,22,0.24)] ring-1 ring-line">
        <button
          type="button"
          aria-label={t(copy.nav.close)}
          disabled={sending}
          onClick={onClose}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper text-[16px] leading-none text-ink-soft transition hover:border-cta/40 hover:text-cta disabled:opacity-40"
        >
          ×
        </button>

        <div className="border-b border-line/80 bg-bone/30 px-5 py-4">
          <p className="text-[15px] font-semibold text-ink">{t(copy.plan.failDialogTitle)}</p>
          <p className="mt-1.5 text-[13px] leading-[22px] text-ink-soft">
            {t(copy.plan.failDialogBody)}
          </p>
        </div>

        <div className="px-5 py-4">
          <button
            type="button"
            disabled={sending}
            onClick={onRetry}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-cta text-[14px] font-semibold text-surface transition hover:bg-cta/90 disabled:opacity-60"
          >
            <IconSend />
            {sending ? t(copy.plan.sending) : t(copy.plan.failRetry)}
          </button>

          {/* 联系方式（二维码 / WhatsApp / 邮箱）+ 旅行计划 PDF 下载 */}
          <ConciergeFallback
            rows={rows}
            filename={filename}
            kicker={kicker}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
