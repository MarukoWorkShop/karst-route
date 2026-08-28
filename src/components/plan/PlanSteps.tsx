import type { PaceId, PrefId } from "@/lib/craft";
import { copy, type Tx } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconGrip } from "@/components/icons";

export function StepBasics({
  startDate,
  flexible,
  days,
  travelers,
  onStart,
  onFlexible,
  onDays,
  onTravelers,
}: {
  startDate: string;
  flexible: boolean;
  days: number;
  travelers: number;
  onStart: (v: string) => void;
  onFlexible: (v: boolean) => void;
  onDays: (v: number) => void;
  onTravelers: (v: number) => void;
}) {
  const { t } = useLocale();
  const minDate = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-5">
      <label className="block text-[13px] text-ink-soft">
        {t(copy.craft.start)}
        <input
          type="date"
          min={minDate}
          value={startDate}
          disabled={flexible}
          onChange={(e) => onStart(e.target.value)}
          className="mt-1 h-12 w-full rounded-lg border border-line bg-surface px-3 text-ink disabled:opacity-50"
        />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-[15px]">
        <input
          type="checkbox"
          checked={flexible}
          onChange={(e) => onFlexible(e.target.checked)}
          className="h-4 w-4 accent-cta"
        />
        {t(copy.craft.flexible)}
      </label>
      <Slider
        label={`${t(copy.craft.duration)} · ${days} ${t(copy.craft.daysUnit)}`}
        min={7}
        max={16}
        value={days}
        onChange={onDays}
      />
      <Slider
        label={`${t(copy.craft.travelers)} · ${travelers}`}
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
    <div className="grid gap-3">
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

const PREF_META: { id: PrefId; name: Tx; sub: Tx }[] = [
  { id: "culture", name: copy.craft.culture, sub: copy.craft.cultureSub },
  { id: "nature", name: copy.craft.nature, sub: copy.craft.natureSub },
  { id: "food", name: copy.craft.food, sub: copy.craft.foodSub },
  { id: "photo", name: copy.craft.photo, sub: copy.craft.photoSub },
];

export function StepPrefs({
  selected,
  order,
  onToggle,
  onReorder,
}: {
  selected: PrefId[];
  order: PrefId[];
  onToggle: (id: PrefId) => void;
  onReorder: (next: PrefId[]) => void;
}) {
  const { t } = useLocale();
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {PREF_META.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(p.id)}
              className={`min-h-[72px] rounded-lg border px-3 py-3 text-left ${
                on ? "border-cta bg-cta/8" : "border-line bg-surface"
              }`}
            >
              <span className="block text-[15px] font-medium">{t(p.name)}</span>
              <span className="mt-1 block text-[12px] leading-5 text-ink-soft">{t(p.sub)}</span>
            </button>
          );
        })}
      </div>
      {selected.length ? (
        <p className="mt-5 text-[13px] text-ink-soft">{t(copy.craft.rankHint)}</p>
      ) : (
        <p className="mt-5 text-[13px] text-danger">{t(copy.craft.prefNeed)}</p>
      )}
      <ol className="mt-2 space-y-2">
        {order.map((id, i) => {
          const meta = PREF_META.find((p) => p.id === id)!;
          return (
            <RankRow
              key={id}
              index={i}
              label={`${i + 1}. ${t(meta.name)}`}
              up={t(copy.craft.up)}
              down={t(copy.craft.down)}
              canUp={i > 0}
              canDown={i < order.length - 1}
              onMove={(dir) => {
                const next = [...order];
                const j = i + dir;
                const cur = next[i];
                const swap = next[j];
                if (cur === undefined || swap === undefined) return;
                next[i] = swap;
                next[j] = cur;
                onReorder(next);
              }}
              onPointerOrder={(from, to) => {
                if (from === to) return;
                const next = [...order];
                const [moved] = next.splice(from, 1);
                if (!moved) return;
                next.splice(to, 0, moved);
                onReorder(next);
              }}
            />
          );
        })}
      </ol>
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
  return (
    <div>
      <p className="text-[22px] font-medium tabular-nums">
        ${value.toLocaleString("en-US")}
        <span className="ml-2 text-[14px] font-normal text-ink-soft">{t(copy.craft.perPerson)}</span>
      </p>
      <p className="mt-1 text-[13px] text-cta">{band}</p>
      <input
        type="range"
        min={800}
        max={5000}
        step={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-forest mt-4 w-full"
        aria-label={t(copy.craft.s4)}
      />
      <div className="mt-1 flex justify-between text-[11px] tracking-wide text-ink-soft">
        <span>$800</span>
        <span>$2,200</span>
        <span>$5,000</span>
      </div>
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
  return (
    <label className="block text-[13px] text-ink-soft">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-forest mt-2 w-full"
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
      className={`min-h-[88px] rounded-lg border px-4 py-4 text-left ${
        selected ? "border-cta bg-cta/8" : "border-line bg-surface"
      }`}
    >
      <span className="block text-[17px] font-medium">{title}</span>
      <span className="mt-1 block text-[14px] leading-6 text-ink-soft">{sub}</span>
    </button>
  );
}

function RankRow({
  index,
  label,
  up,
  down,
  canUp,
  canDown,
  onMove,
  onPointerOrder,
}: {
  index: number;
  label: string;
  up: string;
  down: string;
  canUp: boolean;
  canDown: boolean;
  onMove: (dir: -1 | 1) => void;
  onPointerOrder: (from: number, to: number) => void;
}) {
  return (
    <li
      data-rank={index}
      className="flex min-h-12 items-center gap-2 rounded-lg border border-line bg-surface px-2"
    >
      <button
        type="button"
        className="flex h-11 w-11 touch-none items-center justify-center text-ink-soft"
        aria-label="Reorder"
        onPointerDown={(e) => {
          let from = index;
          const handle = e.currentTarget;
          handle.setPointerCapture(e.pointerId);
          const move = (ev: PointerEvent) => {
            const hit = document.elementFromPoint(ev.clientX, ev.clientY);
            const row = hit?.closest("[data-rank]");
            if (!row) return;
            const to = Number(row.getAttribute("data-rank"));
            if (!Number.isFinite(to) || to === from) return;
            onPointerOrder(from, to);
            from = to;
          };
          const upEnd = () => {
            handle.releasePointerCapture(e.pointerId);
            handle.removeEventListener("pointermove", move);
            handle.removeEventListener("pointerup", upEnd);
          };
          handle.addEventListener("pointermove", move);
          handle.addEventListener("pointerup", upEnd);
        }}
      >
        <IconGrip className="h-5 w-5" />
      </button>
      <span className="flex-1 text-[15px]">{label}</span>
      <button
        type="button"
        disabled={!canUp}
        aria-label={up}
        onClick={() => onMove(-1)}
        className="h-11 w-11 text-[16px] disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={!canDown}
        aria-label={down}
        onClick={() => onMove(1)}
        className="h-11 w-11 text-[16px] disabled:opacity-30"
      >
        ↓
      </button>
    </li>
  );
}
