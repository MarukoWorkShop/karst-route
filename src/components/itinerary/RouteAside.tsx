import type { RouteId } from "@/types";
import { handbooks, type Review } from "@/data/destinations";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconPlay, IconStar } from "@/components/icons";

export function RouteAside({
  routeId,
  onPlay,
}: {
  routeId: RouteId;
  onPlay: () => void;
}) {
  const { t } = useLocale();
  const book = handbooks[routeId];
  return (
    <aside className="space-y-8 lg:sticky lg:top-20">
      <div>
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta">
          {t(copy.tours.book.overview)}
        </p>
        <dl className="mt-4 space-y-4 text-[15px] leading-7">
          <div>
            <dt className="font-medium">{t(copy.tours.book.why)}</dt>
            <dd className="mt-1 text-ink-soft">{t(book.why)}</dd>
          </div>
          <div>
            <dt className="font-medium">{t(copy.tours.book.see)}</dt>
            <dd className="mt-1 text-ink-soft">{t(book.see)}</dd>
          </div>
          <div>
            <dt className="font-medium">{t(copy.tours.book.play)}</dt>
            <dd className="mt-1 text-ink-soft">{t(book.play)}</dd>
          </div>
        </dl>
      </div>
      <div>
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta">
          {t(copy.tours.book.reviews)}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {book.reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onPlay}
        className="flex min-h-[72px] w-full items-center gap-3 rounded-lg bg-cta px-4 py-3 text-left text-white active:bg-cta-press"
      >
        <IconPlay className="h-8 w-8 shrink-0" />
        <span>
          <span className="block text-[14px] font-medium uppercase tracking-[0.08em]">
            {t(copy.tours.book.playBtn)}
          </span>
          <span className="mt-0.5 block text-[12px] leading-5 text-white/80">
            {t(copy.tours.book.playSub)}
          </span>
        </span>
      </button>
    </aside>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { t } = useLocale();
  return (
    <article className="rounded-lg border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
          <Flag code={review.country} />
          {review.country}
        </span>
        <Stars value={review.rating} />
      </div>
      <p className="mt-2 text-[13px] leading-6">“{t(review.quote)}”</p>
      <p className="mt-2 text-[11px] text-ink-soft">
        {review.name} · {t(review.from)}
      </p>
    </article>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5 text-cta" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar
          key={i}
          className={`h-3 w-3 ${i < full ? "fill-cta" : "opacity-25"}`}
        />
      ))}
      <span className="ml-1 text-[11px] tabular-nums">{value.toFixed(1)}</span>
    </span>
  );
}

function Flag({ code }: { code: Review["country"] }) {
  const fills: Record<Review["country"], [string, string, string]> = {
    US: ["#3C3B6E", "#FFFFFF", "#B22234"],
    UK: ["#012169", "#FFFFFF", "#C8102E"],
    AU: ["#012169", "#FFFFFF", "#E4002B"],
    FR: ["#002395", "#FFFFFF", "#ED2939"],
  };
  const [a, b, c] = fills[code];
  return (
    <svg viewBox="0 0 15 10" className="h-3 w-[18px] rounded-[1px]" aria-hidden>
      <rect width="5" height="10" fill={a} />
      <rect x="5" width="5" height="10" fill={b} />
      <rect x="10" width="5" height="10" fill={c} />
    </svg>
  );
}
