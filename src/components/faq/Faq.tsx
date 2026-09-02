import { useEffect, useRef, useState } from "react";
import { faqGroups, faqs } from "@/data/faqs";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconChevron } from "@/components/icons";

export function Faq() {
  const { t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const visibleGroups =
    filter === "all" ? faqGroups : faqGroups.filter((g) => g.id === filter);
  const activeGroup = faqGroups.find((g) => g.id === filter);
  const activeLabel = activeGroup ? t(activeGroup.label) : t(copy.faq.filterAll);

  // 点击下拉外部时自动收起
  useEffect(() => {
    if (!menuOpen) return;
    function onDocPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [menuOpen]);

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
          <h2 className="mt-2 mb-4 text-[22px] leading-[1.3] font-medium text-cta">
            {t(copy.faq.h2)}
          </h2>

          {/* 分类下拉：默认展示全部，可按类型筛选 */}
          <div ref={menuRef} className="relative mb-8">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-[7px] text-[13px] font-medium text-ink"
            >
              {activeLabel}
              <IconChevron
                className={`h-3.5 w-3.5 text-ink-soft transition ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {menuOpen ? (
              <ul
                role="listbox"
                className="absolute top-full left-0 z-20 mt-1.5 w-max min-w-[220px] overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              >
                {[
                  { id: "all", label: copy.faq.filterAll },
                  ...faqGroups.map((g) => ({ id: g.id, label: g.label })),
                ].map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={filter === opt.id}
                      onClick={() => {
                        setFilter(opt.id);
                        setMenuOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-[13px] ${
                        filter === opt.id
                          ? "bg-sage font-medium text-cta"
                          : "text-ink"
                      }`}
                    >
                      {t(opt.label)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {visibleGroups.map((group) => (
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
                        {/* 问题：衬线体 + medium，重要标题统一字重 */}
                        <span
                          className={`flex-1 font-serif text-[16.5px] leading-snug font-medium ${
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
