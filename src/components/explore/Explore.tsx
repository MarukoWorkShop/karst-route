import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function Explore() {
  const { t } = useLocale();
  return (
    <section id="explore" className="scroll-mt-24 border-t border-line py-12">
      <div className="mx-auto max-w-xl px-4">
        <p className="text-[12px] font-medium tracking-[0.16em] text-ink-soft">
          {t(copy.explore.kicker)}
        </p>
        <h2 className="mt-2 text-[20px] leading-8 font-medium text-ink-soft">{t(copy.explore.h2)}</h2>
        <p className="mt-2 text-[15px] leading-7 text-ink-soft">{t(copy.explore.sub)}</p>
      </div>
      <div className="mt-6 flex snap-x-mandatory gap-3 overflow-x-auto px-4 pb-2">
        <Story
          id="explore-culture"
          kicker={t(copy.explore.c1k)}
          title={t(copy.explore.c1t)}
          cta={t(copy.explore.c1c)}
        />
        <Story
          id="explore-voices"
          kicker={t(copy.explore.c2k)}
          title={t(copy.explore.c2t)}
          cta={t(copy.explore.c2c)}
        />
        <Story
          id="explore-guide"
          kicker={t(copy.explore.c3k)}
          title={t(copy.explore.c3t)}
          cta={t(copy.explore.c3c)}
        />
      </div>
    </section>
  );
}

function Story({
  id,
  kicker,
  title,
  cta,
}: {
  id: string;
  kicker: string;
  title: string;
  cta: string;
}) {
  return (
    <article id={id} className="w-[72vw] max-w-xs shrink-0 snap-start scroll-mt-28">
      <div className="aspect-video rounded-lg border border-dashed border-line bg-bone" />
      <p className="mt-3 text-[11px] tracking-[0.12em] text-ink-soft">{kicker}</p>
      <h3 className="mt-1 text-[16px] leading-7 font-medium text-ink">{title}</h3>
      <span className="mt-2 inline-block text-[13px] text-ink-soft underline-offset-4">
        {cta}
      </span>
    </article>
  );
}
