import { artisans } from "@/data/artisans";

export function ArtisanRail({
  onIntro,
}: {
  onIntro: (note: string) => void;
}) {
  return (
    <section id="artisans" className="pt-12">
      <p className="px-4 text-[13px] font-medium tracking-[0.16em] text-cta">
        LOCALS
      </p>
      <div className="mt-4 flex snap-x-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {artisans.map((a) => (
          <article
            key={a.id}
            className="w-[72vw] max-w-xs shrink-0 snap-start"
          >
            <div className="aspect-[3/4] rounded-lg bg-bone" />
            <h3 className="mt-3 text-[16px] font-medium">{a.craft}</h3>
            <p className="text-[13px] text-ink-soft">{a.city}</p>
            {a.href ? (
              <a
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-line text-[14px]"
              >
                Visit
              </a>
            ) : (
              <button
                type="button"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-line text-[14px]"
                onClick={() =>
                  onIntro(`Request intro: ${a.craft} (${a.city})`)
                }
              >
                Request intro
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
