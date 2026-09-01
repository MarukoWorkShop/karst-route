import { runCraft } from "../server/runCraft";
import { runBookCraft } from "../server/runBookCraft";

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { status: (n: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  try {
    const body = (req.body ?? {}) as { kind?: string; brief?: unknown };
    const draft =
      body.kind === "book"
        ? await runBookCraft(body.brief ?? body)
        : await runCraft(body.brief ?? body);
    return res.status(200).json({ draft });
  } catch {
    return res.status(400).json({ error: "invalid brief" });
  }
}
