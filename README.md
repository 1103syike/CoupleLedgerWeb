# 我們的帳本

情侶雙人共用記帳 **網頁版（PWA）**，可在 iPhone 用 Safari → **加入主畫面** 像 App 一樣使用。

- **資料庫**：Firebase **Firestore**（免費 Spark）
- **帳號**：Firebase **Authentication**（Email）
- **全程可 $0**（Firebase + Vercel/Netlify 免費方案）

## 專案結構

```
CoupleLedgerWeb/     ← 網頁 App（主要開發這裡）
firebase/
  firestore.rules    ← 安全規則（必須部署）
  firestore.indexes.json
  DATABASE.md        ← 資料庫欄位說明
```

## 快速開始

### 1. Firebase（免費）

1. [Firebase Console](https://console.firebase.google.com/) 建立專案
2. 新增 **Web App**，複製設定
3. 啟用 **Authentication → Email/Password**
4. 建立 **Firestore**，貼上 `firebase/firestore.rules` 並發布
5. 若提示索引，於 Console 建立或執行：`firebase deploy --only firestore:indexes`

### 2. 本機開發（Windows 即可）

```bash
cd CoupleLedgerWeb
copy .env.example .env
# 編輯 .env 填入 Firebase Web 設定

npm install
npm run dev
```

瀏覽器打開終端機顯示的網址（例如 `http://localhost:5173`）。

### 3. iPhone 使用

1. 部署到 **Vercel** / **Netlify** / **Firebase Hosting**（免費 HTTPS 網址）
2. iPhone **Safari** 開啟網址
3. **分享 → 加入主畫面**

### 4. 兩人流程

1. 你：註冊 → 建立帳本 → **設定** 複製邀請碼  
2. 女友：註冊 → 輸入邀請碼加入  
3. 任一方記帳，另一方即時同步  

## Git 自動部署（GitHub Actions → Vercel）

push 到 `main`（或 `master`）會自動建置並部署網頁版。

### 一次性設定

1. **GitHub 儲存庫**  
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的帳號/你的-repo.git
   git push -u origin main
   ```

2. **Vercel 專案**（[vercel.com](https://vercel.com)）  
   - 匯入 GitHub repo  
   - **Root Directory** 設 `CoupleLedgerWeb`  
   - 在 **Settings → Environment Variables** 加入與 `.env` 相同的 `VITE_FIREBASE_*`（Production / Preview / Development 都加）

3. **取得 Vercel ID**（本機 `CoupleLedgerWeb` 目錄）  
   ```bash
   npx vercel link
   npx vercel env pull
   ```
   或到 Vercel → **Settings → General** 複製 **Project ID**、**Team / Org ID**。

4. **GitHub Secrets**（repo → Settings → Secrets and variables → Actions）  

   | Secret | 說明 |
   |--------|------|
   | `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) 建立 |
   | `VERCEL_ORG_ID` | Vercel Team / User ID |
   | `VERCEL_PROJECT_ID` | Vercel 專案 ID |

   **（選用）Firestore 規則一併自動部署：**

   | Secret | 說明 |
   |--------|------|
   | `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → 專案設定 → 服務帳戶 → 產生 JSON 金鑰（整份 JSON 貼上） |
   | `FIREBASE_PROJECT_ID` | Firebase 專案 ID |

5. push 後到 GitHub **Actions** 分頁查看部署進度。

### 手動部署（不用 CI）

1. 將專案推送到 GitHub  
2. [vercel.com](https://vercel.com) 匯入 repo，Root Directory 設 `CoupleLedgerWeb`  
3. 在 Vercel 專案設定加入與 `.env` 相同的環境變數（`VITE_FIREBASE_*`）  
4. Deploy  

## 資料庫說明

詳見 [firebase/DATABASE.md](firebase/DATABASE.md)。

## 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 本機開發 |
| `npm run build` | 建置靜態檔（部署用） |
| `npm run preview` | 預覽建置結果 |
