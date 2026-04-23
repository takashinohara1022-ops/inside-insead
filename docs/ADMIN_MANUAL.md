# Inside INSEAD 管理者マニュアル

このマニュアルでは、サイトの運用に必要な環境変数、キャッシュ更新、メール設定、Google 連携、デプロイについて説明します。

---

## 1. 環境変数

### 必須（Google 連携）

| 変数名 | 説明 |
|--------|------|
| `GOOGLE_CLIENT_EMAIL` | Google サービスアカウントのメールアドレス |
| `GOOGLE_PRIVATE_KEY` | サービスアカウントの秘密鍵（`-----BEGIN PRIVATE KEY-----` ～ `-----END PRIVATE KEY-----`） |
| `PROFILE_SHEET_ID` | 在校生プロフィール用 Google スプレッドシート ID |
| `BLOG_SHEET_ID` | ブログ投稿用 Google スプレッドシート ID |
| `DRIVE_IMAGE_FOLDER_ID` | メイン画像フォルダ（Drive）の ID |
| `GALLERY_IMAGE_FOLDER_ID` または `GALLERY_UPLOAD_FOLDER_ID` | ギャラリー画像フォルダ（Drive）の ID |

### 任意（Google 連携）

| 変数名 | 説明 |
|--------|------|
| `GALLERY_UPLOAD_SHEET_ID` | ギャラリー投稿用スプレッドシート ID（未設定時はデフォルト値を使用） |
| `CONTENT_DOCS_FOLDER_ID` | ページコンテンツ用 Google ドキュメントの親フォルダ ID |

### コーヒーチャット（メール通知）

| 変数名 | 説明 |
|--------|------|
| `EMAIL_USER` | SMTP 送信元メールアドレス（例: Gmail） |
| `EMAIL_PASS` | アプリパスワード（Gmail の場合は「2段階認証」→「アプリパスワード」で発行） |
| `NOTIFICATION_EMAIL` | 申込通知先メールアドレス（例: Google グループ） |
| `EMAIL_FROM_NAME` | 送信者表示名（例: INSEAD Coffee Chat） |

### コーヒーチャット（オプション）

| 変数名 | 説明 |
|--------|------|
| `SMTP_HOST` | SMTP ホスト（デフォルト: `smtp.gmail.com`） |
| `SMTP_PORT` | SMTP ポート（デフォルト: `587`） |
| `EMAIL_ALERT_WEBHOOK_URL` | メール送信失敗時に通知する Webhook URL（Slack など） |

### キャッシュ更新（Revalidate）

| 変数名 | 説明 |
|--------|------|
| `CONTENT_REVALIDATE_TOKEN` | 全コンテンツ更新 API の Bearer トークン |
| `HISTORY_REVALIDATE_TOKEN` | 歴史ページ更新用トークン（上記のいずれかと同一可） |
| `CULTURE_REVALIDATE_TOKEN` | カルチャーページ更新用トークン（上記のいずれかと同一可） |

---

## 2. キャッシュ更新（Revalidate）

### 全サイトコンテンツの更新

1. 管理画面（`/internal/revalidate`）にアクセスする
2. 「管理者トークン」欄に `CONTENT_REVALIDATE_TOKEN`（または `HISTORY_REVALIDATE_TOKEN` / `CULTURE_REVALIDATE_TOKEN`）の値を入力する
3. **「全サイトコンテンツを更新」** ボタンをクリックする

### 更新対象

- About 系ページ（history, culture, programs, campuses, exchange）
- Student Life 系ページ（yearly-schedule, academic-terms, academic-classes, academic-faculty, career, social-clubs, social-events）
- Google ドキュメント・Drive のキャッシュ

### API 経由での更新

```bash
curl -X POST https://your-site.com/api/content/revalidate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. メール設定（Gmail）

1. Google アカウントで **2段階認証** を有効にする
2. **アプリパスワード** を発行する（Google アカウント → セキュリティ → 2段階認証 → アプリパスワード）
3. `EMAIL_USER` に Gmail アドレス、`EMAIL_PASS` にアプリパスワードを設定する
4. アプリパスワードにスペースが含まれる場合は、環境変数内でそのまま入力してよい（コード側で自動除去）

### メール送信失敗時のアラート

`EMAIL_ALERT_WEBHOOK_URL` を設定すると、メール送信失敗時に Webhook へ POST されます。Slack の Incoming Webhook などを指定できます。

---

## 4. Google 連携

### サービスアカウントの共有

以下のリソースを、サービスアカウント（`GOOGLE_CLIENT_EMAIL`）と **編集者** または **閲覧者** で共有してください。

- **スプレッドシート**: PROFILE_SHEET_ID, BLOG_SHEET_ID, GALLERY_UPLOAD_SHEET_ID、Coffee Chat 用シート
- **Drive フォルダ**: DRIVE_IMAGE_FOLDER_ID, GALLERY_IMAGE_FOLDER_ID / GALLERY_UPLOAD_FOLDER_ID
- **Google ドキュメント**: ページコンテンツ用ドキュメントが入った親フォルダ（CONTENT_DOCS_FOLDER_ID）

### ページコンテンツと Google ドキュメントの対応

`lib/pageContentDocs.ts` の `FIXED_DOC_ID_BY_PATH` で、パスごとに参照する Google ドキュメント ID を固定できます。フォルダ内のドキュメント名から自動マッチする場合もあります。

| パス | ドキュメント ID（例） |
|------|----------------------|
| /about/campuses | 1NjIZKgbP9TP0lWDWTfBG8hedOp5puKUZ5GNtI9192vA |
| /about/exchange | 1Gx0yxAO0t8zMX9vM0KSfNM_eevEy5xVOqtnGmzue3SI |
| /about/programs | 1bmsGtRqg9GCVvsNfhL5jmD5ATCJDlQonPaYywhUfl2g |
| /student-life/academic-faculty | 1MoO0Vbb9-DyOYzJRwSf1QNGvCEpWxVkgQIJ5EVf6MIo |
| /student-life/yearly-schedule | 1A1xbglfyfzvdOFyUh2PrgTTs4ZvzNaHogEFKnCcZo2Y |
| その他 | `lib/pageContentDocs.ts` を参照 |

---

## 5. 投稿フォーム（Google Forms）の設定

ギャラリー・ブログ・プロフィールの投稿は、Google フォームをスプレッドシートに接続して行います。

### ギャラリー投稿フォーム

- **接続先シート**: `GALLERY_UPLOAD_SHEET_ID` のスプレッドシート
- **推奨列名**: アップロード者名、アップロード日、写真コメント、画像（Drive リンクまたはファイルアップロード）

### ブログ投稿フォーム

- **接続先シート**: `BLOG_SHEET_ID` のスプレッドシート
- **推奨列名**: 投稿日、投稿者、タイトル、本文、テーマ/ハッシュタグ、写真や動画、Youtube

#### ブログ本文内の表（マークダウン）

サイトでは GitHub Flavored Markdown の表記で表を表示します。**ヘッダ行の直後に区切り行（`|---|`）が必須**です。区切り行が無い場合でも、先頭のパイプ行の直後に自動で区切り行を挿入する処理がありますが、複雑な表では次の形式を明示すると確実です。

```markdown
| 列A | 列B |
|-----|-----|
| 値1 | 値2 |
```

### プロフィール登録フォーム

- **接続先シート**: `PROFILE_SHEET_ID` のスプレッドシート
- **推奨列名**: 氏名イニシャル、INSEAD卒業年度、INSEAD卒業月、ホームキャンパス、入学時社会人歴、キャリアバックグラウンド大分類 など

フォーム作成後、在校生・卒業生にフォーム URL を共有してください。詳細は `docs/USER_MANUAL.md` を参照してください。

---

## 6. デプロイ

### ビルド・起動

```bash
npm install
npm run build
npm run start
```

### Vercel へのデプロイ

1. リポジトリを Vercel に接続する
2. 環境変数を Vercel のダッシュボードで設定する（上記「環境変数」を参照）
3. デプロイ後、`/internal/revalidate` でキャッシュ更新を実行できることを確認する

### 注意事項

- `GOOGLE_PRIVATE_KEY` は改行を `\n` でエスケープした 1 行形式でも設定可能です
- Vercel では環境変数の値に改行を含められないため、`\n` 形式で入力してください
