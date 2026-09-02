import { useEffect, useState } from "react";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { IconClose } from "@/components/icons";
import { FieldLabel, IconSend } from "@/components/plan/PlanUi";
import { sendEnquiry } from "@/lib/enquiry";

const INPUT_CLS =
  "w-full rounded-lg border-[1.5px] border-line bg-surface px-3.5 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-soft/70 outline-none focus:border-cta";

export function ContactDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  // 锁定背景滚动 + Esc 关闭
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // 关闭后清空表单
  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setMessage("");
      setSending(false);
      setSent(false);
      setError(false);
    }
  }, [open]);

  if (!open) return null;

  async function submit() {
    if (!email.trim() || !message.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setSending(true);
    const ok = await sendEnquiry({
      subject: "Karst Route — general enquiry",
      name: name.trim(),
      contact: email.trim(),
      message: message.trim(),
      path: "contact",
    });
    setSending(false);
    if (ok) setSent(true);
    else setError(true);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(copy.contact.title)}
    >
      <button
        type="button"
        aria-label={t(copy.nav.close)}
        onClick={onClose}
        className="absolute inset-0 bg-night/55 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-[560px] rounded-[14px] bg-paper p-6 shadow-[0_24px_64px_rgba(22,36,30,0.18)]">
        <button
          type="button"
          aria-label={t(copy.nav.close)}
          onClick={onClose}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-sage"
        >
          <IconClose className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="py-6 text-center">
            <p className="mb-2 text-[20px] font-medium text-cta">{t(copy.contact.sentTitle)}</p>
            <p className="text-[14px] leading-6 text-ink-soft">{t(copy.contact.sentBody)}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-cta px-6 text-[14px] font-medium text-paper"
            >
              {t(copy.contact.close)}
            </button>
          </div>
        ) : (
          <>
            <p className="mb-1 text-[11px] font-medium tracking-[0.14em] text-cta uppercase">
              {t(copy.contact.kicker)}
            </p>
            <h3 className="mb-4 text-[20px] font-medium text-ink">{t(copy.contact.title)}</h3>
            <div className="flex flex-col gap-3.5">
              <label className="block">
                <FieldLabel>{t(copy.contact.nameLabel)}</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLS}
                />
              </label>
              <label className="block">
                <FieldLabel>{t(copy.contact.emailLabel)}</FieldLabel>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t(copy.contact.emailPh)}
                  className={INPUT_CLS}
                />
              </label>
              <label className="block">
                <FieldLabel>{t(copy.contact.messageLabel)}</FieldLabel>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t(copy.contact.messagePh)}
                  className={`${INPUT_CLS} resize-y`}
                />
              </label>
              {error ? (
                <p className="text-[13px] text-danger">{t(copy.contact.err)}</p>
              ) : null}
              <button
                type="button"
                disabled={sending}
                onClick={() => void submit()}
                className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cta text-[14px] font-medium text-paper disabled:opacity-60"
              >
                {sending ? (
                  t(copy.contact.sending)
                ) : (
                  <>
                    <IconSend className="h-3.5 w-3.5" />
                    {t(copy.contact.submit)}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}