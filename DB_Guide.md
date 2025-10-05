# 🚀 Fuwariプロジェクト セットアップガイド

## 📋 セットアップ手順（7ステップ）

### **ステップ1: Docker Desktopをインストール**
https://www.docker.com/products/docker-desktop/ からダウンロードしてインストールしてください。

インストール後、Docker Desktopを起動してください（アイコンが緑色になるまで待つ）。

---

### **ステップ2: コードを取得**
```bash
git pull origin main
```

---

### **ステップ3: .envファイルを作成**
プロジェクトのルートフォルダに `.env` ファイルを作成し、Teamsで送った内容をコピペしてください：

```env
Teamsで送った内容をコピペしてください
```

---

### **ステップ4: パッケージをインストール**
```bash
npm install
```

---

### **ステップ5: MySQLを起動**
```bash
docker-compose up -d mysql
```

10秒ほど待ってください。

---

### **ステップ6: データベースをセットアップ（重要！）**
```bash
npm run db:init
```

このコマンドは2つのことを実行します：
1. ✅ テーブルを作成（users, products, orders）
2. ✅ サンプルデータを挿入

成功すると以下のメッセージが表示されます：
```
🎉 Initial setup completed!
```

その後、migrationを実行（初回は何もしない）:
```bash
npm run migrate
```

**サンプルアカウント:**
- 管理者: `admin@fuwari.com` / `admin123`
- ユーザー: `user@example.com` / `user123`

---

### **ステップ7: 開発サーバーを起動**
```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## 🔄 データベースの変更について

### **データベース構造を変更する時:**

1. 新しいmigrationファイルを作成:
```bash
npm run migrate:create add_categories_table
```

2. 生成されたファイル（`migrations/YYYYMMDDHHMMSS_add_categories_table.sql`）を編集してSQLを追加

3. Migrationをテスト:
```bash
npm run migrate
```

4. 変更をコミット:
```bash
git add migrations/
git commit -m "Add categories table"
git push
```

### **メンバーが変更を取得:**

```bash
git pull
npm run migrate
```

**重要:** `npm run migrate` は**新しいmigrationだけ**実行します。既存のデータは保持されます！✨

---

## 🛠️ 便利なコマンド

### **初期セットアップ（テーブル + サンプルデータ）:**
```bash
npm run db:init
```

### **Migrationを実行（変更を適用）:**
```bash
npm run migrate
```

### **データベース完全リセット:**
```bash
npm run db:reset
```

または手動で:
```bash
docker-compose down -v
docker-compose up -d mysql
# 10秒待ってから
npm run db:init
npm run migrate
```

---

## ✅ チェックリスト

コピペして実行してください：

```bash
# 1. コードを取得
git pull origin main

# 2. パッケージをインストール
npm install

# 3. MySQLを起動
docker-compose up -d mysql

# 4. 10秒待つ（重要！）

# 5. データベースをセットアップ
npm run db:init

# 6. Migrationを実行（初回は何もしない）
npm run migrate

# 7. 開発サーバーを起動
npm run dev
```

---

## ❌ エラーが出た場合

### **"Port 3306 already in use"**
以下を実行してください：
```bash
# MySQLサービスを停止
net stop MySQL80

# 再度MySQLを起動
docker-compose up -d mysql
```

---

### **"Cannot connect to MySQL"**
以下を実行してください：
```bash
# Dockerを再起動
docker-compose down
docker-compose up -d mysql

# 10秒待ってから
npm run db:init
```

---

### **"Table doesn't exist"**
以下を実行してください：
```bash
npm run db:init
```

---

### **それでも解決しない場合**
以下を実行してリセット：
```bash
docker-compose down -v
docker-compose up -d mysql
npm run db:init
npm run migrate
npm run dev
```

---

## 🛑 よく使うコマンド

### **サーバーを停止**
```bash
Ctrl + C
```

### **MySQLを停止**
```bash
docker-compose down
```

### **全部をリセット**
```bash
docker-compose down -v
docker-compose up -d mysql
npm run db:init
npm run migrate
npm run dev
```

**セットアップ完了！お疲れ様でした！ 🎉**