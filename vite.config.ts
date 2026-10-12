import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { fileURLToPath, URL } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runCraft } from "./server/runCraft.ts";
import { runBookCraft } from "./server/runBookCraft.ts";

function htmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function jsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028");
}

type CoreDoc = {
  siteTitle?: { en?: string; zh?: string };
  name?: { en?: string; zh?: string };
  brandSlogan?: { en?: string };
};

function readCore(): { siteEn: string; siteZh: string; appName: string; sloganEn: string } {
  const fallback = { siteEn: "Travel", siteZh: "Travel", appName: "Travel", sloganEn: "" };
  try {
    const doc = parseYaml(fs.readFileSync(path.resolve("content/about.yaml"), "utf8")) as CoreDoc;
    return {
      siteEn: doc.siteTitle?.en?.trim() || fallback.siteEn,
      siteZh: doc.siteTitle?.zh?.trim() || fallback.siteZh,
      appName: doc.name?.zh?.trim() || doc.name?.en?.trim() || fallback.appName,
      sloganEn: doc.brandSlogan?.en?.trim() || "",
    };
  } catch {
    return fallback;
  }
}

function manifestBody() {
  const raw = fs.readFileSync(path.resolve("public/manifest.webmanifest"), "utf8");
  const json = JSON.parse(raw) as { name?: string; short_name?: string; description?: string };
  const core = readCore();
  json.name = core.appName;
  json.short_name = core.appName;
  if (core.sloganEn) json.description = core.sloganEn;
  return JSON.stringify(json, null, 2);
}

/** 首屏标题和 PWA 名称来自 content/about.yaml，不写死客户名。 */
function coreHtml(): Plugin {
  const applyHtml = (html: string) => {
    const core = readCore();
    return html
      .replaceAll("__SITE_TITLE_EN__", htmlEscape(core.siteEn))
      .replaceAll("__SITE_TITLE_ZH_JS__", jsEscape(core.siteZh))
      .replaceAll("__APP_NAME__", htmlEscape(core.appName));
  };
  return {
    name: "core-html",
    transformIndexHtml(html) {
      return applyHtml(html);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (url !== "/manifest.webmanifest") {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/manifest+json");
        res.end(manifestBody());
      });
    },
  };
}

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
      const manifestPath = path.join(dist, "manifest.webmanifest");
      if (fs.existsSync(manifestPath)) fs.writeFileSync(manifestPath, `${manifestBody()}\n`);
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
    plugins: [coreHtml(), react(), tailwindcss(), zhFallback(), pagesFallback(), craftDev()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      proxy: {
        "/hero-media": {
          target: "https://youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/hero-media/, ""),
          headers: {
            // Match production custom domain so local /hero-media proxy passes COS referer rules.
            Referer: "https://boutique-routes.guilinvillage.com/",
          },
        },
      },
    },
  };
});
