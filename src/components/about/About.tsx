import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { asset } from "@/lib/asset";

export function About() {
  const { t, locale } = useLocale();
  const colon = locale === "zh" ? "：" : ": ";

  return (
    <section id="about" className="scroll-mt-24 bg-sage py-14 md:py-16">
      <div className="page-col">
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta uppercase">
          {t(copy.about.kicker)}
        </p>
        {/* 标题与 LOGO 同行：LOGO 缩为小签名，紧贴标题区 */}
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-5">
          <h2 className="max-w-[640px] text-[28px] leading-tight font-medium text-balance md:text-[32px]">
            {t(copy.about.name)}
          </h2>
          <img
            src={asset("/brand/youxian-logo.png")}
            alt={t(copy.about.name)}
            className="max-h-7 w-auto shrink-0 self-start opacity-95 mix-blend-multiply md:max-h-9"
          />
        </div>
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
