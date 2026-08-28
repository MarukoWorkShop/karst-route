import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-line px-4 py-10 pb-24 text-[13px] text-ink-soft md:pb-10">
      <p>KARST ROUTE</p>
      <p className="mt-2">{t(copy.footer.line)}</p>
      <p className="mt-4">{t(copy.footer.contact)}</p>
    </footer>
  );
}
