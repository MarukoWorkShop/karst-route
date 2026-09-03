# 栏目内容更新流程

v1 没有运营后台。**日常改文案请走 [content/README.md](./content/README.md)**（YAML，不用改代码）。推 `main` 后 GitHub Pages 自动构建。

下面表格给技术人员：界面按钮等仍在 `src/i18n/copy.ts`。YAML 损坏时页面会回退到 `src/data/` 里的旧值。

产品范围见 [PRD.md](./PRD.md)。视觉与手势见 [DESIGN.md](./DESIGN.md)。本文只讲**改文案、条目、图片**，不讲改组件。

中英不必成对手填。YAML 文件顶部的 `src:` 标明原文语言；其它语言在「部署」前补齐。`copy.ts` 里的界面词仍是 `{ en, zh }`。

---

## 1. 先分清改的是哪一层

| 你想改什么 | 去哪改 | 不要改 |
|---|---|---|
| 栏目标题、按钮、CTA（「精品路线」「查看全部」） | `src/i18n/copy.ts` | 组件 JSX |
| 路线卡片、逐日行程、About、评价、FAQ、商家、首页轮播 | `content/`（见 [content/README.md](./content/README.md)） | 不要先改 `src/data/` |
| 图片 | 放进 `public/`，YAML 里写 `destinations/xxx.jpg` | 裸写 `/destinations/xxx.jpg`（线上会 404） |
| 问卷选项（成员类型、增值服务、额外目的地等） | `src/data/planOptions.ts` | 组件 JSX |
| 问卷步骤、询盘字段、语言 URL | 先别动 | 这是产品逻辑，不是栏目内容 |

---

## 2. 栏目 → 文件（员工改 YAML）

首页从上到下对照：

| 页面栏目 | 员工改这里 | 程序保底（不要当日常入口） |
|---|---|---|
| Hero 轮播文案 / 海报 / 视频文件名 | `content/hero.yaml` | `src/data/heroPanels.ts` |
| Hero / 顶栏按钮 | `copy.ts` 的 `hero`、`nav` | 组件 JSX |
| 精品三卡（名称、价格、封面、卖点） | `content/routes/r1.yaml` 等 | `copy.ts` 的 `tours` + `src/data/tourFacts.ts` |
| 逐日行程 | `content/itineraries/r1.yaml` 等 | `src/data/itinerary.ts` |
| 客人评价 | `content/reviews/*.yaml` | `src/data/reviews.ts` |
| 关于我们 | `content/about.yaml` | `copy.ts` 的 `about` |
| 问答 | `content/faqs.yaml` | `src/data/faqs.ts`（`tool-visa` 等 id 不要改） |
| 合作商家 | `content/partners.yaml` | `src/data/partners.ts` |
| 体验四主题 | （仍走代码）`src/data/themes.ts` + `experiences.ts` | 组件 JSX |
| 探索影像 | （仍走代码）`src/data/videos.ts` | 见 [DESIGN.md §探索影像](./DESIGN.md) |
| 文艺推荐 | （仍走代码）`src/data/literature.ts` | |
| 页脚品牌句 | `copy.ts` 的 `footer` | |
| 页脚社交链接 | `src/components/layout/Footer.tsx` 里的 `socials[].href` | 目前仍是 `#` |
| 定制问卷选项 | `src/data/planOptions.ts` | chips 中英文一起改 |

图片：新文件放到 `public/destinations/` 或 `public/tours/`，YAML 写成 `destinations/文件名.jpg`。不要用 Unsplash。

Hero 成片现为 COS `videos/1.mp4` 等。BGM 仍用 `VITE_HERO_MEDIA_BASE` + `hero/bgm.mp3`。`themeId` 对应体验四卡。

---

## 3. 每次更新的步骤

员工（GitHub 网页）：见 [content/README.md](./content/README.md)。

技术人员本地：

1. **拉最新**  
   `git pull`，确认在 `main`。

2. **只改内容文件**  
   日常改 `content/*.yaml` 的原文（`src` 那种语言）。界面词才动 `copy.ts`。推 `main` 之前跑 `npm run content:lang`，缺的语言补齐后再发布。

3. **本地预览**  
   `npm run dev`，打开英文 `/` 和中文 `/zh/`，滚到那个栏目。换语言后同一条内容两边都要对。

4. **行程类额外核**  
   切路线一 / 二 / 三；展开一天看 bullet、住宿、图。`placeId` 必须是 `src/data/destinations.ts` 里已有的站（如 `hanoi`、`sapa`）。

5. **提交并发布**  
   commit → `git push origin main`。Actions「Deploy GitHub Pages」跑完（大约半分钟）后打开：

   - 英文：https://marukoworkshop.github.io/karst-route/
   - 中文：https://marukoworkshop.github.io/karst-route/zh/

   若仍是旧页，硬刷新。推送就是发布，不必改组件、不必另内部署。

---

## 4. 容易踩的坑

- **只改中文或只改英文**：这是现在的正规做法。改 `src` 指出的原文；缺的语言等「部署」时补。不要用代码里的旧译文去覆盖新原文。
- **改了 `id`**：顶栏问答下拉、体验四卡、Hero `themeId`、日程 `themes[]` 会对不上。新增条目用新 id，旧 id 留给还在用的锚点。
- **图片没用站点相对路径**：YAML 里写 `destinations/xxx.jpg`；代码里用 `asset()`。裸写 `/destinations/xxx.jpg` 在 Pages 子目录会 404。
- **只改精品卡天数、没改 itineraries**：卡片写 14 日、时间轴还是旧日程。
- **YAML 缩进用了 Tab**：该文件会被跳过，页面显示旧内容。

---

## 5. 难度分层

- **可以当内容入口**：`content/` 下全部 YAML（路线、日程、About、评价、FAQ、商家、Hero）。
- **要对照 PRD**：日程 `placeId`、主题 id、FAQ 工具锚点。
- **不要当内容入口**：`App.tsx`、规划四步、`LocaleProvider`、GitHub Pages 配置。
