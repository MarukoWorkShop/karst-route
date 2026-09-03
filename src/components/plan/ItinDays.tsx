import { useState } from "react";
import type { BriefDay } from "@/lib/briefPdf";
import { IconChevron } from "@/components/icons";

export function ItinDays({ days }: { days: BriefDay[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      {days.map((day, idx) => {
        const isOpen = open === idx;
        return (
          <div key={`${day.num}-${idx}`} className={idx > 0 ? "border-t border-line" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              className={`flex w-full items-center gap-3 px-4 py-[13px] text-left ${
                isOpen ? "bg-cta/4" : "bg-surface"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-cta text-[11px] font-semibold text-cta">
                {day.num}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-ink">{day.city}</span>
                {day.date ? (
                  <span className="mt-px block truncate text-[12px] text-ink-soft">{day.date}</span>
                ) : !isOpen && day.bullets[0] ? (
                  <span className="mt-px block truncate text-[12px] text-ink-soft">{day.bullets[0]}</span>
                ) : null}
              </span>
              <span className="mr-1 hidden shrink-0 text-[11px] text-ink-soft sm:inline">{day.stay}</span>
              <IconChevron
                className={`h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform duration-150 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen ? (
              <div className="px-4 pb-4 pl-[60px]">
                {day.blurb ? <p className="mb-2 text-[13px] leading-5 text-ink">{day.blurb}</p> : null}
                {day.bullets.map((b, bi) => (
                  <div key={bi} className="mb-1.5 flex items-start gap-2">
                    <span className="mt-[3px] shrink-0 text-[12px] text-cta">·</span>
                    <span className="text-[13px] leading-5 text-ink">{b}</span>
                  </div>
                ))}
                {day.transport ? (
                  <p className="mt-2 text-[12px] text-ink-soft">{day.transport}</p>
                ) : null}
                {day.lodging ? <p className="text-[12px] text-ink-soft">{day.lodging}</p> : null}
                {day.dining?.length ? (
                  <p className="text-[12px] text-ink-soft">{day.dining.join(" · ")}</p>
                ) : null}
                {day.drive ? (
                  <div className="mt-1 inline-flex items-center rounded-md bg-bone px-2.5 py-1 text-[11.5px] text-ink-soft">
                    {day.drive}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
