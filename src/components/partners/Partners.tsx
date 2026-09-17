import { partners } from "@/data/partners";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function Partners() {
  const { t } = useLocale();

  return (
    <section id="partners" className="scroll-mt-24 bg-paper py-14 md:py-[72px]">
      <div className="page-col">
        <h2 className="type-h2 text-cta">{t(copy.partners.h2)}</h2>
        <p className="type-body mt-1.5 mb-7 max-w-[640px] text-ink-soft">
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
                  <span className="type-meta inline-block rounded-full bg-black/18 px-[7px] py-0.5 text-paper/75">
                    {t(p.category)}
                  </span>
                </div>
                <p className="type-meta pt-0.5 text-right font-normal normal-case tracking-normal text-paper/60">
                  {t(p.location)}
                </p>
              </div>

              <div className="flex-1 px-3 pt-3">
                <h3 className="type-body mb-1.5 font-semibold text-ink">{t(p.name)}</h3>
                <p className="type-aux line-clamp-3 text-ink-soft">{t(p.desc)}</p>
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
                      className={`type-chip inline-flex items-center gap-1.5 rounded-md border px-2 py-[5px] font-medium normal-case tracking-normal ${
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
