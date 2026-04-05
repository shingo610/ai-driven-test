# キャラクター利用ガイド（いまの私 × インバウンド先輩）

## 想定読者との関係

| 項目 | 内容 |
|------|------|
| 図解を見る人 | 自分（旅行営業、インバウンドは初学者） |
| 前提知識 | 旅行手配・営業は分かるが、インバウンドの「流行の型」「会話の切り口」が未整備 |
| ゴール | 通勤時間に読み、**会話で引き出せる形（30秒）**まで落とす |

---

## キャラクターの役割

| キャラクター | 役割 | 備考 |
|-------------|------|------|
| **いまの私** | 迷いを短く言語化。「結局なに？誰向け？いつ使う？」を聞く | 一人称「私」。丁寧語。弱音は短く |
| **インバウンド先輩** | 要点を3つに圧縮し、会話テンプレを提示。断定を避ける | 一人称「私」。丁寧語。上から目線にしない |

**画像がない場合**: `w-12 h-12` の円に Lucide `user` を使い、色で区別する（[html-structure.md](html-structure.md) のパターン）。

---

## トーンの使い分け（いまの私）

| シーン | トーン | セリフの例 |
|--------|--------|-------------|
| 導入 | 混乱 | 「記事は読んだのに、結局どこが“新しい”のか一言で言えません…」 |
| 中盤 | 確認 | 「このトレンドは、初回訪日向けとリピーター向け、どちらの話ですか？」 |
| まとめ | 行動 | 「明日の商談では、30秒版のこの言い方から入ってみます」 |

## 先輩の話し方

- **短く**: 1吹き出しは2〜4文程度  
- **断定しない**: 「傾向」「〜と言われる」「ケースが多い」  
- **会話に変換**: “使う言い方”を必ず一つ出す（30秒版）  

```
❌ 「最近は○○が流行っている」
✅ 「今は○○が“選ばれやすい”と言われます。理由は△△で、提案では□□の一言が効きます」
```

---

## 対話パターン（HTML）

### 1. 導入（迷い → 3点整理）

```html
<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-amber-800"></i>
  </div>
  <div class="char-bubble nowmebubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-amber-800">いまの私:</span><br>
      情報は多いのに、会話にできる“ひと言”に落ちません…どこを掴めばいいですか？
    </p>
  </div>
</div>

<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-indigo-800"></i>
  </div>
  <div class="char-bubble senpaibubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-indigo-800">インバウンド先輩:</span><br>
      「どこ（スポット）」「なぜ（理由）」「誰にどう提案するか」の3点に切ると、会話に変わります。まずは覚える3つだけ押さえましょう。
    </p>
  </div>
</div>
```

### 2. まとめ（30秒会話へ）

```html
<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-indigo-800"></i>
  </div>
  <div class="char-bubble senpaibubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-indigo-800">インバウンド先輩:</span><br>
      30秒で言うなら「結論→理由→例」です。最後に“次の一言”を用意しておけば、商談でも社内でも詰まりません。
    </p>
  </div>
</div>
```

---

## 配置ルール

1. 対話は**上から順**（左右固定にしない）  
2. 「迷い → 3点整理 → 会話テンプレ」の順で解けるようにする  
3. 余白は `gap-4`、`mb-6` で統一  
