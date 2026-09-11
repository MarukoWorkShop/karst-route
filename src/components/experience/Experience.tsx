import { useEffect, useId, useState } from "react";
import type { LightId } from "@/types";
import { lightById, lightExperiences, type LightExperience } from "@/data/lightExperiences";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose } from "@/components/icons";

type View = { kind: "index" } | { kind: "item"; id: LightId };

/** 轻旅行体验：首页「让旅途真正改变你」区块 —— 五个可单独预订的小产品栏目 */
export function Experience({ onQuote }: { onQuote?: () => void }) {
  const { t } = useLocale();
  const [open, setOpen] = useState<View | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function quote(id: LightId) {
    setOpen(null);
    if (onQuote) onQuote();
    else console.info("light experience enquiry", id);
  }

  return (
    <section id="experience" className="scroll-mt-24 bg-paper py-14 md:py-16">
      <div className="page-col">
        <h2 className="text-[22px] leading-7 font-medium text-cta">{t(copy.experience.h2)}</h2>
        <p className="mt-1.5 max-w-[52ch] text-[13px] leading-5 text-ink-soft">
          {t(copy.light.ctaSub)}
        </p>

        <button
          type="button"
          onClick={() => setOpen({ kind: "index" })}
          className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-cta px-5 py-3 text-[14px] font-medium text-surface transition hover:bg-cta/90"
        >
          {t(copy.light.cta)}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M3 11L11 3M11 3H5M11 3V9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {lightExperiences.map((item) => (
            <LightCard
              key={item.id}
              item={item}
              onOpen={() => setOpen({ kind: "item", id: item.id })}
            />
          ))}
        </div>
      </div>

      {open ? (
        <LightModal
          view={open}
          onClose={() => setOpen(null)}
          onPick={(id) => setOpen({ kind: "item", id })}
          onBack={() => setOpen({ kind: "index" })}
          onQuote={quote}
        />
      ) : null}
    </section>
  );
}

function LightCard({ item, onOpen }: { item: LightExperience; onOpen: () => void }) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[3/4] overflow-hidden rounded-[10px] text-left"
    >
      <img
        loading="lazy"
        src={item.cover}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-linear-to-t from-night/85 via-night/25 to-transparent" />
      <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-surface/15 backdrop-blur-sm">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="#FAF8F2" strokeWidth="1.5" />
        </svg>
      </span>
      <span className="absolute right-3.5 bottom-3.5 left-3.5">
        <span className="block text-[10px] tracking-[0.1em] text-surface/60 uppercase">
          {t(item.badge)}
        </span>
        <span className="mt-1 block text-[15px] leading-snug font-medium text-surface md:text-base">
          {t(item.title)}
        </span>
        <span className="mt-0.5 block text-[11px] leading-4 text-surface/65">
          {t(item.tagline)}
        </span>
      </span>
    </button>
  );
}

/**
 * 详情：与线路大片一致的居中大卡（手机全屏，桌面居中双栏）。
 */
function LightModal({
  view,
  onClose,
  onPick,
  onBack,
  onQuote,
}: {
  view: View;
  onClose: () => void;
  onPick: (id: LightId) => void;
  onBack: () => void;
  onQuote: (id: LightId) => void;
}) {
  const { t } = useLocale();
  const titleId = useId();
  const item = view.kind === "item" ? lightById(view.id) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex md:items-start md:justify-center md:overflow-y-auto md:px-4 md:py-14">
      <button
        type="button"
        aria-label={t(copy.nav.close)}
        className="absolute inset-0 bg-night/55 backdrop-blur-[2px] md:bg-night/45"
        onClick={onClose}
      />
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex h-dvh w-full flex-col overflow-y-auto overscroll-contain bg-surface p-4 pt-14 shadow-none ring-0 md:my-auto md:grid md:h-auto md:max-h-none md:w-[min(92vw,960px)] md:grid-cols-[1fr_1fr] md:gap-6 md:overflow-visible md:rounded-xl md:p-6 md:pt-6 md:shadow-[0_24px_64px_rgba(16,28,22,0.22)] md:ring-1 md:ring-line"
      >
        <button
          type="button"
          aria-label={t(copy.nav.close)}
          onClick={onClose}
          className="absolute top-3 right-3 z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink-soft transition hover:border-cta/40 hover:text-cta md:h-8 md:w-8"
        >
          <IconClose className="h-4 w-4" />
        </button>

        {item ? (
          <ItemBody
            item={item}
            titleId={titleId}
            onBack={onBack}
            onQuote={() => onQuote(item.id)}
          />
        ) : (
          <IndexBody titleId={titleId} onPick={onPick} />
        )}
      </article>
    </div>
  );
}

function IndexBody({
  titleId,
  onPick,
}: {
  titleId: string;
  onPick: (id: LightId) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="md:col-span-2">
      <p className="text-[11px] font-bold tracking-[0.12em] text-cta uppercase">
        {t(copy.light.kicker)}
      </p>
      <h3 id={titleId} className="mt-1 pr-10 text-[24px] leading-tight font-medium text-ink md:text-[26px]">
        {t(copy.light.allTitle)}
      </h3>
      <p className="mt-1.5 text-[13px] leading-5 text-ink-soft">{t(copy.light.allSub)}</p>

      <ul className="mt-5 flex flex-col">
        {lightExperiences.map((item, i) => (
          <li key={item.id} className={i > 0 ? "border-t border-line" : ""}>
            <button
              type="button"
              onClick={() => onPick(item.id)}
              className="flex w-full items-center gap-3.5 py-3.5 text-left transition hover:bg-bone/60"
            >
              <img
                loading="lazy"
                src={item.cover}
                alt=""
                className="h-16 w-24 shrink-0 rounded-md object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] tracking-[0.1em] text-cta uppercase">
                  {t(item.badge)}
                </span>
                <span className="mt-0.5 block text-[15px] font-medium text-ink">
                  {t(item.title)}
                </span>
                <span className="mt-0.5 block text-[12px] leading-4 text-ink-soft">
                  {t(item.tagline)}
                </span>
              </span>
              <span className="shrink-0 text-[12px] text-cta">{t(copy.light.view)} →</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-4 text-[12px] leading-5 text-ink-soft">
        {t(copy.light.priceNote)}
      </p>
    </div>
  );
}

function ItemBody({
  item,
  titleId,
  onBack,
  onQuote,
}: {
  item: LightExperience;
  titleId: string;
  onBack: () => void;
  onQuote: () => void;
}) {
  const { t } = useLocale();
  return (
    <>
      <div className="grid grid-cols-1 gap-2 self-start">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-bone">
          <img src={item.gallery[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {item.gallery.slice(1, 3).map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-md bg-bone">
              <img loading="lazy" src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex min-w-0 flex-1 flex-col md:mt-0">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 self-start text-[11.5px] text-ink-soft transition hover:text-cta"
        >
          ← {t(copy.light.back)}
        </button>
        <p className="text-[11px] font-bold tracking-[0.12em] text-cta uppercase">
          {t(item.badge)}
        </p>
        <h3
          id={titleId}
          className="mt-1 pr-10 text-[24px] leading-tight font-medium text-ink md:pr-8 md:text-[26px]"
        >
          {t(item.title)}
        </h3>
        <p className="mt-1.5 text-[13px] leading-5 text-ink-soft">{t(item.tagline)}</p>

        <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-line ring-1 ring-line">
          <Meta label={t(copy.light.duration)} value={t(item.duration)} />
          <Meta label={t(copy.light.group)} value={t(item.group)} />
          <Meta label={t(copy.light.season)} value={t(item.season)} />
        </div>

        <div className="mt-4 space-y-3">
          {item.desc.map((p) => (
            <p key={p.en} className="text-[14px] leading-[26px] text-ink">
              {t(p)}
            </p>
          ))}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-3 text-[11px] tracking-[0.08em] text-ink-soft uppercase">
            {t(copy.light.highlights)}
          </p>
          <ul className="flex flex-col gap-2.5">
            {item.highlights.map((h) => (
              <li key={h.en} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                <span className="text-[13.5px] leading-snug text-ink">{t(h)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2.5 text-[11px] tracking-[0.08em] text-ink-soft uppercase">
            {t(copy.light.included)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.included.map((x) => (
              <span
                key={x.en}
                className="inline-flex items-center gap-1 rounded-full bg-cta/8 px-2.5 py-1 text-[11px] font-medium text-cta"
              >
                <CheckMark />
                {t(x)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between md:pb-0">
          <p className="text-[12px] leading-5 text-ink-soft">{t(copy.light.priceNote)}</p>
          <button
            type="button"
            onClick={onQuote}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[10px] bg-cta px-5 text-[14px] font-medium text-surface transition hover:bg-cta/90"
          >
            {t(copy.light.quote)}
          </button>
        </div>
      </div>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <p className="text-[10px] tracking-[0.06em] text-ink-soft uppercase">{label}</p>
      <p className="mt-0.5 text-[12.5px] font-medium text-ink">{value}</p>
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2 6.4L4.6 9L10 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
