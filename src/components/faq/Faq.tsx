import { useEffect, useState } from "react";
import { faqGroups, faqs } from "@/data/faqs";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function Faq() {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    function applyHash() {
      const id = window.location.hash.replace(/^#/, "");
      if (faqs.some((f) => f.id === id)) setOpenId(id);
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <section id="faq" className="scroll-mt-24 bg-sage py-12 md:py-14">
      <div className="page-col">
        <div className="mx-auto max-w-[680px]">
          <h2 className="mt-2 mb-8 text-[22px] leading-[1.3] font-medium text-cta">
            {t(copy.faq.h2)}
          </h2>

          {faqGroups.map((group) => (
            <div key={group.id} className="mb-9 last:mb-0">
              <p className="mb-1 text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
                {t(group.label)}
              </p>
              <div>
                {group.items.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      id={faq.id}
                      className="scroll-mt-28 border-t border-line last:border-b"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className="flex w-full items-start justify-between gap-4 py-[18px] text-left"
                      >
                        {/* 问题：衬线体 + 加粗 + 放大，衬出沉稳的高奢感 */}
                        <span
                          className={`flex-1 font-serif text-[16.5px] leading-snug font-semibold ${
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
                        // 回答：墨色转淡 + 放宽行高，展开后读起来不压眼
                        <p className="pr-8 pb-[18px] text-[14px] leading-[26px] text-ink-soft">
                          {t(faq.a)}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-9 rounded-[10px] bg-paper px-5 py-5 text-center">
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
