# 客人评价照片

评价配图放在这里。Notion / YAML 里只写相对路径，例如：

```
reviews/haorui-1.jpg
reviews/lin-2.jpg
reviews/2.mp4
```

**不要**再写 `destinations/...`（那是目的地与行程用图）。支持 `.jpg` / `.png` / `.webp` / `.mp4`。

## Notion 注意

- `slug` **每条必须唯一**；多条都叫「匿名」会互相覆盖。可写成 `匿名-20260816`、`ikids` 等。
- `photos` 是**文本**列：一行一条路径，不是上传附件。

## 命名建议

- 英文小写、无空格：`客人slug-序号.jpg`
- 例：`haorui-1.jpg`、`haorui-2.jpg`、`eva-weizhou-1.jpg`

放好文件后，在对应 `content/reviews/某人.yaml` 的 `photos:` 下列出路径，或在 Notion「客人评价」表的 `photos` 列一行一条路径，再同步。
