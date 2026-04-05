# HTML構造ガイド（インバウンドトレンド図解）

## 基本テンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【図解タイトル】- インバウンドトレンド</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --inbound-primary: hsl(242, 56%, 42%);
      --inbound-accent: hsl(39, 92%, 47%);
      --inbound-gradient: linear-gradient(115deg, #4f46e5, #0ea5e9);
    }
    body { font-family: 'Noto Sans JP', sans-serif; }
    .header-gradient { background: var(--inbound-gradient); }
    .section-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .term-explain {
      background: linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%);
      border-left: 4px solid #4f46e5;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin: 1.5rem 0;
    }
    .term-word { color: #4338ca; }
    .nowmebubble {
      position: relative;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-left: 0.25rem;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 2px solid #f59e0b;
    }
    .nowmebubble::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 20px;
      border-width: 10px;
      border-style: solid;
      border-color: transparent #f59e0b transparent transparent;
    }
    .senpaibubble {
      position: relative;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-left: 0.25rem;
      background: linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%);
      border: 2px solid #4f46e5;
    }
    .senpaibubble::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 20px;
      border-width: 10px;
      border-style: solid;
      border-color: transparent #4f46e5 transparent transparent;
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
      background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
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
      <p class="mt-2 text-lg opacity-95">インバウンド｜トレンド図解ダッシュボード</p>
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

## Lucide アイコン（インバウンド・トレンド向け）

| 用途 | アイコン名 |
|------|-----------|
| トレンド | `trending-up` |
| スポット | `map-pin` |
| 交通・移動 | `plane`, `train`, `car` |
| カレンダー・季節 | `calendar` |
| 客層・人物 | `user`, `users` |
| 会話 | `message-circle` |
| 注意点 | `alert-circle` |
| ヒント | `lightbulb` |
| 参照元 | `link`, `file-text` |
| チェック | `check-circle` |

**絵文字は使わない。** アイコンは `<i data-lucide="..." class="w-6 h-6">` で統一。

---

## 「今日のインプット（10分）」チェックリスト（例）

```html
<div class="section-card" id="today">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 bg-gradient-to-br from-indigo-600 to-sky-600 rounded-xl flex items-center justify-center">
      <i data-lucide="check-circle" class="w-6 h-6 text-white"></i>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-slate-800">今日のインプット（10分）</h2>
      <p class="text-slate-500">通勤時間で“引き出し”を作る</p>
    </div>
  </div>

  <div class="grid gap-3">
    <label class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <input type="checkbox" class="mt-1 w-5 h-5">
      <span class="text-slate-700"><strong>結論を1行</strong>で言える（何が新しい？）</span>
    </label>
    <label class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <input type="checkbox" class="mt-1 w-5 h-5">
      <span class="text-slate-700"><strong>覚える3つ</strong>（スポット／理由／提案）を押さえた</span>
    </label>
    <label class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <input type="checkbox" class="mt-1 w-5 h-5">
      <span class="text-slate-700"><strong>30秒会話</strong>（結論→理由→例）が言える</span>
    </label>
  </div>
</div>
```

---

## 「いつ・誰に強いか」ミニ表（例）

```html
<div class="overflow-x-auto rounded-xl border border-slate-200">
  <table class="min-w-full text-sm">
    <thead class="bg-slate-100">
      <tr>
        <th class="px-4 py-2 text-left">観点</th>
        <th class="px-4 py-2 text-left">想定</th>
        <th class="px-4 py-2 text-left">メモ</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t border-slate-200">
        <td class="px-4 py-3">季節</td>
        <td class="px-4 py-3">（例）春・秋が強い</td>
        <td class="px-4 py-3">混雑回避の代替案も用意</td>
      </tr>
      <tr class="border-t border-slate-200">
        <td class="px-4 py-3">客層</td>
        <td class="px-4 py-3">（例）初回訪日／リピーター</td>
        <td class="px-4 py-3">断定せず「傾向」で書く</td>
      </tr>
    </tbody>
  </table>
</div>
```
