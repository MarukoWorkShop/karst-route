# DESIGN.md：Karst Route 视觉与交互规范

配套：[PRD.md](./PRD.md)。功能以 PRD 为准；样子与节奏以本文为准。

参考画册：Cathay Odyssey ThemeTrip 2025、国内电子行程单。  
**抽审美，不搬版式。** 画册是印刷长卷，高密度跨页会让手机用户头痛，也不符合年轻人的滑动节奏。

v1 可用占位图，但间距、热区、骨架几何按真稿执行。

---

## 0. 从参考里抽什么、丢掉什么

### 抽（抽象审美）

| 要素 | 落到网页 |
|---|---|
| 满幅电影感照片、雾、夜、灯笼 | 仅 Hero / 手工艺大图；一张图一个焦点 |
| 浅米白页底 | 页面底 Paper；工具箱一段极浅 Sage，和行程区切开 |
| 森林墨绿 | 墨绿 = 正文 / CTA / DAY / 选中；短线用沉静苔金，页底必须浅米白 |
| `Day 01` + 短标题 | 折叠行一眼看完，不写杂志散文 |
| 后勤信息可核验 | 展开后一行：城市 · 住宿 · 车程（行程单字段，不是表格皮） |
| 全大写细标签 | `12-DAY` / `ROUTE` 这种 meta，不是正文 |

### 丢掉（不适合手机网页）

- 三栏正文、Editor’s Note、整页痛点长文
- 一张屏塞 5 个主题 + 5 段说明
- 仅供阅读、没有可点可滑的「画册 PDF 上网」
- 电子行程单满版黑框表
- Cathay 的 Logo /「寻迹中国」字标（只学气质）

### 网页自己要强的

互动优先于阅读：滑路线、点开一天、打开体验故事、底栏两键、工具抽屉、语言切路径。  
内容密度：**折叠时一行，展开最多 3 条 bullet。** 多出来的细节进 FAQ 或备注，不写进卡片。

---

## 1. 设计原则

1. **有主体，不四平八稳。** 不是大社「安全、合规、舒适」四宫格。先让人记住四句玩法性格，后勤保障缩小成一条，不和性格抢位置。
2. **手机原生，不是缩小的画册。** 默认 375px。一屏一件事。桌面只加宽，不恢复杂志网格。
3. **快节奏。** 先扫再点。默认日程全折叠；同时只开一天。
4. **拇指完成。** 底栏 Tours | Plan。禁止仅 hover。工具箱在 Header 汉堡。
5. **Quote 唯一实心森林墨绿。** 四主题靠大字和照片出性格，不用四色彩虹按钮。
6. **慢网也像开着。** HTML 骨架先出。
7. **动效服务手势。** 跟手、短、可打断。

---

## 2. 主体性：四句性格（全站最醒目的非 CTA 模块）

不要传统大社那种「签证无忧 / 品质保证 / 专车接送 / 24h 客服」均权排列。性格只有这四句，落在 `#experience` 四卡 + Hero 芯片（**不是**独立性格轨）。**中英一起印在卡上**：

| ID | English（大） | 中文（态度） | 照片气质 | 点下去 |
|---|---|---|---|---|
| `wild` | Wild Fun | 纵情山野・玩法够野 | 德天、吉婆海、番西邦、普者黑舟、蔗海骑行 | 时间轴只高亮带 `wild` 的日子 |
| `flavors` | Great Flavors | 地道风味・美食够味 | 越南咖啡、莲花餐、夜市、弥勒 | 高亮 `flavors` |
| `villages` | Green Villages | 村落生态・传统非遗 | 猫猫村、天琴壮寨、团山、建水 | 高亮 `villages` |
| `locals` | Friendly Locals | 够朋友・当地人 | 地陪、手作人、同桌 | 滚到手工艺；高亮 `locals` |

**视觉（主体要突出）**

- 手机：横滑 snap，**主卡约 82vw × 72vw**，一次只露 1.1 张。不要 2×2 小图标。
- 当前语言几乎撑满卡宽，字号约 40–48，字重 500，左下；另一语言一行 15px 叠在下面。
- 图满铺 + `night` 35% 遮罩。四张图性格要能分清，不要四张都是雾山。
- 选中：底边强调 + 时间轴过滤（未匹配日 0.35）。
- 再点同一张 = 取消日程过滤。
- 桌面：四卡横排。

### 2.2 性格对应素材（已下线）

首页不再用 `ThemeMaterials` 三槽。主题照片与故事在 `#experience`（`Experience` + `experiences.ts`）。

### 2.3 Hero 语气

跟上四句的野，不要写成产品手册。轮播标题与导语写在 `heroPanels.ts`，CTA 用长句（精品路线 / 自己设计线路）。

Logo v1：顶栏 `KARST ROUTE`；页脚 `南境拾遗`。

**文案硬限制**

- 主题卡：英文 1–3 词；中文一条，中间用 `・`
- 折叠日：城市 + 住宿一词
- 展开：≤ 3 bullet，每条 ≤ 12 词
- 后勤保障降级为一行小字，不是四宫格：`Border · Car · WhatsApp`

---

## 3. 色板（森林墨绿 × 浅米白）

整页是**浅米白底 + 森林墨绿字**。CTA、DAY、选中态与区块名同用墨绿，不要再上有闲酒红。禁止组件内魔法色。

Tailwind `@theme` / CSS 变量。

| Token | Hex | 用法 |
|---|---|---|
| `--color-ink` | `#1E3329` | 正文（森林墨） |
| `--color-ink-soft` | `#5E7368` | meta |
| `--color-paper` | `#FAF8F2` | **浅米白页底** |
| `--color-surface` | `#FDFBF6` | 卡片、输入、底栏 |
| `--color-sage` | `#E7EBE6` | 工具箱极浅洗底 |
| `--color-night` | `#16241E` | 仅性格卡图上遮罩、弹层遮罩、页脚；不上大面积页底 |
| `--color-cta` | `#2F5344` | 森林绿：Quote、DAY 序号、选中轨、区块名 |
| `--color-cta-press` | `#1E3329` | :active / :hover |
| `--color-teal` | `#2F5344` | 与 CTA 同色，兼容旧类名 |
| `--color-gold` | `#A88C56` | 苔金短线，少用 |
| `--color-gold-line` | `#8F8458` | 苔金描边 |
| `--color-line` | `#D9D6CC` | 分割、输入边 |
| `--color-bone` | `#E8E5DC` | 骨架、空素材槽 |
| `--color-bone-2` | `#F0EDE5` | 骨架高光 |
| `--color-ok` | `#3D6B52` | 成功 |
| `--color-danger` | `#B42318` | 校验错 |

Hero：浅米白底、墨绿字、PingFang H1；主钮森林绿。性格卡仍可用深色照片，但卡四周必须是浅米白。  
墨绿只用于 CTA、DAY、选中与区块名，不要四色彩虹。

---

## 4. 字体

全站 **PingFang**（系统栈，不加载 webfont）。无 Georgia / 衬线例外。

```css
--font-sans: "PingFang SC", "PingFang TC", "Hiragino Sans GB", "Heiti SC",
  "Noto Sans SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif;
```

字重整体偏轻：正文 400，标题与按钮 **500**，不要 700。行距略松：正文约 1.65–1.7。

| 角色 | 手机 | 规则 |
|---|---|---|
| Hero H1 | 34/44 · 500 | ≤ 2 行 |
| 主题英文 | 40/52 · 500 | 卡内最大字，允许破行 |
| 主题中文 | 14/22 · 400 | 口号，不是段落 |
| 区块名 | 13/20 · 500 · 字距 0.12em · 全大写 | `ITINERARY` |
| Day 序号 | 15/22 · 500 | `01` |
| 折叠城市 | 16/26 · 500 | |
| Bullet | 15/26 | |
| Meta | 12/20 | 后勤条 |
| 按钮 | 16/26 · 500 | 高 48 |

---

## 5. 间距与节奏

- 4px 基准。左右 16 / `md` 24。
- 内容宽：时间轴与表单 640；Hero 全宽。
- **区块空隙要大、区块内部要紧：** 段与段 40–48，卡片内 12。年轻人靠「块与块之间能喘气」，不是靠块内写满。
- 圆角收敛：卡与输入 **8px**（`rounded-lg`）；主按钮 8px；芯片仍 `full`。不要 16–20 的大圆角卡片。
- 底栏 56 + `safe-area`。主区 `padding-bottom: calc(72px + safe-area)`。

| 断点 | |
|---|---|
| 默认 | 单列，底栏在 |
| `md` 768 | 藏底栏；主题卡横排且 Wild 更宽；Header 出锚点 |
| `lg` 1024 | 仍单列时间轴（不要桌面三栏杂志）；工具 5 图标一行 |

桌面也不恢复画册网格。宽了只是边距变大、Hero 图更宽。

---

## 6. 手机信息流（低密度）

```
Header：一级 Boutique Tours / 精品路线 · Plan Your Route / 行程定制；二级 Explore / 探索 ▾ · Q&A / 问答 ▾
  手机：KARST ROUTE + 汉堡工具箱 + 地球仪切语言
Hero：满幅轮播；主题芯片 → #experience；实心 → #tours；幽灵 Plan（AI）→ #plan
#tours：两张精品卡
#itinerary：折叠行程 + 评论 + 路线动画
#experience：四主题体验卡
#explore：目的地影像 + 文艺推荐
#plan：路径 B 四步问卷 | 路径 A 精品询盘
#faq：出行前问答
#partners：当地合作商家
Footer：南境拾遗 / The Southern Curations
Dock：Tours / 路线 | Plan / 定制
```

**同时只展开一天。** 点另一天则关上当前天（手风琴互斥），避免变成高密度长页。

---

## 7. 互动（比画册多出来的部分）

| 手势 | 行为 |
|---|---|
| 点体验主题卡 | 过滤时间轴；再点取消；可打开故事抽屉 |
| 点精品卡 / 时间轴分段器 | 切 Route 1/2；过滤保留 |
| 点 Day 行 | 互斥展开；再点收起 |
| 顶栏汉堡 | 打开旅行工具箱 |
| 底栏 Tours | 滚到 `#tours` |
| 底栏 Plan | 滚到 `#plan` 并进入 AI 问卷 |
| Header EN \| 中文 | 改 URL 路径，保留 hash |
| Esc / 遮罩 | 关闭抽屉与弹层 |

跟手优先：路线滑、sheet 拖，用 transform，不靠长 CSS 动画演戏。

---

## 8. 组件

### Header

高 56。浅米白底 + 底边 `line`。左 Logo 墨绿，右 **EN | 中文**。桌面锚点墨绿。

### Hero

满幅轮播、白字叠在夜色遮罩上。主题芯片滚到 `#experience`。主钮全宽约 48，森林绿，圆角 8。区域地图不进首屏。

### Experience（四主题，取代首页性格轨）

见 PRD §6.3。`Experience` + `src/data/themes.ts` + `src/data/experiences.ts`。点选过滤时间轴；抽屉讲故事。`ThemeRail` / `ThemeMaterials` 已下线。

### 时间轴（互动路书）

折叠日程 + 展开后勤条（交通 / 住宿 / 餐饮）+ 旅客评论 + 路线动画。圆角 8px，字重 500。

- 分段器高 44。选中森林绿底白字。过滤芯片绿字。
- 折叠行高 56：左 `01` 森林绿，右城市。
- 展开：后勤条；≤ 3 bullet；最多三张图。日数据含 `themes: ('wild'|'flavors'|'villages'|'locals')[]`。
- 同时只开一天；默认全折叠。
- 地点详情抽屉、左右目的地卡已下线；展开日直接出图与导读。

### 工具 sheet

顶圆角 8–12，高 ≤ 80vh。五 Tab 可滑。打开锁背景滚。桌面：Sage 底上一行图标 + 点选面板，仍不要五段同时展开说明。

### FX / 天气 / 火车

大数字、芯片、少字。火车：一行路段 + Open。米轨：chip `Included`，无外链。

### 翻译（入口，不是语言站）

芯片与地球仪只做**已发布语言版之间的跳转**，或未发布语言的「即将推出」。细则见 §12。Loading 只脉冲被替换的那几行。无 Key / 无该语言版：面板说明，不挡询盘。禁止整页自动翻译。

### 手工艺

卡宽 `72vw`，snap，图 **3:4 竖图**（学画册竖片，但一次只露一张多一点）。标题一行，按钮一行。

### 表单 / 路径 B 问卷

路径 A 输入高 48。Submit = Hero CTA。成功小弹窗，一句 + Close。

路径 B：一屏一问。进度 4 段墨绿条。选项卡选中 8px 圆角 + 浅绿洗。偏好可拖排序。预算为滑杆。生成后先骨架五行 Day，主句「正在为您匹配 Wanderful 专属当地向导资源…」。AI 标志为 sparkles + `WANDERFUL AI` 胶囊，不要大机器人插画。

### 底栏

Tours 森林绿圆底；Plan 线性 ink。当前项字用森林绿。

---

## 9. 骨架

`index.html` 内联 CSS，对齐：Header、Hero 色块、**三条 Day 骨行**、Dock。不要骨架出三列杂志。

动画仅 bone 透明度；`prefers-reduced-motion` 则静止。React 灌入时不要先闪白。

| 组件 | 骨 |
|---|---|
| Hero | 满幅色块 + 标题骨 + CTA 骨 |
| Day | 左 28 圆 + 一行 |

---

## 10. 动效时长

| | |
|---|---|
| 手风琴 | 180ms ease-out |
| Sheet | 240ms，可拖停 |
| 路线切 | 120ms fade 或跟手横移 |
| 滚到 quote | smooth；减动效则 instant |
| :active | scale 0.98 / 80ms |

禁止：加载全屏转圈、长交叉淡入。

---

## 11. 图标

内联 SVG，24，`stroke 1.75`。无 emoji 图标、无 icon font。

必备：passport, shield, car, headset, quote, tools, globe, swap, train, external, chevron, close, sparkles, grip。

---

## 12. 多语言对应与 hreflang

不同语言必须是**同一套页面结构的平行版本**，不是机器随手译出来的分身。搜索引擎和用户都要能一对一找到「这一天 / 这一句性格」的对应文案。

### 12.1 清晰对应（1 : 1）

| 约束 | 做法 |
|---|---|
| 结构相同 | 各语言共用同一 IA、同一 `theme` / `day` / 表单字段 `id`，只换字符串 |
| 源数据 | 运营中文与英文工作稿为源；其它语言从同一 key 出，禁止各语言各写一套日程顺序 |
| URL | 路径分区：`/` 英文（`x-default`）、`/zh/`、`/vi/`、`/fr/`、`/ja/`、`/ko/`（上线一种加一种） |
| 页面语言 | `<html lang="en">` 等与当前路径一致，不可停留在 `en` 却展示译稿 |
| 切换 | 地球仪跳到**对应路径的同一锚点**（如 `/fr/#itinerary`），不要只改客户端内存而不改 URL |

性格卡已是中英同卡，不拆成两套模块。日程、素材槽 caption、表单 label、成功文案随语言版整套替换。

### 12.2 hreflang（每个已发布语言页的 `<head>`）

每种已上线语言的 HTML 都要列出**完整互指**，缺一不可：

```html
<link rel="canonical" href="https://www.example.com/fr/" />
<link rel="alternate" hreflang="en" href="https://www.example.com/" />
<link rel="alternate" hreflang="zh-Hans" href="https://www.example.com/zh/" />
<link rel="alternate" hreflang="vi" href="https://www.example.com/vi/" />
<link rel="alternate" hreflang="fr" href="https://www.example.com/fr/" />
<link rel="alternate" hreflang="ja" href="https://www.example.com/ja/" />
<link rel="alternate" hreflang="ko" href="https://www.example.com/ko/" />
<link rel="alternate" hreflang="x-default" href="https://www.example.com/" />
```

- 只用 BCP 47：简体中文 `zh-Hans`（不要只写含糊的 `zh` 若已分简繁）。
- `canonical` 指向**本语言自己的 URL**，不要所有语言都 canonical 到英文。
- 未发布的语言不要出现在 hreflang 里。
- SPA 须在构建或 SSR/预渲染阶段写入这些标签；单靠客户端 `document.title` 不够。
- Sitemap 为每种语言列独立 URL，并带 `xhtml:link` 互指（与 hreflang 一致）。

### 12.3 禁止自动翻译充当语言版

自动翻译（浏览器、Google 网站翻译插件、无审校的 API 出稿当正式页）会把口号、地名、性格句译坏，且无法与 hreflang 一对一。

**禁止**

- Google Translate / 浏览器「翻译此页」作为官方语言入口（可在页脚提示用户关闭自动翻译）
- 把 `/api/translate` 的即时结果生成可收录 URL（`?lang=`、`/t/fr/` 等）
- 同一 URL 随 `Accept-Language` 换全文而不改路径（无法稳定 hreflang）
- 未人工过目的机翻进入 sitemap

**允许**

- 地球仪切换**已审校**的语言路径
- 开发期用 AI **草稿**进文案文件，上线前必须人工改地名、性格口号、CTA
- 未上线语言：芯片灰态 *Coming soon*，不链假 URL

v1 可只发布 `en`（`x-default`）。一旦加第二种语言，必须同时补齐互指 hreflang 与对应文案文件，不允许「英文站 + 整页机翻」凑数。

---

## 13. 无障碍

label；地球仪 `aria-label="Choose language"`；sheet `dialog` + 焦点循环；Tablist 分段器；对比度 4.5:1；骨架 `aria-hidden`。

---

## 14. 状态

| | |
|---|---|
| Slow 3G | 先骨架 |
| 天气失败 | 工具内一行 |
| 无翻译 Key | 面板说明 |
| 表单错 | 字段红 |
| 表单成 | 弹窗 |
| 手工艺无链 | Request intro |

---

## 15. 验收

- [ ] 375 无横向溢出；折叠 12 日可在约 1.5 屏内扫完
- [ ] 同时只开一天
- [ ] 底栏两键 Tours | Plan；工具箱在 Header 汉堡
- [ ] 四主题在 `#experience`；点选可过滤行程
- [ ] 没有大社四宫格 Trust 与主题同级
- [ ] 展开日 ≤ 3 bullet
- [ ] 森林绿只出现在 Quote/Submit、DAY、选中与区块名；页底为浅米白 `#FAF8F2`；卡片圆角 8px；PingFang；标题字重 500；正文行距 ≥ 1.65
- [ ] 桌面没有变回三栏画册
- [ ] 骨架与真布局偏差 ≤ 8px
- [ ] 减动效模式下无脉冲、无平滑滚
- [ ] 抽屉打开不可点穿
- [ ] 每种已发布语言：`<html lang>` 正确；`canonical` 指向自身；`hreflang` 互指齐全且含 `x-default`
- [ ] 语言切换改路径并落到同一模块，不靠自动翻译插件或无 URL 的整页机翻
