# MEMO — 南境拾遗（Karst Route）

> 技术决策、成本分析、已知问题与待办存档。  
> 最后更新：2026-09-10  
>
> **做同类独立站的复用手册 → [MEMO-独立站复用经验.md](./MEMO-独立站复用经验.md)**  
> **报价三层架构（已落地）→ [MEMO-报价三层架构.md](./MEMO-报价三层架构.md)**  
> **报价二期（行程自动生成报价行）→ [MEMO-报价二期-行程生成报价行.md](./MEMO-报价二期-行程生成报价行.md)**

---

## 一、项目概况

| 项 | 值 |
|---|---|
| 线上站点 | https://boutique-routes.guilinvillage.com/ |
| 仓库 | MarukoWorkShop/karst-route（`main` 推送 → Actions → GitHub Pages） |
| 技术栈 | Vite + React + TypeScript + Tailwind v4 |
| 双语 | EN / zh（`/zh` 子路径，`localeFromPath` 判定） |
| 部署 | GitHub Pages + 自定义域名；媒体走腾讯云 COS |
| 内容真源 | Notion → `npm run content:notion` → `content/*.yaml` |

页面结构（`App.tsx`）：
```
Header → Hero → TrustBar → BoutiqueTours → Timeline(行程) → Experience
       → About → Explore → PlanSection(定制/预订) → Faq → Partners → Footer + MobileDock
```

---

## 二、报价（2026-09 已落地）

| 层 | Notion | 说明 |
|---|---|---|
| 产品库 | 酒店 / 车型 / 导游 / 餐 / 票 / 杂项 | 改价在产品库 |
| 线路逐日明细 | 线路参数 + 按日一行 | 点选产品；同步写 `content/pricing.yaml` |
| 人数验算 | 2/4/6/8/10 | 同步脚本按公式回写单价 |

**估算要点（网站即时参考价）：**

- 公式：按日产品成本 + 团队固定分摊 → ÷(1−margin) → 取整（margin=0.3 即 ÷0.70，对齐报价单）  
- 领队费分档：`1-2` / `1-4` / `5-10`（实为 5–9）/ `10+`（含 10）  
- 车队：2 人可降 4 座小车；&gt;7 座载客升 14 座（约 7 座×1.4）；否则加车  
- 当前全线 margin：**0.28**  
- 改 Notion 数字后须跑 `npm run content:notion`（验算表不会自动刷新）

运维脚本见 `package.json` 的 `content:notion*`；补车型/领队列可用 `npm run content:notion:patch-leader-buses`。

二期（行程 YAML → 自动 scaffold 报价行）见报价二期 MEMO，**尚未做**。

---

## 三、COS 存储与流量（历史备查）

| 项 | 值 |
|---|---|
| 桶 | `youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com`（广州） |
| 用途 | Hero 视频等媒体；`VITE_MEDIA_BASE` 在 Pages 构建注入 |
| 测试期 | `VITE_HERO_VIDEO_OFF=1` 时 Hero 只轮播 poster，不拉视频流量 |

### 2026-09 初观测（欠费期）

- 视频曾可访问（206）；图片曾被 451 → 部分资源改走本地 `public/`  
- 流量大头来自 Hero 双层预载；已做惰性加载（`armed`）  
- 决策阈值（备查）：&lt;100GB/月可直出；持续更高再挂 CDN  

详细费用表与云开发对比仍以当时测算为准；上线后以控制台实际账单为准。

---

## 四、⚠️ 已知问题：线上 AI 接口未生效（暂不修复）

### 现象

Pages 上「生成行程」走本地规则兜底，豆包（火山方舟）未被调用。不报错，静默降级。

### 根因

`/api/craft` 相对路径在纯静态 Pages 上 404 → `composeDraft()` / `catalogFallback()`。  
本地 dev 经 Vite 代理到 `server/runCraft.ts`，故开发正常。

### 修复方向（待有需求）

1. 把 `api/craft` 部署到 Vercel（或同类）  
2. 注入 `VITE_API_BASE`  
3. CORS **限定为** `https://boutique-routes.guilinvillage.com`（不可 `*`）  
4. 配 `ARK_*` 密钥并验证  

代码骨架已在仓库；无即时需求时保持现状。

---

## 五、后期后端规划（已确认方向）

后期需要云函数、用户系统、AI：云开发可作后端；**视频仍建议 COS+CDN**，避免吃掉云开发流量配额。

---

## 六、页面待填 / 运营核对

| 区 | 状态提示 |
|---|---|
| 信任条 / About 资质 | 年限、人数、许可证、保险、取消政策等需主理人确认 |
| 路线参考价 | 已接 Notion 三层估算；对外展示仍为参考价，非锁价 |
| 联系方式 | Footer / 询盘邮箱（Web3Forms）需确认是否全活 |
| 评价 | 授权、照片、评分展示 |

儿童 / 纯玩 / 餐食 / 小费 / 单房差说明已在 `PlanSection` 脚注（中英）。

---

## 七、引用点速查（媒体）

| # | 位置 | 说明 |
|---|---|---|
| 1 | `src/data/heroPanels.ts` / `src/lib/asset.ts` | COS / 本地资源解析 |
| 2 | `vite.config.ts` | dev `/hero-media` proxy |
| 3 | `.github/workflows/pages.yml` | `VITE_MEDIA_BASE`、`PAGES_BASE=/` |
| 4 | `cos_upload.py` | 上传脚本（若仍在用） |

---

## 八、当前待办优先级

1. **🟡 运营数据与联系方式** — 资质、保险、真实口径  
2. **🟢 报价二期** — 行程变更自动 scaffold 按日行（见二期 MEMO）  
3. **⚪ AI 接口上线** — 有需求时按第四节六步做  
4. **⚪ COS/CDN** — 按实际流量再决定是否挂 CDN  
