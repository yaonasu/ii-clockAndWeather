# ii-clockAndWeather

茄子モチーフのアナログ置時計、現在から24時間分の天気予報グラフ、3つのランチャーボタンを備えた**無料公開（広告・課金なし）**の常時表示対応 PWA アプリケーションです。

## 主な機能

- **2分割画面＆3分ごとの自動入替**: 横画面では左右2分割、縦画面では上下2分割で A面（置時計）と B面（天気・ランチャー）を配置し、3分ごとに即時入れ替わります。
- **茄子アナログ置時計（A面）**: 大きなアナログ文字盤とデジタル時刻・日付（曜日）を表示します。
- **24時間天気予報（B面）**: 現在から24時間分の気温（℃）・降水確率（%）の2軸折れ線グラフと1時間ごとのお天気アイコンを表示します。毎時0分に自動更新し、手動更新にも対応しています。
- **3つのランチャーボタン（B面）**: 表示名と Web URL を設定でき、初期値として「Gmail」「天気」「カレンダー」を備えています。`http:` / `https:` の Web URL のみを許可し、危険なスキームを拒否して新しいタブで開きます。
- **PWA・Wake Lock 対応**: ホーム画面へのインストール（アプリ名・`short_name`: `ii-clockAndWeather`）、オフライン時のキャッシュ表示、アプリ前面表示中の画面スリープ防止に対応しています。

## 天気データの提供元

- 天気予報データは **[Open-Meteo.com](https://open-meteo.com/)** の無料 API（非商用利用向け）から取得しています（ライセンス: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)）。
- Open-Meteo は気象庁（JMA）をはじめとする各国気象機関の公開予報モデルデータを利用しています。

## 使用技術

- **フロントエンド**: React 19, TypeScript, Tailwind CSS v4, Lucide React
- **ビルド・PWA**: Vite, `vite-plugin-pwa` (Workbox)
- **フォント**: Google Fonts（Outfit, Noto Sans JP, JetBrains Mono）

## 開発・ビルド

API キーや `.env` ファイルの設定は不要です。依存関係の再現性確保のため `bun.lock` を同梱しています。

```bash
# 依存関係のインストール（bun.lock 準拠）
bun install --frozen-lockfile

# 開発サーバー起動（ルートパス / で動作）
bun run dev

# TypeScript 型チェック
bun run lint

# 本番ビルド（GitHub Pages サブパス /ii-clockAndWeather/ 向けに出力）
bun run build
```

## GitHub Pages への公開・自動デプロイ

- リポジトリ名 `ii-clockAndWeather` での **GitHub Pages** サブパス公開（`https://<GitHubユーザー名>.github.io/ii-clockAndWeather/`）を想定しています。
- 本番ビルド（`mode === 'production'`）では Vite の `base` および PWA Manifest（`id` / `start_url` / `scope` / `icons`）が `/ii-clockAndWeather/` に設定されます。
- 既存の `localStorage` キー（`ii-clock-settings-v1` / `ii-clock-weather-cache-v1`）は後方互換性のため維持されています。
- `.github/workflows/deploy.yml` により、`main` ブランチへの push または GitHub Actions 画面からの手動実行で自動的に型チェック・本番ビルド・GitHub Pages へのデプロイが行われます。
- GitHub リポジトリ側では **Settings → Pages → Build and deployment → Source → GitHub Actions** を選択してください。

## 画像・アイコンについて

- ヘッダー画像（`public/assets/aistudio/___91ac5eb5.png`）およびそれをもとに生成した PWA アイコン一式は、過去に Gemini などの生成 AI を利用して制作した画像に背景透過処理を施したものであり、開発者の GitHub アイコンとしても使用しているものです。
- 制作に使用した具体的な生成 AI サービス・プランおよび当時の利用規約は特定できていないため、権利関係は完全には確認済みではありません。

## ライセンス・第三者権利表記

- 本アプリは無料で一般公開していますが、**本アプリ独自のソースコードおよび独自素材についてはオープンソースライセンスを付与しておらず（`UNLICENSED`）、自由な再利用・改変・再配布・商用利用は許諾していません**。
- 上記の権利留保は本アプリ独自部分にのみ適用され、使用している第三者のオープンソースソフトウェア（OSS）、天気予報データ（Open-Meteo / CC BY 4.0）、および Google Fonts 等の第三者ライセンス・利用条件を制限するものではありません。各第三者の権利は従来どおり尊重されます。
- 第三者の OSS パッケージ、天気データ、フォント、アイコン等のライセンスおよび著作権表示の詳細は [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) を参照してください。
