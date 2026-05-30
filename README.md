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

## 部署（Vercel + Git 自動部署）

Repo：https://github.com/1103syike/CoupleLedgerWeb  
Production：https://couple-ledger-web-beta.vercel.app

**Vercel 已連結此 GitHub repo**（Root Directory：`CoupleLedgerWeb`）。  
push 到 `main` 後 Vercel 會**自動建置並部署**，無需額外設定。

1. 本機 commit 變更
2. `git push origin main`
3. 到 [Vercel Deployments](https://vercel.com/1103syikes-projects/couple-ledger-web) 查看進度

環境變數 `VITE_FIREBASE_*` 已在 Vercel Production / Development 設定完成。

### 本機立即部署（不等 push）

```bash
cd CoupleLedgerWeb
npx vercel deploy --prod
```

已安裝 [Vercel Coding Agent Plugin](https://vercel.com/docs/agent-resources/vercel-plugin)。**Reload Window** 後可在 Agent 使用：

| 指令 | 用途 |
|------|------|
| `/vercel-plugin:bootstrap` | 連結專案、環境變數初始化 |
| `/vercel-plugin:deploy prod` | 部署到 production |
| `/vercel-plugin:env` | 管理環境變數 |
| `/vercel-plugin:status` | 查看部署狀態 |

首次使用前，在 `CoupleLedgerWeb` 目錄登入 Vercel：

```bash
cd CoupleLedgerWeb
npx vercel login
npx vercel link
```

### Firestore 規則（選用）

GitHub Actions → **Deploy Firestore** 可手動部署規則，需在 Secrets 設定 `FIREBASE_SERVICE_ACCOUNT`、`FIREBASE_PROJECT_ID`。  
或本機執行：`firebase deploy --only firestore:rules,firestore:indexes`
## 資料庫說明

詳見 [firebase/DATABASE.md](firebase/DATABASE.md)。

## 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 本機開發 |
| `npm run build` | 建置靜態檔（部署用） |
| `npm run preview` | 預覽建置結果 |
