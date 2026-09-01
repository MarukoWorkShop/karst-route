import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runCraft } from "./server/runCraft.ts";
import { runBookCraft } from "./server/runBookCraft.ts";

function pagesBase() {
  const raw = process.env.PAGES_BASE || "/";
  if (raw === "/") return "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function pagesFallback(): Plugin {
  return {
    name: "pages-fallback",
    apply: "build",
    closeBundle() {
      const dist = path.resolve("dist");
      const indexPath = path.join(dist, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const html = fs.readFileSync(indexPath, "utf8");
      fs.writeFileSync(path.join(dist, "404.html"), html);
      fs.mkdirSync(path.join(dist, "zh"), { recursive: true });
      fs.writeFileSync(path.join(dist, "zh", "index.html"), html);
      fs.writeFileSync(path.join(dist, ".nojekyll"), "");
    },
  };
}

function zhFallback(): Plugin {
  const rewrite = (url = "") => {
    const [path, query] = url.split("?");
    if (path === "/zh" || path === "/zh/" || (path.startsWith("/zh/") && !path.includes("."))) {
      return `/${query ? `?${query}` : ""}`;
    }
    return url;
  };
  return {
    name: "zh-spa-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) req.url = rewrite(req.url);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) req.url = rewrite(req.url);
        next();
      });
    },
  };
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function isCraftPath(url = "") {
  const path = url.split("?")[0];
  return path === "/api/craft" || path === "/api/craft/";
}

function craftHandler(req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) {
  if (!isCraftPath(req.url ?? "")) {
    next();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "method" }));
    return;
  }
  void (async () => {
    try {
      const raw = JSON.parse((await readBody(req)) || "{}") as { kind?: string; brief?: unknown };
      const draft =
        raw.kind === "book" ? await runBookCraft(raw.brief ?? raw) : await runCraft(raw.brief ?? raw);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ draft }));
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "invalid brief" }));
    }
  })();
}

function craftDev(): Plugin {
  return {
    name: "craft-api",
    configureServer(server) {
      server.middlewares.use(craftHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(craftHandler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
  return {
    base: pagesBase(),
    plugins: [react(), tailwindcss(), zhFallback(), pagesFallback(), craftDev()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  };
});
