# 資料庫說明（Firebase Firestore）

網頁版、iOS 版 **共用同一個資料庫**，不需自己架 MySQL 或買伺服器。

## 什麼是 Firestore

- Google Firebase 提供的 **NoSQL 雲端資料庫**
- **免費 Spark 方案** 足夠兩人記帳（讀寫次數、儲存量遠低於上限）
- 資料存在 Google 雲端，兩支 iPhone / 電腦瀏覽器 **即時同步**
- 安全靠 `firestore.rules`（只有帳本成員能讀寫）

## 集合（Collections）一覽

```
Firestore
├── users/{userId}           ← 使用者帳號
├── spaces/{spaceId}         ← 兩人帳本（含邀請碼）
├── categories/{docId}       ← 分類（建立帳本時種子資料）
└── expenses/{expenseId}     ← 每筆花費
```

---

### 1. `users` — 使用者

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 同 Firebase Auth `uid`（文件 ID） |
| `email` | string | 登入 Email |
| `displayName` | string | 暱稱 |
| `spaceId` | string? | 加入的帳本 ID，未加入為 null |
| `createdAt` | timestamp | 註冊時間 |

---

### 2. `spaces` — 兩人帳本

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 帳本 UUID（文件 ID） |
| `name` | string | 顯示名稱，例如「我們的帳本」 |
| `inviteCode` | string | 6 碼大寫邀請碼（給另一半加入） |
| `memberIds` | string[] | 成員 Auth uid，最多 2 人 |
| `memberNames` | map | `{ uid: "暱稱" }` |
| `createdAt` | timestamp | |
| `createdBy` | string | 建立者 uid |

查詢：依 `inviteCode` 查詢（加入帳本用）。

---

### 3. `categories` — 支出分類

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 邏輯 ID，如 `dining` |
| `spaceId` | string | 所屬帳本 |
| `name` | string | 餐飲、交通… |
| `icon` | string | 圖示名（網頁用 emoji／字串） |
| `colorHex` | string | `#FF6B6B` |
| `sortOrder` | number | 排序 |
| `isSystem` | boolean | 是否為內建分類 |

文件 ID 格式：`{spaceId}_{categoryId}`（例如 `abc123_dining`）。

---

### 4. `expenses` — 花費紀錄

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | UUID（文件 ID） |
| `spaceId` | string | 所屬帳本 |
| `amount` | string | 金額，存字串避免浮點誤差（如 `"600"`） |
| `currency` | string | 固定 `TWD` |
| `date` | timestamp | 消費日期 |
| `categoryId` | string | 對應分類 `id` |
| `note` | string | 備註 |
| `paidByUserId` | string | 誰付的（uid） |
| `splitType` | string | `equal` 兩人平分 / `personal` 個人 |
| `createdBy` | string | |
| `updatedBy` | string | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |
| `deletedAt` | timestamp? | 有值 = 軟刪除 |

查詢：`spaceId` + `date` 降序（明細列表）。

---

## 結算邏輯（不在 DB 內存，App 即時計算）

僅 `splitType === "equal"` 的支出參與：

- 每人應付 = `amount / 2`
- 付款人實付 = `amount`
- 累加「實付 − 應付」→ 得出誰應付給誰

---

## 網頁版如何連線

1. Firebase Console → 專案 → **建立 Web App**
2. 複製設定到 `CoupleLedgerWeb/.env`（見 `.env.example`）
3. 啟用 **Authentication → Email/Password**
4. 建立 **Firestore**，貼上 `firestore.rules` 並發布
5. 若 Console 提示建立索引，一鍵建立（或部署 `firestore.indexes.json`）

## 費用

| 方案 | 價格 |
|------|------|
| Spark（預設） | **$0** |
| 兩人記帳用量 | 遠低於免費額度 |

## 備份與匯出

Firebase Console → Firestore → 可手動匯出；beta 不必另建資料庫備份。
