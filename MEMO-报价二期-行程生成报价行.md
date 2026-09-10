# 报价二期规划：行程 YAML → 自动生成 / 对齐报价行

> 依赖：**一期**（酒店/车/导主数据 + 按日明细 + 汇总到网页参考报价）已上线。  
> 一期文档：Cursor plan「按日报价体系」。  
> 本文只写二期；一期仍人工按 day 号对齐。  
> 日期：2026-09-09

---

## 0. 一句话

行程路书（`content/itineraries/{r}.yaml`）改了「第几天去哪、住哪」之后，系统能**自动在 Notion 报价日表里生成或更新对应行的骨架**（预填日序、标题、建议酒店/车/导选项），人工只补金额与例外；网页仍只显示汇总价。

---

## 1. 背景与痛点

### 1.1 一期结束后的状态

| 真相源 | 内容 | 谁维护 |
|--------|------|--------|
| 行程 YAML / Notion 行程库 | day、city、placeId、lodging、transport、dining… | 内容 |
| 报价按日表 + 房/车/导主数据 | 费用行、选项、金额 | 报价 |
| `pricing.yaml` → `estimateParty` | 汇总人均 | 同步脚本 |

两边用 **day 数字**人工对齐，互不监听。

### 1.2 不自动化时会怎样

- 行程 Day 8 从「沙坝」改成「多留一天」，报价还停在旧 Day 8 → 对账错、门市价漂。  
- 新建 r2/r3 要手敲 11/7 天空行，易漏「车/导/房」默认行。  
- 连住两晚同一酒店，报价行容易重复建或漏建。

### 1.3 二期要解决什么

1. **脚手架**：从行程一键生成「该有的报价行骨架」。  
2. **对齐检查**：报告行程 day 与报价 day 的差集（多/少/标题不一致）。  
3. **受控更新**：行程变更后，只更新「未人工锁死」的字段，不覆盖报价同事已改的金额与选项。

**不解决（仍非二期）：** 客人看见按日明细；从子弹爬价；单房差/加购自动进估价；AI 猜票价。

---

## 2. 目标与成功标准

### 2.1 目标

- 输入：某线路 `itineraries/{id}.yaml`（或 Notion 行程同步后的同构数据）+ 房/车/导主数据。  
- 输出：Notion `pricingDays`（及可选本地 `pricing.yaml` days）中的行集合更新。  
- 操作者：技术跑 CLI，或内容在 Notion 按钮/说明下触发（首版以 CLI 为准）。

### 2.2 可验收标准

| ID | 标准 |
|----|------|
| P2-1 | 对 r1：空报价日表时跑生成，得到 14 个「日」的骨架，且每天至少含建议的 hotel/vehicle/guide 行类型（按规则，见 §4） |
| P2-2 | 再跑一次生成：**不产生重复行**（幂等） |
| P2-3 | 行程删除 Day 12：对齐报告标红；可选 `--prune-stubs` 只删「未锁定且无金额」的孤儿行 |
| P2-4 | 人工改过的「酒店选项 / 金额覆盖」在默认同步下**不被覆盖**（见 §5 锁定规则） |
| P2-5 | 生成后 `npm run content:notion` + 网站 2 人估算仍只出汇总，无明细 UI 回归 |
| P2-6 | 文档：内容同事能按 README 完成「改行程 → 跑对齐 → 补价」 |

---

## 3. 前置依赖（一期必须具备）

1. Notion：`pricingHotels` / `pricingVehicles` / `pricingGuides` / `pricingDays` + 线路参数。  
2. 主数据有稳定 **id**（或唯一代号），可供行程 `placeId` / 规则映射。  
3. 按日行有字段：`线路`、`日序`、`费用类型`、relations、`金额覆盖`、**`人工锁定`（checkbox）**、`生成来源`（select：`manual` / `itinerary_stub`）。  
4. 估算器已能从 `days[]` 汇总（无 days 时回退旧 modules）。

若一期尚未加「人工锁定 / 生成来源」列：二期开工第一项补列，再写生成器。

---

## 4. 从行程推导报价行的规则

### 4.1 行程侧可用字段（现有）

来自 [`content/itineraries/*.yaml`](content/itineraries/)：

- `day`（整数，主键对齐键）  
- `city` / `stay` / `placeId` / `stayKind`（`hotel` \| `train` \| `park` \| `base`）  
- `lodging`（文案，弱信号）  
- `drive` / `transport`（是否用车的弱信号）  
- `dining[]`（是否有含餐的弱信号）  
- `bullets` / `themes`（**不**自动变票价行，避免臆造）

### 4.2 每天默认生成哪些「行类型」

| 条件 | 生成行 | 预填 |
|------|--------|------|
| `stayKind` ∈ hotel/park/base 且非行程最后一天「仅送机无住」* | `hotel` | 按 §4.3 匹配酒店 relation；匹配失败则空 relation + 备注「待选」 |
| `stayKind` = train | `other` 或专用 `train_berth` | 标签来自 lodging 文案；金额空，待人工 |
| 当日有 `drive` 或 transport 含「专车/车/轮渡」等 | `vehicle` | 按段选默认车型（国内/越南），见 §4.4 |
| 跨境日（文案含口岸/入境/出境） | 可选 `visa` 空行 + `vehicle` | 金额空 |
| 默认同段有导 | `guide` | 国内→中司兼导；越南→越导（主数据 id 配置表） |
| dining 非空且像「含餐」 | **不**自动生成 meal 金额行 | 只在对齐报告里提示「检查含餐」；含餐价仍人工（与 Word 样例一致：餐是例外清单） |
| bullets 含景点 | **不**自动拆票 | 报告列出 bullets，供人工加 `ticket` 行（含价或勾「现付」） |
| — | **不**强制每天生成 `other` 空行 | 机动项人工随时加；对齐报告可提示「当日无 other」仅供参考 |

\*「最后一天仅送机」：若 `day === maxDay` 且 lodging/stay 表示返程/送机、无过夜，则**不**生成 hotel 行，只生成 vehicle（送机）。

### 4.3 酒店匹配（placeId → 主数据）

维护一张显式映射（优先代码/YAML，而不是模糊匹配 lodging 文案）：

```yaml
# content/pricing-hotel-map.yaml（二期新增）
# placeId → hotels 主数据 id；可按 route 覆盖
default:
  nanning: hotel-nanning-nalian
  chongzuo: hotel-chongzuo-nali
  halong: hotel-halong-wason
  # ...
routes:
  r1: {}   # 覆盖 default
  r2:
    guantang: hotel-guantang-xxx
```

规则：

1. 查 `routes[r].placeId` → 否则 `default[placeId]`。  
2. 命中且主数据「启用」→ 写入 relation。  
3. 未命中 → 生成 stub，`生成来源=itinerary_stub`，备注 `unmapped:placeId=…`。  
4. **禁止**用 lodging 中英文字串去 fuzzy 匹配酒店名作为默认写入（可在报告里「建议候选」）。

### 4.4 车型 / 导游默认

```yaml
# content/pricing-defaults.yaml
vehicles:
  china: van-7          # 主数据 id
  vietnam: van-7-vn
guides:
  china: guide-driver   # 司兼导
  vietnam: guide-vn
segmentByPlace:         # placeId → china|vietnam
  nanning: china
  chongzuo: china
  jianshui: china
  halong: vietnam
  catba: vietnam
  hanoi: vietnam
  sapa: vietnam
  # 口岸日：按「当晚 placeId」定段；上午出境下午中国则拆两行 vehicle（高级，见 §7）
```

### 4.5 一行在 Notion 上的稳定身份（幂等键）

生成器不依赖 Notion page id 做「是否已存在」的唯一依据，而用业务键：

```text
idempotencyKey = `${routeId}|d${day}|${type}|${slot}`
```

- `slot`：同日同类型多行时用：`hotel` 默认 `night`；`vehicle` 默认 `main`（二期若拆两段车用 `am`/`pm`）；`ticket` 用 slug（人工创建时自填，自动生成票行则二期不做）。  
- 写入 Notion 时把该键放进只读/隐藏文本列 `幂等键`，或编码进页面标题前缀。

第二次运行：同键 → **更新允许字段**；不同键 → 新建。

---

## 5. 冲突与锁定策略

### 5.1 字段分级

| 级别 | 字段 | 再生成时 |
|------|------|----------|
| A 骨架 | 日序、日标题（来自 city）、费用类型、幂等键、生成来源 | 可更新标题；类型与键不变 |
| B 建议选项 | 酒店/车/导 relation（仅当当前为空或来源=stub 且未锁定） | 仅填充空；已选不改 |
| C 人工价 | 金额覆盖、间数、数量、分摊口径、适用成人儿童 | **默认永不覆盖** |
| D 锁定 | `人工锁定=true` | 整行跳过更新（可仍出现在对齐报告） |

### 5.2 行程删日 / 改 day 号

- **删日**：报告 `pricing_extra_days`；默认不删 Notion 行。`--prune-stubs`：删除 `生成来源=itinerary_stub` 且无金额覆盖且未锁定的行。  
- **day 重编号**（少见）：不做自动搬家；报告「行程 day 集合变更，请人工处理」；提供可选 `--remap 8:9,9:10` 高级参数（二期后半再做）。

### 5.3 行程改 placeId（同日换目的地）

- 未锁定且 hotel relation 仍等于「旧映射建议」或为空 → 更新为新映射。  
- 已换成别的酒店或已锁定 → 不改，报告 `hotel_drift`。

---

## 6. 系统形态与目录

### 6.1 CLI（首版）

```bash
# 对齐报告（只读）
npm run content:pricing-align -- --route r1

# 生成/更新骨架（写 Notion）
npm run content:pricing-scaffold -- --route r1

# 生成后立刻同步回 YAML（可选）
npm run content:pricing-scaffold -- --route r1 --sync
```

实现建议：`scripts/pricing-scaffold-from-itinerary.mjs`  
- 读 `content/itineraries/{route}.yaml`  
- 读 `content/pricing-hotel-map.yaml` + `pricing-defaults.yaml`  
- 读 Notion 主数据与已有 `pricingDays`  
- 打报告到 stdout；写操作需 `NOTION_TOKEN`

### 6.2 仓库文件

| 文件 | 作用 |
|------|------|
| `content/pricing-hotel-map.yaml` | placeId→酒店 id |
| `content/pricing-defaults.yaml` | 默认车/导、地域分段 |
| `scripts/pricing-scaffold-from-itinerary.mjs` | 生成与对齐 |
| `scripts/pricing-align-report.mjs` | 可合并进上一脚本的 `--dry-run` |
| `content/notion-import/README.md` | 同事操作说明 |
| `MEMO-报价二期-行程生成报价行.md` | 本文 |

### 6.3 与 sync-notion 的关系

- **scaffold**：行程 → Notion 报价行（写 Notion）。  
- **content:notion**：Notion → `pricing.yaml`（读 Notion）。  
- 推荐流水线：`改行程 → scaffold → （人在 Notion 补价）→ content:notion → 网站`。  
- 禁止 scaffold 直接改 `pricing.yaml` 绕过 Notion（除非 `--local-only` 开发模式，不进正式文档主路径）。

---

## 7. 边界与进阶（二期内分档）

### 7.1 二期 A（必须交付）

- 对齐报告 + 骨架生成（hotel/vehicle/guide 空金额）。  
- 幂等键 + 锁定 + 空 relation 填充。  
- placeId 映射表 + 默认车/导。  
- r1 全量跑通；r2/r3 可跑通结构（映射可先不全）。

### 7.2 二期 B（增强，可同一里程碑后半）

- 跨境日拆两段 `vehicle`（am 越南 / pm 中国）。  
- `--prune-stubs`。  
- 对齐报告输出 Markdown 文件到 `tmp/` 或 Notion 评论。  
- dining/bullets「待人工加票/餐」检查清单。

### 7.3 明确不做（三期以后）

- 根据 bullets 自动创建带价格的 ticket 行。  
- 行程 Notion 保存时 webhook 全自动 scaffold（需公网与权限，另立运维方案）。  
- 客人端展示生成日志或按日价。

---

## 8. 实现步骤（工程排序）

1. **补一期字段**：`人工锁定`、`生成来源`、`幂等键`（若缺）。  
2. **映射表**：根据 r1 样例酒店清单写齐 `pricing-hotel-map.yaml`。  
3. **dry-run 对齐报告**：只读对比行程 days vs 报价 days。  
4. **scaffold 写入**：幂等创建/更新 stub 行。  
5. **文档与 npm scripts**。  
6. **r1 回归**：scaffold → 人工确认选项 → sync → estimate 与一期基准对比（汇总偏差说明）。  
7. **二期 B** 按需排期。

---

## 9. 操作手册（给内容/报价同事）

```text
1. 在 Notion/YAML 改好某线路逐日行程并同步到仓库 itineraries
2. 跑：npm run content:pricing-align -- --route r1
   → 看缺日、多日、未映射 placeId
3. 跑：npm run content:pricing-scaffold -- --route r1
4. 打开 Notion 按日报价表：把「待选」酒店/车/导选好；填票餐小费等金额
5. 需要防止再被刷掉的行：勾选「人工锁定」
6. npm run content:notion → 推送上线（网页仍只显示汇总参考价）
```

---

## 10. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 自动覆盖人工价 | 默认不写 C 级字段；锁定整行跳过 |
| placeId 无酒店 | 映射表强制维护；报告 unmapped |
| day 重排导致错行 | 不做静默 remap；报告 + 人工 |
| Notion API 限频 | 按线路批量、有限并发、可续跑 |
| 与一期 modules 双真相 | scaffold 只服务 days；modules 仅回退，文档写明「有 days 则以 days 为准」 |

---

## 11. 验收用例（摘要）

1. **空表生成**：r1 无报价日行 → scaffold → 14 天骨架，映射酒店命中数 ≥ 约定阈值。  
2. **幂等**：再跑行数不变。  
3. **改 placeId**：未锁定日酒店随映射更新；锁定日不变且报告 drift。  
4. **删行程日**：align 报多余报价日；prune 只删 stub。  
5. **网站**：PriceEstimate 无按日 UI；2/4 人汇总有值。

---

## 12. 与一期的分工一览

| | 一期 | 二期 |
|--|------|------|
| 报价录入 | 人建按日行、点选房车导 | 行程生成骨架，人补价 |
| 对齐 | 人工看 day 号 | align/scaffold 工具 |
| 估价公式 | days 汇总 → 人均 | 不变 |
| 客人 UI | 只汇总 | 不变 |
| 行程→票价智能 | 无 | 无（仅检查清单） |

---

*二期开工条件：一期 r1 按日汇总已在网页跑通，且主数据 id 稳定。*
