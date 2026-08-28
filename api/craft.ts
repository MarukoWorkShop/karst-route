import { runCraft } from "../server/runCraft";

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { status: (n: number) => { json: (body: unknown) => void } },
) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  try {
    const body = (req.body ?? {}) as { brief?: unknown };
    const draft = await runCraft(body.brief ?? body);
    return res.status(200).json({ draft });
  } catch {
    return res.status(400).json({ error: "invalid brief" });
  }
}
