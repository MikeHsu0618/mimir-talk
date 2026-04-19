# 從 Thanos 到 Mimir 3.0 — 實戰分享

一場 40 分鐘的技術演講，講述從 Thanos 遷移到 Mimir 3.0 並整合 AutoMQ 的完整歷程。

## 執行

```bash
pnpm install       # 安裝依賴
pnpm dev           # 啟動 dev server (開在 http://localhost:3030)
pnpm export        # 匯出 PDF
pnpm export-pptx   # 匯出 PPTX
pnpm build         # 建置靜態 SPA
```

## 演講大綱

1. 開場 & 背景（5 min）
2. Thanos 痛點（8 min）
3. Mimir 3.0 介紹（8 min）
4. AutoMQ 整合（8 min）
5. 轉換成果（6 min）
6. 未來展望 - Parquet Gateway（5 min）

## 檔案結構

- `slides.md` — 主要投影片內容
- `style.css` — 自訂樣式（observability 主題配色）
- `components/` — 自訂 Vue 組件
- `public/` — 靜態資源（圖片、logo）
- `snippets/` — 可嵌入的程式碼片段
