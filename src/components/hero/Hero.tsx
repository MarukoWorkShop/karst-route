import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { RegionMap } from "@/components/hero/RegionMap";
import { IconSparkles } from "@/components/icons";

export function Hero({ onPlanOwn }: { onPlanOwn: () => void }) {
  const { t } = useLocale();
  return (
    <section id="top" className="bg-paper px-4 pb-20 pt-24 text-ink md:pt-20">
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl">
        <RegionMap />
      </div>
      <div className="mx-auto mt-8 w-full max-w-xl md:mt-10">
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta">
          {t(copy.hero.kicker)}
        </p>
        <span className="mt-3 block h-px w-10 bg-gold" />
        <h1 className="mt-4 text-[34px] leading-[1.28] font-medium md:text-5xl md:leading-[1.22]">
          {t(copy.hero.h1a)}
          <br />
          {t(copy.hero.h1b)}
        </h1>
        <p className="mt-4 max-w-md text-[16px] leading-7 text-ink-soft">
          {t(copy.hero.sub)}
        </p>
        <a
          href="#tours"
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-cta px-6 text-[16px] font-medium text-white active:bg-cta-press md:w-auto"
        >
          {t(copy.hero.ctaA)}
        </a>
        <p className="mt-2 text-[12px] text-ink-soft">{t(copy.hero.ctaAHint)}</p>
        <a
          href="#plan"
          onClick={onPlanOwn}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-line px-6 text-[15px] text-ink md:w-auto"
        >
          <IconSparkles className="h-4 w-4 text-cta" />
          {t(copy.hero.ctaB)}
          <span className="rounded-full border border-cta/25 bg-cta/8 px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-cta">
            AI
          </span>
        </a>
        <p className="mt-2 text-[12px] text-ink-soft">{t(copy.hero.ctaBHint)}</p>
      </div>
    </section>
  );
}
