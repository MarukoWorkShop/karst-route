export async function sendEnquiry(fields: Record<string, string>): Promise<boolean> {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) return true;

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: key, ...fields }),
    });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
}

export function labelsOf(
  ids: string[],
  items: readonly { id: string; label: { en: string; zh: string } }[],
  locale: "en" | "zh",
): string[] {
  return ids
    .map((id) => items.find((item) => item.id === id)?.label[locale])
    .filter((v): v is string => Boolean(v));
}
