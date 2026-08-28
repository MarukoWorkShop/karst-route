import { composeDraft, validateBrief, type CraftBrief, type CraftDraft } from "@/lib/craft";

export async function requestDraft(brief: CraftBrief): Promise<CraftDraft> {
  const safe = validateBrief(brief);
  try {
    const res = await fetch("/api/craft", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ brief: safe }),
    });
    if (!res.ok) return composeDraft(safe);
    const json = (await res.json()) as { draft?: CraftDraft };
    if (json.draft?.days?.length) return json.draft;
  } catch {
    /* local fallback */
  }
  return composeDraft(safe);
}
