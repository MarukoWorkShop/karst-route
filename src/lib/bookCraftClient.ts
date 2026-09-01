import { catalogFallback, type BookCraftRequest, type BookDraft } from "@/lib/bookCraft";

export async function requestBookDraft(req: BookCraftRequest): Promise<BookDraft> {
  const fallback = catalogFallback(req.catalog, req.locale);
  try {
    const res = await fetch("/api/craft", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ kind: "book", brief: req }),
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { draft?: BookDraft };
    if (json.draft?.days?.length) return json.draft;
  } catch {
    /* Pages has no /api/craft */
  }
  return fallback;
}
