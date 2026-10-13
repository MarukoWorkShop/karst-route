import { copy, pathFor, type LegalPageId } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function LegalPage({ page }: { page: LegalPageId }) {
  const { locale, t } = useLocale();
  const doc = copy[page];

  return (
    <main className="bg-paper pt-[calc(52px+env(safe-area-inset-top))] md:pt-[calc(60px+env(safe-area-inset-top))]">
      <article className="page-col py-12 md:py-16">
        <h1 className="type-h1 text-ink">{t(doc.title)}</h1>
        <div className="mt-8 max-w-[680px] space-y-7">
          {doc.sections.map((section) => (
            <section key={section.h.en}>
              <h2 className="type-h3 text-ink">{t(section.h)}</h2>
              {"p" in section && section.p ? (
                <p className="type-body mt-2 text-ink-soft">{t(section.p)}</p>
              ) : null}
              {"items" in section && section.items ? (
                <ul className="mt-3 list-disc space-y-3 pl-5">
                  {section.items.map((item) => (
                    <li key={item.lead.en} className="type-body text-ink-soft">
                      <span className="font-medium text-ink">
                        {t(item.lead)}
                        {locale === "zh" ? "：" : ": "}
                      </span>
                      {t(item.body)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        <a href={pathFor(locale)} className="type-aux mt-10 inline-block font-medium text-cta hover:text-cta-press">
          {t(doc.back)}
        </a>
      </article>
    </main>
  );
}
