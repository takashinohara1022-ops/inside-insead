# Git へアップロードする手順

## 事前確認

- **Git のインストール**: [Git for Windows](https://git-scm.com/download/win) を入れ、インストール時に「PATH に追加」を選んでおく。
- **.env.local はアップロードしません**: `.gitignore` に `.env*` が含まれているため、APIキー等はリポジトリに含まれません。

---

## 1. リポジトリをまだ作っていない場合（初回）

プロジェクトフォルダで **Git Bash** または **コマンドプロンプト** を開き、次を実行してください。

```bash
cd "c:\Users\takas\OneDrive\デスクトップ\inside-insead"

# Git リポジトリの初期化（まだの場合）
git init

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Next.js gallery and blog app"
```

---

## 2. GitHub などにリモートを追加してプッシュ

### GitHub で新しいリポジトリを作成した場合

GitHub で「New repository」を作成し、**URL をコピー**したうえで、プロジェクトフォルダで次を実行します。

```bash
cd "c:\Users\takas\OneDrive\デスクトップ\inside-insead"

# リモートを追加（URL は自分のリポジトリに置き換え）
git remote add origin https://github.com/あなたのユーザー名/inside-insead.git

# メインブランチ名を設定（GitHub のデフォルトに合わせる）
git branch -M main

# プッシュ
git push -u origin main
```

---

## 3. すでにリポジトリがある場合（2回目以降）

```bash
cd "c:\Users\takas\OneDrive\デスクトップ\inside-insead"

git add .
git commit -m "更新内容の短い説明"
git push
```

---

## トラブルシュート

- **「git が認識されない」**  
  Git for Windows をインストールしたあと、**新しい**ターミナルを開き直してください。

- **認証で聞かれた場合**  
  - HTTPS: GitHub のユーザー名と **Personal Access Token**（パスワードの代わり）を入力。  
  - SSH: あらかじめ `ssh-keygen` で鍵を作成し、GitHub の「SSH keys」に登録したうえで、リモート URL を `git@github.com:ユーザー名/inside-insead.git` 形式にします。

- **「nothing added to commit」**  
  変更がなく、または `.gitignore` で除外されているだけの可能性があります。`git status` で確認してください。
