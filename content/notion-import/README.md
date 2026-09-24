# 导入 Notion

这些 CSV 从仓库里的 yaml 生成，给有闲运营在 Notion 里建表用。

重新生成：

```bash
npm run content:csv
```

## 导入顺序

1. 在 Notion 建好页面「南境拾遗 · 内容」
2. 按文件名前缀 **01 → 08** 依次导入（先路线，再行程，评价里的 `路线` 才能对上 r1/r2/r3；目的地表可与行程并行）

每个文件：

1. 新页面 → `/table` → **表格 - 整页**
2. 右上角 **⋯** → **导入** → 选对应 CSV
3. 导入后核对：标题列、选择列（`src`、`placeId`、`stayKind`、`route`、`id`）
4. `included` / `excluded` / `themes` 是逗号分隔，导入后把该列改成 **多选**
5. 「逐日行程」里的 **路线** 列（r1/r2/r3）导入后改成 **关联关系**，指向「路线卡片」的 `id`

## 文件对照

| CSV | Notion 表 | 行数大约 |
|---|---|---|
| `01-路线卡片.csv` | 路线卡片 | 3 |
| `02-逐日行程.csv` | 逐日行程 | 约 31 天（含当日 `blurb` 介绍） |
| `03-客人评价.csv` | 客人评价 | 8 |
| `04-FAQ.csv` | FAQ | 按问答条数 |
| `05-合作商家.csv` | 合作商家 | 6 |
| `06-首页轮播.csv` | 首页轮播 | 4 |
| `07-关于我们.csv` | 关于我们（一行） | 1 |
| `07b-关于我们-资质.csv` | 资质条目 | 6 |
| `08-目的地详情.csv` | 目的地详情 | 12（体验/餐饮/住宿） |
| `09-线路路书.csv` | 线路路书 | 3（r1/r2/r3 可下载 PDF） |
| `10-定价参数.csv` | 线路定价参数 | 3（团队固定 / 加成率等；旧车辆档可忽略） |
| `11-成本模块.csv` | ~~成本模块~~ | **已删除，勿导入**；改用产品库 + 按日一行 |
| `12-报价锚点.csv` | 报价锚点 | 9（每线路 2/4/6 人，校准用） |

## 导入之后（必做）

CSV 进来后列多半还是「文本」。按下面改类型，**不要改列名**。

改类型：点列名 → **编辑属性** → 改「类型」。

### 1. 把整页改名

Notion 里现在可能还叫 `01-路线卡片.csv`。点标题，改成：

- 路线卡片
- 逐日行程
- 客人评价
- FAQ
- 合作商家
- 首页轮播
- 关于我们
- 关于我们 · 资质
- 目的地详情
- 线路路书

总页面可叫「南境拾遗 · 内容」或你现在的「网站内容优化」。

### 2. 各表改列类型

**路线卡片**

| 列 | 改成 |
|---|---|
| `src` | 选择（选项：`zh`、`en`） |
| `included` | 多选（逗号会拆开；选项保持英文 id） |
| `excluded` | 多选 |

**逐日行程**

| 列 | 改成 |
|---|---|
| `路线` | **关联关系** → 选「路线卡片」（用 `id` 对上 r1/r2/r3） |
| `day` | 数字 |
| `src` | 选择：`zh` / `en` |
| `stayKind` | 选择：`hotel` `train` `park` `base` |
| `placeId` | 选择：`nanning` `chongzuo` `halong` `catba` `hanoi` `sapa` `train` `jianshui` `puzhehei` `mile` `kunming` `guantang` |
| `themes` | 多选：`wild` `flavors` `villages` `locals` |
| `blurb_zh` / `blurb_en` | 文本（当日介绍段；长文可保留换行） |

关联若对不上：确认「路线卡片」标题列的值就是 `r1` `r2` `r3`，再在行程表把「路线」从文本改成关联，逐行点选一次。

**若「逐日行程」表已存在**：不必整表重导。在表里新增列 `blurb_zh`、`blurb_en`，再从 `02-逐日行程.csv` 手工粘贴，或技术侧把新 CSV 内容合并进现有行。

**目的地详情**（新建表；覆盖每日详情里的「体验 / 餐饮 / 住宿」）

| 列 | 改成 |
|---|---|
| `id` | 选择：与 `placeId` 相同的 12 个英文 id（或文本，值须与行程 `placeId` 一致） |
| `src` | 选择：`zh` / `en` |
| 其余 `*_zh` / `*_en`、`photo`、`hotel_photo`、`slides` | 文本（`slides` 一行一条路径） |

说明：同一 `placeId` 的多天共用这一行深度文案；按天不同的短介绍用逐日行程的 `blurb`。

**线路路书**（新建表；官网行程区「下载路书 PDF」）

| 列 | 改成 |
|---|---|
| `id` | 选择：`r1` `r2` `r3` |
| `src` | 选择：`zh` / `en` |
| `file` | 文本：`public/` 下相对路径，如 `guidebooks/r3/xxx.pdf` |
| `downloadName` | 文本：浏览器保存的文件名（可空） |
| `title_zh` / `title_en` | 文本 |

更新路书：把新 PDF 放进 `public/guidebooks/r1|r2|r3/`，改 `file`（及可选 `downloadName`），同步部署即可。`file` 留空则网站回退为即时生成的简版 PDF。

**定价三表**（官网「预订 → 人数」下方的**即时估算器**）

打开 Notion 三张表填写即可。列名已是中文；下面说明每个数字怎么填。

**① 线路定价参数**（每条线路一行：r1 / r2 / r3）

| 列名 | 怎么填 |
|---|---|
| 线路 | 选 `r1` / `r2` / `r3` |
| 估算开关 | `关闭·网站不显示估算` → 前端不出价；`演示·仅供参考` → 可出价但标参考；`正式·可对外` → 正式 |
| 数据口径说明 | 可选，如「2026-09 主理人校准」 |
| 领队成本 / 运营税费 / 储备金 | 一整团只发生一次的固定成本（元） |
| 加成率 | 如 `0.2` = 成本加 20% 后对外 |
| 报价取整基数 | 一般填 `10` 或 `100` |
| 同房人数 / 人数上限 | 双人一间默认；线路参考人数上限 |

车价改在 **产品库 · 车型** + 按日点选；公式：按日产品成本 + 团队固定分摊 → ×(1+margin) → 取整。

**② 成本模块**（主理人主要填这里；每线路 7 行）

| 列名 | 怎么填 |
|---|---|
| 线路 | `r1` / `r2` / `r3` |
| 模块代号 | 选带中文的项即可（如 `stay·住宿`）；**不要改代号前半段** |
| 模块名称·中文 / 英文 | 给自己看的说明，可改 |
| 口径备注 | `按人` / `按间夜均摊` / `团费人均`（**只备注，不参与计算**） |
| 成人人均成本(元) | 该模块折算后的**成人人均**，不是单价。例：住宿 6 晚 × ¥1000/间 ÷ 2 人 = 填 `3000` |
| 儿童人均成本(元) | 同上；不占床可填 `0` |

**③ 报价锚点**（校准用，**不展示给客人**）

| 列名 | 怎么填 |
|---|---|
| 线路 | `r1` / `r2` / `r3` |
| 人数档 | 如 `2` / `4` / `6` |
| 成人发布价 / 儿童发布价 | 已知对外发布价，用来核对模型算得对不对 |

填完后说一声「同步定价」或运行 `npm run content:notion`，会写入 `content/pricing.yaml`，网站即时估算随之更新。

**客人评价**

| 列 | 改成 |
|---|---|
| `src` | 选择：`zh` / `en` |
| `route` | 选择：`r1` `r2` `r3`（或也改成关联「路线卡片」） |
| `rating` | 数字 |
| `photos` | 文本；一行一条路径，写 `reviews/文件名.jpg`（图放在仓库 `public/reviews/`）。**不要**写 `destinations/...` |

**FAQ / 商家 / 轮播 / 关于我们**

- 各表的 `src` → 选择 `zh` / `en`
- 轮播 `themeId` → 选择：`wild` `flavors` `villages` `locals`
- 商家 `link1_type` / `link2_type` → 选择：`google` / `web`

### 3. 建议加的两列（所有表都可以加）

| 列 | 类型 | 用途 |
|---|---|---|
| `状态` | 选择 | `草稿` / `已发布` / `已下线`。现有行先全部标「已发布」 |
| `备注` | 文本 | 给运营看，不同步到网站 |

### 4. 视图（可选，更好用）

在「逐日行程」点左侧视图旁的 `+`：

- 看板或表格，按 **路线** 筛选：只要 r1 / 只要 r2 / 只要 r3
- 排序：`day` 从小到大

「客人评价」可按 `route` 分组。

### 5. 权限

打开总页面 → 右上角 **分享**：

- 运营：可以编辑
- 不要「任何人可编辑」的公开链接

### 6. 和官网的关系

接上 Integration 并「部署」之后，才会按时间戳把 Notion 较新的内容写进 yaml 并上线。  
紧急改上线仍可走 GitHub yaml（只要那次提交比 Notion 更晚）。

### 7. 开通同步（表设好后做这个）

1. 打开 https://www.notion.so/my-integrations → **New integration**  
   - 类型：Internal  
   - 工作区：选有闲那个  
   - 复制 Token（`secret_` 开头），**不要发到聊天里**
2. 回到「网站内容优化」页面 → 右上角 **⋯** → **连接**（Connections）→ 勾选刚建的集成  
3. 每个表格点进去变成整页 → **分享** → 复制链接，把链接里 32 位 ID 发给技术，填进仓库的 `content/notion.yaml`（含新建的 `destinations`）  
4. 技术把 Token 放进：  
   - 本地 `.env.local` 的 `NOTION_TOKEN=`  
   - GitHub 仓库 Settings → Secrets → `NOTION_TOKEN`  
5. 说一声「部署」

本地试拉：`npm run content:notion`（需要已填 ID 和 Token）

---

## 注意

- 不要改列名，以后同步脚本会按这些名字读。
- 单元格里的换行是有意的（餐饮、活动、照片一行一条）。
- 图片路径不要改成 Notion 附件链接。
- 导入 **不会** 自动更新官网，仍要等接上同步并「部署」。

---

## 方式 B：一键建表（自动出链接，推荐）

不想手工导入 CSV、也不想一列列改类型的话，用脚本直接在 Notion 建好三张定价表并填好现有数据，跑完直接打印链接。

需要一次：

1. https://www.notion.so/my-integrations → **New integration**（Internal）→ 复制 Token
2. 在 Notion 打开父页面（如「网站内容优化」）→ 右上角 **⋯** → **连接** → 勾选该集成
3. 复制该父页面链接里 `?` 前面的 32 位 ID

然后本地执行：

```bash
NOTION_TOKEN=secret_xxx npm run content:notion:init -- <父页面32位ID>
# 只建空表、不填数据：末尾再加一个 --empty
```

脚本会：建「线路定价参数 / 成本模块 / 报价锚点」三张表（列类型已设好）→ 把 `content/pricing.yaml` 里的数据填进去 → 打印三个链接 **和** 要粘进 `content/notion.yaml` 的三行 ID。

之后主理人直接在 Notion 里改数字，跑 `npm run content:notion` 即可同步回网站。

---

## 报价三层架构（产品库 → 线路逐日明细 → 人数验算）

Notion 打开 **「报价」** 页，下挂三大分区：

| 大项 | 子表 |
|------|------|
| **产品库** | 酒店 · 车型 · 导游 · 餐食 · 门票 · 杂项 |
| **线路逐日明细** | 线路参数 · 按日一行 |
| **人数验算** | 人数验算表（2/4/6/8/10） |

详见 `MEMO-报价三层架构.md`。

```bash
npm run content:notion:bootstrap-v3        # 建餐/票/杂项等（首次）
npm run content:notion:organize-sections  # 三大分区排布 + 改名
npm run content:notion
```

旧「成本模块」与「按日明细多行」已删除，**不再同步**。无按日明细则网站询价。

### 多线路标注 + 行程总览（必做）

每条线路（**路线一 r1 / 路线二 r2 / 路线三 r3**）在「线路定价参数」各占一行，**先写总览，再写按日**：

| 列 | 说明 |
|----|------|
| 线路 | 代码 `r1` / `r2` / `r3`（筛选用，勿改） |
| 标题 | 建议：`路线一·r1 · 定价参数` |
| 线路名称·中文 / 英文 | 如「路线一 · 三境溯游 · 秘境回响」 |
| 行程总览·中文 / 英文 | **每日报价前的 brief**：天数、进出港、城市链、卖点摘要 |

按日明细行标题建议：`路线一·r1 · D2·德天/明仕 · 酒店`（一眼分清线路）。

一键补列并回填三线路名称/总览、重命名已有按日标题：

```bash
npm run content:notion:label-routes
npm run content:notion
```

Notion 建议建三个视图：筛选 `线路=r1` / `r2` / `r3`，按「日序」排序。r2/r3 的按日行可后填，但参数行的 **label + brief 应先有**。

CSV：`17-报价线路总览.csv`（三线路名称与 brief 模板）。

### CSV 模板（手工导入备选）

| 文件 | 表 |
|------|-----|
| `13-报价酒店主数据.csv` | 酒店主数据 |
| `14-报价车型主数据.csv` | 车型主数据 |
| `15-报价导游主数据.csv` | 导游主数据 |
| `16-报价按日明细-r1.csv` | 按日明细（r1 样例；酒店/车/导列写**代号**，导入后在 Notion 改成关联） |
| `17-报价线路总览.csv` | 写入「线路定价参数」的名称 + 行程总览 |

### 按日表明细列

| 列 | 类型 | 说明 |
|----|------|------|
| 标题 | 标题 | 含「路线一·r1」前缀，勿只写 D1 |
| 线路 | 选择 r1/r2/r3 | **必须**标明；未来 r2/r3 同表不同筛选 |
| 日序 | 数字 | 对齐行程 day |
| 日标题 | 文本 | 如「南宁」 |
| 费用类型 | 选择 | `hotel` `vehicle` `guide` `ticket` `meal` `tip` `visa` `other` |
| 酒店 / 车型 / 导游 | 关联 | 对应主数据 |
| 项目名称 | 文本 | 门票名、机动说明 |
| 间数 / 数量 | 数字 | 酒店间数；票份数 |
| 金额覆盖 | 数字 | 覆盖主数据价；无主数据项直接填这里 |
| 现付 | 勾选 | 门票等现场自付 → **不进**参考报价 |
| 分摊口径 | 选择 | `per_room_split` / `per_vehicle_split` / `per_person` / `per_group_split` |
| 成人适用 / 儿童适用 | 勾选 | 默认都勾；酒店儿童通常不勾 |

`other` = 每日机动栏；可多行。门票默认进价，勾「现付」则排除。

**录入顺序**：打开该线路「定价参数」看清行程总览 → 切到按日视图筛该线路 → 按日序填房/车/导/票/其他。

填完后：`npm run content:notion` → 写入 `content/pricing.yaml` 的 `label` / `brief` / `catalogs` / `days`。

---

## 轻体验栏目（首页六张小产品卡）

官网首页「让旅途真正改变你」区块的六张卡片 + 详情大卡，数据源是 `content/experiences.yaml`。

Notion **两张独立表**（同一内容页下各一张，侧栏都能看到）：

| 表 | 用途 | 仓库文件 |
|---|---|---|
| **轻体验栏目** | 一行一个品类大卡：介绍、封面、时长/成团/季节 | `content/experiences.yaml` |
| **轻体验清单** | 一行一个可售 SKU | `content/light-skus.yaml` |
| **轻体验评价** | 一行一条详情右侧客人评价 | `content/light-reviews.yaml` |
| **轻体验 · YAML 映射说明** | 三张表的列 ↔ YAML ↔ 网页；改前先看 | — |

栏目顺序固定为 `hike → photo → village → foodfilm → craft → wellness`，栏目 `id` 不要新增或改名。

改完跑 `npm run content:notion` → 写入 YAML → 网站更新。  
手工导入备选：`18-轻体验栏目.csv`（6 行栏目）。

整理层级 / 从网站回写栏目到 Notion：

```bash
npm run content:notion:organize-light
# 或：node scripts/notion-organize-light.mjs
```

整表从仓库推回 Notion（内容是在 yaml 里改的，避免下次单向同步被冲掉）：

```bash
npm run content:push-light                 # 栏目 + 清单一起推
npm run content:push-light -- --only=skus  # 只推清单
```

价格只写在 `content/light-skus.yaml`（CNY 原值）。英文界面按实时汇率自动换算美元 / 欧元，访客可在 `$ / €` 之间切换；汇率拉取失败时回退到内置汇率（约 1 USD ≈ 7.25 CNY）。

---

## 轻体验清单（SKU · 运营/主理人货架）

详情页里的「活动小产品 / 线路餐食」、桃心收藏、参考价与兴趣清单合计，都来自 **SKU**，不是栏目大卡。  
在 Notion 内容页里直接打开「轻体验清单」，不要在「轻体验栏目」里找第二张表。

| 仓库文件 | Notion |
|---|---|
| `content/light-skus.yaml` | **轻体验清单**（与「轻体验栏目」并列的独立表） |

### 常用列

| Notion 列 | 含义 |
|---|---|
| `id` | SKU 稳定键（如 `climb`）；桃心与计价依赖它，勿随意改 |
| `category` | 归属栏目：`hike` / `village` / … |
| `kind` | `route` 活动小产品 · `meal` 线路餐食 |
| `status` | `在售` / `季节性` / `暂缓`（暂缓不上线） |
| `sort` | 同栏目排序，越小越靠前 |
| `title_zh` / `title_en` | 标题 |
| `blurb1_*` / `blurb2_*` | 说明（网站会剥掉文内「参考报价」句，避免与结构化价重复） |
| `images` | 一行一条，`public/` 相对路径，如 `light/hike/climb-1.jpeg` |
| `price_unit` | `person` 按人 · `raft` 按筏 · `flat` 一口价 |
| `price_cny_1_3` / `price_cny_4_plus` | 按人档位（元，十位取整） |
| `raft_cny` / `raft_seats` | 按筏 |
| `price_flat_cny` | 一口价 |
| `min_pax` | 起订人数（可选） |
| `price_note_zh` / `price_note_en` | 报价后补足，如「（2 人一车）· 驾驶约 50 分钟。」 |
| `note` | 内部备注，不同步 |

### 改完怎么生效

1. 在 Notion「轻体验清单」改行  
2. `npm run content:notion`（需 `.env.local` 的 `NOTION_TOKEN`）  
3. 推送后 Actions 会同步并部署  

首次建表 / 从代码灌入现有 32 个 SKU：

```bash
npx vite-node scripts/dump-light-skus.mjs   # 可选：从代码重导 YAML
node scripts/notion-create-light-skus.mjs   # 建表或更新行
```

儿童计入单价人数；3 岁以下免费只在网站提示。英文站 USD/EUR 按参考汇率换算，人民币以本表为准。

## 轻体验评价（详情右侧客人评价）

| 仓库文件 | Notion 表 |
|---|---|
| `content/light-reviews.yaml` | **轻体验评价**（与栏目/清单并列） |

| 列 | 说明 |
|---|---|
| `id` | 稳定键，如 `hp-seed-box` |
| `category` | `hike` / `photo` / `village` / `foodfilm` / `craft` / `wellness` |
| `flag` / `name` / `country` / `rating` / `date` | 头像区 |
| `body_zh` / `body_en` | 正文（各 ≤999 字）；`src` 为原文语言 |
| `photos` | 一行一条：`light/reviews/文件名.jpeg`（本地 + COS 同键，最多 4 张） |

首次建表 / 从 YAML 灌入：

```bash
npm run content:notion:create-light-reviews
python3 scripts/cos-sync-public.py light/reviews   # 新图必须先上 COS
```

与精品路线「客人评价」（`content/reviews/`、路径 `reviews/…`）分开。
