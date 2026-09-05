import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { BookRouteFlow } from "@/components/plan/BookRouteFlow";
import { DesignRouteFlow } from "@/components/plan/DesignRouteFlow";
import type { RouteId } from "@/types";

export function PlanSection({
  tab,
  onTab,
  route,
}: {
  tab: "custom" | "boutique";
  onTab: (tab: "custom" | "boutique") => void;
  route: RouteId;
}) {
  const { t } = useLocale();
  const boutique = tab === "boutique";

  return (
    <section id="plan" className="scroll-mt-24 border-y border-cta/20 bg-bone py-14 md:py-20">
      <div className="page-col">
        <p className="text-[13px] font-semibold tracking-[0.16em] text-cta uppercase">
          {t(copy.plan.kicker)}
        </p>
        <h2 className="mt-2 max-w-[720px] text-[26px] leading-tight font-semibold text-balance text-ink md:text-[34px]">
          {t(copy.plan.h2)}
        </h2>
        <p className="mt-3 max-w-[640px] text-[14px] leading-[22px] text-ink-soft">
          {t(copy.plan.h2Sub)}
        </p>

        <div className="mt-8 w-full md:mt-10">
          {/* 文件夹页签：与下方面板左右齐平，选中页签叠在面板顶边上消缝 */}
          <div role="tablist" className="relative z-[1] flex items-end gap-1.5">
            <button
              type="button"
              role="tab"
              aria-selected={boutique}
              onClick={() => onTab("boutique")}
              className={`relative inline-flex min-h-[48px] flex-1 items-center justify-center rounded-t-[12px] border px-3 py-2.5 text-center text-[12.5px] leading-[1.3] font-semibold transition-colors md:min-h-[52px] md:px-5 md:text-[14px] ${
                boutique
                  ? "z-[2] -mb-px border-gold/40 border-b-paper bg-paper text-cta"
                  : "z-[0] border-line/70 bg-bone/80 text-ink-soft hover:bg-bone-2 hover:text-ink"
              }`}
            >
              {t(copy.plan.tabBook)}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!boutique}
              onClick={() => onTab("custom")}
              className={`relative inline-flex min-h-[48px] flex-1 items-center justify-center rounded-t-[12px] border-2 px-3 py-2.5 text-center text-[12.5px] leading-[1.3] font-semibold transition-colors md:min-h-[52px] md:px-5 md:text-[14px] ${
                !boutique
                  ? "z-[2] -mb-[2px] border-cta border-b-paper bg-cta text-paper"
                  : "z-[0] border-2 border-line/70 bg-bone/80 text-ink-soft hover:bg-bone-2 hover:text-ink"
              }`}
            >
              {t(copy.plan.tabDesign)}
            </button>
          </div>

          {/* 文件夹本体：定制与预订同 paper 底，仅用 2px 墨绿边区分 */}
          <div
            className={`relative rounded-b-2xl bg-paper p-5 md:p-8 shadow-[0_10px_36px_color-mix(in_srgb,var(--color-ink)_6%,transparent)] ${
              boutique
                ? "rounded-tr-2xl border border-gold/40"
                : "rounded-tl-2xl border-2 border-cta"
            }`}
          >
            <div className={boutique ? "" : "hidden"}>
              <BookRouteFlow route={route} />
            </div>
            <div className={boutique ? "hidden" : ""}>
              <DesignRouteFlow route={route} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
