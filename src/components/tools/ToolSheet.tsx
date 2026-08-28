import { useMemo, useState } from "react";
import { trains } from "@/data/trains";
import { IconExternal, IconSwap } from "@/components/icons";

const FX = ["USD", "EUR", "CNY", "VND"] as const;
const RATES: Record<(typeof FX)[number], number> = {
  USD: 1,
  EUR: 0.92,
  CNY: 7.25,
  VND: 25400,
};

type Tab = "fx" | "weather" | "trains" | "translate" | "shop";

export function ToolSheet({
  open,
  onClose,
  onShop,
}: {
  open: boolean;
  onClose: () => void;
  onShop: () => void;
}) {
  const [tab, setTab] = useState<Tab>("fx");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="absolute right-0 bottom-0 left-0 max-h-[80vh] overflow-auto rounded-t-lg bg-sage p-4 pb-[calc(16px+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-line" />
        <div className="flex snap-x-mandatory gap-2 overflow-x-auto pb-2">
          {(
            [
              ["fx", "FX"],
              ["weather", "Weather"],
              ["trains", "Trains"],
              ["translate", "Translate"],
              ["shop", "Shop"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (id === "shop") {
                  onShop();
                  return;
                }
                setTab(id);
              }}
              className={`h-10 shrink-0 rounded-full px-3 text-[13px] ${
                tab === id ? "bg-cta text-white" : "bg-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "fx" ? <FxPanel /> : null}
        {tab === "weather" ? (
          <p className="pt-4 text-[15px] text-ink-soft">
            7-day forecast along the route lands in the next cut. Cities are
            already in the itinerary.
          </p>
        ) : null}
        {tab === "trains" ? (
          <ul className="space-y-3 pt-4">
            {trains.map((t) => (
              <li key={t.id} className="rounded-lg bg-surface p-4">
                <p className="font-medium">{t.leg}</p>
                <p className="text-[13px] text-ink-soft">{t.note}</p>
                {t.href ? (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[13px]"
                  >
                    Open timetable <IconExternal className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="mt-2 inline-block rounded-full bg-bone px-2 py-1 text-[12px]">
                    Included
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        {tab === "translate" ? (
          <p className="pt-4 text-[15px] text-ink-soft">
            AI translate uses a server key. Globe on the dock is the shortcut —
            quote still works without it.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FxPanel() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState<(typeof FX)[number]>("USD");
  const [to, setTo] = useState<(typeof FX)[number]>("VND");
  const out = useMemo(() => {
    const n = Number(amount) || 0;
    const usd = n / RATES[from];
    return (usd * RATES[to]).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }, [amount, from, to]);

  return (
    <div className="pt-2">
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputMode="decimal"
        className="h-14 w-full bg-transparent text-[28px] outline-none"
      />
      <div className="flex flex-wrap gap-2">
        {FX.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFrom(c)}
            className={`h-10 rounded-full px-3 text-[13px] ${from === c ? "bg-cta text-white" : "bg-surface"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="my-3 flex h-11 w-11 items-center justify-center"
        aria-label="Swap"
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
      >
        <IconSwap className="h-6 w-6" />
      </button>
      <p className="text-[22px] leading-7">
        {out} {to}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {FX.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setTo(c)}
            className={`h-10 rounded-full px-3 text-[13px] ${to === c ? "bg-cta text-white" : "bg-surface"}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ToolkitTeaser({ onOpen }: { onOpen: () => void }) {
  return (
    <section id="toolkit" className="bg-sage px-4 py-10 mt-12">
      <p className="text-[13px] font-medium tracking-[0.16em] text-cta">
        TOOLKIT
      </p>
      <p className="mt-2 text-[16px]">FX · Weather · Trains · Translate · Shop</p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 h-11 rounded-lg border border-line bg-surface px-4 text-[14px]"
      >
        Open tools
      </button>
    </section>
  );
}
