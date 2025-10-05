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
npm run migrate
```

成功すると以下のメッセージが表示されます：
```
✅ Migration completed successfully!
```

---

### **ステップ7: 開発サーバーを起動**
```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

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
npm run migrate

# 6. 開発サーバーを起動
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
npm run migrate
```

---

### **"Table doesn't exist"**
以下を実行してください：
```bash
npm run migrate
```

---

### **それでも解決しない場合**
以下を実行してリセット：
```bash
docker-compose down -v
docker-compose up -d mysql
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
npm run migrate
npm run dev
```

**セットアップ完了！お疲れ様でした！ 🎉**