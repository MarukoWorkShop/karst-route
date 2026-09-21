# 轻体验客人评价配图

路径约定（本地 `public/` 与腾讯云 COS **同一对象键**）：

```
light/reviews/hp-1.jpeg
light/reviews/hp-2.jpeg
```

- 本地：本目录
- COS：`youxian-travel-1412422924` → `light/reviews/…`
- Notion「轻体验评价」表 `photos` 列：一行一条，写上面这种相对路径（不要写完整 URL）
- YAML：`content/light-reviews.yaml`

上传：

```bash
python3 scripts/cos-sync-public.py light/reviews
# 或 npm run content:cos:light-reviews
```

与精品路线「客人评价」图库 `public/reviews/`（路径 `reviews/…`）分开，勿混用。
