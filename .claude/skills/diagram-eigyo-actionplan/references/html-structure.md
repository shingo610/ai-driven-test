# HTML構造ガイド（営業アクションプラン図解）

## 基本テンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【図解タイトル】- アクションプラン</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --eigyo-primary: hsl(199, 65%, 38%);
      --eigyo-accent: hsl(38, 92%, 42%);
      --eigyo-gradient: linear-gradient(115deg, #0f766e, #0369a1);
    }
    body { font-family: 'Noto Sans JP', sans-serif; }
    .header-gradient { background: var(--eigyo-gradient); }
    .section-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .term-explain {
      background: linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%);
      border-left: 4px solid #0284c7;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin: 1.5rem 0;
    }
    .term-word { color: #0369a1; }
    .hinabubble {
      position: relative;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-left: 0.25rem;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 2px solid #f59e0b;
    }
    .hinabubble::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 20px;
      border-width: 10px;
      border-style: solid;
      border-color: transparent #f59e0b transparent transparent;
    }
    .kachobubble {
      position: relative;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-left: 0.25rem;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #0284c7;
    }
    .kachobubble::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 20px;
      border-width: 10px;
      border-style: solid;
      border-color: transparent #0284c7 transparent transparent;
    }
    .badge-essential {
      background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .badge-recommended {
      background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .badge-optional {
      background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .toc {
      position: fixed;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      background: white;
      padding: 1rem;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-height: 80vh;
      overflow-y: auto;
      z-index: 50;
    }
    @media (max-width: 1280px) {
      .toc { display: none; }
    }
  </style>
</head>
<body class="bg-slate-50">
  <header class="header-gradient text-white py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl md:text-4xl font-bold">【タイトル】</h1>
      <p class="mt-2 text-lg opacity-95">次年度アクションプラン｜図解サマリー</p>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-4 py-8">
    <!-- セクションを配置 -->
  </main>

  <script>lucide.createIcons();</script>
</body>
</html>
```

---

## Lucide アイコン（営業・計画向け）

| 用途 | アイコン名 |
|------|-----------|
| 目標 | `target` |
| カレンダー・期限 | `calendar` |
| ユーザー・担当 | `user`, `users` |
| フロー | `arrow-right`, `git-branch` |
| チェック | `check-circle` |
| 注意 | `alert-circle` |
| ヒント | `lightbulb` |
| 旅行・移動 | `plane`, `map-pin` |
| 資料 | `file-text`, `presentation` |

**絵文字は使わない。** アイコンは `<i data-lucide="..." class="w-6 h-6">` で統一。

---

## ロードマップ（四半期・月の例）

```html
<div class="flex flex-col md:flex-row items-stretch justify-center gap-3 my-8">
  <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 flex-1 text-center">
    <i data-lucide="calendar" class="w-8 h-8 text-teal-700 mx-auto mb-2"></i>
    <div class="font-bold text-teal-900">Q1</div>
    <p class="text-sm text-slate-600 mt-1">重点テーマ・施策の要約</p>
  </div>
  <i data-lucide="arrow-right" class="w-8 h-8 text-slate-400 hidden md:block self-center"></i>
  <i data-lucide="arrow-down" class="w-8 h-8 text-slate-400 md:hidden self-center"></i>
  <div class="bg-sky-50 border border-sky-200 rounded-xl p-4 flex-1 text-center">
    <i data-lucide="calendar" class="w-8 h-8 text-sky-700 mx-auto mb-2"></i>
    <div class="font-bold text-sky-900">Q2</div>
    <p class="text-sm text-slate-600 mt-1">...</p>
  </div>
</div>
```

---

## 担当マトリクス（例）

```html
<div class="overflow-x-auto rounded-xl border border-slate-200">
  <table class="min-w-full text-sm">
    <thead class="bg-slate-100">
      <tr>
        <th class="px-4 py-2 text-left">施策</th>
        <th class="px-4 py-2 text-left">主担当</th>
        <th class="px-4 py-2 text-left">支援</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-slate-200">
        <td class="px-4 py-3">（例）既存顧客フォロー強化</td>
        <td class="px-4 py-3">営業</td>
        <td class="px-4 py-3">営業支援</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 数値・表の前に「読み方」を置く

コード例の代わりに、**表や数値の前に**必ず一文。

```html
<div class="mb-4 flex items-start gap-2">
  <i data-lucide="info" class="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5"></i>
  <p class="text-slate-600">
    この表は<strong>誰が窓口</strong>となり、<strong>いつまでに</strong>何を揃えるかを示しています。
  </p>
</div>
```
