import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import type { LightId, Tx } from "@/types";
import {
  lightById,
  lightExperiences,
  type LightExperience,
  type LightRoute,
} from "@/data/lightExperiences";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose, IconHeart } from "@/components/icons";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { User, Baby, Minus, Plus } from "lucide-react";
import { FieldLabel, IconSend } from "@/components/plan/PlanUi";
import { CurrencyToggle } from "@/components/ui/CurrencyToggle";
import { formatMoney, fmtCny } from "@/lib/fx";
import { sendEnquiry } from "@/lib/enquiry";
import { lineTotalCny, priceOf, formatSkuPriceParts, priceNoteOf, stripPriceFromBlurb } from "@/lib/lightPrice";
import { useFxRates, usePriceCurrency } from "@/hooks/useFx";

type View = { kind: "index" } | { kind: "item"; id: LightId };

type LikedSku = {
  key: string;
  categoryId: LightId;
  categoryTitle: Tx;
  route: LightRoute;
};

const LIKES_KEY = "light-sku-likes-v1";

function likeKey(categoryId: string, routeId: string) {
  return `${categoryId}:${routeId}`;
}

function readLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeLikes(set: Set<string>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...set]));
}

function collectLiked(keys: Set<string>): LikedSku[] {
  const out: LikedSku[] = [];
  for (const cat of lightExperiences) {
    const pools = [...(cat.routes ?? []), ...(cat.meals ?? [])];
    for (const route of pools) {
      const key = likeKey(cat.id, route.id);
      if (keys.has(key)) {
        out.push({
          key,
          categoryId: cat.id,
          categoryTitle: cat.title,
          route,
        });
      }
    }
  }
  return out;
}

/** 在地小体验：Profoundly Local Experiences —— 可单独预订的小产品栏目 */
export function Experience() {
  const { t } = useLocale();
  const [open, setOpen] = useState<View | null>(null);
  const [likedOpen, setLikedOpen] = useState(false);
  const [likes, setLikes] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setLikes(readLikes());
  }, []);

  useEffect(() => {
    if (!open && !likedOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (likedOpen) setLikedOpen(false);
        else setOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, likedOpen]);

  function toggleLike(categoryId: LightId, routeId: string) {
    const key = likeKey(categoryId, routeId);
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      writeLikes(next);
      return next;
    });
  }

  const likedCount = likes.size;
  const likedItems = collectLiked(likes);

  return (
    <section id="experience" className="scroll-mt-24 bg-paper py-14 md:py-16">
      <div className="page-col">
        <SectionIntro
          title={t(copy.experience.h2)}
          sub={t(copy.experience.moduleSub)}
          desc={t(copy.experience.moduleDesc)}
          action={
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="button"
                onClick={() => setOpen({ kind: "index" })}
                className="type-btn inline-flex items-center gap-2 rounded-lg bg-cta px-5 py-3 text-surface transition hover:bg-cta/90"
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
              <button
                type="button"
                onClick={() => setLikedOpen(true)}
                className="type-aux font-medium text-cta underline-offset-4 transition hover:underline"
              >
                {t(copy.light.interestedLink).replace("{n}", String(likedCount))}
              </button>
            </div>
          }
        />

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
          likes={likes}
          onToggleLike={toggleLike}
        />
      ) : null}

      {likedOpen ? (
        <LikedModal
          items={likedItems}
          onToggleLike={toggleLike}
          onClose={() => setLikedOpen(false)}
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
        <span className="type-meta block text-surface/60">{t(item.badge)}</span>
        <span className="type-sub mt-1 block font-medium text-surface">{t(item.title)}</span>
        <span className="type-aux mt-0.5 block text-surface/65">{t(item.tagline)}</span>
      </span>
    </button>
  );
}

function LightModal({
  view,
  onClose,
  onPick,
  onBack,
  likes,
  onToggleLike,
}: {
  view: View;
  onClose: () => void;
  onPick: (id: LightId) => void;
  onBack: () => void;
  likes: Set<string>;
  onToggleLike: (categoryId: LightId, routeId: string) => void;
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
        className={`relative z-[1] flex h-dvh w-full flex-col overflow-y-auto overscroll-contain bg-surface p-4 pt-14 shadow-none ring-0 md:my-auto md:h-auto md:max-h-none md:w-[min(92vw,960px)] md:overflow-visible md:rounded-xl md:p-6 md:pt-6 md:shadow-[0_24px_64px_rgba(16,28,22,0.22)] md:ring-1 md:ring-line ${
          item ? "md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-6" : ""
        }`}
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
            likes={likes}
            onToggleLike={onToggleLike}
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
      <p className="type-meta text-cta">{t(copy.light.kicker)}</p>
      <h3 id={titleId} className="type-h3 mt-1 pr-10 text-ink">
        {t(copy.light.allTitle)}
      </h3>
      <p className="type-aux mt-1.5 text-ink-soft">{t(copy.light.allSub)}</p>

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
                <span className="type-meta block text-cta">{t(item.badge)}</span>
                <span className="type-sub mt-0.5 block font-medium text-ink">{t(item.title)}</span>
                <span className="type-aux mt-0.5 block text-ink-soft">{t(item.tagline)}</span>
              </span>
              <span className="type-aux shrink-0 text-cta">{t(copy.light.view)} →</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="type-aux mt-4 border-t border-line pt-4 text-ink-soft">{t(copy.light.priceNote)}</p>
    </div>
  );
}

function ItemBody({
  item,
  titleId,
  onBack,
  likes,
  onToggleLike,
}: {
  item: LightExperience;
  titleId: string;
  onBack: () => void;
  likes: Set<string>;
  onToggleLike: (categoryId: LightId, routeId: string) => void;
}) {
  const { t, locale } = useLocale();
  const { rates } = useFxRates();
  const { currency, setCurrency } = usePriceCurrency();
  const money = (cny: number) => formatMoney(cny, { locale, currency, rates });
  const routes = item.routes ?? [];
  const meals = item.meals ?? [];
  return (
    <>
      {/* 左栏：直接产品列（栏目 gallery 保留在数据里，详情不展示） */}
      <div className="flex min-w-0 flex-col self-start">
        {routes.length ? (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
              <div className="min-w-0">
                <p className="type-meta text-cta">{t(item.routesLabel ?? copy.light.routes)}</p>
                <p className="type-aux mt-1 text-ink-soft">{t(item.routesSub ?? copy.light.routesSub)}</p>
              </div>
              {locale === "en" ? (
                <CurrencyToggle value={currency} onChange={setCurrency} className="mt-0.5 shrink-0" />
              ) : null}
            </div>
            <ul className="mt-3 flex flex-col gap-4">
              {routes.map((route) => (
                <SkuCard
                  key={route.id}
                  route={route}
                  liked={likes.has(likeKey(item.id, route.id))}
                  onToggleLike={() => onToggleLike(item.id, route.id)}
                  formatAmount={money}
                />
              ))}
            </ul>
          </div>
        ) : (
          <p className="type-aux text-ink-soft">{t(copy.light.priceNote)}</p>
        )}
      </div>

      <div className="mt-4 flex min-w-0 flex-1 flex-col md:mt-0">
        <button
          type="button"
          onClick={onBack}
          className="type-aux mb-3 self-start text-ink-soft transition hover:text-cta"
        >
          ← {t(copy.light.back)}
        </button>
        <p className="type-meta text-cta">{t(item.badge)}</p>
        <h3 id={titleId} className="type-h3 mt-1 pr-10 text-ink md:pr-8">
          {t(item.title)}
        </h3>
        <p className="type-aux mt-1.5 text-ink-soft">{t(item.tagline)}</p>

        <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-line ring-1 ring-line">
          <Meta label={t(copy.light.duration)} value={t(item.duration)} />
          <Meta label={t(copy.light.group)} value={t(item.group)} />
          <Meta label={t(copy.light.season)} value={t(item.season)} />
        </div>

        <div className="mt-4 space-y-3">
          {item.desc.map((p) => (
            <p key={p.en} className="type-body text-ink">
              {t(p)}
            </p>
          ))}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="type-meta mb-3 text-ink-soft">{t(copy.light.highlights)}</p>
          <ul className="flex flex-col gap-2.5">
            {item.highlights.map((h) => (
              <li key={h.en} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                <span className="type-body text-ink">{t(h)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="type-meta mb-2.5 text-ink-soft">{t(copy.light.included)}</p>
          <div className="flex flex-wrap gap-1.5">
            {item.included.map((x) => (
              <span
                key={x.en}
                className="type-chip inline-flex items-center gap-1 rounded-full bg-cta/8 px-2.5 py-1 font-medium tracking-normal normal-case text-cta"
              >
                <CheckMark />
                {t(x)}
              </span>
            ))}
          </div>
        </div>

        {meals.length ? (
          <div className="mt-5 border-t border-line pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
              <div className="min-w-0">
                <p className="type-meta text-cta">{t(copy.light.meals)}</p>
                <p className="type-aux mt-1 text-ink-soft">{t(copy.light.mealsSub)}</p>
              </div>
              {locale === "en" && !routes.length ? (
                <CurrencyToggle value={currency} onChange={setCurrency} className="mt-0.5 shrink-0" />
              ) : null}
            </div>
            <ul className="mt-3 flex flex-col gap-4">
              {meals.map((meal) => (
                <SkuCard
                  key={meal.id}
                  route={meal}
                  liked={likes.has(likeKey(item.id, meal.id))}
                  onToggleLike={() => onToggleLike(item.id, meal.id)}
                  formatAmount={money}
                />
              ))}
            </ul>
          </div>
        ) : (
          <div className="pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0" />
        )}
      </div>
    </>
  );
}

function SkuCard({
  route,
  liked,
  onToggleLike,
  eyebrow,
  formatAmount = fmtCny,
}: {
  route: LightRoute;
  liked: boolean;
  onToggleLike: () => void;
  eyebrow?: ReactNode;
  formatAmount?: (cny: number) => string;
}) {
  const { t, locale } = useLocale();
  const [pop, setPop] = useState(false);
  const [tip, setTip] = useState(false);
  const price = route.price ?? priceOf(route.id);
  const note = priceNoteOf(route.id, locale);
  const priceParts = price ? formatSkuPriceParts(price, locale, formatAmount, note) : null;
  const blurbs = route.blurb
    .map((p) => {
      const raw = t(p);
      const kept = stripPriceFromBlurb(raw);
      return kept ? { key: p.zh || p.en, text: kept } : null;
    })
    .filter((x): x is { key: string; text: string } => Boolean(x));

  useEffect(() => {
    if (!tip) return;
    const id = window.setTimeout(() => setTip(false), 1200);
    return () => window.clearTimeout(id);
  }, [tip]);

  return (
    <li className="relative rounded-[10px] border border-line bg-paper/60 p-3 pt-3.5">
      <div className="absolute top-2 right-2 z-[1] flex items-center gap-1.5">
        {tip ? (
          <span
            role="status"
            className="like-tip type-aux pointer-events-none rounded-full bg-night/88 px-2.5 py-1 font-medium tracking-[0.04em] text-paper shadow-sm"
          >
            {t(copy.light.interestedToast)}
          </span>
        ) : null}
        <button
          type="button"
          aria-pressed={liked}
          aria-label={t(liked ? copy.light.unlikeAria : copy.light.likeAria)}
          onClick={(e) => {
            e.stopPropagation();
            if (!liked) {
              setPop(false);
              requestAnimationFrame(() => setPop(true));
              setTip(true);
            }
            onToggleLike();
          }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper/90 transition hover:bg-danger/8 ${
            liked ? "text-danger" : "text-ink-soft hover:text-danger"
          }`}
        >
          <IconHeart
            filled={liked}
            className={`h-[18px] w-[18px] ${pop ? "like-heart-pop" : ""}`}
            onAnimationEnd={() => setPop(false)}
          />
        </button>
      </div>
      {eyebrow}
      <h4 className="type-sub pr-9 font-medium text-ink">{t(route.title)}</h4>
      <SkuImages images={route.images} />
      {blurbs.length ? (
        <div className="mt-2.5 space-y-1.5">
          {blurbs.map((b) => (
            <p key={b.key} className="type-aux text-ink-soft">
              {b.text}
            </p>
          ))}
        </div>
      ) : null}
      {priceParts ? (
        <p className="type-body mt-2.5 text-ink">
          <span>{priceParts.lead}</span>
          <span className="text-[15px] font-semibold tracking-[0.01em]">{priceParts.core}</span>
          {note ? <span>{note}</span> : null}
        </p>
      ) : null}
    </li>
  );
}

/** 1 张大图 / 2 张中图错落 / 3 张瀑布，避免统一三小格 */
function SkuImages({ images }: { images: string[] }) {
  const imgs = images.slice(0, 3);
  if (!imgs.length) return null;

  if (imgs.length === 1) {
    return (
      <div className="mt-2.5 overflow-hidden rounded-md bg-bone">
        <img src={imgs[0]} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
      </div>
    );
  }

  if (imgs.length === 2) {
    return (
      <div className="mt-2.5 grid grid-cols-2 items-end gap-2">
        <div className="overflow-hidden rounded-md bg-bone">
          <img src={imgs[0]} alt="" className="aspect-[3/4] w-full object-cover" loading="lazy" />
        </div>
        <div className="overflow-hidden rounded-md bg-bone pb-4">
          <img src={imgs[1]} alt="" className="aspect-square w-full object-cover" loading="lazy" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5 grid grid-cols-2 gap-2">
      <div className="row-span-2 overflow-hidden rounded-md bg-bone">
        <img src={imgs[0]} alt="" className="h-full min-h-[11rem] w-full object-cover" loading="lazy" />
      </div>
      <div className="overflow-hidden rounded-md bg-bone">
        <img src={imgs[1]} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
      </div>
      <div className="overflow-hidden rounded-md bg-bone">
        <img src={imgs[2]} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
      </div>
    </div>
  );
}

function LikedModal({
  items,
  onToggleLike,
  onClose,
}: {
  items: LikedSku[];
  onToggleLike: (categoryId: LightId, routeId: string) => void;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const titleId = useId();
  const { rates } = useFxRates();
  const { currency, setCurrency } = usePriceCurrency();
  const money = (cny: number) => formatMoney(cny, { locale, currency, rates });
  const [party, setParty] = useState<Record<string, { adults: number; children: number }>>({});
  const [showTotal, setShowTotal] = useState(false);
  const [phase, setPhase] = useState<"list" | "contact" | "sent">("list");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [formErr, setFormErr] = useState(false);

  useEffect(() => {
    setParty((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (!next[it.key]) next[it.key] = { adults: 4, children: 2 };
      }
      for (const k of Object.keys(next)) {
        if (!items.some((it) => it.key === k)) delete next[k];
      }
      return next;
    });
  }, [items]);

  const rows = useMemo(() => {
    return items.map((it) => {
      const p = party[it.key] ?? { adults: 4, children: 2 };
      const price = it.route.price ?? priceOf(it.route.id);
      const line = price ? lineTotalCny(price, p.adults, p.children) : 0;
      return { ...it, adults: p.adults, children: p.children, price, line };
    });
  }, [items, party]);

  const total = rows.reduce((s, r) => s + r.line, 0);

  function updateParty(
    key: string,
    categoryId: LightId,
    routeId: string,
    adults: number,
    children: number,
  ) {
    const a = Math.max(0, adults);
    const c = Math.max(0, children);
    if (a === 0 && c === 0) {
      const ok = window.confirm(t(copy.light.interestedRemoveConfirm));
      if (ok) onToggleLike(categoryId, routeId);
      return;
    }
    setParty((prev) => ({ ...prev, [key]: { adults: a, children: c } }));
  }

  function briefBody() {
    const lines = rows.map((r, i) => {
      const title = locale === "zh" ? r.route.title.zh : r.route.title.en;
      const cat = locale === "zh" ? r.categoryTitle.zh : r.categoryTitle.en;
      const est = r.line ? ` · ${money(r.line)}` : "";
      return `${i + 1}. ${title}（${cat}）· ${r.adults}A/${r.children}C${est}`;
    });
    const totalLine = !total
      ? ""
      : locale === "zh"
        ? `参考合计约 ${money(total)}（十位取整，非最终报价）`
        : `Reference total ≈ ${money(total)} (rounded · not an offer)`;
    const notesLine = notes.trim()
      ? `${locale === "zh" ? "备注" : "Notes"}: ${notes.trim()}`
      : "";
    return [
      locale === "zh" ? "【在地小体验兴趣清单】" : "[Light experiences interest list]",
      ...lines,
      totalLine,
      notesLine,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function submit() {
    if (name.trim().length < 2 || !contact.trim()) {
      setFormErr(true);
      return;
    }
    setFormErr(false);
    setSending(true);
    const ok = await sendEnquiry({
      subject: `Light experiences interest — ${rows.length} items`,
      name: name.trim(),
      contact: contact.trim(),
      path: "light-likes",
      estimate: total ? money(total) : "",
      notes: notes.trim(),
      brief: briefBody(),
      itemCount: String(rows.length),
    });
    setSending(false);
    if (ok) setPhase("sent");
    else setFormErr(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <button
        type="button"
        aria-label={t(copy.nav.close)}
        className="absolute inset-0 bg-night/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[min(88dvh,820px)] w-full max-w-[640px] flex-col overflow-hidden rounded-xl bg-surface shadow-[0_24px_64px_rgba(16,28,22,0.22)] ring-1 ring-line"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h3 id={titleId} className="type-h3 text-ink">
              {t(copy.light.interestedTitle)}
            </h3>
            <p className="type-aux mt-1 text-ink-soft">
              {t(copy.light.interestedLink).replace("{n}", String(items.length))}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2.5">
            <button
              type="button"
              aria-label={t(copy.nav.close)}
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-cta/40 hover:text-cta"
            >
              <IconClose className="h-4 w-4" />
            </button>
            {locale === "en" ? (
              <CurrencyToggle value={currency} onChange={setCurrency} />
            ) : null}
          </div>
        </div>

        {phase === "sent" ? (
          <div className="px-5 py-10 text-center">
            <p className="type-h3 text-cta">{t(copy.light.interestedSentTitle)}</p>
            <p className="type-body mt-2 text-ink-soft">{t(copy.light.interestedSentBody)}</p>
            <button
              type="button"
              onClick={onClose}
              className="type-btn mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-cta px-6 text-surface"
            >
              {t(copy.contact.close)}
            </button>
          </div>
        ) : phase === "contact" ? (
          <div className="overflow-y-auto overscroll-contain px-5 py-4">
            <button
              type="button"
              onClick={() => setPhase("list")}
              className="type-aux mb-3 text-ink-soft transition hover:text-cta"
            >
              ← {t(copy.light.interestedBackList)}
            </button>
            <div className="flex flex-col gap-3.5">
              <label className="block">
                <FieldLabel>{t(copy.light.interestedName)}</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none focus:border-cta"
                />
              </label>
              <label className="block">
                <FieldLabel>{t(copy.light.interestedContact)}</FieldLabel>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none focus:border-cta"
                />
              </label>
              <label className="block">
                <FieldLabel>{t(copy.light.interestedNotes)}</FieldLabel>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t(copy.light.interestedNotesPh)}
                  className="w-full resize-y rounded-lg border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none focus:border-cta"
                />
              </label>
              {formErr ? (
                <p className="type-aux text-danger">{t(copy.light.interestedFormErr)}</p>
              ) : null}
              <button
                type="button"
                disabled={sending || rows.length === 0}
                onClick={() => void submit()}
                className="type-btn mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cta text-surface disabled:opacity-60"
              >
                {sending ? (
                  t(copy.light.interestedSending)
                ) : (
                  <>
                    <IconSend className="h-3.5 w-3.5" />
                    {t(copy.light.interestedSend)}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
              {items.length === 0 ? (
                <p className="type-aux py-10 text-center text-ink-soft">
                  {t(copy.light.interestedEmpty)}
                </p>
              ) : (
                <>
                  <p className="party-tip type-aux mb-3 flex items-start gap-2 rounded-xl bg-tea/8 px-3 py-2.5 text-tea">
                    <Baby className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    <span>{t(copy.light.interestedChildNote)}</span>
                  </p>
                  <ul className="flex flex-col gap-3">
                    {rows.map((r) => (
                      <li
                        key={r.key}
                        className="rounded-2xl bg-bone/50 p-3.5 ring-1 ring-line/80 transition hover:bg-bone/80"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="type-meta text-cta">{t(r.categoryTitle)}</p>
                            <p className="type-sub mt-0.5 font-medium text-ink">{t(r.route.title)}</p>
                            {r.route.blurb[0] ? (
                              <p className="type-aux mt-1 line-clamp-2 text-ink-soft">
                                {t(r.route.blurb[0])}
                              </p>
                            ) : null}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {r.line > 0 ? (
                                <span className="type-aux inline-flex items-center rounded-full bg-cta/10 px-2.5 py-1 font-semibold text-cta">
                                  {t(copy.light.interestedLineEst).replace("{n}", money(r.line))}
                                </span>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => onToggleLike(r.categoryId, r.route.id)}
                                className="type-aux text-ink-soft underline-offset-2 transition hover:text-danger hover:underline"
                              >
                                {t(copy.light.interestedRemove)}
                              </button>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2 self-stretch sm:self-center">
                            <PartyStepper
                              kind="adult"
                              label={t(copy.light.interestedAdults)}
                              value={r.adults}
                              min={0}
                              max={12}
                              onChange={(v) =>
                                updateParty(r.key, r.categoryId, r.route.id, v, r.children)
                              }
                            />
                            <PartyStepper
                              kind="child"
                              label={t(copy.light.interestedChildren)}
                              value={r.children}
                              min={0}
                              max={12}
                              onChange={(v) =>
                                updateParty(r.key, r.categoryId, r.route.id, r.adults, v)
                              }
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-line bg-linear-to-b from-paper to-sage/30 px-5 py-4">
                {showTotal ? (
                  <div className="mb-3 rounded-2xl bg-surface px-3.5 py-3 shadow-[0_4px_16px_rgba(16,28,22,0.06)] ring-1 ring-cta/15">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="type-meta text-cta">{t(copy.light.interestedTotalLabel)}</p>
                      <p className="text-[22px] font-semibold tracking-tight text-cta">{money(total)}</p>
                    </div>
                    <p className="type-aux mt-1 text-ink-soft">{t(copy.light.interestedTotalNote)}</p>
                    <ul className="mt-2.5 space-y-1.5 border-t border-line/80 pt-2.5">
                      {rows.map((r) => (
                        <li key={r.key} className="type-aux flex justify-between gap-3 text-ink-soft">
                          <span className="min-w-0 truncate">{t(r.route.title)}</span>
                          <span className="shrink-0 font-medium text-ink">{r.line ? money(r.line) : "—"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowTotal((v) => !v)}
                    className="type-btn inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-cta/25 bg-surface text-cta shadow-sm transition hover:border-cta/50 hover:bg-cta/5"
                  >
                    {showTotal
                      ? t(copy.light.interestedHideTotal)
                      : t(copy.light.interestedShowTotal)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase("contact")}
                    className="type-btn inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-cta text-surface shadow-[0_6px_16px_rgba(47,83,68,0.28)] transition hover:bg-cta/90"
                  >
                    <IconSend className="h-3.5 w-3.5" />
                    {t(copy.light.interestedEnquire)}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </article>
    </div>
  );
}

function PartyStepper({
  kind,
  label,
  value,
  min,
  max,
  onChange,
}: {
  kind: "adult" | "child";
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const isAdult = kind === "adult";
  const Icon = isAdult ? User : Baby;
  const shell = isAdult
    ? "bg-cta/10 ring-cta/20"
    : "bg-tea/10 ring-tea/20";
  const iconWrap = isAdult ? "bg-cta text-surface" : "bg-tea text-surface";
  const btn = isAdult
    ? "text-cta hover:bg-cta/15 active:scale-90 disabled:opacity-25"
    : "text-tea hover:bg-tea/15 active:scale-90 disabled:opacity-25";

  return (
    <div
      className={`flex min-w-[7.25rem] flex-col items-center gap-1.5 rounded-2xl px-2 py-2 ring-1 ${shell}`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm ${iconWrap}`}
        title={label}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
      </span>
      <div className="flex w-full items-center justify-between gap-0.5">
        <button
          type="button"
          aria-label={`${label} −`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${btn}`}
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <span className="min-w-[1.6ch] text-center text-[17px] font-semibold tabular-nums text-ink">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label} ＋`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${btn}`}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <p className="type-meta text-ink-soft">{label}</p>
      <p className="type-aux mt-0.5 font-medium text-ink">{value}</p>
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
