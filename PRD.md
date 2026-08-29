# PRD：南境拾遗 / The Southern Curations

| 字段 | 内容 |
|---|---|
| 对外品牌 | 南境拾遗 / The Southern Curations |
| 产品工作名 | Karst Route（仓库：`karst-route`；本地目录名 Travel in Guilin） |
| 版本 | v1.2 |
| 日期 | 2026-08-29 |
| 形态 | 单页落地站；**官方中英 1:1 语言版**（`/` 英文、`/zh/` 简体中文）；询盘表单；页内 FAQ；抽屉式旅行工具箱 |
| 主视口 | 手机 375px；桌面为同一套组件的加宽布局 |
| 技术 | Vite + React + TypeScript + Tailwind CSS；GitHub；GitHub Pages 子目录 `/karst-route/` |
| 后端 | 询盘走 Web3Forms。路径 B 生成走 `/api/craft`（仅在支持 serverless 的环境可用；Pages 静态托管时前端走本地兜底草稿）。无业务 CMS。AI 翻译 API **不是**官方语言站 |

本文是实现与验收的唯一产品依据。视觉、密度与手势见 [DESIGN.md](./DESIGN.md)。语言 URL / `hreflang` 细则以 DESIGN §12 为准，产品范围以本文为准。

**内容密度（产品约束，不只是视觉）：** 面向手机与年轻节奏。日程默认全折叠，同时只展开一天；展开最多 3 条短 bullet。不把国泰画册式长文搬进页面。审美（雾、奶油纸、灯笼红、电影感图）可用，版式不可用。

---

## 1. 背景与目标

面向海外客人售卖两条「广西 + 越南出入境」私团路线。客人在站内先看懂**在哪走、两条线怎么不同**，再留下 WhatsApp / Email。运营不写业务后端：询盘邮件直达业务邮箱。

语言策略：**英文与简体中文是人工对照的官方页面**，同一套 DOM / `id`，只换字符串。禁止把 Google 整页机翻或 `/api/translate` 的即时结果当成可收录语言站。

**v1 成功标准**

1. 手机 Slow 3G 下，首字节即可看到与真页面同结构的骨架，而不是长时间白屏。
2. 两条完整路线可切换；375px 折叠态约 1.5 屏能扫完 12 日；同时只展开一天。
3. 本地与生产各成功提交一封询盘（精品表单或 AI 草稿留资）。
4. Header **EN | 中文** 切换：URL 变为 `/` 或 `/zh/`，保留当前 hash；`<html lang>`、`canonical`、`hreflang`（`en` / `zh-Hans` / `x-default`）与可见文案一致。
5. 首屏满幅轮播可读出主题气质与双 CTA；两条精品卡能读出路线名、天数、出入口、适合人群。

---

## 2. 用户

| 角色 | 描述 | 核心任务 |
|---|---|---|
| 海外旅行决策者 | 英语或中文，可能人在东南亚 / 欧美 / 澳新 / 华人圈 | 看 Hero 轮播定位气质、对比两条线、看清出入口与人群、留资 |
| 同行伙伴 | 被转发链接，移动端打开 | 快速扫日程；一键切到中文或英文官方版 |
| 地接运营（内部） | 中文母语，收邮件跟进 | 从邮件读出姓名、联系方式、人数、日期、意向路线、备注 |

**非用户：** 需要在线付订金、自己出 12306 票的访客（v1 不承诺）。GitHub Pages 为中国大陆可访问的静态托管；服务端 AI 生成不作为 Pages 发布门禁。

---

## 3. 范围

### 3.1 In scope（v1）

- 单页双轨：买精品 / 自己规划
- Hero `#top`：满幅轮播（主题芯片 + 标题 + 导语）+ 双 CTA
- `#tours`：两张精品路线卡（封面、路线名、副题、区域、特色长文、天数 / 入境 / 出境 / 适合人群）
- `#itinerary`：12 日 / 10 日折叠时间轴、旅客评论、路线地图动画
- `#experience`：四主题体验卡（过滤时间轴；点开故事抽屉）
- `#explore`：目的地影像（YouTube）+ 文艺推荐；首页各 3 条，「查看全部」右侧抽屉
- `#plan`：路径 B 为 **Wanderful AI 四步问卷**（日期人数 → 节奏 → 偏好排序 → 预算）+ 生成等待 + 英文路书草稿；路径 A 精品询盘仍为固定表单
- `#faq`：出行前问答（签证 / 季节 / 交通等）；旧 hash `#tool-visa` 等仍可打开对应条目
- `#partners`：实地考察过的当地合作商家
- 官方中英 1:1：`src/i18n/copy.ts` + 行程 `{en,zh}`；Header 语言切换必须改 URL 路径；SPA `/zh/` 回退
- 手机底栏：Tours | Plan（探索 / 问答 / 工具箱不进主键）
- HTML 首屏骨架
- Web3Forms 询盘
- GitHub Pages（`/karst-route/`）；图片一律经 `asset()` 拼接 `BASE_URL`

### 3.2 Out of scope（v1 明确不做）

- 整站 CMS、支付订金、购物车、用户账号
- 越南 / 法 / 日 / 韩官方语言版（可灰态 Coming soon，不链假 URL）
- 用 Google Translate、浏览器「翻译此页」、或无审校 API 出稿充当官方语言站
- 同一 URL 随 `Accept-Language` 换全文而不改路径
- 12306 / 越铁爬虫或站内出票
- 前端放置 `VITE_` AI Key
- 任意文本「万能翻译框」
- 中国大陆专线 CDN / ICP 备案方案
- WhatsApp Business API
- Hero 区域地图、性格轨 `ThemeRail` / `ThemeMaterials`：已退出首页主路径（主题改在 `#experience`）
- 汇率 / 地图 / 天气 / 饮食：仅 Header 汉堡打开的 `ToolsDrawer`，不做成首页栏目

---

## 4. 信息架构（一页，从上到下）

1. Sticky Header：Logo **KARST ROUTE** → `#top`。一级 **Boutique Tours / 精品路线**、**Plan Your Route / 行程定制**（带 AI 胶囊）；二级 **Explore / 探索**（目的地影像、文艺推荐）、**Q&A / 问答**（越南签证、最佳季节、旅途交通）。汉堡打开旅行工具箱。右上 **EN | 中文**
2. Hero `#top`：满幅轮播；主题芯片滚到 `#experience`；实心 CTA → `#tours`；幽灵 CTA **自己设计游玩主题和线路** → `#plan`（intent=custom，进入 AI 问卷）
3. `#tours` 精品两卡 + 卡下「咨询这条路线」
4. `#itinerary` 行程时间轴（仅此区内）
5. `#experience` 四主题体验
6. `#explore` 目的地影像 + 文艺推荐（`#explore-films` / `#explore-lit`）
7. `#plan` 双 Tab：AI 智能规划 | 咨询精品路线
8. `#faq` 出行前问答
9. `#partners` 当地合作商家
10. Footer：品牌 **南境拾遗 / The Southern Curations**
11. 手机底栏：Tours / 路线（主）| Plan / 定制（次）

主转化是轨 A 看路线或轨 B 提交 brief，不是首屏堆工具。

---

## 5. 路线产品

数据源：`src/data/itinerary.ts`。越南段抽 `vietnamBlock`，禁止两线各写一套 JSX。城市、住宿、bullet 均为 `{en, zh}`，随当前语言取值。

### 5.1 路线一 · 12 日 · Kunming Exit

适合从**昆明飞走**、偏探险节奏。入境南宁，入关芒街，出关河口，昆明送机。

| Day | 住宿 | 行程 |
|---|---|---|
| 1 | 南宁 | 抵达南宁 |
| 2 | 崇左 | 德天瀑布、名仕田园 |
| 3 | 吉婆岛 | 芒街过关，轮渡吉婆岛 |
| 4 | 河内 | 吉婆岛缆车至海防（等候赠越南咖啡）；欧洲小镇、大教堂、火车街、三十六鼓街（含三轮车）；晚上观光巴士夜游西湖 |
| 5 | 河内 | 胡志明纪念堂、巴亭广场、莲花自助餐；自由活动或河内菜市场 |
| 6 | 沙坝 | 河内赴沙坝；梯田、猫猫村 |
| 7 | 米轨过夜 | 番西邦（缆车 + 芒花小火车）；晚上米轨发车，住车上 |
| 8 | 建水 | 出境赴河口，河口入境；河口—建水约 3 小时 |
| 9 | 普者黑景区内 | 建水古城、小火车（双龙桥、香会桥、团山民居）；下午赴丘北普者黑约 4 小时 |
| 10 | 弥勒 | 柳叶舟游湖；午餐后赴弥勒约 3 小时；东风韵；晚上温泉 |
| 11 | 昆明 | 弥勒—昆明约 2 小时；翠湖公园、昆明老街 |
| 12 | 送机 | 昆明送机；若下午/晚上航班可加斗南花市 |

### 5.2 路线二 · 10 日 · Nanning Loop

适合**南宁进出**、家庭与「全部人群」。不去云南。德天放在回国后。

| Day | 住宿 | 行程 |
|---|---|---|
| 1 | 南宁 | 抵达南宁 |
| 2 | 吉婆岛 | 同路线一 Day 3（芒街 + 轮渡） |
| 3 | 河内 | 同路线一 Day 4 |
| 4 | 河内 | 同路线一 Day 5 |
| 5 | 沙坝 | 同路线一 Day 6 |
| 6 | 米轨过夜 | 同路线一 Day 7 |
| 7 | 观堂 | 沙坝—河内—谅山；同登庙会；友谊关出境；龙州，住观堂 |
| 8 | 观堂 | 天琴壮寨、骑行蔗海、自由散步 |
| 9 | 南宁 | 德天瀑布、名仕田园，住南宁 |
| 10 | 结束 | 返南宁，行程结束 |

### 5.3 住宿标记（必须在时间轴卡片上可见）

- 普通酒店城市
- 米轨过夜
- 普者黑**景区内**住宿
- 观堂连住两晚

车程（2h / 3h / 4h）写在对应日展开行。

### 5.4 主题标签（性格过滤）

每日 `themes[]`。点主题卡时，不含该标签的日子降低存在感，仍可点开。

| 主题 | 路线一（大致） | 路线二额外 |
|---|---|---|
| Wild Fun | D2 德天、D3 吉婆、D7 番西邦、D9–10 普者黑舟 | D8 蔗海骑行、D9 德天 |
| Great Flavors | D4 咖啡、D5 莲花餐/菜市、D10 弥勒 | 同越南段 |
| Green Villages | D6 猫猫村、D9 团山/建水 | D8 天琴壮寨 |
| Friendly Locals | 全程地陪 | 观堂两晚 |

抵达/送机日可以不打标签，过滤时最淡。

### 5.5 精品卡物流字段（必须印在 `#tours` 卡上）

卡片结构见 §6.2。字段与路线绑定，禁止只写口号不写出入口。

| | 路线一 | 路线二 |
|---|---|---|
| 天数 | 12 日 | 10 日 |
| 入境 | 南宁 | 南宁 |
| 出境 | 昆明 | 南宁 |
| 适合 | 探险 | 家庭 · 全部 |
| 封面 | `public/tours/r1-kunming-exit.jpg` | `public/tours/r2-nanning-loop.jpg` |

适合人群枚举（可多选、卡上写成一行）：`全部` / `家庭` / `探险`。v1 固定如上，不开放客人自填。

---

## 6. 功能需求

### 6.1 Hero 轮播

- 满幅照片轮播（`src/data/heroPanels.ts`），约 5.5s 自动切；底部分段指示器可点。
- 每张：主题芯片（点芯片滚到 `#experience` 并打开该主题）、标题、导语、双 CTA。
- CTA A 实心酒红 → `#tours`（文案：备受赞誉的深度人文精品路线）
- CTA B 幽灵按钮，带 sparkles → `#plan` 且 intent=custom（文案：自己设计游玩主题和线路）
- 区域地图不出现在首屏；`regionMap.ts` 仅给行程内 `RoutePlayer` 用。
- 顶栏 Logo 仍为 **KARST ROUTE**；页脚品牌为 **南境拾遗**。

### 6.2 精品路线卡

组件 `BoutiqueTours`，锚点 `#tours`。桌面两列，手机上下叠。整卡可点（`aria-pressed`），选中描边，滚到 `#itinerary`。卡下另有「咨询这条路线」→ `#plan` 且 intent=boutique。

每张卡：

1. 顶图 16:10 电影感封面（无图则 `bone` 等高占位，禁止塌高）
2. 路线徽章 + 中英路线名（`copy.tours.r1Name` / `r2Name`）+ 副题 + 途经区域
3. 一段特色说明（`r1Feature` / `r2Feature`）
4. 四行 meta，图标 + 值（label 对读屏可见）：
   - 时钟 → 天数
   - 起飞 → 入境城市
   - 降落 → 出境城市
   - 人群 → 适合场景

### 6.3 体验主题（`#experience`）

组件 `Experience`。四张主题卡，文案来自 `src/data/themes.ts`（Wild Fun / Great Flavors / Green Villages / Friendly Locals）。点选过滤 `#itinerary` 时间轴（未匹配日 opacity 0.35）；再点取消过滤。点卡打开故事抽屉（`src/data/experiences.ts` 封面、亮点、真实故事）。

Hero 轮播芯片与此四主题同一套 `ThemeId`。性格轨 `ThemeRail` / 素材槽 `ThemeMaterials` **不再出现在首页**。

### 6.4 时间轴（`#itinerary`）

- 12 日 / 10 日分段器；受当前 `theme` 过滤。
- 默认折叠，互斥展开；≤ 3 bullet；住宿与车程随语言。
- 每日带 `themes[]` 与可选 `placeId`（展开时用 `places` / `placeStories` 补图与导读）。
- 展开日：照片、导读、交通 / 住宿 / 餐饮行。
- 区块内：旅客评论折叠、`RoutePlayer` 路线动画（SVG 来自 `regionMap.ts`）。
- 375px 无横滚。建水仅路线一；德天在路线一 Day 2、路线二 Day 9。

### 6.5 询盘：路径 A 精品表单 / 路径 B AI 定制

**路径 A**（精品卡「咨询报价」）：Web3Forms 固定表单。文案随语言。

| 字段 | 规则 |
|---|---|
| Full name | 必填，2–80 字符 |
| WhatsApp 或 Email | 至少填一项；填了 Email 则校验格式 |
| Travelers | 1–12+ |
| Preferred dates | 必填；允许文本 “flexible” |
| I want | 精品 12 日昆明出境 / 精品 10 日南宁闭环 |
| Notes | 选填，≤1000 |
| honeypot `_gotcha` | 隐藏，有值则静默丢弃 |

**路径 B**（Hero 幽灵钮 / Header Plan / 底栏 Plan）：`CustomPlanFlow`，**不是**同一张固定表。

1. 基础信息：出发日或「日期灵活」+ 天数滑杆 + 人数滑杆  
2. 旅行节奏：单选 特种兵 / 慢游  
3. 核心偏好：文化 / 自然 / 美食 / 摄影，多选 + 拖拽排序  
4. 预算：人均 USD 滑杆  
5. 魔法等待：骨架屏 +「正在为您匹配 Wanderful 专属当地向导资源…」  
6. 英文路书草稿（headline / pitch / 逐日 ≤3 beat）+ 留资把草稿发给规划师  

前端把 brief JSON `POST /api/craft`。服务端封装系统提示词，调用 OpenAI 兼容接口；Key 仅服务端（`OPENAI_API_KEY`，禁止 `VITE_`）。无 Key 或模型失败时，用目录内真实停站做 fallback 草稿，等待态仍完整播放。隐性数据（刚浏览的精品线、性格主题）随 JSON 提交，只作提示。

成功留资：焦点陷阱弹窗。失败：不清空。邮件主题：`New Karst Route AI draft — {routeHint}`。

环境变量：`VITE_WEB3FORMS_ACCESS_KEY`（仅此 Key 允许 `VITE_`）。`OPENAI_API_KEY` / `OPENAI_BASE_URL` / `CRAFT_MODEL` 仅服务端。

### 6.6 官方中英切换

| 项 | 规则 |
|---|---|
| 路径 | `/` = `en`（`x-default`）；`/zh/` = `zh-Hans` |
| 文案 | `src/i18n/copy.ts` 全站 UI；行程 / 主题用 `{en,zh}`。禁止运行时整页机翻当正式稿 |
| 切换 | Header `EN \| 中文`；`history.pushState` 到对应路径 + **当前 hash** |
| 文档头 | `html lang`、`document.title`、`link rel=canonical`、`link rel=alternate` 互指已发布语言 |
| 回退 | Vite 与 GitHub Pages 把 `/zh/` 落到同一 `index.html` |
| 结构 | 同一套 `id`（`#tours` `#itinerary` `#experience` `#explore` `#plan` `#faq` 等），只换字符串 |

未发布语言不要出现在 hreflang。AI 只可当文案草稿，上线前必须人工过目地名、主题句、CTA。

### 6.7 探索、问答、工具箱

**`#explore`（Explore / 探索）**  
目的地影像 + 文艺推荐。数据：`src/data/videos.ts`（含 YouTube id）、`src/data/literature.ts`。首页各预览 3 条；「查看全部」右侧抽屉。视频弹 YouTube；封面用站内图。

**`#faq`（Q&A / 问答）**  
组件 `Faq`。标题：出行前，您可能想知道。条目 id 保留 `#tool-visa` / `#tool-season` / `#tool-transit` 等，以便顶栏下拉与旧链接。文案在 `src/data/faqs.ts`。

**旅行工具箱**  
不是首页栏目。Header 汉堡打开 `ToolsDrawer`：汇率、区域地图外链、天气、饮食提示。

### 6.8 合作商家（`#partners`）

实地考察过的当地商家列表；可链地图或官网。cta 欢迎沿线商家联系。

---

## 7. 后续（不做 v1 主路径）

以下组件或接口可以留在仓库，但**不作为首页主键、不作为发布门禁**：

- 手工艺人橱窗、真实天气 API、火车外链抽屉
- `POST /api/translate`（仅草稿；不得生成可收录语言 URL）
- 其它语言路径 `/vi/` `/fr/` `/ja/` `/ko/`

---

## 8. 性能与骨架（NFR）

海外托管时，白屏会被当成打不开。骨架必须出现在 **JS 之前**。

| 层 | 时机 | 表现 |
|---|---|---|
| 0 | `index.html` 内联 CSS | Header、Hero 色块、3 张行程骨牌、底栏。不依赖 Tailwind。可按路径预写 `lang` / title |
| 1 | 主 JS | 真文案、轮播、打包行程数据，零行程 API |
| 2 | 滚动到 FAQ / 打开工具箱 | 不阻塞主路径 |

封面图不得挡住标题与 CTA。系统字体优先。主包不含未上线的天气/翻译代码。

验收：DevTools Slow 3G，先看到骨架版面，再灌入真内容。

---

## 9. 其它非功能

- 点按 ≥44px；`viewport-fit=cover` + `safe-area-inset-bottom`
- 表单有可见 `label`；弹窗 `role="dialog"`，Esc 关闭
- 路线动画图 `role="img"` + 短 `aria-label`；精品卡 `aria-pressed`
- 无障碍：骨架用装饰性动画，不向读屏循环播报
- 密钥：AI Key 仅服务端；`.env.example` 只列变量名
- 「名仕田园」对外英文暂用 Mingshi Pastoral，上线前与地接确认

---

## 10. 技术与仓库

```
src/i18n/                  copy.ts, LocaleProvider.tsx
src/components/layout/     Header, Footer, MobileDock, ToolsDrawer
src/components/hero/       Hero
src/components/tours/      BoutiqueTours
src/components/itinerary/  Timeline, ReviewsFold, RoutePlayer
src/components/experience/ Experience
src/components/explore/    Explore
src/components/plan/       PlanSection, CustomPlanFlow, PlanSteps, PlanMagic, PlanResult
src/components/form/       QuoteForm（路径 A 精品）
src/components/faq/        Faq
src/components/partners/   Partners
src/lib/                   craft.ts, craftClient.ts, asset.ts
src/data/                  itinerary, themes, experiences, videos, literature,
                           faqs, partners, destinations, regionMap, heroPanels, reviews
server/runCraft.ts         系统提示词 + 模型调用
api/craft.ts               serverless 入口（Pages 上不部署）
public/tours/              r1 / r2 封面
public/destinations/       行程与封面图
index.html                 含 #root 内联骨架
.github/workflows/pages.yml  GitHub Pages
```

部署：GitHub `main` → Actions 发布 Pages，站点根为 `/karst-route/`。Secrets：`VITE_WEB3FORMS_ACCESS_KEY`。`OPENAI_API_KEY` 仅在有 `/api/craft` 的环境生效；Pages 静态站路径 B 用 `craftClient` 本地兜底。

---

## 11. 交付阶段

| 阶段 | 交付 | 验收 |
|---|---|---|
| 已完成骨架 | Vite + Tailwind + HTML 骨架 | Slow 3G 可见骨架 |
| 已完成主路径 | 轮播 Hero、精品卡、时间轴、体验、探索、双轨询盘、FAQ、合作商家 | 见 §13 |
| 已完成语言 | 中英 1:1 + `/zh/` + hreflang | EN/中文互切，hash 保留 |
| 待运营 | Web3Forms Key、真图与 YouTube 片源、正式域名写入 canonical | 测试邮件可达 |

---

## 12. 假设与待运营提供

- Web3Forms 收件邮箱、Access Key
- 品牌正式英文名已定为 The Southern Curations；顶栏工作名仍为 KARST ROUTE
- 探索区 YouTube 片源与文艺条目（v1 可用站内封面）
- 建水小火车、12go 等最终跳转 URL（工具后续）
- 手工艺人真实联系方式（后续橱窗）

---

## 13. 验收清单（发布前门禁）

- [ ] 375 / 768 / 1280 无横向溢出
- [ ] Slow 3G 先骨架后内容
- [ ] Hero 满幅轮播可读、主题芯片可点；双 CTA 分别去 `#tours` 与 `#plan`
- [ ] 精品卡可见路线名、天数、入境、出境、适合人群；点卡滚到对应时间轴
- [ ] 路线一切换路线二，越南段内容一致、德天日期不同
- [ ] `/` 为英文，`/zh/` 为中文；切语言保留 `#tours` 等 hash
- [ ] `<html lang>` 为 `en` 或 `zh-Hans`；canonical 指向本语言；hreflang 含 `en`、`zh-Hans`、`x-default`，不含未上线语言
- [ ] 路径 B：幽灵钮进入四步问卷（非固定表），有 AI 标志；生成有骨架等待；出英文草稿
- [ ] `#explore` 影像 / 文艺可读；`#faq` 可展开；顶栏问答下拉能滚到对应条目
- [ ] `#partners` 可见当地商家
- [ ] 底栏只有 Tours | Plan，没有 Tools / Lang 主键
- [ ] 无 Google 整页翻译入口充当语言站
