import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import mainVenueHintsJson from "./data/mainVenueHints.json" with { type: "json" };
import { postMainVenueFetchOfficial, postMainVenueSuggest } from "./venueHintsApi";

/** PDF「全体進捗スケジュール JC世界大会2027」と同じ月軸（2026年4〜12月 + 2027年1〜12月） */
const ganttMonthLabels: { year: number; label: string }[] = [
  ...[4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({ year: 2026, label: `${m}月` })),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({ year: 2027, label: `${m}月` })),
];

const ganttMonthCount = ganttMonthLabels.length;

const DEFAULT_EVENT_AXIS_INDEX = Math.max(
  0,
  ganttMonthLabels.findIndex((m) => m.year === 2027 && parseInt(m.label, 10) === 11)
);
const DEFAULT_PARTY_VENUE_AXIS_INDEX = Math.max(
  0,
  ganttMonthLabels.findIndex((m) => m.year === 2026 && parseInt(m.label, 10) === 6)
);
const DEFAULT_MAIN_VENUE_AXIS_INDEX = Math.max(
  0,
  ganttMonthLabels.findIndex((m) => m.year === 2026 && parseInt(m.label, 10) === 8)
);

/** デモ：選択可能な開催地（都道府県） */
const EVENT_PREFECTURE_OPTIONS = [
  "東京都",
  "大阪府",
  "愛知県",
  "福岡県",
  "北海道",
  "沖縄県",
  "京都府",
  "宮城県",
] as const;

const DEFAULT_EVENT_PREFECTURE: (typeof EVENT_PREFECTURE_OPTIONS)[number] = "東京都";

type RegionVendorSets = {
  mainVenues: string[];
  partyVenues: string[];
  hotels: string[];
  buses: string[];
};

/** 開催地ごとのメイン会場・パーティー会場・ホテル10社・バス10社（デモデータ） */
const REGION_VENDORS: Record<string, RegionVendorSets> = {
  東京都: {
    mainVenues: [
      "東京国際フォーラム ホールA",
      "日本武道館",
      "東京ビッグサイト 南展示棟",
      "八王子市民会館 メインホール",
      "有明アリーナ メインアリーナ",
    ],
    partyVenues: [
      "帝国ホテル 孔雀の間",
      "プリンスパークタワー 桜の間",
      "汐留シティセンター 披露宴会場",
      "品川プリンス 大宴会場",
      "ホテルニューオータニ 葵の間",
    ],
    hotels: [
      "東京ロイヤルプラザ（公式宿）",
      "新宿駅南口タワーホテル",
      "丸の内グランドステイ",
      "お台場ベイフロントホテル",
      "上野パークサイドイン",
      "渋谷スクランブルビューホテル",
      "浅草リバーサイド旅館",
      "羽田エアポートホテル連携枠",
      "池袋サンシャインタワー宿泊",
      "六本木コンベンションホテル",
    ],
    buses: [
      "都営バス貸切サービス",
      "東京バスリンク株式会社",
      "首都高速ライナー貸切",
      "多摩バスセンター",
      "江戸川観光バス",
      "横浜東京連絡バス",
      "成田空港リムジン提携枠",
      "大型ハイヤー東京",
      "ミニバス手配東京",
      "夜行バスネットワーク東日本",
    ],
  },
  大阪府: {
    mainVenues: [
      "グランキューブ大阪 メイン",
      "フェスティバルホール",
      "インテックス大阪 展示棟",
      "岸和田市立文化会館 大ホール",
      "大阪城ホール",
    ],
    partyVenues: [
      "リーガロイヤル大阪 蘭の間",
      "ハービスPLAZA 弧の間",
      "大阪マリオット 宴会場",
      "梅田スカイビル 星の間",
      "シェラトングランド大阪 天保山宴会場",
    ],
    hotels: [
      "大阪ベイタワーホテル（公式）",
      "難波グランドステイ",
      "本町ビジネスインターナショナル",
      "天王寺アーバンホテル",
      "京橋リバーサイドホテル",
      "新大阪駅前プラザホテル",
      "堺東ウィークリーマンション枠",
      "関空アクセスホテル合同",
      "万博記念公園周辺宿泊",
      "USJオフィシャルパートナーホテル枠",
    ],
    buses: [
      "近畿貸切バス株式会社",
      "大阪バスセンター",
      "関西空港リムジン連携",
      "なんばライナーバス",
      "阪神間観光バス",
      "京都大阪連絡貸切",
      "ミニバス大阪手配",
      "大型ハイヤー関西",
      "夜行バスネットワーク西日本",
      "地方線バス大阪事業部",
    ],
  },
  愛知県: {
    mainVenues: [
      "愛知県芸術劇場 大ホール",
      "ポートメッセなごや",
      "名古屋国際会議場",
      "豊田市文化会館 メイン",
      "日本ガイシホール",
    ],
    partyVenues: [
      "名古屋マリオット 桜坂",
      "JRセントラルタワーズ 披露宴",
      "熱田神宮会館 特別室",
      "金城ふ頭イベントホール",
      "ホテルナゴヤキャッスル 大宴会場",
      "バンテリンドーム",
      "IGアリーナ",
    ],
    hotels: [
      "名古屋駅前ロイヤルタワー（公式）",
      "栄スカイホテル",
      "金山ベイエリアホテル",
      "中部国際空港連携宿泊",
      "豊田コンベンションホテル",
      "岡崎城下町イン",
      "刈谷製造業向けビジホ合同",
      "津島ワーキングステイ",
      "西尾抹茶の里温泉旅館",
      "知多半島リゾートホテル",
    ],
    buses: [
      "名鉄観光バス貸切",
      "愛知バスセンター",
      "中部空港アクセスバス",
      "トヨタ工場見学バス連携",
      "三河湾クルーズ連絡バス",
      "ミニバス名古屋手配",
      "大型ハイヤー中部",
      "夜行バス東海ネットワーク",
      "地方線バス愛知",
      "イベント専用シャトル名古屋",
    ],
  },
  福岡県: {
    mainVenues: [
      "福岡国際会議場 メインホール",
      "マリンメッセ福岡",
      "北九州ソレイユホール",
      "久留米シティプラザホール",
      "北九州メディアドーム メイン",
    ],
    partyVenues: [
      "ヒルトン福岡シーホーク 披露宴",
      "天神イムズ スカイバンケット",
      "太宰府迎賓館 藤の間",
      "門司港レトロ会館",
      "リーガロイヤル小倉 披露宴",
    ],
    hotels: [
      "博多駅前公式宿泊タワー",
      "天神ビジネスホテルプラザ",
      "糸島リゾートヴィラ",
      "北九州小倉ステイ",
      "久留米温泉旅館連携",
      "空港直結ホテル福岡",
      "キャナルシティ周辺宿",
      "大濠公園ビューホテル",
      "宗像大社参拝者宿",
      "唐津湾マリーナホテル",
    ],
    buses: [
      "西鉄バス貸切福岡",
      "九州バスリンク",
      "福岡空港リムジン提携",
      "北九州貸切センター",
      "長崎方面連絡バス",
      "ミニバス福岡手配",
      "大型ハイヤー九州",
      "観光バス博多",
      "イベントシャトル福岡",
      "離島アクセス連携バス",
    ],
  },
  北海道: {
    mainVenues: [
      "札幌文化芸術劇場 hitaru",
      "北海道立総合体育センター",
      "函館アリーナ メイン",
      "旭川市民文化会館",
      "真駒内セキスイハイム アイスアリーナ",
    ],
    partyVenues: [
      "札幌プリンスホテル 雪の間",
      "小樽運河倉庫イベント",
      "ニセコリゾート バンケット",
      "帯広ガーデンホテル 披露宴",
      "札幌東急REIホテル 大宴会場",
    ],
    hotels: [
      "札幌駅北口公式ホテル",
      "すすきのタワーイン",
      "新千歳空港直結宿泊",
      "函館山ロープウェイ近接ホテル",
      "富良野ファームステイ枠",
      "知床ウトロ温泉旅館",
      "釧路湿原エコツアー宿",
      "旭川モール前ビジホ",
      "稚内フェリー連携宿",
      "登別温泉郷ホテル",
    ],
    buses: [
      "北海道バス貸切センター",
      "札幌観光バス",
      "新千歳空港連絡バス",
      "道東長距離貸切",
      "ニセコシャトル連携",
      "ミニバス札幌手配",
      "大型ハイヤー北海道",
      "冬季専用バス北海道",
      "イベントシャトル札幌",
      "地方線バス北海道",
    ],
  },
  沖縄県: {
    mainVenues: [
      "沖縄コンベンションセンター",
      "那覇市民会館 メイン",
      "宜野湾コンベンションシティ",
      "石垣島多目的ホール",
      "那覇文化芸術劇場 てだこ大ホール",
    ],
    partyVenues: [
      "ハイアットリージェンシー那覇 披露宴",
      "美ら海水族館前テラス",
      "古宇利島リゾートバンケット",
      "首里城公園 特設会場",
      "沖縄ハーバービューホテル 珊瑚の間",
    ],
    hotels: [
      "那覇国際通り公式ホテル",
      "恩納村リゾートタワー",
      "石垣シーサイドホテル",
      "宮古島ビーチヴィラ",
      "久米島ダイビングベース宿",
      "美ら海リゾート連携宿",
      "糸満漁港前ビジホ",
      "名護オレンジバレーイン",
      "与那国島ゲストハウス枠",
      "北谷アメリカンビレッジ周辺宿",
    ],
    buses: [
      "沖縄バス貸切",
      "那覇空港リムジン連携",
      "本島一周観光バス",
      "離島フェリー連絡バス",
      "ミニバス沖縄手配",
      "大型ハイヤー沖縄",
      "リゾートシャトル沖縄",
      "イベント専用バス那覇",
      "北部エコツアーバス",
      "南部戦跡めぐりバス",
    ],
  },
  京都府: {
    mainVenues: [
      "ロームシアター京都 メイン",
      "京都会館",
      "みやこめっせ 西ホール",
      "宇治市文化会館 大ホール",
      "京都市勧業館 みやこめっせ 東館",
    ],
    partyVenues: [
      "京都ホテルオークラ 鶴の間",
      "嵐山モンキパークビュー会場",
      "南禅寺順正 書院",
      "伏見桃山城キャッスルランド",
      "琵琶湖マリオットホテル グランドボールルーム",
    ],
    hotels: [
      "京都駅前タワーホテル（公式）",
      "四条河原町グランドステイ",
      "嵐山温泉旅館連携",
      "舞鶴港ビューホテル",
      "宇治抹茶の里イン",
      "亀岡サンガスタジアム近接宿",
      "福知山城下町旅館",
      "天橋立リゾートホテル",
      "宮津伊根舟屋ステイ",
      "南丹市自然体験拠点宿",
    ],
    buses: [
      "京都バス貸切センター",
      "京阪観光バス",
      "大阪京都連絡貸切",
      "嵐山シャトル連携",
      "ミニバス京都手配",
      "大型ハイヤー京都",
      "夜行バス京都発着",
      "イベントシャトル京都",
      "地方線バス京都",
      "観光バス洛北",
    ],
  },
  宮城県: {
    mainVenues: [
      "セキスイハイムスーパーアリーナ",
      "仙台国際センター",
      "石巻市総合体育館",
      "多賀城文化会館 メイン",
      "ゼビオアリーナ仙台",
    ],
    partyVenues: [
      "ホテルメトロポリタン仙台 披露宴",
      "松島離宮 宴会場",
      "秋保温泉 蘭亭",
      "仙台うみの杜水族館前テラス",
      "ホテル藤江 仙台駅前 披露宴",
    ],
    hotels: [
      "仙台駅東口公式ホテル",
      "勾当台公園ビューホテル",
      "松島温泉旅館連携",
      "石巻復興記念ステイ",
      "秋保温泉郷ホテル",
      "仙台空港アクセスホテル",
      "名取モール前ビジホ",
      "気仙沼港ホテル",
      "大崎古川城下町イン",
      "蔵王温泉スキー基地宿",
    ],
    buses: [
      "宮城交通貸切バス",
      "仙台空港リムジン連携",
      "松島観光ルートバス",
      "ミニバス仙台手配",
      "大型ハイヤー東北",
      "イベントシャトル仙台",
      "石巻・気仙沼支援バス",
      "地方線バス宮城",
      "冬期蔵王シャトル",
      "太平洋沿岸ロング貸切",
    ],
  },
};

/**
 * メイン会場マスタ（src/data/mainVenueHints.json）。
 * フロントは同一JSONを参照。本番ではバックエンドがDB/CMSから供給してもよい。
 */
type MainVenueOfficialHint = {
  officialUrl: string;
  suggestedLeadMonths: number;
  priority?: number;
  integrationNotes?: string;
};

const MAIN_VENUE_OFFICIAL_HINTS = mainVenueHintsJson as Record<string, MainVenueOfficialHint>;

function getMainVenueOfficialHint(name: string): MainVenueOfficialHint | undefined {
  return MAIN_VENUE_OFFICIAL_HINTS[name.trim()];
}

/** マスタに登録された会場のみ。複数選択時は「いちばん早い予約開始月」に合わせる */
function suggestMainVenueAxisIndexFromOfficialHints(
  venueNames: readonly string[],
  eventAxisIndex: number
): number | null {
  const em = Math.max(
    0,
    Math.min(ganttMonthCount - 1, Math.floor(Number.isFinite(eventAxisIndex) ? eventAxisIndex : 0))
  );
  const starts: number[] = [];
  for (const raw of venueNames) {
    const h = getMainVenueOfficialHint(raw);
    if (h) starts.push(Math.max(0, em - h.suggestedLeadMonths));
  }
  if (starts.length === 0) return null;
  return Math.min(...starts);
}

function getRegionVendors(pref: string): RegionVendorSets {
  return REGION_VENDORS[pref] ?? REGION_VENDORS[DEFAULT_EVENT_PREFECTURE];
}

function getMainVenueOptions(pref: string): string[] {
  return getRegionVendors(pref).mainVenues;
}

function getPartyVenueOptions(pref: string): string[] {
  return getRegionVendors(pref).partyVenues;
}

function getLodgingHotelOptions(pref: string): string[] {
  return getRegionVendors(pref).hotels;
}

function getBusCompanyOptions(pref: string): string[] {
  return getRegionVendors(pref).buses;
}

function defaultLeadByOptionNames(names: readonly string[], base: number, cycle: number): Record<string, number> {
  const m: Record<string, number> = {};
  names.forEach((name, i) => {
    m[name] = base + (i % cycle);
  });
  return m;
}

function dedupeNonEmpty(names: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const t = raw.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** 読点・カンマ・改行で区切った追加会場名 */
function parseVenueExtras(text: string): string[] {
  return dedupeNonEmpty(text.split(/[,、\n]+/));
}

/** マスタ候補のみ。空なら先頭1件 */
function normalizeCatalogMulti(names: readonly string[], options: readonly string[]): string[] {
  const d = dedupeNonEmpty(names).filter((n) => options.includes(n));
  return d.length > 0 ? options.filter((o) => d.includes(o)) : [options[0]];
}

/** メイン／パーティー：自由入力も可。空なら先頭1件 */
function normalizeVenueNameList(names: readonly string[], options: readonly string[]): string[] {
  const d = dedupeNonEmpty(names);
  if (d.length === 0) return [options[0]];
  return d;
}

function formatVenueList(names: readonly string[]): string {
  return dedupeNonEmpty(names).join("／");
}

function rebuildVendorLeadMap(
  prev: Record<string, number>,
  names: readonly string[],
  base: number,
  cycle: number
): Record<string, number> {
  const m: Record<string, number> = {};
  names.forEach((name, i) => {
    m[name] = prev[name] ?? base + (i % cycle);
  });
  return m;
}

function buildInitialLeadsForPrefecture(pref: string): {
  lodgingLeadByHotel: Record<string, number>;
  busLeadByCompany: Record<string, number>;
} {
  const hotels = getLodgingHotelOptions(pref);
  const buses = getBusCompanyOptions(pref);
  return {
    lodgingLeadByHotel: defaultLeadByOptionNames(hotels, 12, 6),
    busLeadByCompany: defaultLeadByOptionNames(buses, 4, 5),
  };
}

/** 左3列幅（colgroup・sticky・バー内グリッドを同一値で揃え、月列のずれを防ぐ） */
const GANTT_TABLE_STYLE = {
  "--gantt-c1": "7rem",
  "--gantt-c2": "11rem",
  "--gantt-c3": "4.5rem",
} as CSSProperties;

type GanttTaskRow = {
  item: string;
  assignee: string;
  startIdx: number;
  duration: number;
  barKind?: "main" | "settle";
  /** false のとき検討期間の帯を出さない */
  showConsiderPeriod?: boolean;
};

type ScheduleSettings = {
  /** 開催地（都道府県）— 候補マスタの切り替えに使用 */
  eventPrefecture: string;
  /** 開催月＝タイムライン列インデックス */
  eventAxisIndex: number;
  /** 弊社で全体管理ブロックをガントに出すか（他社担当なら非表示） */
  eventOurCompany: boolean;
  /** メイン会場予約の開始月＝列インデックス */
  mainVenueAxisIndex: number;
  /** 弊社でメイン会場ブロックを出すか */
  mainVenueOurCompany: boolean;
  /** メイン会場名（複数可・ガント項目に表示） */
  mainVenueNames: string[];
  /** パーティー会場予約の開始月＝列インデックス */
  partyVenueAxisIndex: number;
  partyOurCompany: boolean;
  /** パーティー会場名（複数可） */
  partyVenueNames: string[];
  /** 宿泊（宿泊施設確保）開始：開催の N か月前（フォールバック・互換） */
  lodgingLeadMonths: number;
  /** ホテル10社それぞれの「開催の N か月前から手配着手」 */
  lodgingLeadByHotel: Record<string, number>;
  lodgingOurCompany: boolean;
  /** 選択中の宿泊ホテル（デモ10社から複数可） */
  lodgingHotelNames: string[];
  /** 貸切バス予約開始：開催の N か月前（フォールバック・互換） */
  busLeadMonths: number;
  /** バス会社10社それぞれの「開催の N か月前から予約着手」 */
  busLeadByCompany: Record<string, number>;
  /** 輸送ブロック全体を弊社担当とみなすか（バス手配含む） */
  busOurCompany: boolean;
  /** 選択中の貸切バス会社（デモ10社から複数可） */
  busCompanyNames: string[];
  /** 輸送計画：バス予約の N か月前から着手 */
  transportPlanMonthsBeforeBus: number;
  /** 検討期間：各作業開始の N か月前から */
  considerLeadMonths: number;
};

function cloneScheduleDraft(s: ScheduleSettings): ScheduleSettings {
  return {
    ...s,
    lodgingLeadByHotel: { ...s.lodgingLeadByHotel },
    busLeadByCompany: { ...s.busLeadByCompany },
  };
}

const _initialLeadsTokyo = buildInitialLeadsForPrefecture(DEFAULT_EVENT_PREFECTURE);
const _tokyoHotels = getLodgingHotelOptions(DEFAULT_EVENT_PREFECTURE);
const _tokyoBuses = getBusCompanyOptions(DEFAULT_EVENT_PREFECTURE);

const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  eventPrefecture: DEFAULT_EVENT_PREFECTURE,
  eventAxisIndex: DEFAULT_EVENT_AXIS_INDEX,
  eventOurCompany: true,
  mainVenueAxisIndex:
    suggestMainVenueAxisIndexFromOfficialHints(
      [getMainVenueOptions(DEFAULT_EVENT_PREFECTURE)[0]],
      DEFAULT_EVENT_AXIS_INDEX
    ) ?? DEFAULT_MAIN_VENUE_AXIS_INDEX,
  mainVenueOurCompany: false,
  mainVenueNames: [getMainVenueOptions(DEFAULT_EVENT_PREFECTURE)[0]],
  partyVenueAxisIndex: DEFAULT_PARTY_VENUE_AXIS_INDEX,
  partyOurCompany: true,
  partyVenueNames: [getPartyVenueOptions(DEFAULT_EVENT_PREFECTURE)[0]],
  lodgingLeadByHotel: { ..._initialLeadsTokyo.lodgingLeadByHotel },
  lodgingLeadMonths: _initialLeadsTokyo.lodgingLeadByHotel[_tokyoHotels[0]],
  lodgingOurCompany: true,
  lodgingHotelNames: [_tokyoHotels[0]],
  busLeadByCompany: { ..._initialLeadsTokyo.busLeadByCompany },
  busLeadMonths: _initialLeadsTokyo.busLeadByCompany[_tokyoBuses[0]],
  busOurCompany: true,
  busCompanyNames: [_tokyoBuses[0]],
  transportPlanMonthsBeforeBus: 3,
  considerLeadMonths: 2,
};

/** ヘッダーから開く単項目モーダル */
type ScheduleFieldModal = "event" | "mainVenue" | "party" | "lodging" | "bus";

function axisOptionLabel(i: number): string {
  const m = ganttMonthLabels[i];
  return m ? `${m.year}年${m.label}` : "";
}

type VendorCardRow = { name: string; startLabel: string };

/** ヘッダー宿泊カード：ホテルごとの予約開始月ラベル */
function lodgingHotelCardRows(s: ScheduleSettings, eventMonthIndex: number): VendorCardRow[] {
  const hotelOpts = getLodgingHotelOptions(s.eventPrefecture);
  const selected = normalizeCatalogMulti(s.lodgingHotelNames, hotelOpts);
  const em = Math.max(0, Math.min(ganttMonthCount - 1, eventMonthIndex));
  return selected.map((h) => {
    const lead = s.lodgingLeadByHotel[h] ?? s.lodgingLeadMonths;
    const idx = Math.max(0, em - lead);
    return { name: h, startLabel: axisOptionLabel(idx) };
  });
}

/** ヘッダーバスカード：会社ごとの予約開始月ラベル */
function busCompanyCardRows(s: ScheduleSettings, eventMonthIndex: number): VendorCardRow[] {
  const busOpts = getBusCompanyOptions(s.eventPrefecture);
  const selected = normalizeCatalogMulti(s.busCompanyNames, busOpts);
  const em = Math.max(0, Math.min(ganttMonthCount - 1, eventMonthIndex));
  return selected.map((b) => {
    const lead = s.busLeadByCompany[b] ?? s.busLeadMonths;
    const idx = Math.max(0, em - lead);
    return { name: b, startLabel: axisOptionLabel(idx) };
  });
}

/** 公式サイト用。https を省略した入力にも対応 */
function normalizeExternalUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t.includes("://") ? t : `https://${t}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

function computeScheduleIndices(s: ScheduleSettings) {
  const eventMonthIndex = Math.max(0, Math.min(ganttMonthCount - 1, s.eventAxisIndex));
  const settleMonthIndex = Math.min(ganttMonthCount - 1, Math.max(0, eventMonthIndex + 1));
  const hotelOpts = getLodgingHotelOptions(s.eventPrefecture);
  const busOpts = getBusCompanyOptions(s.eventPrefecture);
  const selectedHotels = normalizeCatalogMulti(s.lodgingHotelNames, hotelOpts);
  const selectedBuses = normalizeCatalogMulti(s.busCompanyNames, busOpts);
  const lodgingStarts = selectedHotels.map((h) => {
    const lead = s.lodgingLeadByHotel[h] ?? s.lodgingLeadMonths;
    return Math.max(0, eventMonthIndex - lead);
  });
  const busStarts = selectedBuses.map((b) => {
    const lead = s.busLeadByCompany[b] ?? s.busLeadMonths;
    return Math.max(0, eventMonthIndex - lead);
  });
  const lodgingStartIndex =
    lodgingStarts.length > 0
      ? Math.min(...lodgingStarts)
      : Math.max(0, eventMonthIndex - s.lodgingLeadMonths);
  const busReservationStartIndex =
    busStarts.length > 0 ? Math.min(...busStarts) : Math.max(0, eventMonthIndex - s.busLeadMonths);
  const partyVenueStartIndex = Math.max(0, Math.min(ganttMonthCount - 1, s.partyVenueAxisIndex));
  const mainVenueStartIndex = Math.max(0, Math.min(ganttMonthCount - 1, s.mainVenueAxisIndex));
  const transportPlanStartIndex = Math.max(0, busReservationStartIndex - s.transportPlanMonthsBeforeBus);
  return {
    eventMonthIndex,
    settleMonthIndex,
    lodgingStartIndex,
    partyVenueStartIndex,
    mainVenueStartIndex,
    busReservationStartIndex,
    transportPlanStartIndex,
    ganttMonthCount,
  };
}

type GanttSectionId = "overall" | "mainVenue" | "lodging" | "party" | "transport" | "pr" | "other";

type GanttSection = {
  id: GanttSectionId;
  name: string;
  rows: GanttTaskRow[];
};

function buildGanttSections(ix: ReturnType<typeof computeScheduleIndices>): GanttSection[] {
  const {
    settleMonthIndex,
    lodgingStartIndex,
    partyVenueStartIndex,
    mainVenueStartIndex,
    busReservationStartIndex,
    transportPlanStartIndex,
    ganttMonthCount: mc,
  } = ix;
  return [
    {
      id: "overall",
      name: "全体管理",
      rows: [
        { item: "業務進捗管理", assignee: "Aさん", startIdx: 0, duration: mc, barKind: "main" },
        { item: "予算管理", assignee: "Aさん", startIdx: 0, duration: 5, barKind: "main" },
        { item: "精算", assignee: "Aさん", startIdx: settleMonthIndex, duration: 1, barKind: "settle" },
      ],
    },
    {
      id: "mainVenue",
      name: "メイン会場",
      rows: [
        {
          item: "メイン会場予約",
          assignee: "Dさん",
          startIdx: mainVenueStartIndex,
          duration: 6,
          barKind: "main",
        },
        { item: "精算", assignee: "Dさん", startIdx: settleMonthIndex, duration: 1, barKind: "settle" },
      ],
    },
    {
      id: "lodging",
      name: "参加者等の宿泊対策",
      rows: [
        {
          item: "宿泊施設確保",
          assignee: "Bさん",
          startIdx: lodgingStartIndex,
          duration: 12,
          barKind: "main",
        },
        { item: "参加申込要領原稿作成", assignee: "Cさん", startIdx: lodgingStartIndex + 1, duration: 4, barKind: "main" },
        { item: "申込システム構築", assignee: "Cさん", startIdx: lodgingStartIndex + 2, duration: 7, barKind: "main" },
        { item: "申込受付・変更取消対応", assignee: "Cさん", startIdx: lodgingStartIndex + 7, duration: 9, barKind: "main" },
        {
          item: "参加確認書配布、参加費請求・集金",
          assignee: "Bさん",
          startIdx: lodgingStartIndex + 12,
          duration: 4,
          barKind: "main",
        },
        { item: "精算", assignee: "Bさん", startIdx: settleMonthIndex, duration: 1, barKind: "settle" },
      ],
    },
    {
      id: "party",
      name: "パーティー",
      rows: [
        {
          item: "パーティー会場予約",
          assignee: "Dさん",
          startIdx: partyVenueStartIndex,
          duration: 6,
          barKind: "main",
        },
        { item: "レイアウト作成", assignee: "Dさん", startIdx: partyVenueStartIndex + 6, duration: 5, barKind: "main" },
        { item: "料理・飲み物", assignee: "Dさん", startIdx: partyVenueStartIndex + 8, duration: 5, barKind: "main" },
        { item: "進行スケジュール作成", assignee: "Dさん", startIdx: partyVenueStartIndex + 10, duration: 5, barKind: "main" },
        { item: "アトラクション・ステージ演出作成", assignee: "Dさん", startIdx: partyVenueStartIndex + 7, duration: 7, barKind: "main" },
        { item: "看板作成", assignee: "Eさん", startIdx: partyVenueStartIndex + 12, duration: 3, barKind: "main" },
        { item: "スタッフ調整", assignee: "Eさん", startIdx: partyVenueStartIndex + 13, duration: 3, barKind: "main" },
        { item: "備品調整", assignee: "Eさん", startIdx: partyVenueStartIndex + 13, duration: 3, barKind: "main" },
        { item: "精算", assignee: "Dさん", startIdx: settleMonthIndex, duration: 1, barKind: "settle" },
      ],
    },
    {
      id: "transport",
      name: "参加者等の輸送対策",
      rows: [
        {
          item: "輸送計画策定・事業視察調整",
          assignee: "Eさん",
          startIdx: transportPlanStartIndex,
          duration: 8,
          barKind: "main",
        },
        {
          item: "貸切バス手配",
          assignee: "Eさん",
          startIdx: busReservationStartIndex,
          duration: 6,
          barKind: "main",
        },
        {
          item: "貸切バス事業者との調整",
          assignee: "Eさん",
          startIdx: busReservationStartIndex + 1,
          duration: 6,
          barKind: "main",
        },
        {
          item: "看板作成",
          assignee: "Eさん",
          startIdx: busReservationStartIndex + 3,
          duration: 4,
          barKind: "main",
        },
        {
          item: "スタッフ調整",
          assignee: "Eさん",
          startIdx: busReservationStartIndex + 4,
          duration: 3,
          barKind: "main",
        },
        {
          item: "備品調整",
          assignee: "Eさん",
          startIdx: busReservationStartIndex + 4,
          duration: 3,
          barKind: "main",
        },
        { item: "精算", assignee: "Eさん", startIdx: settleMonthIndex, duration: 1, barKind: "settle" },
      ],
    },
    {
      id: "pr",
      name: "国内外からの誘客対策",
      rows: [
        { item: "ＰＲ内容調整", assignee: "Cさん", startIdx: 2, duration: 9, barKind: "main" },
        { item: "ＰＲ実施", assignee: "Cさん", startIdx: 5, duration: 13, barKind: "main" },
        { item: "精算", assignee: "Cさん", startIdx: settleMonthIndex, duration: 1, barKind: "settle" },
      ],
    },
    {
      id: "other",
      name: "その他の独自対策",
      rows: [
        {
          item: "終了報告書作成",
          assignee: "Aさん",
          startIdx: settleMonthIndex,
          duration: 1,
          barKind: "main",
          showConsiderPeriod: false,
        },
        { item: "プロモーション", assignee: "Cさん", startIdx: 7, duration: 10, barKind: "main" },
        { item: "精算", assignee: "Aさん", startIdx: settleMonthIndex, duration: 1, barKind: "settle" },
      ],
    },
  ];
}

function isScheduleSectionOnOurGantt(id: GanttSectionId, s: ScheduleSettings): boolean {
  switch (id) {
    case "overall":
      return s.eventOurCompany;
    case "mainVenue":
      return s.mainVenueOurCompany;
    case "lodging":
      return s.lodgingOurCompany;
    case "party":
      return s.partyOurCompany;
    case "transport":
      return s.busOurCompany;
    default:
      return true;
  }
}

function GanttBar({
  startIdx,
  duration,
  total,
  barKind = "main",
  highlightMonthIdx,
  showConsiderPeriod = true,
  considerLeadMonths,
}: {
  startIdx: number;
  duration: number;
  total: number;
  barKind?: "main" | "settle";
  highlightMonthIdx: number;
  showConsiderPeriod?: boolean;
  considerLeadMonths: number;
}) {
  const pct = 100 / total;
  /** 検討期間：作業開始の N か月前から（設定値・タイムライン先頭で短くなる場合あり） */
  const considerMonths =
    showConsiderPeriod && barKind === "main" && duration > 0
      ? Math.min(Math.max(0, considerLeadMonths), Math.max(0, startIdx))
      : 0;
  const considerStartIdx = startIdx - considerMonths;

  return (
    <div className="relative h-8 w-full min-w-0">
      <div
        className="absolute inset-0 box-border grid"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`box-border min-w-0 ${
              i === highlightMonthIdx ? "bg-rose-200/65" : "bg-slate-50/50"
            }`}
            style={
              i > 0
                ? { boxShadow: "inset 1px 0 0 0 rgb(226 232 240)" }
                : undefined
            }
          />
        ))}
      </div>
      {considerMonths > 0 && (
        <div
          className="absolute top-1 bottom-1 z-[1] overflow-hidden rounded-sm ring-1 ring-indigo-400/35"
          style={{
            left: `${considerStartIdx * pct}%`,
            width: `${considerMonths * pct}%`,
            minWidth: "4px",
          }}
          title={
            considerLeadMonths <= 0
              ? "検討期間なし"
              : `検討期間（開始月の${considerLeadMonths}か月前から）`
          }
        >
          <div className="h-full w-full bg-indigo-300/95" />
        </div>
      )}
      {duration > 0 && (
        <div
          className="absolute top-1 bottom-1 z-[2] overflow-hidden rounded-sm ring-1 ring-slate-600/15"
          style={{
            left: `${startIdx * pct}%`,
            width: `${duration * pct}%`,
            minWidth: duration > 0 ? "4px" : 0,
          }}
        >
          {barKind === "settle" ? (
            <div className="h-full w-full bg-amber-400/90" />
          ) : duration === 1 ? (
            /* 1か月のみ：グラデーションだと中央が濁るため、左半分＝開始（緑）・右半分＝終了（赤） */
            <div className="flex h-full w-full">
              <div className="min-w-0 flex-1 bg-emerald-500" title="開始月" />
              <div className="min-w-0 flex-1 bg-rose-500" title="終了月" />
            </div>
          ) : (
            <div className="flex h-full w-full">
              {Array.from({ length: duration }, (_, seg) => {
                const isFirst = seg === 0;
                const isLast = seg === duration - 1;
                let segmentClass = "bg-sky-500/90";
                if (isFirst) segmentClass = "bg-emerald-500";
                else if (isLast) segmentClass = "bg-rose-500";
                return (
                  <div
                    key={seg}
                    className={`min-w-0 flex-1 ${segmentClass}`}
                    title={isFirst ? "開始月" : isLast ? "終了月" : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const summaryCards = [
  { label: "全タスク数", value: "48" },
  { label: "完了", value: "19" },
  { label: "進捗率", value: "39.6%" },
  { label: "遅延", value: "4" },
  { label: "期限間近", value: "6" },
  { label: "未設定", value: "2" },
];

const alerts = [
  {
    level: "critical",
    message: "『最終名簿提出』が期限超過しています。",
  },
  {
    level: "warning",
    message: "懇親会あり案件ですが『席次案作成』が未着手です。",
  },
  {
    level: "warning",
    message: "エクスカーションあり案件ですが『雨天代替案準備』が未設定です。",
  },
];

const tasks = [
  {
    category: "全体統括",
    name: "キックオフ",
    assignee: "Aさん",
    dependency: "-",
    startDate: "2026-05-01",
    dueDate: "2026-05-02",
    plannedEnd: "2026-05-02",
    actualEnd: "2026-05-02",
    status: "完了",
    priority: "高",
    condition: "案件開始後すぐ",
    memo: "顧客・社内体制共有済み",
  },
  {
    category: "宿泊",
    name: "宿泊施設候補選定",
    assignee: "Bさん",
    dependency: "キックオフ",
    startDate: "2026-05-03",
    dueDate: "2026-05-08",
    plannedEnd: "2026-05-08",
    actualEnd: "-",
    status: "進行中",
    priority: "高",
    condition: "開催地・予算確定",
    memo: "3施設比較中",
  },
  {
    category: "輸送",
    name: "台数試算",
    assignee: "Eさん",
    dependency: "想定人数確定",
    startDate: "2026-07-10",
    dueDate: "2026-07-12",
    plannedEnd: "2026-07-12",
    actualEnd: "-",
    status: "未着手",
    priority: "中",
    condition: "参加人数の暫定確定",
    memo: "",
  },
  {
    category: "懇親会",
    name: "席次案作成",
    assignee: "Aさん",
    dependency: "最終人数確定",
    startDate: "2026-08-01",
    dueDate: "2026-08-03",
    plannedEnd: "2026-08-03",
    actualEnd: "-",
    status: "未着手",
    priority: "高",
    condition: "最終人数確定",
    memo: "VIP席あり",
  },
  {
    category: "エクスカーション",
    name: "雨天代替案準備",
    assignee: "Dさん",
    dependency: "行程案作成",
    startDate: "2026-08-05",
    dueDate: "2026-08-08",
    plannedEnd: "2026-08-08",
    actualEnd: "-",
    status: "保留",
    priority: "中",
    condition: "観光実施あり",
    memo: "候補地選定待ち",
  },
  {
    category: "誘客",
    name: "申込フォーム準備",
    assignee: "Cさん",
    dependency: "募集要項作成",
    startDate: "2026-06-01",
    dueDate: "2026-06-03",
    plannedEnd: "2026-06-03",
    actualEnd: "-",
    status: "確認待ち",
    priority: "高",
    condition: "募集要項の承認",
    memo: "デザイン確認待ち",
  },
];

function getStatusClass(status: string) {
  switch (status) {
    case "完了":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "進行中":
      return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
    case "確認待ち":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    case "保留":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    default:
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
  }
}

function getAlertClass(level: string) {
  switch (level) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

export default function ProjectScheduleMockPage() {
  const [schedule, setSchedule] = useState<ScheduleSettings>(DEFAULT_SCHEDULE_SETTINGS);
  const [scheduleFieldModal, setScheduleFieldModal] = useState<ScheduleFieldModal | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleSettings | null>(null);

  const indices = useMemo(() => computeScheduleIndices(schedule), [schedule]);
  const eventMonthLabel = useMemo(
    () => axisOptionLabel(indices.eventMonthIndex),
    [indices.eventMonthIndex]
  );
  const mainVenueStartLabel = useMemo(
    () => axisOptionLabel(indices.mainVenueStartIndex),
    [indices.mainVenueStartIndex]
  );
  const partyVenueStartLabel = useMemo(
    () => axisOptionLabel(indices.partyVenueStartIndex),
    [indices.partyVenueStartIndex]
  );
  const lodgingCardRows = useMemo(
    () => lodgingHotelCardRows(schedule, indices.eventMonthIndex),
    [schedule, indices.eventMonthIndex]
  );
  const busCardRows = useMemo(
    () => busCompanyCardRows(schedule, indices.eventMonthIndex),
    [schedule, indices.eventMonthIndex]
  );
  const ganttSectionsData = useMemo(() => {
    const raw = buildGanttSections(indices);
    return raw.filter((sec) => isScheduleSectionOnOurGantt(sec.id, schedule));
  }, [indices, schedule]);

  const [conferenceName, setConferenceName] = useState("JC世界大会2027");
  const [conferenceNameModalOpen, setConferenceNameModalOpen] = useState(false);
  const [conferenceNameDraft, setConferenceNameDraft] = useState("");

  const [officialHpUrl, setOfficialHpUrl] = useState("");
  const [officialHpModalOpen, setOfficialHpModalOpen] = useState(false);
  const [officialHpDraft, setOfficialHpDraft] = useState("");
  const [officialHpError, setOfficialHpError] = useState<string | null>(null);

  const [prefectureModalOpen, setPrefectureModalOpen] = useState(false);
  const [prefectureDraft, setPrefectureDraft] = useState<string>(DEFAULT_EVENT_PREFECTURE);

  const [meetingNotes, setMeetingNotes] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [mainVenueApiBusy, setMainVenueApiBusy] = useState(false);
  const [mainVenueApiMessage, setMainVenueApiMessage] = useState<string | null>(null);
  const [mainVenueHtmlExcerpt, setMainVenueHtmlExcerpt] = useState<string | null>(null);

  function handleAudioChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setAudioFile(f ?? null);
  }

  function clearAudio() {
    setAudioFile(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
  }

  function openScheduleFieldModal(kind: ScheduleFieldModal) {
    setScheduleDraft(cloneScheduleDraft(schedule));
    setScheduleFieldModal(kind);
    if (kind === "mainVenue") {
      setMainVenueApiMessage(null);
      setMainVenueHtmlExcerpt(null);
    }
  }

  function clampAxisIndex(i: number) {
    return Math.max(0, Math.min(ganttMonthCount - 1, Math.floor(Number.isFinite(i) ? i : 0)));
  }

  function applyDraftEventMonth() {
    if (!scheduleDraft) return;
    setSchedule((s) => ({
      ...s,
      eventAxisIndex: clampAxisIndex(scheduleDraft.eventAxisIndex),
      eventOurCompany: scheduleDraft.eventOurCompany,
    }));
  }

  function applyDraftMainVenueMonth() {
    if (!scheduleDraft) return;
    const opts = getMainVenueOptions(scheduleDraft.eventPrefecture);
    const names = normalizeVenueNameList(scheduleDraft.mainVenueNames, opts);
    setSchedule((s) => ({
      ...s,
      mainVenueAxisIndex: clampAxisIndex(scheduleDraft.mainVenueAxisIndex),
      mainVenueOurCompany: scheduleDraft.mainVenueOurCompany,
      mainVenueNames: names,
    }));
  }

  function applyDraftPartyVenueMonth() {
    if (!scheduleDraft) return;
    const opts = getPartyVenueOptions(scheduleDraft.eventPrefecture);
    const names = normalizeVenueNameList(scheduleDraft.partyVenueNames, opts);
    setSchedule((s) => ({
      ...s,
      partyVenueAxisIndex: clampAxisIndex(scheduleDraft.partyVenueAxisIndex),
      partyOurCompany: scheduleDraft.partyOurCompany,
      partyVenueNames: names,
    }));
  }

  function applyDraftLodgingLead() {
    if (!scheduleDraft) return;
    const hotelOpts = getLodgingHotelOptions(scheduleDraft.eventPrefecture);
    const hotels = normalizeCatalogMulti(scheduleDraft.lodgingHotelNames, hotelOpts);
    const nextMap = { ...scheduleDraft.lodgingLeadByHotel };
    const primary = hotels[0];
    setSchedule((s) => ({
      ...s,
      lodgingHotelNames: hotels,
      lodgingOurCompany: scheduleDraft.lodgingOurCompany,
      lodgingLeadByHotel: nextMap,
      lodgingLeadMonths: nextMap[primary] ?? scheduleDraft.lodgingLeadMonths,
    }));
  }

  function applyDraftBusLead() {
    if (!scheduleDraft) return;
    const busOpts = getBusCompanyOptions(scheduleDraft.eventPrefecture);
    const companies = normalizeCatalogMulti(scheduleDraft.busCompanyNames, busOpts);
    const nextMap = { ...scheduleDraft.busLeadByCompany };
    const primary = companies[0];
    setSchedule((s) => ({
      ...s,
      busCompanyNames: companies,
      busOurCompany: scheduleDraft.busOurCompany,
      busLeadByCompany: nextMap,
      busLeadMonths: nextMap[primary] ?? scheduleDraft.busLeadMonths,
    }));
  }

  function closeScheduleFieldModal() {
    setScheduleFieldModal(null);
    setScheduleDraft(null);
    setMainVenueApiMessage(null);
    setMainVenueHtmlExcerpt(null);
    setMainVenueApiBusy(false);
  }

  async function runMainVenueBackendSuggest() {
    const d = scheduleDraft;
    if (!d) return;
    setMainVenueApiBusy(true);
    setMainVenueApiMessage(null);
    try {
      const res = await postMainVenueSuggest(d.eventAxisIndex, d.mainVenueNames);
      if (res.mainVenueAxisIndex !== null) {
        setScheduleDraft((cur) =>
          cur ? { ...cur, mainVenueAxisIndex: res.mainVenueAxisIndex! } : cur
        );
        setMainVenueApiMessage(
          `バックエンド反映: マスタ一致 ${res.matched.length} 件（src/data/mainVenueHints.json・priority付き）。`
        );
      } else {
        setMainVenueApiMessage(
          "マスタ未登録の会場のみです。下の「静的マスタから反映」か、プルダウンで手動指定してください。"
        );
      }
    } catch (e) {
      setMainVenueApiMessage(
        `APIに接続できませんでした（${(e as Error).message}）。別ターミナルで npm run venue-api を起動し、Vite 開発サーバを動かしてください。`
      );
    } finally {
      setMainVenueApiBusy(false);
    }
  }

  async function runMainVenueFetchOfficialExcerpt() {
    const d = scheduleDraft;
    if (!d) return;
    const names = dedupeNonEmpty(d.mainVenueNames);
    const first = names.find((n) => getMainVenueOfficialHint(n));
    if (!first) {
      setMainVenueApiMessage("マスタ登録会場を選ぶと、その公式URLへサーバー経由でアクセスしHTML抜粋を表示できます。");
      return;
    }
    const hint = getMainVenueOfficialHint(first);
    setMainVenueApiBusy(true);
    setMainVenueApiMessage(null);
    setMainVenueHtmlExcerpt(null);
    try {
      const res = await postMainVenueFetchOfficial(first, hint?.officialUrl);
      setMainVenueHtmlExcerpt(res.excerpt ?? null);
      setMainVenueApiMessage(
        res.ok ? (res.message ?? "公式ページの抜粋を取得しました。") : (res.message ?? res.error ?? "取得に失敗しました。")
      );
    } catch (e) {
      setMainVenueApiMessage(`取得エラー: ${(e as Error).message}`);
    } finally {
      setMainVenueApiBusy(false);
    }
  }

  function openConferenceNameModal() {
    setConferenceNameDraft(conferenceName);
    setConferenceNameModalOpen(true);
  }

  function applyConferenceNameModal() {
    const next = conferenceNameDraft.trim();
    if (next) setConferenceName(next);
    setConferenceNameModalOpen(false);
  }

  function closeConferenceNameModal() {
    setConferenceNameModalOpen(false);
  }

  function openOfficialHpModal() {
    setOfficialHpDraft(officialHpUrl);
    setOfficialHpError(null);
    setOfficialHpModalOpen(true);
  }

  function closeOfficialHpModal() {
    setOfficialHpModalOpen(false);
    setOfficialHpError(null);
  }

  function saveOfficialHpUrlOnly() {
    setOfficialHpUrl(officialHpDraft.trim());
    setOfficialHpError(null);
    setOfficialHpModalOpen(false);
  }

  function openOfficialHpInBrowser() {
    const href = normalizeExternalUrl(officialHpDraft);
    if (!href) {
      setOfficialHpError("有効なURLを入力してください（例：https://example.org）");
      return;
    }
    setOfficialHpUrl(href);
    setOfficialHpError(null);
    window.open(href, "_blank", "noopener,noreferrer");
    setOfficialHpModalOpen(false);
  }

  function openPrefectureModal() {
    setPrefectureDraft(
      (EVENT_PREFECTURE_OPTIONS as readonly string[]).includes(schedule.eventPrefecture)
        ? schedule.eventPrefecture
        : DEFAULT_EVENT_PREFECTURE
    );
    setPrefectureModalOpen(true);
  }

  function closePrefectureModal() {
    setPrefectureModalOpen(false);
  }

  function applyPrefectureModal() {
    const pref = prefectureDraft;
    setSchedule((s) => {
      const hotels = getLodgingHotelOptions(pref);
      const buses = getBusCompanyOptions(pref);
      const mains = getMainVenueOptions(pref);
      const parties = getPartyVenueOptions(pref);
      const nextLodgingMap = rebuildVendorLeadMap(s.lodgingLeadByHotel, hotels, 12, 6);
      const nextBusMap = rebuildVendorLeadMap(s.busLeadByCompany, buses, 4, 5);
      const nextHotels = normalizeCatalogMulti(
        s.lodgingHotelNames.filter((h) => hotels.includes(h)),
        hotels
      );
      const nextBuses = normalizeCatalogMulti(
        s.busCompanyNames.filter((b) => buses.includes(b)),
        buses
      );
      const nextMain = normalizeVenueNameList(
        s.mainVenueNames.filter((m) => mains.includes(m)),
        mains
      );
      const nextParty = normalizeVenueNameList(
        s.partyVenueNames.filter((p) => parties.includes(p)),
        parties
      );
      const h0 = nextHotels[0];
      const b0 = nextBuses[0];
      return {
        ...s,
        eventPrefecture: pref,
        mainVenueNames: nextMain,
        partyVenueNames: nextParty,
        lodgingHotelNames: nextHotels,
        busCompanyNames: nextBuses,
        lodgingLeadByHotel: nextLodgingMap,
        busLeadByCompany: nextBusMap,
        lodgingLeadMonths: nextLodgingMap[h0] ?? s.lodgingLeadMonths,
        busLeadMonths: nextBusMap[b0] ?? s.busLeadMonths,
      };
    });
    setPrefectureModalOpen(false);
  }

  const considerLegendText =
    schedule.considerLeadMonths <= 0
      ? "なし（0か月）"
      : `開始月の${schedule.considerLeadMonths}か月前〜`;

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-3 py-6 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-sky-700">案件詳細 / 全体進捗スケジュール</p>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{conferenceName}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openConferenceNameModal}
                    className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 sm:text-sm"
                  >
                    大会名を編集
                  </button>
                  <button
                    type="button"
                    onClick={openOfficialHpModal}
                    className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 sm:text-sm"
                  >
                    大会公式HP
                  </button>
                </div>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-3">
                {/* 1段目：開催月・開催地・会場（件数が比較的少ない想定） */}
                <div className="flex flex-wrap items-stretch gap-3">
                  <div className="inline-flex w-fit flex-col gap-1 rounded-2xl border-2 border-rose-500 bg-rose-50 px-4 py-2.5 shadow-sm ring-2 ring-rose-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      開催月
                    </span>
                    <span className="text-xl font-bold tabular-nums text-rose-950">{eventMonthLabel}</span>
                    <button
                      type="button"
                      onClick={() => openScheduleFieldModal("event")}
                      className="mt-0.5 w-fit rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-rose-900 ring-1 ring-rose-400/70 hover:bg-white"
                    >
                      開催月を変更
                    </button>
                  </div>
                  <div className="inline-flex w-fit max-w-[14rem] flex-col gap-1 rounded-2xl border-2 border-teal-600 bg-teal-50 px-4 py-2.5 shadow-sm ring-2 ring-teal-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      開催地
                    </span>
                    <span className="text-base font-bold leading-snug text-teal-950 sm:text-lg">
                      {schedule.eventPrefecture}
                    </span>
                    <button
                      type="button"
                      onClick={openPrefectureModal}
                      className="mt-0.5 w-fit rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-teal-900 ring-1 ring-teal-400/70 hover:bg-white"
                    >
                      都道府県を変更
                    </button>
                  </div>
                  <div className="inline-flex w-fit max-w-[15rem] flex-col gap-1 rounded-2xl border-2 border-indigo-600 bg-indigo-50 px-4 py-2.5 shadow-sm ring-2 ring-indigo-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                      メイン会場
                    </span>
                    <span className="line-clamp-2 text-sm font-bold leading-snug text-indigo-950">
                      {formatVenueList(schedule.mainVenueNames)}
                    </span>
                    <span className="text-[10px] font-medium tabular-nums text-indigo-700/90">
                      予約開始日 {mainVenueStartLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => openScheduleFieldModal("mainVenue")}
                      className="mt-0.5 w-fit rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-indigo-900 ring-1 ring-indigo-400/70 hover:bg-white"
                    >
                      メイン会場を設定
                    </button>
                  </div>
                  <div className="inline-flex w-fit max-w-[15rem] flex-col gap-1 rounded-2xl border-2 border-violet-600 bg-violet-50 px-4 py-2.5 shadow-sm ring-2 ring-violet-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800">
                      パーティー会場
                    </span>
                    <span className="line-clamp-2 text-sm font-bold leading-snug text-violet-950">
                      {formatVenueList(schedule.partyVenueNames)}
                    </span>
                    <span className="text-[10px] font-medium tabular-nums text-violet-700/90">
                      予約開始日 {partyVenueStartLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => openScheduleFieldModal("party")}
                      className="mt-0.5 w-fit rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-violet-900 ring-1 ring-violet-400/70 hover:bg-white"
                    >
                      パーティー会場を設定
                    </button>
                  </div>
                </div>
                {/* 2段目：宿泊・バス（選択数が増えやすい想定で横に広く） */}
                <div className="flex min-w-0 flex-wrap items-stretch gap-3 lg:flex-nowrap">
                  <div className="inline-flex min-w-0 w-full flex-1 flex-col gap-1 rounded-2xl border-2 border-emerald-600 bg-emerald-50 px-4 py-2.5 shadow-sm ring-2 ring-emerald-200 lg:w-0 lg:basis-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      宿泊（ホテル）
                    </span>
                    <ul className="mt-0.5 max-h-40 list-disc space-y-1.5 overflow-y-auto pl-4 text-sm leading-snug text-emerald-950 marker:text-emerald-600 sm:max-h-none">
                      {lodgingCardRows.map((row) => (
                        <li key={row.name}>
                          <span className="font-bold">{row.name}</span>
                          <span className="ml-1.5 text-xs font-medium tabular-nums text-emerald-800/95">
                            予約開始日 {row.startLabel}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => openScheduleFieldModal("lodging")}
                      className="mt-0.5 w-fit rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-400/70 hover:bg-white"
                    >
                      宿泊を設定
                    </button>
                  </div>
                  <div className="inline-flex min-w-0 w-full flex-1 flex-col gap-1 rounded-2xl border-2 border-amber-500 bg-amber-50 px-4 py-2.5 shadow-sm ring-2 ring-amber-200 lg:w-0 lg:basis-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      貸切バス
                    </span>
                    <ul className="mt-0.5 max-h-40 list-disc space-y-1.5 overflow-y-auto pl-4 text-sm leading-snug text-amber-950 marker:text-amber-600 sm:max-h-none">
                      {busCardRows.map((row) => (
                        <li key={row.name}>
                          <span className="font-bold">{row.name}</span>
                          <span className="ml-1.5 text-xs font-medium tabular-nums text-amber-900/90">
                            予約開始日 {row.startLabel}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => openScheduleFieldModal("bus")}
                      className="mt-0.5 w-fit rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-amber-950 ring-1 ring-amber-400/80 hover:bg-white"
                    >
                      バスを設定
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 全体進捗スケジュール（PDF イメージ準拠：月次ガント） */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-lg font-semibold text-slate-900">全体進捗スケジュール管理表（イメージ）</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-6 rounded-sm bg-rose-400 ring-1 ring-rose-600/50" />
                開催月（{eventMonthLabel}）
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-6 rounded-sm bg-indigo-300 ring-1 ring-indigo-500/35" />
                検討期間（{considerLegendText}）
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-2.5 w-16 overflow-hidden rounded-sm ring-1 ring-slate-600/25">
                  <span className="flex-1 bg-emerald-500" />
                  <span className="flex-1 bg-sky-500" />
                  <span className="flex-1 bg-rose-500" />
                </span>
                作業期間（開始月＝緑・終了月＝赤）
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-6 rounded-sm bg-amber-400/90 ring-1 ring-amber-600/25" />
                精算
              </span>
            </div>
          </div>
          <div className="overflow-x-hidden">
            <table
              className="w-full border-separate border-spacing-0 text-sm table-fixed"
              style={GANTT_TABLE_STYLE}
            >
              <colgroup>
                <col style={{ width: "var(--gantt-c1)" }} />
                <col style={{ width: "var(--gantt-c2)" }} />
                <col style={{ width: "var(--gantt-c3)" }} />
                {ganttMonthLabels.map((_, i) => (
                  <col key={`gantt-col-${i}`} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-10 box-border w-[var(--gantt-c1)] min-w-0 max-w-[var(--gantt-c1)] border-b border-r border-slate-200 bg-slate-100 px-2 py-2 text-left text-[10px] font-semibold leading-tight"
                  >
                    業務分類
                    <span className="block font-normal text-slate-500">（実務責任者）</span>
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky left-[var(--gantt-c1)] z-20 box-border w-[var(--gantt-c2)] min-w-0 max-w-[var(--gantt-c2)] border-b border-r border-slate-200 bg-slate-100 px-1.5 py-2 text-left text-[10px] font-semibold leading-none whitespace-nowrap"
                  >
                    項　目
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky left-[calc(var(--gantt-c1)_+_var(--gantt-c2))] z-40 box-border w-[var(--gantt-c3)] min-w-0 max-w-[var(--gantt-c3)] border-b border-r border-slate-200 bg-slate-100 px-1 py-2 text-left text-[10px] font-semibold leading-none whitespace-nowrap"
                  >
                    担当者
                  </th>
                  <th
                    colSpan={9}
                    className="border-b border-l border-slate-200 px-2 py-2 text-center text-xs font-semibold"
                  >
                    2026年
                  </th>
                  <th
                    colSpan={12}
                    className="border-b border-l border-slate-200 px-2 py-2 text-center text-xs font-semibold"
                  >
                    2027年
                    <span className="mt-0.5 block text-[10px] font-normal text-rose-700">
                      開催：{eventMonthLabel}
                    </span>
                  </th>
                </tr>
                <tr className="bg-slate-100 text-slate-700">
                  {ganttMonthLabels.map((m, i) => {
                    const isEvent = i === indices.eventMonthIndex;
                    return (
                      <th
                        key={`${m.year}-${m.label}-${i}`}
                        className={`box-border min-w-0 border-b border-slate-200 px-0 py-1 text-center text-[9px] font-semibold leading-none whitespace-nowrap ${
                          isEvent
                            ? "bg-rose-200 text-rose-950 ring-2 ring-inset ring-rose-500/60"
                            : ""
                        }`}
                        style={
                          i > 0
                            ? { boxShadow: "inset 1px 0 0 0 rgb(226 232 240)" }
                            : undefined
                        }
                      >
                        {m.label}
                        {isEvent ? (
                          <span className="block text-[7px] font-bold leading-none text-rose-800">開催</span>
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ganttSectionsData.map((section) =>
                  section.rows.map((row, rowIndex) => (
                    <tr key={`${section.id}-${row.item}-${rowIndex}`} className="bg-white hover:bg-slate-50/80">
                      {rowIndex === 0 && (
                        <td
                          rowSpan={section.rows.length}
                          title={section.name}
                          className="sticky left-0 z-10 box-border w-[var(--gantt-c1)] min-w-0 max-w-[var(--gantt-c1)] overflow-hidden text-ellipsis whitespace-nowrap border-b border-r border-slate-200 bg-white px-2 py-1.5 align-top text-[10px] font-semibold leading-none text-slate-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]"
                        >
                          {section.name}
                        </td>
                      )}
                      <td
                        title={row.item}
                        className="sticky left-[var(--gantt-c1)] z-20 box-border w-[var(--gantt-c2)] min-w-0 max-w-[var(--gantt-c2)] overflow-hidden text-ellipsis whitespace-nowrap border-b border-r border-slate-200 bg-white px-1.5 py-1.5 text-[10px] leading-none text-slate-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]"
                      >
                        {row.item}
                      </td>
                      <td className="sticky left-[calc(var(--gantt-c1)_+_var(--gantt-c2))] z-40 box-border w-[var(--gantt-c3)] min-w-0 max-w-[var(--gantt-c3)] overflow-hidden text-ellipsis whitespace-nowrap border-b border-r border-slate-200 bg-white px-1 py-1.5 text-[10px] leading-none text-slate-600 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                        {row.assignee}
                      </td>
                      <td
                        colSpan={ganttMonthLabels.length}
                        className="border-b border-l border-slate-200 p-0 align-middle"
                      >
                        <GanttBar
                          startIdx={row.startIdx}
                          duration={row.duration}
                          total={ganttMonthLabels.length}
                          barKind={row.barKind}
                          highlightMonthIdx={indices.eventMonthIndex}
                          showConsiderPeriod={row.showConsiderPeriod !== false}
                          considerLeadMonths={schedule.considerLeadMonths}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
          >
            項目追加
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
          >
            担当者変更
          </button>
        </div>

        {/* 打ち合わせメモ（スケジュール逐次変更に合わせて記録） */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-lg font-semibold text-slate-900">打ち合わせ・変更メモ</h2>
          <p className="mt-1 text-sm text-slate-600">
            スケジュールは逐一変更になります。打ち合わせ内容を手入力するか、録音した音声ファイルを取り込んでください。
          </p>
          <label htmlFor="meeting-notes" className="mt-4 mb-1 block text-sm font-medium text-slate-700">
            打ち合わせ内容（手入力）
          </label>
          <textarea
            id="meeting-notes"
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            rows={6}
            placeholder="例：日付・参加者・決定事項・スケジュール変更の理由・次アクションなど"
            className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setSchedule((s) => ({ ...s }))}
              className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-800 hover:bg-slate-900"
            >
              スケジュール再計算
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac,.flac"
              className="sr-only"
              onChange={handleAudioChange}
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 sm:w-auto"
            >
              打ち合わせ音声を取り込む
            </button>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm">
              {audioFile ? (
                <>
                  <span className="truncate text-slate-600">
                    選択中:{" "}
                    <span className="font-medium text-slate-900" title={audioFile.name}>
                      {audioFile.name}
                    </span>
                    <span className="ml-1 tabular-nums text-slate-500">
                      （{(audioFile.size / (1024 * 1024)).toFixed(2)} MB）
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={clearAudio}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    解除
                  </button>
                </>
              ) : (
                <span className="text-slate-500">未選択（mp3 / wav / m4a / webm など）</span>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">キーワード</label>
              <input
                type="text"
                placeholder="タスク名・メモで検索"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">業務区分</label>
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500">
                <option>すべて</option>
                <option>全体統括</option>
                <option>宿泊</option>
                <option>輸送</option>
                <option>懇親会</option>
                <option>エクスカーション</option>
                <option>誘客</option>
                <option>プロモーション</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">担当者</label>
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500">
                <option>すべて</option>
                <option>Aさん</option>
                <option>Bさん</option>
                <option>Cさん</option>
                <option>Dさん</option>
                <option>Eさん</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">ステータス</label>
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500">
                <option>すべて</option>
                <option>未着手</option>
                <option>進行中</option>
                <option>確認待ち</option>
                <option>完了</option>
                <option>保留</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                絞り込む
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                解除
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">アラート</h2>
            <span className="text-sm text-slate-500">要確認: {alerts.length}件</span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-xl border px-4 py-3 text-sm ${getAlertClass(alert.level)}`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-slate-900">タスク一覧</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                CSV出力
              </button>
              <button
                type="button"
                className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                タスク追加
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1400px] w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">業務区分</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">タスク名</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">担当者</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">依存タスク</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">開始日</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">期限</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">完了予定日</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">実完了日</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">ステータス</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">優先度</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">確定条件</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">メモ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.map((task, index) => {
                  const isDelayed =
                    task.status !== "完了" &&
                    new Date(task.dueDate).getTime() < new Date("2026-08-04").getTime();

                  return (
                    <tr
                      key={index}
                      className={
                        isDelayed
                          ? "bg-rose-50/70 hover:bg-rose-50"
                          : "hover:bg-slate-50"
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{task.category}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {task.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{task.assignee}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{task.dependency}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{task.startDate}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{task.dueDate}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{task.plannedEnd}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{task.actualEnd}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{task.priority}</td>
                      <td className="min-w-[180px] px-4 py-3 text-slate-600">{task.condition}</td>
                      <td className="min-w-[220px] px-4 py-3 text-slate-600">{task.memo || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-600">
          このモックはUI確認用です。次の実装では、ここに
          「インライン編集」「担当者変更」「ステータス更新」「再計算API連携」
          を載せる想定です。
        </div>
      </div>
    </div>

    {prefectureModalOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefecture-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closePrefectureModal();
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="prefecture-modal-title" className="text-lg font-semibold text-slate-900">
            開催地（都道府県）の選択
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            開催地に応じて、メイン会場・パーティー会場の候補、およびホテル10社・バス会社10社の一覧と保存済みの予約開始月の設定が切り替わります。名称が新地域にない場合は先頭候補に合わせます。
          </p>
          <label htmlFor="prefecture-select" className="mt-4 block text-sm font-medium text-slate-700">
            都道府県
          </label>
          <select
            id="prefecture-select"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            value={prefectureDraft}
            onChange={(e) => setPrefectureDraft(e.target.value)}
          >
            {EVENT_PREFECTURE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closePrefectureModal}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={applyPrefectureModal}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              適用
            </button>
          </div>
        </div>
      </div>
    ) : null}

    {scheduleFieldModal && scheduleDraft ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-field-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeScheduleFieldModal();
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {scheduleFieldModal === "event" ? (
            <>
              <h3 id="schedule-field-modal-title" className="text-lg font-semibold text-slate-900">
                開催月の変更
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                ガント表の開催月列（ローズ色）の位置を選びます。
              </p>
              <label htmlFor="sched-event" className="mt-4 block text-sm font-medium text-slate-700">
                開催月
              </label>
              <select
                id="sched-event"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={scheduleDraft.eventAxisIndex}
                onChange={(e) =>
                  setScheduleDraft({
                    ...scheduleDraft,
                    eventAxisIndex: Number(e.target.value),
                  })
                }
              >
                {ganttMonthLabels.map((_, i) => (
                  <option key={i} value={i}>
                    {axisOptionLabel(i)}
                  </option>
                ))}
              </select>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                  checked={!scheduleDraft.eventOurCompany}
                  onChange={(e) =>
                    setScheduleDraft({ ...scheduleDraft, eventOurCompany: !e.target.checked })
                  }
                />
                <span>
                  <span className="font-medium text-slate-800">他社が担当</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    ON にすると、弊社のガント表から「全体管理」ブロックを表示しません（開催月の列ハイライトは維持されます）。
                  </span>
                </span>
              </label>
            </>
          ) : null}

          {scheduleFieldModal === "mainVenue" ? (
            <>
              <h3 id="schedule-field-modal-title" className="text-lg font-semibold text-slate-900">
                メイン会場予約日の変更
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">① 会場を選ぶ</span>
                {" → "}
                <span className="font-semibold text-slate-800">② 予約開始月を指定</span>
                （プルダウンまたは下の反映ボタン）。候補は{" "}
                <strong className="font-semibold text-slate-800">{scheduleDraft.eventPrefecture}</strong>{" "}
                向けです。
              </p>
              <p className="mt-2 rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-2 text-xs leading-relaxed text-sky-950">
                <span className="font-semibold">構成：</span>
                会場マスタは <code className="rounded bg-white/80 px-1">src/data/mainVenueHints.json</code>{" "}
                （連携優先度 <code className="rounded bg-white/80 px-1">priority</code>・メモ{" "}
                <code className="rounded bg-white/80 px-1">integrationNotes</code>
                付き）。フロントは同一JSONを読み、
                <span className="font-semibold"> Node サーバー（npm run venue-api）</span>
                が同ファイルをAPIで返します。公式ページのHTML抜粋取得はサーバー経由のみ（予約日の自動パースは未実装・会場別ロジックが必要）。
              </p>
              <fieldset className="mt-4 rounded-xl border border-slate-200 bg-white/60 px-3 py-3">
                <legend className="px-1 text-sm font-semibold text-slate-800">
                  ① 会場名（複数選択可・{scheduleDraft.eventPrefecture}）
                </legend>
                <div className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1">
                  {getMainVenueOptions(scheduleDraft.eventPrefecture).map((n) => (
                    <label
                      key={n}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                        checked={scheduleDraft.mainVenueNames.includes(n)}
                        onChange={() => {
                          setScheduleDraft((d) => {
                            if (!d) return d;
                            const opts = getMainVenueOptions(d.eventPrefecture);
                            const custom = d.mainVenueNames.filter((x) => !opts.includes(x));
                            let cat = opts.filter((o) => d.mainVenueNames.includes(o));
                            if (cat.includes(n)) cat = cat.filter((x) => x !== n);
                            else cat = [...cat, n];
                            if (cat.length === 0 && custom.length === 0) cat = [opts[0]];
                            const nextNames = dedupeNonEmpty([...cat, ...custom]);
                            return { ...d, mainVenueNames: nextNames };
                          });
                        }}
                      />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="sched-main-venue-extra" className="mt-4 block text-sm font-medium text-slate-700">
                その他の会場名（任意・読点・改行・カンマで複数）
              </label>
              <textarea
                id="sched-main-venue-extra"
                rows={2}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                placeholder="例：県民ホール メイン、市民プラザ"
                value={scheduleDraft.mainVenueNames
                  .filter((x) => !getMainVenueOptions(scheduleDraft.eventPrefecture).includes(x))
                  .join("\n")}
                onChange={(e) => {
                  setScheduleDraft((d) => {
                    if (!d) return d;
                    const opts = getMainVenueOptions(d.eventPrefecture);
                    const cat = opts.filter((o) => d.mainVenueNames.includes(o));
                    const extras = parseVenueExtras(e.target.value);
                    const merged = dedupeNonEmpty([...cat, ...extras]);
                    const nextNames = merged.length > 0 ? merged : [opts[0]];
                    return { ...d, mainVenueNames: nextNames };
                  });
                }}
              />
              <p className="mt-1 text-xs text-slate-500">
                候補にない会場は上記に追記できます。チェックをすべて外すと先頭候補が1件入ります。
              </p>
              {scheduleDraft.mainVenueNames.some((name) => getMainVenueOfficialHint(name)) ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2">
                  <p className="text-xs font-medium text-slate-700">マスタ登録会場の公式サイト（参考）</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                    {dedupeNonEmpty(scheduleDraft.mainVenueNames).map((name) => {
                      const h = getMainVenueOfficialHint(name);
                      if (!h) return null;
                      return (
                        <li key={name}>
                          <span className="font-medium text-slate-800">{name}</span>
                          {h.priority != null ? (
                            <span className="text-slate-400">（連携優先度 {h.priority}）</span>
                          ) : null}
                          {" · "}
                          <a
                            href={h.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900"
                          >
                            公式サイト
                          </a>
                          <span className="text-slate-500">（目安 開催の {h.suggestedLeadMonths} か月前）</span>
                          {h.integrationNotes ? (
                            <span className="mt-0.5 block text-[11px] text-slate-500">
                              メモ: {h.integrationNotes}
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-800">② メイン会場の予約開始月</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  会場を選んだうえで、プルダウンで直接指定するか、下のボタンでマスタ／APIから流し込みます。
                </p>
                <label htmlFor="sched-main-venue" className="mt-3 block text-sm font-medium text-slate-700">
                  タイムライン上の開始月
                </label>
                <select
                  id="sched-main-venue"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  value={scheduleDraft.mainVenueAxisIndex}
                  onChange={(e) =>
                    setScheduleDraft({
                      ...scheduleDraft,
                      mainVenueAxisIndex: Number(e.target.value),
                    })
                  }
                >
                  {ganttMonthLabels.map((_, i) => (
                    <option key={i} value={i}>
                      {axisOptionLabel(i)}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    disabled={mainVenueApiBusy}
                    onClick={() =>
                      setScheduleDraft((d) => {
                        if (!d) return d;
                        const ix = suggestMainVenueAxisIndexFromOfficialHints(d.mainVenueNames, d.eventAxisIndex);
                        return ix !== null ? { ...d, mainVenueAxisIndex: ix } : d;
                      })
                    }
                    className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
                  >
                    静的マスタから予約開始月を反映
                  </button>
                  <button
                    type="button"
                    disabled={mainVenueApiBusy}
                    onClick={() => void runMainVenueBackendSuggest()}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    バックエンドAPIから取得して反映
                  </button>
                  <button
                    type="button"
                    disabled={mainVenueApiBusy}
                    onClick={() => void runMainVenueFetchOfficialExcerpt()}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    公式ページHTML抜粋（サーバー取得・実験）
                  </button>
                </div>
                {mainVenueApiMessage ? (
                  <p className="mt-2 text-xs text-slate-700">{mainVenueApiMessage}</p>
                ) : null}
                {mainVenueHtmlExcerpt ? (
                  <pre className="mt-2 max-h-32 overflow-auto rounded-lg border border-slate-200 bg-slate-900/5 p-2 text-[10px] leading-snug text-slate-800">
                    {mainVenueHtmlExcerpt}
                  </pre>
                ) : null}
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                  checked={!scheduleDraft.mainVenueOurCompany}
                  onChange={(e) =>
                    setScheduleDraft({ ...scheduleDraft, mainVenueOurCompany: !e.target.checked })
                  }
                />
                <span>
                  <span className="font-medium text-slate-800">他社が担当</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    ON のままにすると、弊社のガント表から「メイン会場」ブロックを表示しません。「OFF」にすると弊社担当として表示されます。
                  </span>
                </span>
              </label>
            </>
          ) : null}

          {scheduleFieldModal === "party" ? (
            <>
              <h3 id="schedule-field-modal-title" className="text-lg font-semibold text-slate-900">
                パーティー会場予約日の変更
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                会場予約バーの開始位置となる月を、タイムライン上で選びます。会場名の候補は{" "}
                <strong className="font-semibold text-slate-800">{scheduleDraft.eventPrefecture}</strong>{" "}
                向けです。
              </p>
              <label htmlFor="sched-party" className="mt-4 block text-sm font-medium text-slate-700">
                パーティー会場予約の開始月
              </label>
              <select
                id="sched-party"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={scheduleDraft.partyVenueAxisIndex}
                onChange={(e) =>
                  setScheduleDraft({
                    ...scheduleDraft,
                    partyVenueAxisIndex: Number(e.target.value),
                  })
                }
              >
                {ganttMonthLabels.map((_, i) => (
                  <option key={i} value={i}>
                    {axisOptionLabel(i)}
                  </option>
                ))}
              </select>
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-slate-700">
                  会場名（複数選択可・{scheduleDraft.eventPrefecture}の候補）
                </legend>
                <div className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1">
                  {getPartyVenueOptions(scheduleDraft.eventPrefecture).map((n) => (
                    <label
                      key={n}
                      className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                        checked={scheduleDraft.partyVenueNames.includes(n)}
                        onChange={() => {
                          const opts = getPartyVenueOptions(scheduleDraft.eventPrefecture);
                          const custom = scheduleDraft.partyVenueNames.filter((x) => !opts.includes(x));
                          let cat = opts.filter((o) => scheduleDraft.partyVenueNames.includes(o));
                          if (cat.includes(n)) cat = cat.filter((x) => x !== n);
                          else cat = [...cat, n];
                          if (cat.length === 0 && custom.length === 0) cat = [opts[0]];
                          setScheduleDraft({
                            ...scheduleDraft,
                            partyVenueNames: dedupeNonEmpty([...cat, ...custom]),
                          });
                        }}
                      />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="sched-party-venue-extra" className="mt-4 block text-sm font-medium text-slate-700">
                その他の会場名（任意・読点・改行・カンマで複数）
              </label>
              <textarea
                id="sched-party-venue-extra"
                rows={2}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                placeholder="例：ホテルグランド 宴会場「桜」"
                value={scheduleDraft.partyVenueNames
                  .filter((x) => !getPartyVenueOptions(scheduleDraft.eventPrefecture).includes(x))
                  .join("\n")}
                onChange={(e) => {
                  const opts = getPartyVenueOptions(scheduleDraft.eventPrefecture);
                  const cat = opts.filter((o) => scheduleDraft.partyVenueNames.includes(o));
                  const extras = parseVenueExtras(e.target.value);
                  const merged = dedupeNonEmpty([...cat, ...extras]);
                  setScheduleDraft({
                    ...scheduleDraft,
                    partyVenueNames: merged.length > 0 ? merged : [opts[0]],
                  });
                }}
              />
              <p className="mt-1 text-xs text-slate-500">
                候補にない会場は上記に追記できます。チェックをすべて外し追記も空にすると先頭候補が1件入ります。
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                  checked={!scheduleDraft.partyOurCompany}
                  onChange={(e) =>
                    setScheduleDraft({ ...scheduleDraft, partyOurCompany: !e.target.checked })
                  }
                />
                <span>
                  <span className="font-medium text-slate-800">他社が担当</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    ON にすると、弊社のガント表から「パーティー」ブロックを表示しません。
                  </span>
                </span>
              </label>
            </>
          ) : null}

          {scheduleFieldModal === "lodging" ? (
            <>
              <h3 id="schedule-field-modal-title" className="text-lg font-semibold text-slate-900">
                宿泊施設開始日の変更
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                <strong className="font-semibold text-slate-800">{scheduleDraft.eventPrefecture}</strong>{" "}
                のホテルを10社から選び、社ごとに「開催の何か月前から手配を始めるか」を保存できます。開催地を変えると候補一覧が切り替わります。
              </p>
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-slate-700">
                  宿泊ホテル（{scheduleDraft.eventPrefecture}・複数選択可）
                </legend>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {getLodgingHotelOptions(scheduleDraft.eventPrefecture).map((h) => {
                    const checked = scheduleDraft.lodgingHotelNames.includes(h);
                    return (
                      <div
                        key={h}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
                      >
                        <label className="flex cursor-pointer items-start gap-2.5">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                            checked={checked}
                            onChange={() => {
                              const opts = getLodgingHotelOptions(scheduleDraft.eventPrefecture);
                              const set = new Set(scheduleDraft.lodgingHotelNames);
                              if (set.has(h)) set.delete(h);
                              else set.add(h);
                              let next = opts.filter((x) => set.has(x));
                              if (next.length === 0) next = [opts[0]];
                              setScheduleDraft({ ...scheduleDraft, lodgingHotelNames: next });
                            }}
                          />
                          <span className="min-w-0 flex-1 font-medium leading-snug">{h}</span>
                        </label>
                        {checked ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 pl-6">
                            <span className="text-xs text-slate-600">予約開始日（開催の何か月前）</span>
                            <input
                              type="number"
                              min={0}
                              max={48}
                              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm tabular-nums outline-none focus:border-sky-500"
                              value={
                                scheduleDraft.lodgingLeadByHotel[h] ?? scheduleDraft.lodgingLeadMonths
                              }
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setScheduleDraft({
                                  ...scheduleDraft,
                                  lodgingLeadByHotel: {
                                    ...scheduleDraft.lodgingLeadByHotel,
                                    [h]: v,
                                  },
                                });
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
              <p className="mt-2 text-xs text-slate-500">
                複数ホテルを選ぶと、ガントの宿泊バー開始月は「いちばん早い予約開始月のホテル」に合わせます。各ホテルの月数は個別に保存されます。
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                  checked={!scheduleDraft.lodgingOurCompany}
                  onChange={(e) =>
                    setScheduleDraft({ ...scheduleDraft, lodgingOurCompany: !e.target.checked })
                  }
                />
                <span>
                  <span className="font-medium text-slate-800">他社が担当</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    ON にすると、弊社のガント表から「参加者等の宿泊対策」ブロックを表示しません。
                  </span>
                </span>
              </label>
            </>
          ) : null}

          {scheduleFieldModal === "bus" ? (
            <>
              <h3 id="schedule-field-modal-title" className="text-lg font-semibold text-slate-900">
                貸切バス予約開始日の変更
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                <strong className="font-semibold text-slate-800">{scheduleDraft.eventPrefecture}</strong>{" "}
                の貸切バス会社を10社から選び、社ごとに「開催の何か月前から予約を始めるか」を保存できます。
              </p>
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-slate-700">
                  貸切バス会社（{scheduleDraft.eventPrefecture}・複数選択可）
                </legend>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {getBusCompanyOptions(scheduleDraft.eventPrefecture).map((c) => {
                    const checked = scheduleDraft.busCompanyNames.includes(c);
                    return (
                      <div
                        key={c}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
                      >
                        <label className="flex cursor-pointer items-start gap-2.5">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                            checked={checked}
                            onChange={() => {
                              const opts = getBusCompanyOptions(scheduleDraft.eventPrefecture);
                              const set = new Set(scheduleDraft.busCompanyNames);
                              if (set.has(c)) set.delete(c);
                              else set.add(c);
                              let next = opts.filter((x) => set.has(x));
                              if (next.length === 0) next = [opts[0]];
                              setScheduleDraft({ ...scheduleDraft, busCompanyNames: next });
                            }}
                          />
                          <span className="min-w-0 flex-1 font-medium leading-snug">{c}</span>
                        </label>
                        {checked ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 pl-6">
                            <span className="text-xs text-slate-600">予約開始日（開催の何か月前）</span>
                            <input
                              type="number"
                              min={0}
                              max={48}
                              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm tabular-nums outline-none focus:border-sky-500"
                              value={
                                scheduleDraft.busLeadByCompany[c] ?? scheduleDraft.busLeadMonths
                              }
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setScheduleDraft({
                                  ...scheduleDraft,
                                  busLeadByCompany: {
                                    ...scheduleDraft.busLeadByCompany,
                                    [c]: v,
                                  },
                                });
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
              <p className="mt-2 text-xs text-slate-500">
                複数社を選ぶと、バス予約バー開始月は「いちばん早い予約開始月の会社」に合わせます。各社の月数は個別に保存されます。
              </p>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600"
                  checked={!scheduleDraft.busOurCompany}
                  onChange={(e) =>
                    setScheduleDraft({ ...scheduleDraft, busOurCompany: !e.target.checked })
                  }
                />
                <span>
                  <span className="font-medium text-slate-800">他社が担当</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    ON にすると、弊社のガント表から「参加者等の輸送対策」ブロック（貸切バス手配など）を表示しません。
                  </span>
                </span>
              </label>
            </>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeScheduleFieldModal}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => {
                if (scheduleFieldModal === "event") applyDraftEventMonth();
                else if (scheduleFieldModal === "mainVenue") applyDraftMainVenueMonth();
                else if (scheduleFieldModal === "party") applyDraftPartyVenueMonth();
                else if (scheduleFieldModal === "lodging") applyDraftLodgingLead();
                else if (scheduleFieldModal === "bus") applyDraftBusLead();
                closeScheduleFieldModal();
              }}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              適用
            </button>
          </div>
        </div>
      </div>
    ) : null}

    {conferenceNameModalOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conference-name-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeConferenceNameModal();
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="conference-name-modal-title" className="text-lg font-semibold text-slate-900">
            大会名の編集
          </h3>
          <p className="mt-1 text-sm text-slate-600">画面上部の見出しに表示される大会名を変更します。</p>
          <label htmlFor="conference-name-input" className="mt-4 block text-sm font-medium text-slate-700">
            大会名
          </label>
          <input
            id="conference-name-input"
            type="text"
            value={conferenceNameDraft}
            onChange={(e) => setConferenceNameDraft(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="例：JC世界大会2027"
          />
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeConferenceNameModal}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={applyConferenceNameModal}
              disabled={!conferenceNameDraft.trim()}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:pointer-events-none disabled:opacity-50"
            >
              適用
            </button>
          </div>
        </div>
      </div>
    ) : null}

    {officialHpModalOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="official-hp-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeOfficialHpModal();
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="official-hp-modal-title" className="text-lg font-semibold text-slate-900">
            大会公式サイト（HP）
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            公式サイトのURLを登録し、ブラウザで開いて内容を確認できます（ページの表示＝読み込み）。https://
            を省略した入力にも対応します。
          </p>
          <label htmlFor="official-hp-url-input" className="mt-4 block text-sm font-medium text-slate-700">
            公式サイトのURL
          </label>
          <input
            id="official-hp-url-input"
            type="text"
            inputMode="url"
            value={officialHpDraft}
            onChange={(e) => {
              setOfficialHpDraft(e.target.value);
              setOfficialHpError(null);
            }}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="https://www.example.org/"
          />
          {officialHpUrl ? (
            <p className="mt-2 text-xs text-slate-500">
              現在の登録:{" "}
              <span className="break-all font-mono text-slate-700">{officialHpUrl}</span>
            </p>
          ) : null}
          {officialHpError ? <p className="mt-2 text-sm text-rose-600">{officialHpError}</p> : null}
          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={closeOfficialHpModal}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 sm:order-1"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={saveOfficialHpUrlOnly}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 sm:order-2"
            >
              URLだけ保存
            </button>
            <button
              type="button"
              onClick={openOfficialHpInBrowser}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 sm:order-3"
            >
              ブラウザで開く
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
