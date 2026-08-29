import { useEffect, useState } from "react";
import { faqs } from "@/data/faqs";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function TravelTools() {
  const { t } = useLocale();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    function applyHash() {
      const id = window.location.hash.replace(/^#/, "");
      const i = faqs.findIndex((f) => f.id === id);
      if (i >= 0) setOpenIdx(i);
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <section id="tools" className="scroll-mt-24 bg-sage py-12 md:py-14">
      <div className="page-col">
        <div className="mx-auto max-w-[640px]">
          <h2 className="mt-2 mb-7 text-[22px] leading-[1.3] font-medium text-cta">
            {t(copy.faq.h2)}
          </h2>
          <div>
            {faqs.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={faq.id}
                  id={faq.id}
                  className={`scroll-mt-28 border-t border-line ${
                    i === faqs.length - 1 ? "border-b" : ""
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-4 py-[18px] text-left"
                  >
                    <span
                      className={`flex-1 text-[15px] leading-snug font-medium ${
                        isOpen ? "text-cta" : "text-ink"
                      }`}
                    >
                      {t(faq.q)}
                    </span>
                    <span
                      className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[16px] leading-none ${
                        isOpen
                          ? "border-[1.5px] border-cta bg-cta text-paper"
                          : "border-[1.5px] border-line text-ink-soft"
                      }`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="pb-[18px] text-[13.5px] leading-6 text-ink-soft">
                      {t(faq.a)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-8 rounded-[10px] bg-paper px-5 py-5 text-center">
            <p className="text-[14px] text-ink-soft">{t(copy.faq.more)}</p>
            <a
              href="#plan"
              className="mt-3 inline-flex text-[14px] font-medium text-cta underline underline-offset-[3px]"
            >
              {t(copy.faq.cta)}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
