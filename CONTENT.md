# 栏目内容更新流程

v1 没有运营后台。更新栏目 = 改仓库里的数据文件 → 本地预览中英两版 → 推 `main` → GitHub Pages 自动上线。

产品范围见 [PRD.md](./PRD.md)。视觉与手势见 [DESIGN.md](./DESIGN.md)。本文只讲**改文案、条目、图片**，不讲改组件。

中英必须一起改。字段是 `{ en: "...", zh: "..." }` 或 `L("English", "中文")`。

---

## 1. 先分清改的是哪一层

| 你想改什么 | 去哪改 | 不要改 |
|---|---|---|
| 栏目标题、按钮、CTA（「精品路线」「查看全部」） | `src/i18n/copy.ts` | 组件 JSX |
| FAQ、商家、影像、文艺、轮播正文 | `src/data/` 对应文件 | `App.tsx` |
| 图片 | 放进 `public/`，数据里用 `asset("/路径")` | 裸写 `/destinations/xxx.jpg`（线上会 404） |
| 日程天数、住宿、bullet | `src/data/itinerary.ts` | 只改精品卡文案会和行程对不上 |
| 问卷选项（成员类型、增值服务、额外目的地等） | `src/data/planOptions.ts` | 组件 JSX |
| 问卷步骤、询盘字段、语言 URL | 先别动 | 这是产品逻辑，不是栏目内容 |

---

## 2. 栏目 → 文件

| 页面栏目 | 文件 | 常见操作 |
|---|---|---|
| Hero 轮播 | `src/data/heroPanels.ts` | 改 `title` / `intro`；换图改 `src`；`themeId` 必须对应体验四卡（`wild` / `flavors` / `villages` / `locals`），芯片文案读 `themes.ts` |
| Hero / 顶栏按钮 | `copy.ts` 的 `hero`、`nav` | CTA、导航名 |
| 精品两卡 | `copy.ts` 的 `tours`（`r1Name`、`r1Feature` 等）+ 封面 `public/tours/` | 路线名、副题、天数 / 出入境；封面路径在 `BoutiqueTours.tsx` |
| 行程 | `src/data/itinerary.ts` | 每天 `city` / `stay` / `bullets`（最多 3 条）；越南段在 `vietnamBlock`，两条线共用 |
| 体验四主题 | `src/data/themes.ts` + `src/data/experiences.ts` | 卡上名字 vs 抽屉故事；`id` 不要随便改 |
| 探索影像 | `src/data/videos.ts` | `youtubeId`、标题、封面 |
| 文艺推荐 | `src/data/literature.ts` | 书 / 电影条目、`googleQuery` |
| 问答 | `src/data/faqs.ts` | 增删问答；顶栏用的 `tool-visa` / `tool-season` / `tool-transit` 不要改 id |
| 合作商家 | `src/data/partners.ts` | 名称、介绍、地图 / 官网链接 |
| 页脚品牌句 | `copy.ts` 的 `footer` | slogan、版权 |
| 页脚社交链接 | `src/components/layout/Footer.tsx` 里的 `socials[].href` | 目前仍是 `#` |
| 定制问卷选项 | `src/data/planOptions.ts` | chips 中英文一起改 |

图片：新文件放到 `public/destinations/` 或 `public/tours/`，引用写成 `asset("/destinations/文件名.jpg")`。不要用 Unsplash。

---

## 3. 每次更新的步骤

1. **拉最新**  
   `git pull`，确认在 `main`。

2. **只改内容文件**  
   按上表打开对应 `src/data/*.ts` 或 `copy.ts`。抄一条现有对象改字段，保持 `id` 稳定。

3. **本地预览**  
   `npm run dev`，打开英文 `/` 和中文 `/zh/`，滚到那个栏目。换语言后同一条内容两边都要对。

4. **行程类额外核**  
   切路线一 / 路线二；展开一天看 bullet、住宿、图。`placeId` 必须是 `src/data/destinations.ts` 里已有的站（如 `hanoi`、`sapa`）。

5. **提交并发布**  
   commit → `git push origin main`。Actions「Deploy GitHub Pages」跑完（大约半分钟）后打开：

   - 英文：https://marukoworkshop.github.io/karst-route/
   - 中文：https://marukoworkshop.github.io/karst-route/zh/

   若仍是旧页，硬刷新。推送就是发布，不必改组件、不必另内部署。

---

## 4. 容易踩的坑

- **只改中文或只改英文**：另一语言版会过期。
- **改了 `id`**：顶栏问答下拉、体验四卡、Hero `themeId`、日程 `themes[]` 会对不上。新增条目用新 id，旧 id 留给还在用的锚点。
- **图片没用 `asset()`**：本地看起来正常，Pages 子目录 `/karst-route/` 会 404。
- **只改精品卡天数、没改 `itinerary.ts`**：卡片写 12 日、时间轴还是旧日程。
- **越南段改一处漏一处**：改 `vietnamBlock`，两条线会一起变，这是故意的。

---

## 5. 难度分层

- **可以当内容入口**：FAQ、商家、影像、文艺、轮播句子、页脚 slogan。
- **要对照 PRD**：日程、精品卡 meta、主题 id。
- **不要当内容入口**：`App.tsx`、规划四步、`LocaleProvider`、GitHub Pages 配置。
