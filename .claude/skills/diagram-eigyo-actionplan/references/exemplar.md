# 模範解答パターン（営業アクションプラン図解）

## 成功する図解の構造（日次ダッシュボード）

```
1. ヘッダー（グラデーション）
   └─ タイトル + 「日次アクションダッシュボード」

2. 導入（ヒナ × 課長の対話）
   └─ ヒナ: 朝に判断できない困りごと
   └─ 課長: 今日の判断の順番（数字→優先→担当）

3. 「今日やること」（5分で決める）
   └─ チェックリスト（毎日/週次/月次/都度）
   └─ まず覚える3つ（必須/推奨/確認バッジ）

4. 用語解説ボックス
   └─ KPI、繁忙期、略語など初出をすべて

5. 本編セクション（section-card）
   └─ テーマごとに Lucide 付き見出し
   └─ 判断基準・担当表（誰にボールがあるか）
   └─ たとえ話（旅行・窓口・行程）を3つ以上

6. 担当別の見取り図
   └─ 営業／営業支援で「自分の矢印」が分かる表または図

7. まとめ（ヒナ × 課長）
   └─ 課長: 要点3つ
   └─ ヒナ: 今日の最初の一手の言語化

8. 目次（フローティング・デスクトップのみ）
```

---

## 「まず覚える3つ」の例（HTML断片）

```html
<div class="section-card">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-12 h-12 bg-gradient-to-br from-teal-600 to-sky-600 rounded-xl flex items-center justify-center">
      <i data-lucide="star" class="w-6 h-6 text-white"></i>
    </div>
    <div>
      <h2 class="text-2xl font-bold text-slate-800">まず覚える3つ</h2>
      <p class="text-slate-500">会議前にこれだけ押さえればOK</p>
    </div>
  </div>

  <div class="grid gap-4">
    <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-l-4 border-red-500">
      <div class="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="font-bold text-lg text-slate-800">数値目標の柱</span>
          <span class="badge-essential">必須</span>
        </div>
        <p class="text-slate-600">前年比・件数など、<strong>今年一番見る数字</strong>はどれか。</p>
      </div>
    </div>
    <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border-l-4 border-sky-500">
      <div class="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="font-bold text-lg text-slate-800">四半期のマイルストーン</span>
          <span class="badge-recommended">推奨</span>
        </div>
        <p class="text-slate-600">いつまでに<strong>何が揃っている状態</strong>か。</p>
      </div>
    </div>
    <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-l-4 border-slate-400">
      <div class="w-10 h-10 bg-slate-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="font-bold text-lg text-slate-800">自分の役割の線</span>
          <span class="badge-optional">確認</span>
        </div>
        <p class="text-slate-600">営業と営業支援の<strong>切り分け</strong>はどこか。</p>
      </div>
    </div>
  </div>
</div>
```

---

## たとえ話の展開パターン

### パターン1: ツアー行程表

「アクションプランは、**お客様にお渡しする行程表**と同じです。目的地（KGI）・日付（期限）・集合場所（担当）が揃っていないと、現地で迷子になります。」

### パターン2: カウンターとバックオフィス

「営業がカウンターなら、支援は舞台裏。**表で約束したこと**が裏で回るかをセットで見ます。」

### パターン3: 繁忙期のレーン分け

「空港のチェックインのように、**混む時期はレーン（優先順位）を決めないと全員が待たされます**。」

---

## 品質チェックリスト（作成後）

- [ ] 略語・社内用語に用語解説ボックスがある
- [ ] たとえ話が3つ以上ある
- [ ] ヒナ × 課長の対話が導入・中間・まとめにある
- [ ] 「まず覚える3つ」がある
- [ ] 「今日やること（チェックリスト）」が最上部にある
- [ ] 担当（営業／支援など）が一目で分かる
- [ ] Lucide のみ（絵文字なし）
- [ ] スマホで読める
- [ ] **見て5分で「今日の優先行動」が決まる**内容になっている

---

## ヒアリングSSOTとの対応

| ヒアリング | 図解での反映 |
|-----------|-------------|
| 課員が読者 | 用語の丁寧な言い換え、担当別セクション |
| 文字だけで伝わらない | ロードマップ、フロー、マトリクスを必須 |
| 成功定義：理解して行動 | 最後に「次の一歩」がヒナのセリフで明示 |
