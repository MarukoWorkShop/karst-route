import { useState, type FormEvent } from "react";
import type { CraftDraft } from "@/lib/craft";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function PlanResult({
  draft,
  onAgain,
}: {
  draft: CraftDraft;
  onAgain: () => void;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const honey = (form.elements.namedItem("_gotcha") as HTMLInputElement).value;
    if (honey) return;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const whatsapp = (form.elements.namedItem("whatsapp") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    if (name.length < 2) return setStatus("err");
    if (!whatsapp && !email) return setStatus("err");

    const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    const notes = [
      draft.headline,
      draft.pitch,
      `routeHint=${draft.routeHint}`,
      `source=${draft.source}`,
      ...draft.days.map(
        (d) => `D${d.day} ${d.city} · ${d.title} — ${d.beats.join("; ")}`,
      ),
    ].join("\n");

    setStatus("sending");
    if (!key) {
      setStatus("ok");
      return;
    }
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: `New Karst Route AI draft — ${draft.routeHint}`,
          name,
          whatsapp,
          email,
          notes,
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      setStatus(json.success ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div>
      <p className="text-[13px] font-medium tracking-[0.16em] text-cta">{t(copy.craft.resultKicker)}</p>
      <h3 className="mt-2 text-[22px] leading-8 font-medium">{draft.headline}</h3>
      <p className="mt-2 text-[16px] leading-7 text-ink-soft">{draft.pitch}</p>
      <p className="mt-3 text-[12px] text-ink-soft">{t(copy.craft.englishNote)}</p>
      <p className="mt-4 text-[13px] leading-6 text-ink">{draft.guideNote}</p>

      <ol className="mt-6 space-y-2">
        {draft.days.map((d) => {
          const on = open === d.day;
          return (
            <li key={d.day} className="rounded-lg border border-line bg-surface">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? 0 : d.day)}
                className="flex min-h-14 w-full items-center gap-3 px-3 text-left"
              >
                <span className="w-8 text-[13px] font-medium tabular-nums text-cta">
                  {String(d.day).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] leading-6">
                  {d.city}
                  <span className="mt-0.5 block text-[13px] text-ink-soft">{d.title}</span>
                </span>
              </button>
              {on ? (
                <div className="border-t border-line px-3 py-3">
                  <p className="text-[12px] text-ink-soft">
                    {t(copy.craft.stay)} · {d.stay}
                  </p>
                  <ul className="mt-2 space-y-1 text-[15px] leading-6">
                    {d.beats.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        <p className="text-[13px] font-medium tracking-[0.16em] text-cta">{t(copy.craft.why)}</p>
        <ul className="mt-2 space-y-2 text-[15px] leading-6 text-ink-soft">
          {draft.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="mt-10 space-y-4" noValidate>
        <p className="text-[17px] font-medium">{t(copy.craft.keep)}</p>
        <p className="text-[14px] leading-6 text-ink-soft">{t(copy.craft.keepSub)}</p>
        <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
        <Field label={t(copy.plan.name)} name="name" />
        <Field label={t(copy.plan.whatsapp)} name="whatsapp" />
        <Field label={t(copy.plan.email)} name="email" type="email" />
        {status === "err" ? <p className="text-[13px] text-danger">{t(copy.plan.err)}</p> : null}
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-12 w-full rounded-lg bg-cta text-[16px] font-medium text-white active:bg-cta-press disabled:opacity-60"
        >
          {status === "sending" ? t(copy.craft.sending) : t(copy.craft.send)}
        </button>
      </form>

      <button type="button" onClick={onAgain} className="mt-4 h-12 w-full text-[15px] text-ink-soft">
        {t(copy.craft.again)}
      </button>

      {status === "ok" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-lg bg-surface p-6">
            <p className="text-[16px] leading-7">{t(copy.plan.thanks)}</p>
            <button
              type="button"
              autoFocus
              onClick={() => setStatus("idle")}
              className="mt-6 h-12 w-full rounded-lg bg-cta font-medium text-white"
            >
              {t(copy.nav.close)}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block text-[13px] text-ink-soft">
      {label}
      <input
        name={name}
        type={type}
        className="mt-1 h-12 w-full rounded-lg border border-line bg-surface px-3 text-ink"
      />
    </label>
  );
}
