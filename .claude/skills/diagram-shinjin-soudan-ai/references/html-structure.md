# HTML構造ガイド（新人伴走ダッシュボード図解）

## 基本テンプレート

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【図解タイトル】- 新人伴走ダッシュボード</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --buddy-primary: hsl(215, 75%, 40%);
      --buddy-accent: hsl(346, 78%, 44%);
      --buddy-gradient: linear-gradient(115deg, #0ea5e9, #2563eb);
    }
    body { font-family: 'Noto Sans JP', sans-serif; }
    .header-gradient { background: var(--buddy-gradient); }
    .section-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .term-explain {
      background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
      border-left: 4px solid #2563eb;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin: 1.5rem 0;
    }
    .minabubble {
      position: relative;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-left: 0.25rem;
      background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
      border: 2px solid #fb7185;
    }
    .minabubble::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 20px;
      border-width: 10px;
      border-style: solid;
      border-color: transparent #fb7185 transparent transparent;
    }
    .aibubble {
      position: relative;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-left: 0.25rem;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 2px solid #2563eb;
    }
    .aibubble::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 20px;
      border-width: 10px;
      border-style: solid;
      border-color: transparent #2563eb transparent transparent;
    }
    .badge-now {
      background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 700;
    }
    .badge-blocker {
      background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 700;
    }
    .badge-done {
      background: linear-gradient(135deg, #047857 0%, #10b981 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 700;
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
    @media (max-width: 1280px) { .toc { display: none; } }
  </style>
</head>
<body class="bg-slate-50">
  <header class="header-gradient text-white py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl md:text-4xl font-bold">【タイトル】</h1>
      <p class="mt-2 text-lg opacity-95">新人伴走ダッシュボード｜決定→精算</p>
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

## Lucide アイコン（新人伴走向け）

| 用途 | アイコン名 |
|------|-----------|
| 次の一手 | `list-todo`, `check-circle` |
| 期限 | `calendar` |
| 相手 | `user`, `users`, `phone`, `mail` |
| 進捗 | `git-branch`, `arrow-right` |
| 注意/ブロッカー | `alert-triangle`, `alert-circle` |
| 用語 | `lightbulb` |
| 書類 | `file-text` |
| お金 | `receipt`, `credit-card` |

**絵文字は使わない。** アイコンは `<i data-lucide="..." class="w-6 h-6">` で統一。

---

## 必須コンポーネント例

### 1) 次の一手（最大3つ）

```html
<div class="section-card" id="next-actions">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
      <i data-lucide="list-todo" class="w-6 h-6 text-white"></i>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-slate-800">次の一手（今日やること）</h2>
      <p class="text-slate-500">最大3つに絞る／期限と相手をセットで</p>
    </div>
  </div>

  <div class="grid gap-4">
    <div class="p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-sky-50 to-blue-50">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="font-bold text-slate-800 text-lg">① 仕入先に在庫確認</div>
          <div class="text-slate-600 mt-1">「いつまで確保できるか」も一緒に聞く</div>
        </div>
        <span class="badge-now">いまここ</span>
      </div>
      <div class="mt-3 grid md:grid-cols-3 gap-3 text-sm">
        <div class="flex items-center gap-2 text-slate-600"><i data-lucide="calendar" class="w-4 h-4"></i>期限: 今日 17:00（仮）</div>
        <div class="flex items-center gap-2 text-slate-600"><i data-lucide="user" class="w-4 h-4"></i>相手: 仕入先（ホテル）</div>
        <div class="flex items-center gap-2 text-slate-600"><i data-lucide="check-circle" class="w-4 h-4"></i>完了条件: 在庫OK + 期限回答</div>
      </div>
    </div>
  </div>
</div>
```

### 2) 進捗トラッカー（決定→精算）

```html
<div class="section-card" id="progress">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-xl flex items-center justify-center">
      <i data-lucide="git-branch" class="w-6 h-6 text-white"></i>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-slate-800">いまの位置（決定→精算）</h2>
      <p class="text-slate-500">工程に当てはめて、迷子を防ぐ</p>
    </div>
  </div>

  <div class="grid gap-3">
    <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200">
      <div class="flex items-center gap-3">
        <i data-lucide="check-circle" class="w-6 h-6 text-emerald-600"></i>
        <div class="font-bold text-slate-800">決定</div>
      </div>
      <span class="badge-done">完了</span>
    </div>
    <div class="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50">
      <div class="flex items-center gap-3">
        <i data-lucide="arrow-right" class="w-6 h-6 text-blue-700"></i>
        <div class="font-bold text-slate-800">手配</div>
      </div>
      <span class="badge-now">進行中</span>
    </div>
    <div class="flex items-center justify-between p-4 rounded-xl border border-rose-200 bg-rose-50">
      <div class="flex items-center gap-3">
        <i data-lucide="alert-triangle" class="w-6 h-6 text-rose-700"></i>
        <div class="font-bold text-slate-800">請求</div>
      </div>
      <span class="badge-blocker">未着手/要確認</span>
    </div>
  </div>
</div>
```

### 3) 確認すべき質問（テンプレ付き）

```html
<div class="section-card" id="questions">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
      <i data-lucide="message-square" class="w-6 h-6 text-white"></i>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-slate-800">確認すべき質問（聞けない時の壁打ち）</h2>
      <p class="text-slate-500">顧客/仕入先/社内に分ける。送れる文面にする</p>
    </div>
  </div>

  <div class="grid gap-6">
    <div class="p-4 rounded-xl border border-slate-200">
      <div class="font-bold text-slate-800 mb-2">顧客に聞く</div>
      <ul class="list-disc pl-5 text-slate-700 space-y-2">
        <li>人数はいつ確定できますか？（確定日が必要）</li>
        <li>お支払い方法は振込/カードのどちらですか？</li>
      </ul>
      <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700">
        <div class="font-bold mb-1">送れる文面（例）</div>
        <div>「お世話になっております。手配を進めるため、①人数確定の予定日 ②お支払い方法（振込/カード）をご教示ください。」</div>
      </div>
    </div>
  </div>
</div>
```
