import { partners } from "@/data/partners";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function Partners() {
  const { t } = useLocale();

  return (
    <section id="partners" className="scroll-mt-24 bg-paper py-14 md:py-[72px]">
      <div className="page-col">
        <h2 className="text-[22px] leading-[1.3] font-medium text-cta">{t(copy.partners.h2)}</h2>
        <p className="mt-1.5 mb-7 max-w-[640px] text-[13px] leading-5 text-ink-soft">
          {t(copy.partners.sub)}
        </p>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {partners.map((p) => (
            <article
              key={p.name.en}
              className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface"
            >
              <div
                className="flex items-start justify-between gap-2 px-3.5 pt-3.5 pb-2.5"
                style={{ backgroundColor: p.color }}
              >
                <div>
                  <span className="inline-block rounded-full bg-black/18 px-[7px] py-0.5 text-[9px] font-semibold tracking-[0.06em] text-paper/75 uppercase">
                    {t(p.category)}
                  </span>
                </div>
                <p className="pt-0.5 text-right text-[9px] leading-[14px] text-paper/60">{t(p.location)}</p>
              </div>

              <div className="flex-1 px-3 pt-3">
                <h3 className="mb-1.5 text-[13px] leading-[1.3] font-semibold text-ink">{t(p.name)}</h3>
                <p className="line-clamp-3 text-[11.5px] leading-[17px] text-ink-soft">{t(p.desc)}</p>
              </div>

              <div className="flex flex-col gap-1.5 p-3 pt-2.5">
                {p.links.map((lnk) => {
                  const google = lnk.type === "google";
                  return (
                    <a
                      key={lnk.url + lnk.type}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-[5px] text-[11px] font-medium ${
                        google
                          ? "border-[rgba(66,133,244,0.2)] bg-[rgba(66,133,244,0.08)] text-[#4285F4]"
                          : "border-cta/15 bg-cta/7 text-cta"
                      }`}
                    >
                      {google ? <IconGoogleMapPin /> : <IconExternalLinkSm />}
                      {t(lnk.label)}
                    </a>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-[10px] border border-dashed border-line px-[18px] py-4">
          <div>
            <p className="text-[13px] font-medium text-ink">{t(copy.partners.ctaTitle)}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-soft">{t(copy.partners.ctaSub)}</p>
          </div>
          <a
            href="#plan"
            className="shrink-0 rounded-full border-[1.5px] border-cta px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-cta"
          >
            {t(copy.partners.contact)}
          </a>
        </div>
      </div>
    </section>
  );
}

function IconExternalLinkSm() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 2H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6M6 1h3m0 0v3m0-3L4.5 5.5" />
    </svg>
  );
}

function IconGoogleMapPin() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <path d="M5 0C3.07 0 1.5 1.57 1.5 3.5c0 2.63 3.5 6.5 3.5 6.5S8.5 6.13 8.5 3.5C8.5 1.57 6.93 0 5 0zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  );
}
