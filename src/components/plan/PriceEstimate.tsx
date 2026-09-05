import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { estimateParty, fmtCny } from "@/lib/estimate";
import { pricingAvailable } from "@/data/routePricing";

/**
 * 参考报价面板（预订流程 · 人数下方）。
 * 任何金额都必须标明仅供参考，并引导留下邮箱 / WhatsApp 由管家出具正式报价。
 */
export function PriceEstimate({
  route,
  adults,
  children,
}: {
  route: RouteId | "";
  adults: number;
  children: number;
}) {
  const { t } = useLocale();
  if (!route) return null;

  if (!pricingAvailable(route)) {
    return (
      <aside className="mt-4 rounded-lg border border-line bg-sage/60 px-4 py-3.5">
        <p className="text-[12.5px] leading-5 text-ink-soft">{t(copy.plan.estUnavailable)}</p>
      </aside>
    );
  }

  const est = estimateParty(route, adults, children);

  if (!est) {
    return (
      <aside className="mt-4 rounded-lg border border-line bg-sage/60 px-4 py-3.5">
        <p className="text-[12.5px] leading-5 text-ink-soft">{t(copy.plan.estOversize)}</p>
      </aside>
    );
  }

  return (
    <aside
      aria-live="polite"
      className="mt-4 overflow-hidden rounded-lg border border-cta/25 bg-surface"
    >
      {/* 顶栏：明确「参考」身份，不做促销贴纸 */}
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line bg-bone/50 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">
            {t(copy.plan.estBadge)}
          </p>
          <p className="mt-0.5 text-[15px] font-medium text-ink">{t(copy.plan.estTitle)}</p>
        </div>
        <p className="text-[11.5px] leading-4 text-ink-soft">
          {t(copy.plan.estForParty)
            .replace("{n}", String(est.n))
            .replace("{a}", String(est.adults))
            .replace("{c}", String(est.children))}
        </p>
      </div>

      <div className="px-4 pt-1 pb-2">
        <div className="flex items-baseline justify-between gap-3 border-b border-line/80 py-2.5">
          <span className="text-[12px] text-ink-soft">{t(copy.plan.estPerAdult)}</span>
          <span className="font-mono text-[15px] tabular-nums text-ink">
            {fmtCny(est.adultPerPerson)}
            <span className="ml-1 text-[11px] font-sans font-normal text-ink-soft">
              {t(copy.plan.estPerUnit)}
            </span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-line/80 py-2.5">
          <span className="text-[12px] text-ink-soft">{t(copy.plan.estPerChild)}</span>
          <span className="font-mono text-[15px] tabular-nums text-ink">
            {fmtCny(est.childPerPerson)}
            <span className="ml-1 text-[11px] font-sans font-normal text-ink-soft">
              {t(copy.plan.estPerUnit)}
            </span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-3">
          <span className="text-[12px] font-medium text-ink">{t(copy.plan.estSubtotal)}</span>
          <span className="font-mono text-[22px] leading-none font-semibold tracking-[-0.02em] tabular-nums text-cta">
            {fmtCny(est.subtotal)}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-t border-line bg-paper px-4 py-3.5">
        {children > 0 ? (
          <p className="text-[11px] leading-4 text-ink-soft">{t(copy.plan.estChildrenHint)}</p>
        ) : null}
        <p className="text-[12px] leading-5 font-medium text-ink">{t(copy.plan.estDisclaimer)}</p>
        <p className="text-[11.5px] leading-[18px] text-ink-soft">{t(copy.plan.estConciergeHint)}</p>
      </div>
    </aside>
  );
}
