# キャラクター利用ガイド（新人ミナ × 指導社員AI）

## 想定読者との関係

| 項目 | 内容 |
|------|------|
| 図解を見る人 | 新人（旅行会社の業務知識ゼロ） |
| 状況 | いま一人で作業中、聞けない/聞きづらい |
| ゴール | 不安を下げつつ「次に何をすればいいか」を確定し、作業を前に進める |

---

## キャラクターの役割

| キャラクター | 役割 | 備考 |
|-------------|------|------|
| **ミナ**（新人） | いまの状況・不安・詰まりを短く言う。「何が分からないかも分からない」を代弁 | 一人称「私」。丁寧語。弱音は短く |
| **指導社員AI** | 工程に当てはめて整理し、次の一手を3つ以内で提示。聞くべき質問を用意し、仮置き案も出す | 一人称「私」。丁寧語。上から目線にしない |

**画像がない場合**: `w-12 h-12` の円に Lucide `user` を使い、色で区別する（[html-structure.md](html-structure.md) のパターン）。

---

## トーンの使い分け（ミナ）

| シーン | トーン | セリフの例 |
|--------|--------|-------------|
| 導入 | 不安 | 「いま何から手をつければいいか分からなくなりました…」 |
| 中盤 | 混乱 | 「“精算”って、どこまでやれば終わりですか？」 |
| まとめ | 行動 | 「まずはこの3つをやって、揃ったら次に進みます」 |

## 指導社員AIの話し方

- **短く**: 1吹き出しは2〜4文程度  
- **断定しない**: 会社ルール差が出る所は「多くの会社では〜」に留める  
- **“次の一手”を必ず出す**: 具体的な作業（電話/メール/依頼/確認）  
- **完了条件を言語化**: 「何が揃えばOKか」  

```
❌ 「とりあえず手配を進めてください」
✅ 「今日の一手は3つです。①仕入先に在庫確認（いつまで確保できるかも聞く）②お客様に人数確定の期限を確認 ③社内の値付けルールを確認。完了条件は“在庫OK・人数確定期限・見積の金額が出る”です」
```

---

## 対話パターン（HTML）

### 1. 導入（不安 → 次の一手）

```html
<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-rose-800"></i>
  </div>
  <div class="char-bubble minabubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-rose-800">ミナ:</span><br>
      いま一人で進めていて…次に何をすればいいか分からなくなりました。
    </p>
  </div>
</div>

<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-sky-800"></i>
  </div>
  <div class="char-bubble aibubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-sky-800">指導社員AI:</span><br>
      大丈夫です。まずは工程に当てはめて、今日の一手を3つまでに絞りましょう。期限と相手も一緒に決めます。
    </p>
  </div>
</div>
```

### 2. 中盤（詰まり → 質問テンプレ）

```html
<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="message-square" class="w-7 h-7 text-sky-800"></i>
  </div>
  <div class="char-bubble aibubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-sky-800">指導社員AI:</span><br>
      いま聞けない前提で、聞くべき質問を“そのまま送れる文面”にしておきます。送れない時は、いったん安全な仮置き案で止めましょう。
    </p>
  </div>
</div>
```

### 3. まとめ（行動の確定）

```html
<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="check-circle" class="w-7 h-7 text-rose-800"></i>
  </div>
  <div class="char-bubble minabubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-rose-800">ミナ:</span><br>
      まずは「次の一手3つ」をやって、揃ったら次の工程に進みます。分からない所は質問テンプレを使います。
    </p>
  </div>
</div>
```

---

## 配置ルール

1. 対話は**上から順**（左右固定にしない）  
2. 「不安 → 整理 → 次の一手 → 質問テンプレ → まとめ」の順で安心して進める  
3. 余白は `gap-4`、`mb-6` で統一  
