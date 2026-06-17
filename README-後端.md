# 棄道 — 後端 + 上傳功能 安裝說明

## 檔案放法
把以下檔案放進你的專案(路徑對齊):

    server/index.js          ← 新增,Express 後端
    server/package.json      ← 新增
    src/data/loadNovel.ts    ← 覆蓋(改成打 API)
    src/composables/useReader.ts ← 覆蓋(內容不變,確保版本一致)
    src/views/ReaderView.vue ← 覆蓋(加載入狀態)
    src/views/UploadView.vue ← 新增,上傳頁
    src/router/index.ts      ← 覆蓋(加 /upload)
    vite.config.ts           ← 你若已有,只併入 server.proxy 那段

## 啟動(開兩個終端機)

後端:
    cd server
    npm install
    npm run dev          # 跑在 http://localhost:3001

前端(專案根目錄):
    npm run dev          # /api 會自動 proxy 到 3001

## 使用
- 上傳頁:http://localhost:5173/upload
- 填卷號/卷名/章號/章名/內文 → 送出 → 寫成 src/content/loen/卷-章.md
- 回 /read 重新整理即可看到(因為已改成執行時打 API,不用重啟)

## 注意
- 檔名格式 卷號-章號.md(各補兩位零),例 02-26.md
- 同卷同章重複上傳會被擋(回 409)
- 內文「空一行」代表分段,單一換行也算一段(沿用你原本的解析規則)
- 要加新書:在 server/index.js 的 BOOK_META 加一筆即可
