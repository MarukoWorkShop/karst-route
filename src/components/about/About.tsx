import { useLocale } from "@/i18n/LocaleProvider";
import { copy } from "@/i18n/copy";
import { asset } from "@/lib/asset";
import { about } from "@/content/about";
import { IconExternal } from "@/components/icons";

const YOUXIAN_WEBSITE = "http://cs.guilinvillage.com/DiscoverGuilin-/135.html";

export function About() {
  const { t, locale } = useLocale();
  const colon = locale === "zh" ? "：" : ": ";

  return (
    <section id="about" className="scroll-mt-24 bg-sage py-14 md:py-16">
      <div className="page-col">
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta uppercase">
          {t(about.kicker)}
        </p>
        {/* 标题与 LOGO 同行：LOGO 缩为小签名，紧贴标题区 */}
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-5">
          <div className="max-w-[640px]">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-[28px] leading-tight font-medium text-balance md:text-[32px]">
                {t(about.name)}
              </h2>
              <a
                href={YOUXIAN_WEBSITE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-cta transition-colors hover:text-cta-press"
              >
                {t(copy.about.website)}
                <IconExternal className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>
          <img
            src={asset("/brand/youxian-logo.png")}
            alt={t(about.name)}
            className="max-h-7 w-auto shrink-0 self-start opacity-95 mix-blend-multiply md:max-h-9"
          />
        </div>
        <p className="mt-2 max-w-[640px] text-[16px] leading-7 text-ink-soft">{t(about.role)}</p>
        <p className="mt-6 max-w-[720px] text-[16px] leading-[1.75]">{t(about.body1)}</p>
        <p className="mt-5 max-w-[720px] text-[16px] leading-[1.75]">
          <span className="font-semibold">{t(about.body2Lead)}</span>
          {colon}
          {t(about.body2)}
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {about.points.map((point) => (
            <li
              key={point.en}
              className="border-t border-line pt-3 text-[14px] leading-6 font-medium text-cta"
            >
              {t(point)}
            </li>
          ))}
        </ul>

        {/* 资质与保障：执照 / 持证向导 / 保险 / 退改 / 运营数据 / 媒体背书 */}
        <div className="mt-9">
          <p className="mb-1.5 text-[13px] font-semibold text-cta">{t(about.credsTitle)}</p>
          <p className="mb-4 max-w-[640px] text-[13px] leading-[22px] text-ink-soft">
            {t(about.credsSub)}
          </p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {about.creds.map((cred) => (
              <li
                key={cred.en}
                className="flex items-start gap-2.5 rounded-[10px] border border-line bg-surface px-3.5 py-3"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" aria-hidden />
                <span className="text-[12.5px] leading-[19px] text-ink">{t(cred)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
