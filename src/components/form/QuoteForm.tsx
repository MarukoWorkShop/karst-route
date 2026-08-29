import { useEffect, useState } from "react";
import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

const PEOPLE = ["1", "2", "3", "4", "5", "6+"] as const;

export function QuoteForm({
  route,
  presetNotes,
}: {
  route: RouteId;
  presetNotes: string;
}) {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [dates, setDates] = useState("");
  const [want, setWant] = useState<RouteId | "">(route);
  const [notes, setNotes] = useState(presetNotes);

  useEffect(() => {
    setWant(route);
  }, [route]);
  useEffect(() => {
    if (presetNotes) setNotes(presetNotes);
  }, [presetNotes]);

  const questions = [copy.plan.qRoute, copy.plan.qWhen, copy.plan.qContact, copy.plan.qNotes];

  function canNext() {
    if (step === 1) return dates.trim().length > 0;
    if (step === 2) return name.trim().length > 0 && contact.trim().length > 0;
    return true;
  }

  async function submit() {
    if (name.trim().length < 2) return setError("name");
    if (!contact.trim()) return setError("contact");

    const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    setStatus("sending");
    const which = want === "r1" ? "boutique-r1" : want === "r2" ? "boutique-r2" : "unsure";

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
          subject: `New Karst Route enquiry — ${which}`,
          name: name.trim(),
          contact: contact.trim(),
          travelers,
          dates: dates.trim(),
          route: which,
          notes: notes.trim(),
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      setStatus(json.success ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  }

  const routes = [
    { val: "r1" as const, label: t(copy.plan.optR1) },
    { val: "r2" as const, label: t(copy.plan.optR2) },
    { val: "" as const, label: t(copy.plan.optUnsure) },
  ];

  return (
    <div>
      <h3 className="mb-5 text-[17px] font-medium text-ink">{t(copy.plan.bookTitle)}</h3>
      <div className="mb-7 flex gap-1.5" aria-hidden>
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-[3px] flex-1 rounded-sm ${i <= step ? "bg-cta" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="mb-4 text-[16px] font-medium text-ink">{t(questions[step]!)}</p>

      {step === 0 ? (
        <div className="flex flex-col gap-2.5">
          {routes.map((rc) => (
            <button
              key={rc.val || "unsure"}
              type="button"
              onClick={() => setWant(rc.val)}
              className={`rounded-lg border-[1.5px] px-4 py-[13px] text-left text-[14px] font-medium ${
                want === rc.val
                  ? "border-cta bg-cta/7 text-cta"
                  : "border-line bg-surface text-ink"
              }`}
            >
              {rc.label}
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-3.5">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              {t(copy.plan.dates)} *
            </span>
            <input
              type="text"
              value={dates}
              placeholder={t(copy.plan.datePh)}
              onChange={(e) => setDates(e.target.value)}
              className={`h-12 w-full rounded-lg border-[1.5px] bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/70 ${
                error === "dates" ? "border-danger" : "border-line"
              }`}
            />
          </label>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-soft">
              {t(copy.plan.travelers)}: {travelers} {t(copy.plan.peopleUnit)}
            </p>
            <div className="flex gap-2">
              {PEOPLE.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTravelers(n)}
                  className={`h-10 flex-1 rounded-lg border-[1.5px] text-[14px] font-medium ${
                    travelers === n
                      ? "border-cta bg-cta/7 text-cta"
                      : "border-line bg-transparent text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-3.5">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              {t(copy.plan.name)} *
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-12 w-full rounded-lg border-[1.5px] bg-surface px-3.5 text-[15px] text-ink ${
                error === "name" ? "border-danger" : "border-line"
              }`}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              {t(copy.plan.contact)} *
            </span>
            <input
              type="text"
              value={contact}
              placeholder={t(copy.plan.contactPh)}
              onChange={(e) => setContact(e.target.value)}
              className={`h-12 w-full rounded-lg border-[1.5px] bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-soft/70 ${
                error === "contact" ? "border-danger" : "border-line"
              }`}
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <textarea
          rows={4}
          value={notes}
          placeholder={t(copy.plan.notesPh)}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] leading-6 text-ink placeholder:text-ink-soft/70"
        />
      ) : null}

      {status === "err" ? (
        <p className="mt-3 text-[13px] text-danger">{t(copy.plan.err)}</p>
      ) : null}

      <div className="mt-6 flex gap-2.5">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep((s) => s - 1);
            }}
            className="h-12 flex-1 rounded-lg border-[1.5px] border-line text-[15px] font-medium text-ink"
          >
            {t(copy.plan.back)}
          </button>
        ) : null}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => {
              if (!canNext()) {
                setError(step === 1 ? "dates" : "name");
                return;
              }
              setError("");
              setStep((s) => s + 1);
            }}
            className="h-12 flex-[2] rounded-lg bg-cta text-[15px] font-medium text-paper"
          >
            {t(copy.plan.next)}
          </button>
        ) : (
          <button
            type="button"
            disabled={status === "sending"}
            onClick={() => void submit()}
            className="h-12 flex-[2] rounded-lg bg-cta text-[15px] font-medium text-paper disabled:opacity-60"
          >
            {status === "sending" ? t(copy.plan.sending) : t(copy.plan.send)}
          </button>
        )}
      </div>

      {status === "ok" ? (
        <Success
          message={t(copy.plan.thanks)}
          close={t(copy.nav.close)}
          onClose={() => setStatus("idle")}
        />
      ) : null}
    </div>
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
          className="mt-6 h-12 w-full rounded-lg bg-cta font-medium text-paper"
        >
          {close}
        </button>
      </div>
    </div>
  );
}
