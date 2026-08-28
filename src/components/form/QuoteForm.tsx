import { useEffect, useState, type FormEvent } from "react";
import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function QuoteForm({
  route,
  presetNotes,
}: {
  route: RouteId;
  presetNotes: string;
}) {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [notes, setNotes] = useState(presetNotes);
  useEffect(() => {
    if (presetNotes) setNotes(presetNotes);
  }, [presetNotes]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const honey = (form.elements.namedItem("_gotcha") as HTMLInputElement).value;
    if (honey) return;

    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const whatsapp = (form.elements.namedItem("whatsapp") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const travelers = (form.elements.namedItem("travelers") as HTMLSelectElement).value;
    const dates = (form.elements.namedItem("dates") as HTMLInputElement).value.trim();
    const which = (form.elements.namedItem("route") as HTMLSelectElement).value;
    const note = (form.elements.namedItem("notes") as HTMLTextAreaElement).value.trim();

    if (name.length < 2) return setStatus("err");
    if (!whatsapp && !email) return setStatus("err");

    const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    setStatus("sending");

    if (!key) {
      setStatus("ok");
      form.reset();
      setNotes("");
      return;
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: `New Karst Route enquiry — ${which}`,
          name,
          whatsapp,
          email,
          travelers,
          dates,
          route: which,
          notes: note,
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      setStatus(json.success ? "ok" : "err");
      if (json.success) {
        form.reset();
        setNotes("");
      }
    } catch {
      setStatus("err");
    }
  }

  return (
    <section id="plan" className="scroll-mt-24 mx-auto max-w-xl bg-surface px-4 py-16">
      <p className="text-[13px] font-medium tracking-[0.16em] text-cta">
        {t(copy.plan.kicker)}
      </p>
      <h2 className="mt-2 text-[22px] leading-8 font-medium">{t(copy.plan.h2)}</h2>
      <p className="mt-2 text-[16px] leading-7 text-ink-soft">{t(copy.plan.sub)}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
        <Field label={t(copy.plan.name)} name="name" required />
        <Field label={t(copy.plan.whatsapp)} name="whatsapp" />
        <Field label={t(copy.plan.email)} name="email" type="email" />
        <label className="block text-[13px] text-ink-soft">
          {t(copy.plan.travelers)}
          <select
            name="travelers"
            className="mt-1 h-12 w-full rounded-lg border border-line bg-surface px-3 text-ink"
            defaultValue="2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1 === 12 ? "12+" : i + 1}>
                {i + 1 === 12 ? "12+" : i + 1}
              </option>
            ))}
          </select>
        </label>
        <Field
          label={t(copy.plan.dates)}
          name="dates"
          placeholder={t(copy.plan.flexible)}
          required
        />
        <label className="block text-[13px] text-ink-soft">
          {t(copy.plan.want)}
          <select
            name="route"
            className="mt-1 h-12 w-full rounded-lg border border-line bg-surface px-3 text-ink"
            defaultValue={route === "r1" ? "boutique-r1" : "boutique-r2"}
            key={route}
          >
            <option value="boutique-r1">{t(copy.plan.optR1)}</option>
            <option value="boutique-r2">{t(copy.plan.optR2)}</option>
          </select>
        </label>
        <label className="block text-[13px] text-ink-soft">
          {t(copy.plan.notes)}
          <textarea
            name="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface p-3 text-ink"
          />
        </label>
        {status === "err" ? (
          <p className="text-[13px] text-danger">{t(copy.plan.err)}</p>
        ) : null}
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-12 w-full rounded-lg bg-cta text-[16px] font-medium text-white active:bg-cta-press disabled:opacity-60"
        >
          {status === "sending" ? t(copy.plan.sending) : t(copy.plan.send)}
        </button>
      </form>
      {status === "ok" ? (
        <Success
          message={t(copy.plan.thanks)}
          close={t(copy.nav.close)}
          onClose={() => setStatus("idle")}
        />
      ) : null}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-[13px] text-ink-soft">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 h-12 w-full rounded-lg border border-line bg-surface px-3 text-ink"
      />
    </label>
  );
}

function Success({
  message,
  close,
  onClose,
}: {
  message: string;
  close: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-lg bg-surface p-6">
        <p className="text-[16px] leading-7">{message}</p>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-lg bg-cta font-medium text-white"
        >
          {close}
        </button>
      </div>
    </div>
  );
}
