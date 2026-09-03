import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

/** 信任信号条：紧接 Hero 之后，用最短的话把「凭什么信你」说清 */
const ITEMS = [
  { icon: "🕰️", label: copy.trust.years },
  { icon: "🧳", label: copy.trust.travellers },
  { icon: "🎓", label: copy.trust.guide },
  { icon: "🛡️", label: copy.trust.insurance },
  { icon: "↩️", label: copy.trust.cancel },
] as const;

export function TrustBar() {
  const { t } = useLocale();
  return (
    <section className="border-y border-line bg-sage">
      <div className="page-col py-3.5">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:gap-x-9">
          {ITEMS.map((item) => (
            <li
              key={item.label.en}
              className="flex items-center gap-1.5 text-[12px] font-medium text-ink md:text-[13px]"
            >
              <span className="text-[13px]" aria-hidden>
                {item.icon}
              </span>
              {t(item.label)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
