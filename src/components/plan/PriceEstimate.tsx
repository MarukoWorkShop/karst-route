import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { estimateParty, formatMoney } from "@/lib/estimate";
import { pricingAvailable, resolveMarketTier } from "@/data/routePricing";
import { useFxRates, usePriceCurrency } from "@/hooks/useFx";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";

/**
 * 参考报价面板（预订流程 · 人数旁 / 下方）。
 * 优先展示 Word「市场报价」（加粗）；无档位时回退公式测算。
 * 英文版按参考汇率显示 USD/EUR，可切换；中文版为人民币。
 */
export function PriceEstimate({
  route,
  adults,
  children,
  className = "",
}: {
  route: RouteId | "";
  adults: number;
  children: number;
  className?: string;
}) {
  const { t, locale } = useLocale();
  const { rates } = useFxRates();
  const { currency, setCurrency } = usePriceCurrency();
  const money = (v: number) => formatMoney(v, { locale, currency, rates });

  if (!route) return null;

  if (!pricingAvailable(route)) {
    return (
      <aside className={`rounded-lg border border-line/80 bg-bone/40 px-4 py-3.5 ${className}`}>
        <p className="text-[12.5px] leading-5 text-ink-soft">{t(copy.plan.estUnavailable)}</p>
      </aside>
    );
  }

  const n = adults + children;
  const market = resolveMarketTier(route, n);
  const est = estimateParty(route, adults, children);

  if (!market && !est) {
    return (
      <aside className={`rounded-lg border border-line/80 bg-bone/40 px-4 py-3.5 ${className}`}>
        <p className="text-[12.5px] leading-5 text-ink-soft">{t(copy.plan.estOversize)}</p>
      </aside>
    );
  }

  const adultPer = market?.adult ?? est!.adultPerPerson;
  const childPer = market?.child ?? est!.childPerPerson;
  const subtotal = adults * adultPer + children * childPer;
  const partyN = est?.n ?? n;
  const partyA = est?.adults ?? adults;
  const partyC = est?.children ?? children;

  return (
    <aside
      aria-live="polite"
      className={`overflow-hidden rounded-lg border border-gold/35 bg-bone-2/70 ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gold/20 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-gold uppercase">
            {t(copy.plan.estBadge)}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink">{t(copy.plan.estTitle)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {locale === "en" ? <CurrencyToggle value={currency} onChange={setCurrency} /> : null}
          <p className="text-[11.5px] leading-4 text-ink-soft">
            {t(copy.plan.estForParty)
              .replace("{n}", String(partyN))
              .replace("{a}", String(partyA))
              .replace("{c}", String(partyC))}
          </p>
        </div>
      </div>

      <div className="px-4 pt-1 pb-2">
        <div className="flex items-baseline justify-between gap-3 border-b border-line/70 py-2.5">
          <span className="text-[12px] text-ink-soft">{t(copy.plan.estMarketAdult)}</span>
          <span className="font-mono text-[15px] font-bold tabular-nums text-ink">
            {money(adultPer)}
            <span className="ml-1 text-[11px] font-sans font-normal text-ink-soft">
              {t(copy.plan.estPerUnit)}
            </span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-line/70 py-2.5">
          <span className="text-[12px] text-ink-soft">{t(copy.plan.estMarketChild)}</span>
          <span className="font-mono text-[15px] font-bold tabular-nums text-ink">
            {money(childPer)}
            <span className="ml-1 text-[11px] font-sans font-normal text-ink-soft">
              {t(copy.plan.estPerUnit)}
            </span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-3">
          <span className="text-[12px] font-semibold text-ink">{t(copy.plan.estSubtotal)}</span>
          <span className="font-mono text-[22px] leading-none font-bold tracking-[-0.02em] tabular-nums text-cta">
            {money(subtotal)}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-t border-gold/20 bg-bone/35 px-4 py-3.5">
        {locale === "en" ? (
          <p className="text-[11px] leading-4 text-ink-soft">{t(copy.plan.estFxNote)}</p>
        ) : null}
        {est?.fleetAdjusted ? (
          <p className="text-[11px] leading-4 text-ink-soft">{t(copy.plan.estFleetHint)}</p>
        ) : null}
        {children > 0 ? (
          <p className="text-[11px] leading-4 text-ink-soft">{t(copy.plan.estChildrenHint)}</p>
        ) : null}
        <p className="text-[12px] leading-5 font-semibold text-ink">{t(copy.plan.estDisclaimer)}</p>
        <p className="text-[11.5px] leading-[18px] text-ink-soft">{t(copy.plan.estConciergeHint)}</p>
      </div>
    </aside>
  );
}
