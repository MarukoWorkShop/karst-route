import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function About() {
  const { t, locale } = useLocale();
  const colon = locale === "zh" ? "：" : ": ";

  return (
    <section id="about" className="scroll-mt-24 bg-sage py-14 md:py-16">
      <div className="page-col">
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta uppercase">
          {t(copy.about.kicker)}
        </p>
        <h2 className="mt-3 max-w-[720px] text-[28px] leading-tight font-medium text-balance md:text-[32px]">
          {t(copy.about.name)}
        </h2>
        <p className="mt-2 max-w-[640px] text-[16px] leading-7 text-ink-soft">{t(copy.about.role)}</p>
        <p className="mt-6 max-w-[720px] text-[16px] leading-[1.75]">{t(copy.about.body1)}</p>
        <p className="mt-5 max-w-[720px] text-[16px] leading-[1.75]">
          <span className="font-semibold">{t(copy.about.body2Lead)}</span>
          {colon}
          {t(copy.about.body2)}
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {copy.about.points.map((point) => (
            <li
              key={point.en}
              className="border-t border-line pt-3 text-[14px] leading-6 font-medium text-cta"
            >
              {t(point)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
