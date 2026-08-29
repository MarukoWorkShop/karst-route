import type { PaceId, PrefId } from "@/lib/craft";
import { copy, type Tx } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function StepBasics({
  startDate,
  days,
  travelers,
  onStart,
  onDays,
  onTravelers,
}: {
  startDate: string;
  days: number;
  travelers: number;
  onStart: (v: string) => void;
  onDays: (v: number) => void;
  onTravelers: (v: number) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-3.5">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">{t(copy.craft.start)}</span>
        <input
          type="text"
          value={startDate}
          placeholder={t(copy.craft.datePh)}
          onChange={(e) => onStart(e.target.value)}
          className="h-12 w-full rounded-lg border-[1.5px] border-line bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/70"
        />
      </label>
      <Slider
        label={`${t(copy.craft.duration)}: ${days} ${t(copy.craft.nightsUnit)}`}
        min={7}
        max={18}
        value={days}
        onChange={onDays}
      />
      <Slider
        label={`${t(copy.craft.travelers)}: ${travelers} ${t(copy.craft.peopleUnit)}`}
        min={1}
        max={12}
        value={travelers}
        onChange={onTravelers}
      />
    </div>
  );
}

export function StepPace({ pace, onPace }: { pace: PaceId | null; onPace: (v: PaceId) => void }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-2.5">
      <Choice
        selected={pace === "packed"}
        title={t(copy.craft.packed)}
        sub={t(copy.craft.packedSub)}
        onClick={() => onPace("packed")}
      />
      <Choice
        selected={pace === "slow"}
        title={t(copy.craft.slow)}
        sub={t(copy.craft.slowSub)}
        onClick={() => onPace("slow")}
      />
    </div>
  );
}

const PREF_META: { id: PrefId; name: Tx }[] = [
  { id: "culture", name: copy.craft.culture },
  { id: "nature", name: copy.craft.nature },
  { id: "food", name: copy.craft.food },
  { id: "photo", name: copy.craft.photo },
];

export function StepPrefs({
  selected,
  onToggle,
}: {
  selected: PrefId[];
  onToggle: (id: PrefId) => void;
}) {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {PREF_META.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(p.id)}
              className={`rounded-full border-[1.5px] px-[18px] py-2.5 text-[14px] font-medium ${
                on ? "border-cta bg-cta/8 text-cta" : "border-line bg-transparent text-ink"
              }`}
            >
              {t(p.name)}
            </button>
          );
        })}
      </div>
      {selected.length ? null : (
        <p className="mt-4 text-[13px] text-danger">{t(copy.craft.prefNeed)}</p>
      )}
    </div>
  );
}

export function StepBudget({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { t } = useLocale();
  const band =
    value < 1600 ? t(copy.craft.lean) : value < 3000 ? t(copy.craft.comfort) : t(copy.craft.generous);
  const pct = ((value - 500) / (5000 - 500)) * 100;
  return (
    <div>
      <p className="text-[13px] font-medium text-ink-soft">
        {t(copy.craft.s4)}: ${value.toLocaleString("en-US")}
        <span className="ml-1 font-normal"> {t(copy.craft.perPerson)}</span>
      </p>
      <p className="mt-1 text-[13px] text-cta">{band}</p>
      <input
        type="range"
        min={500}
        max={5000}
        step={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-forest mt-2.5 w-full"
        style={{
          background: `linear-gradient(to right, var(--color-cta) ${pct}%, var(--color-line) ${pct}%)`,
        }}
        aria-label={t(copy.craft.s4)}
      />
      <p className="mt-2 text-[12px] text-ink-soft">{t(copy.craft.s4sub)}</p>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-ink-soft">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-forest w-full"
        style={{
          background: `linear-gradient(to right, var(--color-cta) ${pct}%, var(--color-line) ${pct}%)`,
        }}
      />
    </label>
  );
}

function Choice({
  selected,
  title,
  sub,
  onClick,
}: {
  selected: boolean;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-lg border-[1.5px] px-4 py-3.5 text-left ${
        selected ? "border-cta bg-cta/8 text-cta" : "border-line bg-transparent text-ink"
      }`}
    >
      <span className="block text-[15px] font-medium">{title}</span>
      <span className="mt-1 block text-[13px] leading-5 text-ink-soft">{sub}</span>
    </button>
  );
}
