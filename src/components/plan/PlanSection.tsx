import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { BookRouteFlow } from "@/components/plan/BookRouteFlow";
import { DesignRouteFlow } from "@/components/plan/DesignRouteFlow";
import type { RouteId } from "@/types";

export function PlanSection({
  tab,
  onTab,
  route,
  open,
  onToggle,
}: {
  tab: "custom" | "boutique";
  onTab: (tab: "custom" | "boutique") => void;
  route: RouteId;
  open: boolean;
  onToggle: () => void;
}) {
  const { t, locale } = useLocale();
  const boutique = tab === "boutique";

  return (
    <section id="plan" className="scroll-mt-24">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="plan-panel"
        className="flex w-full flex-col items-center bg-cta px-6 py-8 text-center text-paper transition hover:bg-cta-press md:py-11"
      >
        <span className="plan-cta-title max-w-[18em]">
          {t(copy.plan.ctaTitle)}
        </span>
        <span className="mt-2 max-w-[40ch] text-[14px] leading-snug text-paper/90 md:text-[15px]">
          {t(copy.plan.ctaSub)}
        </span>
        <span
          className={`mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-paper/40 text-paper/90 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg
            className={open ? undefined : "plan-cta-hint"}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.75 5.25 7 9.25l4.25-4" />
          </svg>
        </span>
      </button>

      <div id="plan-panel" className={open ? "border-b border-cta/20 bg-bone py-14 md:py-20" : "hidden"}>
      <div className="page-col">
        <p className="type-meta text-cta">
          {t(copy.plan.kicker)}
        </p>
        <h2 className="type-h2 mt-2 max-w-[720px] text-balance text-ink">
          {t(copy.plan.h2)}
        </h2>
        <p className="type-body mt-3 max-w-[640px] text-ink-soft">
          {t(copy.plan.h2Sub)}
        </p>

        <div className="mt-8 w-full md:mt-10">
          {/*
            文件夹页签：选中页签无底边，面板用负 margin 上叠，
            避免 border-b 与顶边在拐角处出现台阶/白缝。
          */}
          <div role="tablist" className="relative z-[1] flex items-end gap-1.5">
            <button
              type="button"
              role="tab"
              aria-selected={boutique}
              onClick={() => onTab("boutique")}
              className={`type-btn relative inline-flex min-h-[48px] flex-1 items-center justify-center rounded-t-xl border px-3 py-2.5 text-center font-semibold transition-colors md:min-h-[52px] md:px-5 ${
                boutique
                  ? "z-[2] border-gold/40 border-b-0 bg-paper text-cta after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[1px] after:bg-paper"
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
              className={`type-btn relative inline-flex min-h-[48px] flex-1 items-center justify-center rounded-t-xl border-2 px-3 py-2.5 text-center font-semibold transition-colors md:min-h-[52px] md:px-5 ${
                !boutique
                  ? "z-[2] border-cta border-b-0 bg-cta text-paper after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[-2px] after:h-[2px] after:bg-cta"
                  : "z-[0] border-line/70 bg-bone/80 text-ink-soft hover:bg-bone-2 hover:text-ink"
              }`}
            >
              {t(copy.plan.tabDesign)}
            </button>
          </div>

          {/* 文件夹本体：定制与预订同 paper 底，仅用 2px 墨绿边区分 */}
          <div
            className={`relative z-0 rounded-b-xl bg-paper p-5 md:p-8 shadow-[0_10px_36px_color-mix(in_srgb,var(--color-ink)_6%,transparent)] ${
              boutique
                ? "-mt-px rounded-tr-xl border border-gold/40"
                : "-mt-[2px] rounded-tl-xl border-2 border-cta"
            }`}
          >
            <div className={boutique ? "" : "hidden"}>
              <BookRouteFlow route={route} />
            </div>
            <div className={boutique ? "hidden" : ""}>
              <DesignRouteFlow />
            </div>
          </div>

          <div className="mt-8 max-w-[720px] space-y-4 border-t border-cta/15 pt-7">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-cta uppercase">
              {t(copy.plan.footNotesTitle)}
            </p>
            <ul className="space-y-[1.125rem]">
              {copy.plan.footNotes.map((note, i) => (
                <li key={i} className="text-[12px] leading-[1.5] text-ink-soft">
                  <span className="font-semibold text-ink">{t(note.title)}</span>
                  {locale === "zh" ? "：" : ": "}
                  {t(note.body)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
