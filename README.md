# instrument-training

初心者楽器奏者向けのピッチトレーニング Web アプリです。

## 技術スタック
- React + Vite + TypeScript
- Tailwind CSS
- Web Audio API (AnalyserNode + FFT + 自己相関)
- LocalStorage
- GitHub Pages 対応（`base: /instrument-training/`）

## 構成

```text
src/
  App.tsx
  components/
    DashboardScreen.tsx
    FingeringGuide.tsx
    HomeScreen.tsx
    PitchMeter.tsx
    PlayScreen.tsx
    ResultScreen.tsx
  constants/
    instruments.ts
  hooks/
    useAudioProcessor.ts
  types/
    music.ts
  utils/
    music.ts
    scoring.ts
    storage.ts
```

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## GitHub Pages デプロイ

1. GitHub リポジトリの **Settings > Pages** で **Build and deployment** の **Source** を **GitHub Actions** に設定します。
2. `main` ブランチに push すると `.github/workflows/deploy-pages.yml` が実行され、`dist/` を GitHub Pages にデプロイします。
