import type { ReactNode } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export type PlanTone = "light" | "dark";

export function Chip({
  active,
  onClick,
  children,
  tone = "light",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: PlanTone;
}) {
  const dark = tone === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-[1.5px] px-[15px] py-[9px] text-[13px] font-semibold whitespace-nowrap transition-[border-color,background-color] duration-150 ${
        dark
          ? active
            ? "border-gold bg-gold/18 text-gold"
            : "border-gold/35 bg-transparent text-paper/85 hover:border-gold/60"
          : active
            ? "border-cta bg-cta/10 text-cta"
            : "border-line/90 bg-transparent text-ink hover:border-cta/35"
      }`}
    >
      {children}
    </button>
  );
}

export function OptionBtn({
  active,
  onClick,
  children,
  className = "",
  tone = "light",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  tone?: PlanTone;
}) {
  const dark = tone === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border-[1.5px] px-4 py-[13px] text-left text-[14px] font-semibold transition-[border-color,background-color] duration-150 ${
        dark
          ? active
            ? "border-gold bg-gold/15 text-paper"
            : "border-gold/30 bg-transparent text-paper hover:border-gold/55"
          : active
            ? "border-cta bg-cta/10 text-cta"
            : "border-line/90 bg-transparent text-ink hover:border-cta/35"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function RadioDot({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        on ? "border-cta" : "border-line"
      }`}
    >
      {on ? <span className="h-2.5 w-2.5 rounded-full bg-cta" /> : null}
    </span>
  );
}

export function Progress({
  step,
  total,
  tone = "light",
}: {
  step: number;
  total: number;
  tone?: PlanTone;
}) {
  const dark = tone === "dark";
  return (
    <div className="mb-7 flex gap-1" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-[3px] flex-1 rounded-sm ${
            i <= step ? (dark ? "bg-gold" : "bg-cta") : dark ? "bg-paper/20" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}

export function StepKicker({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <div
      className={`mb-3 text-[11px] font-semibold tracking-[0.08em] text-gold ${
        locale === "en" ? "uppercase" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function FieldLabel({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: PlanTone;
}) {
  return (
    <span
      className={`mb-1.5 block text-[13px] font-semibold ${
        tone === "dark" ? "text-paper/65" : "text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}

export const fieldClass =
  "h-12 w-full rounded-lg border-[1.5px] border-line/90 bg-paper/70 px-3.5 text-[15px] text-ink placeholder:text-ink-soft/70 outline-none focus:border-cta/40";

export const fieldClassDark =
  "h-12 w-full rounded-lg border-[1.5px] border-gold/35 bg-paper/8 px-3.5 text-[15px] text-paper placeholder:text-paper/40 outline-none focus:border-gold/60";

export function NavRow({
  step,
  total,
  lastLabel,
  onBack,
  onNext,
  tone = "light",
}: {
  step: number;
  total: number;
  lastLabel: string;
  onBack: () => void;
  onNext: () => void;
  tone?: PlanTone;
}) {
  const { t } = useLocale();
  const dark = tone === "dark";
  return (
    <div className="mt-7 flex gap-2.5">
      {step > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className={`h-12 flex-1 rounded-lg border-[1.5px] text-[15px] font-semibold ${
            dark
              ? "border-gold/40 text-paper hover:border-gold/65"
              : "border-line text-ink"
          }`}
        >
          {t(copy.plan.back)}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        className={`inline-flex h-12 flex-[2] items-center justify-center gap-1.5 rounded-lg text-[15px] font-semibold ${
          dark
            ? "bg-gold text-night hover:bg-gold/90"
            : "bg-cta text-paper active:bg-cta-press"
        }`}
      >
        {step < total - 1 ? t(copy.plan.next) : lastLabel}
      </button>
    </div>
  );
}

export function IconDownload({ className = "h-[15px] w-[15px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7.5 2v8M4 7.5l3.5 3.5 3.5-3.5M2 13h11" />
    </svg>
  );
}

export function IconSend({ className = "h-[13px] w-[13px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M11.5 1.5 1.5 6l4 2 2 4 4-10z" />
    </svg>
  );
}

export function IconRestart({ className = "h-[13px] w-[13px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11.5 2A6 6 0 1 0 12 6.5" />
      <path d="M11.5 2v3.5H8" />
    </svg>
  );
}

export function StartOver({
  onClick,
  tone = "light",
}: {
  onClick: () => void;
  tone?: PlanTone;
}) {
  const { t } = useLocale();
  return (
    <div className="mt-4 text-center">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] ${
          tone === "dark"
            ? "text-paper/55 hover:text-paper"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        <IconRestart />
        {t(copy.plan.startOver)}
      </button>
    </div>
  );
}

export function ConciergeForm({
  name,
  contact,
  sending,
  error,
  onName,
  onContact,
  onSend,
  tone = "light",
}: {
  name: string;
  contact: string;
  sending: boolean;
  error: boolean;
  onName: (v: string) => void;
  onContact: (v: string) => void;
  onSend: () => void;
  tone?: PlanTone;
}) {
  const { t } = useLocale();
  const dark = tone === "dark";
  return (
    <div
      className={`overflow-hidden rounded-[10px] border ${
        dark ? "border-gold/35" : "border-line"
      }`}
    >
      <div
        className={`border-b px-4 py-3.5 ${
          dark ? "border-gold/25 bg-paper/6" : "border-line/80 bg-bone/30"
        }`}
      >
        <p className={`text-[14px] font-semibold ${dark ? "text-paper" : "text-ink"}`}>
          {t(copy.plan.concierge)}
        </p>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <label className="block">
          <FieldLabel tone={tone}>{t(copy.plan.yourName)}</FieldLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            className={dark ? fieldClassDark : fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel tone={tone}>{t(copy.plan.yourContact)}</FieldLabel>
          <input
            type="text"
            value={contact}
            placeholder={t(copy.plan.contactPh)}
            onChange={(e) => onContact(e.target.value)}
            className={dark ? fieldClassDark : fieldClass}
          />
        </label>
        {error ? (
          <p className={`text-[13px] ${dark ? "text-gold" : "text-danger"}`}>
            {t(copy.plan.err)}
          </p>
        ) : null}
        <button
          type="button"
          disabled={sending}
          onClick={onSend}
          className={`inline-flex h-[46px] items-center justify-center gap-1.5 rounded-lg text-[14px] font-semibold disabled:opacity-60 ${
            dark ? "bg-gold text-night hover:bg-gold/90" : "bg-cta text-paper"
          }`}
        >
          {sending ? (
            t(copy.plan.sending)
          ) : (
            <>
              <IconSend />
              {t(copy.plan.sendTeam)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function SentNote({ tone = "light" }: { tone?: PlanTone }) {
  const { t } = useLocale();
  const dark = tone === "dark";
  return (
    <div
      className={`flex items-center gap-2.5 rounded-[10px] border px-4 py-3.5 ${
        dark ? "border-gold/40 bg-gold/12" : "border-ok bg-ok/10"
      }`}
    >
      <span className="text-[20px]" aria-hidden>
        ✓
      </span>
      <span className={`text-[14px] font-semibold ${dark ? "text-gold" : "text-ok"}`}>
        {t(copy.plan.sentNote)}
      </span>
    </div>
  );
}
