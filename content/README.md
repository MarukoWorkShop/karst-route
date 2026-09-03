# 内容编辑指南（不需要写代码）

网站上的文字、价格、行程、评价，都放在这个 `content` 文件夹里。
**改原文 → 对技术说「部署」→ 补齐其它语言后推到 `main` → 大约 1 分钟后网站更新。**
不要改 `src` 里的程序代码。

**只改原文即可。** 每份文件顶部有 `src: zh` 或 `src: en`，标明你写的是哪种语言。其它语言上线前会补齐，不必自己翻译。

---

## 首页从上到下：改哪一块，打开哪个文件

```
页面位置                         改这个文件
─────────────────────────────────────────────────────────
① 最上方大图 / 视频轮播           content/hero.yaml
② 三条路线「卡片」（名字、价格、封面）
                                 content/routes/r1.yaml
                                 content/routes/r2.yaml
                                 content/routes/r3.yaml
③ 卡片下面的「逐日行程」时间轴     content/itineraries/r1.yaml
                                 content/itineraries/r2.yaml
                                 content/itineraries/r3.yaml
④ 客人评价                       content/reviews/某人.yaml
⑤ 关于我们                       content/about.yaml
⑥ 常见问题 FAQ                   content/faqs.yaml
⑦ 合作商家                       content/partners.yaml
```

```
content/
├── README.md                 ← 本指南（先看这里）
├── langs.yaml                ← 网站开放的语言（以后加语种改这里）
├── about.yaml                ← ⑤ 关于我们
├── faqs.yaml                 ← ⑥ 常见问题
├── partners.yaml             ← ⑦ 合作商家
├── hero.yaml                 ← ① 首页轮播
├── routes/                   ← ② 路线卡片（不是每天行程）
│   ├── README.md
│   ├── r1.yaml               ← 路线一 · 三境溯游
│   ├── r2.yaml               ← 路线二 · 南疆回环
│   └── r3.yaml               ← 路线三 · 崇左栖山 · 涠洲枕海
├── itineraries/              ← ③ 逐日行程（第几天去哪）
│   ├── README.md
│   ├── r1.yaml
│   ├── r2.yaml
│   └── r3.yaml
└── reviews/                  ← ④ 用户评价（一人一个文件）
    ├── README.md
    ├── lin.yaml
    ├── michelle.yaml
    └── …
```

把现有内容导入 Notion：用 [`content/notion-import/`](./notion-import/README.md) 里的 CSV（`npm run content:csv` 可重新生成）。

**卡片和日程是分开的：** 改价格、卖点、封面 → `routes/`；改第 3 天去哪、住哪 → `itineraries/`。两处都要改时请打开两个文件。

---

## 怎么改（电脑浏览器最稳）

1. 打开 <https://github.com/MarukoWorkShop/karst-route>
2. 点进 `content`，再点上表对应的文件夹 / 文件
3. 点右上角铅笔 ✏️（Edit this file）
4. 只改 `src` 标明的那种语言（中文或英文），其它语言行可以不动或删掉
5. 更稳妥：改完后对技术说「部署」，会补齐其它语言再推上线
6. 若你自己点了绿色 **Commit changes** 到 `main`：缺的语言会暂时显示原文；再说一声「补齐语言」即可

线上中文：https://marukoworkshop.github.io/karst-route/zh/  
线上英文：https://marukoworkshop.github.io/karst-route/

---

## 语言：只改原文

每份 yaml 顶部类似：

```yaml
src: zh   # 原文语言。只改这种语言；其它语言上线前补齐
```

| 你想做的事 | 怎么做 |
|---|---|
| 用中文改文案 | 确认 `src: zh`，只改 `zh:` 那一行。`en:` 可以删掉或留着不管 |
| 用英文改文案 | 把该文件（或该字段）的 `src` 改成 `en`，只改 `en:` |
| 这条评价客人原话是英文 | 在 `short` / `full` 下写 `src: en`，只填 `en:` |
| 以后要上越南语、日语 | 在 `langs.yaml` 的 `served` 里加 `vi` / `ja`，然后说「补齐语言」 |

示例（只写了中文，完全可以）：

```yaml
src: zh

name:
  zh: "三境溯游"
```

上线后会变成：

```yaml
src: zh

name:
  zh: "三境溯游"
  en: "The Three Realms Traverse"
```

`zh:` 始终是原文，后期改中文只动 `zh:`；发现英译不顺再改 `en:`。

某条字段原文和文件默认不同时，在该字段上覆盖：

```yaml
short:
  src: en
  en: "The border crossing was seamless."
```

---

## 填写规则（必看）

1. **只保证原文有内容** — `src` 指出的那种语言必填；其它语言不必手填。
2. **冒号后面空一格** — ✅ `name: "三境溯游"` ❌ `name:"三境溯游"`
3. **缩进只用空格，不用 Tab** — 对齐现有行最稳。
4. **图片只写相对路径** — ✅ `destinations/nanning.jpg` ❌ 不要写完整网址，也不要写成 `/destinations/...`
5. **引号里的中文引号** — 句子里如果要写「」或 “”，保持和现有文件一样即可。

照片文件本身放在 `public/` 下：

| 路径写法 | 实际文件夹 |
|---|---|
| `destinations/xxx.jpg` | `public/destinations/` |
| `tours/xxx.jpg` | `public/tours/` |

新图先请技术把 jpg 放进对应文件夹，再把文件名写进 yaml。

---

## ① `hero.yaml` — 首页轮播

每一屏是 `slides:` 里的一项。

| 字段 | 含义 | 只能填什么 |
|---|---|---|
| `id` | 内部编号，不要随便改 | 现有值 |
| `video` | 视频文件名 | `videos/1.mp4` 这种 |
| `poster` | 视频没播出来时的静图 | `destinations/xxx.jpg` |
| `pos` | 静图裁切位置 | 例如 `center 42%` |
| `themeId` | 点这屏对应哪张体验卡 | `wild` / `flavors` / `villages` / `locals` |
| `alt` / `title` / `intro` | 无障碍说明、标题、简介 | 只改 `src` 那种语言即可 |

测试期若首页没有视频，多半是流量开关，不是 yaml 写错。

---

## ② `routes/r1.yaml`（r2、r3 同理）— 路线卡片

| 字段 | 页面上是什么 |
|---|---|
| `cover` | 卡片大图 |
| `badge` | 左上角「路线一」 |
| `name` | 路线中英文名称 |
| `tagline` | 名称下面一行短句 |
| `regions` | 途经地名（用 ` · ` 分隔） |
| `feature` | 卡片正文卖点 |
| `days` | 「14 日」这类时长 |
| `entry` / `exit` | 入境城 / 出境城 |
| `audience` | 适合谁 |
| `price` | 价格文案（中英可以不同体例） |
| `included` | 费用包含，**只填英文 id** |
| `excluded` | 费用不含，**只填英文 id** |

费用 id（不要写中文）：

- 包含可用：`transport` `lodging` `tickets` `meals` `guide` `visaAssist` `insurance`
- 不含可用：`intlFlights` `visaFee` `personal` `optional` `tips`

---

## ③ `itineraries/r1.yaml` — 逐日行程

`days:` 下面每一项是一天。天数顺序按列表从上到下。

| 字段 | 页面上是什么 | 注意 |
|---|---|---|
| `day` | 第几天（数字） | 1、2、3… |
| `city` | 城市名 | 只改 `src` 那种语言即可 |
| `stay` | 时间轴上的小标题 | 例如「邕江边，第一夜」 |
| `stayKind` | 住宿类型 | 只能 `hotel` / `train` / `park` / `base` |
| `placeId` | 地图上的站 | 见下表，写错会沿用旧值 |
| `drive` | 当天车程说明（可选） | |
| `blurb` | 展开后的较长介绍（可选） | |
| `photos` | 当天照片 | `destinations/xxx.jpg` |
| `transport` | 交通 | |
| `lodging` | 住宿 | |
| `dining` | 餐饮（可多条） | 每条只填原文语言即可 |
| `bullets` | 当天活动要点 | 建议不超过 3 条 |
| `themes` | 体验主题标签 | 只能 `wild` / `flavors` / `villages` / `locals` |

`placeId` 只能是：

`nanning` `chongzuo` `halong` `catba` `hanoi` `sapa` `train` `jianshui` `puzhehei` `mile` `kunming` `guantang`

新增一座还没出现过的城市，需要技术人员先加地图点，不能只改 yaml。

---

## ④ `reviews/` — 评价（一人一个文件）

| 字段 | 含义 |
|---|---|
| `flag` | 国旗 emoji，如 `🇨🇳` |
| `name` | 客人姓名 |
| `country` | 城市或国家 |
| `route` | 只能 `r1` / `r2` / `r3` |
| `rating` | 1–5 的数字 |
| `date` | 例如 `2024-11` |
| `short` | 列表里的一句话 |
| `full` | 点开后的全文 |
| `photos` | 客人照片路径列表 |

**新增评价：** 复制任意一份现有 yaml → 文件名改成英文小写（如 `anna.yaml`，不要空格）→ 改字段 → 提交。页面会按文件自动出现。

**删评价：** 删掉对应 yaml 并提交。

---

## ⑤ `about.yaml` — 关于我们

| 字段 | 页面上是什么 |
|---|---|
| `kicker` | 小标题「关于我们」 |
| `name` | 公司名 |
| `role` | 公司名下面一行 |
| `body1` / `body2Lead` / `body2` | 两段介绍 |
| `points` | 下面三句摘要 |
| `credsTitle` / `credsSub` | 「资质与保障」标题和说明 |
| `creds` | 资质条目：`icon` + 原文（部署时补其它语言） |

---

## ⑥ `faqs.yaml` — 常见问题

按 `groups`（分类）→ `items`（具体问答）。

| 字段 | 含义 |
|---|---|
| 分组 `id` / `label` | 分类内部名 / 显示名 |
| 问答 `id` | 页面锚点，如 `faq-cards`。**不要随便改**，顶栏工具会用到 |
| `q` / `a` | 问题 / 回答 |

新增一条：在合适的 `items:` 下复制一整块现有问答，换一个新的 `id`（不要和旧的重复）。

---

## ⑦ `partners.yaml` — 合作商家

`list:` 里每一家是一项。

| 字段 | 含义 |
|---|---|
| `name` / `category` / `location` / `desc` | 名称、类型、地点、介绍 |
| `emoji` | 卡片图标 |
| `color` | 色条，如 `#8F8458` |
| `links` | 地图或官网 |
| `links[].type` | 只能 `google` 或 `web` |
| `links[].url` | 完整 https 链接 |

新增商家：复制最后一家整块，改名字和链接。删商家：删掉那一整块（注意缩进）。

---

## 改错了怎么办

**网站不会因写错而白屏。** 某个字段填坏了，会自动用程序里的旧内容顶上。

整份文件格式坏了（缩进错乱），这一份会被跳过，其它栏目不受影响。

撤销：打开该文件 → History → 找到上一版 → Revert。

---

## 暂时不能只靠这个文件夹完成的事

| 需求 | 说明 |
|---|---|
| 新增第四条路线 | 需要技术人员加模板（`r4`） |
| 换一张还没上传的图 | 把 jpg 放到 `public/destinations/` 或 `public/tours/`，路径写进 yaml |
| 改按钮、导航等界面词 | 仍在程序里，找技术人员 |
| 文艺推荐 / 探索影像 | 仍在程序里，找技术人员 |
| FAQ 顶栏用的 `tool-visa` 等 id | 不要改这些 id |

---

## 常见问题

**Q：改完多久能看见？**  
A：提交到 `main` 后约 1 分钟。超过 3 分钟请强制刷新。

**Q：线路卡片和每天行程是不是同一个文件？**  
A：不是。卡片（卖点、价格、封面）在 `routes/`；第几天去哪在 `itineraries/`。

**Q：我可以在手机上改吗？**  
A：可以，但屏幕小容易看错缩进，建议用电脑。
