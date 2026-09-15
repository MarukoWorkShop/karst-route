import type { DisplayCurrency } from "@/lib/fx";

/**
 * 小号药丸切换：文案在外侧，中间拇指左右滑。
 * 仅英文页使用。
 */
export function CurrencyToggle({
  value,
  onChange,
  className = "",
}: {
  value: DisplayCurrency;
  onChange: (next: DisplayCurrency) => void;
  className?: string;
}) {
  const isEur = value === "EUR";

  return (
    <div
      role="group"
      aria-label="Display currency"
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange("USD")}
        className={`text-[9px] font-semibold tracking-[0.08em] transition ${
          !isEur ? "text-cta" : "text-ink-soft/70 hover:text-ink-soft"
        }`}
        aria-pressed={!isEur}
      >
        USD
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={isEur}
        aria-label={isEur ? "Euro selected" : "US dollar selected"}
        onClick={() => onChange(isEur ? "USD" : "EUR")}
        className="relative h-3.5 w-7 shrink-0 rounded-full bg-line/80 transition hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cta"
      >
        <span
          aria-hidden
          className={`absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-cta shadow-sm transition-transform duration-200 ease-out ${
            isEur ? "translate-x-3.5" : "translate-x-0"
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => onChange("EUR")}
        className={`text-[9px] font-semibold tracking-[0.08em] transition ${
          isEur ? "text-cta" : "text-ink-soft/70 hover:text-ink-soft"
        }`}
        aria-pressed={isEur}
      >
        EUR
      </button>
    </div>
  );
}
