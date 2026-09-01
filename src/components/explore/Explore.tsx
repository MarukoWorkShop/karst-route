import { useEffect, useMemo, useState, type ReactNode } from "react";
import { destinationVideos } from "@/data/videos";
import {
  homeLiteraryWorks,
  literaryWorks,
  restLiteraryWorksShuffled,
  type LitWork,
} from "@/data/literature";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose } from "@/components/icons";

type VideoItem = (typeof destinationVideos)[number];
type DrawerKind = "videos" | "lit";

const PREVIEW = 3;

export function Explore() {
  const { t } = useLocale();
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [drawer, setDrawer] = useState<DrawerKind | null>(null);

  useEffect(() => {
    function applyHash() {
      const id = window.location.hash.replace(/^#/, "");
      const preview = new Set(destinationVideos.slice(0, PREVIEW).map((v) => v.id));
      if (destinationVideos.some((v) => v.id === id) && !preview.has(id)) {
        setDrawer("videos");
      }
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    if (!drawer && !activeVideo) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeVideo) setActiveVideo(null);
      else setDrawer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer, activeVideo]);

  const homeLit = useMemo(() => homeLiteraryWorks(), []);
  const drawerLit = useMemo(
    () => [...homeLiteraryWorks(), ...restLiteraryWorksShuffled()],
    [],
  );

  const drawerTitle = drawer === "videos" ? t(copy.explore.allFilms) : t(copy.explore.allLit);

  return (
    <section id="explore" className="scroll-mt-24 bg-paper py-14 md:py-16">
      <div className="page-col">
        <h2 className="mb-9 text-[22px] leading-[1.3] font-medium text-cta">
          {t(copy.explore.h2)}
        </h2>

        <Block
          id="explore-films"
          label={t(copy.explore.films)}
          count={destinationVideos.length}
          onViewAll={() => setDrawer("videos")}
          viewAll={t(copy.explore.viewAll)}
        >
          {destinationVideos.slice(0, PREVIEW).map((v) => (
            <VideoCard key={v.id} item={v} named onOpen={() => setActiveVideo(v)} />
          ))}
        </Block>

        <Block
          id="explore-lit"
          label={t(copy.explore.literature)}
          count={literaryWorks.length}
          onViewAll={() => setDrawer("lit")}
          viewAll={t(copy.explore.viewAll)}
          className="mt-11"
        >
          {homeLit.map((w) => (
            <LitCard key={w.id} work={w} />
          ))}
        </Block>
      </div>

      {drawer ? (
        <button
          type="button"
          aria-label={t(copy.nav.close)}
          className="fixed inset-0 z-[300] bg-[rgba(22,36,30,0.5)] backdrop-blur-[2px]"
          onClick={() => setDrawer(null)}
        />
      ) : null}

      <aside
        role="dialog"
        aria-modal={drawer ? true : undefined}
        aria-labelledby="explore-drawer-title"
        inert={!drawer}
        className={`place-drawer fixed inset-y-0 right-0 z-[301] flex w-[min(96vw,460px)] flex-col overflow-y-auto bg-paper ${
          drawer ? "is-open pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {drawer ? (
          <div className="pt-[max(56px,env(safe-area-inset-top))] pb-12">
            <div className="flex items-center justify-between px-5 pb-5">
              <p id="explore-drawer-title" className="text-[16px] font-medium text-ink">
                {drawerTitle}
              </p>
              <button
                type="button"
                aria-label={t(copy.nav.close)}
                onClick={() => setDrawer(null)}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line bg-sage"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-5 h-px bg-line" />
            <div className="flex flex-col gap-3 px-4">
              {drawer === "videos"
                ? destinationVideos.map((v) => (
                    <VideoCard key={v.id} item={v} onOpen={() => setActiveVideo(v)} />
                  ))
                : drawerLit.map((w) => (
                    <div key={w.id}>
                      <LitCard work={w} />
                      <div className="-mt-2.5 rounded-b-[10px] border-x border-b border-line bg-sage px-3.5 pt-3.5 pb-3.5">
                        <p className="text-[12.5px] leading-5 text-ink">{t(w.desc)}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        ) : null}
      </aside>

      {activeVideo ? (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[rgba(16,28,22,0.92)] p-4">
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            className="absolute inset-0"
            onClick={() => setActiveVideo(null)}
          />
          <button
            type="button"
            aria-label={t(copy.nav.close)}
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 bg-paper/12 text-paper"
          >
            <IconClose className="h-5 w-5" />
          </button>
          <div
            role="dialog"
            aria-modal
            aria-label={t(activeVideo.title)}
            className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-lg bg-night"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={t(activeVideo.title)}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
            <div className="border-t border-paper/10 px-3.5 py-2.5">
              <VideoSource item={activeVideo} onDark />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Block({
  id,
  label,
  count,
  onViewAll,
  viewAll,
  className = "",
  children,
}: {
  id: string;
  label: string;
  count: number;
  onViewAll: () => void;
  viewAll: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className={`scroll-mt-28 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-ink">{label}</span>
          <span className="rounded-full bg-sage px-2 py-0.5 text-[11px] text-ink-soft">{count}</span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 rounded-full border border-cta px-3 py-[5px] text-[12px] font-medium text-cta"
        >
          {viewAll}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 6h7M6 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function VideoSource({ item, onDark }: { item: VideoItem; onDark?: boolean }) {
  const { t } = useLocale();
  const href = item.channelUrl ?? `https://www.youtube.com/watch?v=${item.youtubeId}`;
  const label = item.channel
    ? t(copy.explore.source).replace("{channel}", item.channel)
    : t(copy.explore.sourceVideo);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block text-[11px] leading-[16px] underline-offset-2 hover:underline ${
        onDark ? "text-paper/70 hover:text-paper" : "text-ink-soft"
      }`}
    >
      {label}
    </a>
  );
}

function VideoCard({
  item,
  onOpen,
  named,
}: {
  item: VideoItem;
  onOpen: () => void;
  named?: boolean;
}) {
  const { t } = useLocale();
  return (
    <div id={named ? item.id : undefined} className={named ? "scroll-mt-28" : undefined}>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full overflow-hidden rounded-[10px] border border-line bg-surface text-left"
      >
        <div className="relative w-[110px] min-h-[108px] shrink-0 self-stretch bg-bone">
          <img loading="lazy" src={item.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 bg-[rgba(16,28,22,0.32)]" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(250,248,242,0.92)] pl-0.5 text-cta">
              <PlayMark />
            </span>
          </span>
          <span className="absolute right-1.5 bottom-1.5 rounded-[3px] bg-[rgba(16,28,22,0.75)] px-[5px] py-px text-[10px] text-paper tabular-nums">
            {item.duration}
          </span>
        </div>
        <div className="min-w-0 flex-1 px-[13px] py-3">
          <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-gold">{t(item.location)}</p>
          <h3 className="mb-1.5 line-clamp-2 text-[13.5px] leading-[1.35] font-medium text-ink">
            {t(item.title)}
          </h3>
          <p className="line-clamp-2 text-[11.5px] leading-[17px] text-ink-soft">{t(item.desc)}</p>
        </div>
      </button>
      <div className="px-0.5 pt-1.5">
        <VideoSource item={item} />
      </div>
    </div>
  );
}

function LitCard({ work }: { work: LitWork }) {
  const { t } = useLocale();
  const badge = work.type === "book" ? copy.explore.book : copy.explore.film;
  return (
    <div className="flex overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="relative h-[110px] w-[110px] shrink-0 bg-bone">
        <img loading="lazy" src={work.cover} alt="" className="h-full w-full object-cover" />
        <span
          className={`absolute top-1.5 left-0 rounded-r-[3px] px-1.5 py-0.5 text-[8.5px] font-semibold tracking-[0.06em] text-paper ${
            work.type === "book" ? "bg-cta" : "bg-gold"
          }`}
        >
          {t(badge)}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between px-[13px] py-3">
        <div>
          <p className="mb-0.5 text-[10px] font-medium tracking-[0.06em] text-gold">
            {t(work.location)}
            {work.year ? ` · ${work.year}` : ""}
          </p>
          <p className="mb-0.5 text-[13.5px] leading-[1.3] font-medium text-ink">{t(work.title)}</p>
          <p className="mb-1.5 text-[11.5px] text-ink-soft">{t(work.creator)}</p>
          <p className="line-clamp-2 text-[11.5px] leading-[17px] text-ink-soft">{t(work.desc)}</p>
        </div>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(work.googleQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#4285F4]"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7.5 7.5l2 2" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {t(copy.explore.searchGoogle)}
        </a>
      </div>
    </div>
  );
}

function PlayMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M7 4.5 17 10 7 15.5V4.5z" />
    </svg>
  );
}
