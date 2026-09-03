# Karst Route

南境拾遗 / The Southern Curations — 广西 × 越南北部私人路书站点。

```bash
npm i
npm run dev
```

推送到 GitHub `main` 后，Actions 会自动发布到 GitHub Pages（`/karst-route/`）。中文版路径为 `/zh/`。

改栏目文案、FAQ、图片、行程：员工看 [content/README.md](./content/README.md)；技术对照 [CONTENT.md](./CONTENT.md)。不要改组件也能上线。

定制模块是站内问卷（预定现成路线 / 自己设计路线），询盘需要在仓库 Secrets 里配置 `VITE_WEB3FORMS_ACCESS_KEY`。PDF 在浏览器里生成，不依赖服务端。

本地「预定现成路线」的 AI 微调走火山引擎 Ark：在 `.env.local` 写 `ARK_API_KEY`（勿提交），然后 `npm run dev`。GitHub Pages 没有服务端，线上会回退到原精品日程，微调意见仍可留下。
