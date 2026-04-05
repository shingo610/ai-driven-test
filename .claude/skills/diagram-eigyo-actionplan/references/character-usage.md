# キャラクター利用ガイド（ヒナ × 課長）

## 想定読者との関係

| 項目 | 内容 |
|------|------|
| 図解を見る人 | 課員全員（営業マン、営業支援） |
| 前提知識 | 旅行業務は分かるが、**課全体の方針の優先順位**は人によって差がある |
| ゴール | 各自が**自分の担当に落とし込んで動ける** |

---

## キャラクターの役割

| キャラクター | 役割 | 備考 |
|-------------|------|------|
| **ヒナ**（新人営業） | 現場の素朴な疑問・不安を代弁。「自分の席から何をすればいい？」を言語化 | 一人称「私」、丁寧語 |
| **課長** | 方針の意図、優先順位、会議で伝えたい一言を短く説明 | 一人称「私」、丁寧語。説教調にしすぎない |

**画像がない場合**: `w-12 h-12` の円に `bg-amber-100` + Lucide `user` をヒナ、`bg-sky-100` + `user` を課長で区別する（[html-structure.md](html-structure.md) のパターン）。

---

## 表情・トーンの使い分け（ヒナ）

| シーン | トーン | セリフの例 |
|--------|--------|-------------|
| 導入 | 戸惑い | 「文章だけだと、自分の担当がどこに当たるか拾いにくくて…」 |
| 中盤 | 確認 | 「つまり、四半期ごとに見るのはこの3つで合っていますか？」 |
| まとめ | 納得・次アクション | 「自分の顧客リストに戻したら、まず〇〇から手を付けます」 |

## 課長の話し方

- **短く**: 1吹き出しは2〜4文程度  
- **比喩は旅行・接客に寄せる**: 行程、窓口、チーム旅行の役割分担 など  
- **数字は「なぜその数字か」**を一言添える  

```
❌ 「戦略的に推進していく」
✅ 「今年は個人客のリピートが課題なので、架電の順番はリピート候補を先にします」
```

---

## 対話パターン（HTML）

### 1. 導入（困り → 方針）

```html
<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-amber-800"></i>
  </div>
  <div class="char-bubble hinabubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-amber-800">ヒナ:</span><br>
      次年度のプラン、文字ばかりで…自分の担当エリアはどこに書いてあるんでしょう？
    </p>
  </div>
</div>

<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-sky-800"></i>
  </div>
  <div class="char-bubble kachobubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-sky-800">課長:</span><br>
      まずは「全体の旅路」を一枚で掴んでください。あなたの担当は後半の<span class="font-bold">担当別の見取り図</span>に落としています。
    </p>
  </div>
</div>
```

### 2. まとめ（行動への橋渡し）

```html
<div class="flex items-start gap-4 mb-6">
  <div class="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
    <i data-lucide="user" class="w-7 h-7 text-sky-800"></i>
  </div>
  <div class="char-bubble kachobubble flex-1">
    <p class="text-lg">
      <span class="font-bold text-sky-800">課長:</span><br>
      覚えておいてほしいのはこの3つだけです。詳細は各自の顧客リストに写してください。
    </p>
  </div>
</div>
```

---

## 配置ルール

1. 対話は**上から順**（左右の固定レイアウトにしない）  
2. ヒナ → 課長の順で疑問が解けるようにする  
3. 余白は `gap-4`、`mb-6` で統一  

---

## 画像がある場合

課・会社のキャラクター画像があれば、`img` に差し替え可能。パスは `./images/...` を推奨。
