import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  FileText,
  Handshake,
  Hash,
  ListChecks,
  Mail,
  MessageSquare,
  Mic,
  Monitor,
  Keyboard,
  Phone,
  Plane,
  RefreshCcw,
  Sparkles,
  Target,
  UserCircle,
  Users,
  Video,
  X,
} from "lucide-react";
import {
  formatSalesReportDraftPlain,
  mockResummarizeDraft,
  queueItemToDraft,
  type SalesReportDraft,
} from "./salesReportDraft";

const triggers = [
  { icon: Users, title: "リアル打ち合わせ終了", desc: "対面商談の終了をきっかけに下書き化" },
  { icon: Video, title: "オンライン打ち合わせ終了", desc: "Teams / Web会議終了後に自動候補化" },
  { icon: Phone, title: "電話終了", desc: "通話終了後に録音・要約を登録候補へ" },
  { icon: Mail, title: "メール送信 / 翌朝集約", desc: "同日メールを企業別・案件別に翌朝まとめる" },
];

const sources = [
  { title: "Outlook", items: ["メール本文", "添付資料", "カレンダー予定", "Teams会議情報"] },
  { title: "音声データ", items: ["リアル打ち合わせ録音", "オンライン会議録音", "電話録音"] },
  { title: "手入力メモ", items: ["補足メモ", "修正メモ", "録音できなかった時の保険"] },
];

/** デモの「本日」スコープ（実装ではサーバー日付と突合） */
const TODAY_ISO = "2026-04-05";
const TODAY_LABEL_JA = "2026年4月5日（日）";
const DAILY_REVIEW_TIME = "17:00";

const queueItems = [
  {
    id: 1,
    type: "メール",
    company: "株式会社みらい商事",
    project: "インセンティブツアー",
    status: "未処理",
    time: "4/5 朝イチ集約（前夜送信分）",
    summary: "見積送付、日程候補共有、添付資料の補足説明を案件単位で集約。",
    meetingDate: TODAY_ISO,
  },
  {
    id: 2,
    type: "オンライン",
    company: "ABCホールディングス",
    project: "周年記念旅行",
    status: "確認待ち",
    time: "4/5 13:00〜13:45",
    summary: "役員向けプラン提案を実施。競合比較中のため差別化提案が必要。",
    meetingDate: TODAY_ISO,
  },
  {
    id: 3,
    type: "電話",
    company: "福井テクノサービス",
    project: "社員旅行2026",
    status: "下書き作成済み",
    time: "4/5 16:20〜16:35",
    summary: "概算人数と見積再提示期限を確認。",
    meetingDate: TODAY_ISO,
  },
  {
    id: 4,
    type: "リアル",
    company: "山陽メタル工業",
    project: "工場見学インセンティブ",
    status: "未処理",
    time: "4/5 11:00〜11:40",
    summary: "工場見学付きプランの可否と安全要件、概算人数レンジをヒアリング。",
    meetingDate: TODAY_ISO,
  },
] as const;

/** デモ用：実際の org は環境に合わせて差し替え */
const salesforceRecordMock: Record<
  number,
  { accountUrl: string; opportunityUrl: string }
> = {
  1: {
    accountUrl: "https://your-domain.lightning.force.com/lightning/r/Account/001Qy00000DEMO001/view",
    opportunityUrl: "https://your-domain.lightning.force.com/lightning/r/Opportunity/006Qy00000DEMO001/view",
  },
  2: {
    accountUrl: "https://your-domain.lightning.force.com/lightning/r/Account/001Qy00000DEMO002/view",
    opportunityUrl: "https://your-domain.lightning.force.com/lightning/r/Opportunity/006Qy00000DEMO002/view",
  },
  3: {
    accountUrl: "https://your-domain.lightning.force.com/lightning/r/Account/001Qy00000DEMO003/view",
    opportunityUrl: "https://your-domain.lightning.force.com/lightning/r/Opportunity/006Qy00000DEMO003/view",
  },
  4: {
    accountUrl: "https://your-domain.lightning.force.com/lightning/r/Account/001Qy00000DEMO004/view",
    opportunityUrl: "https://your-domain.lightning.force.com/lightning/r/Opportunity/006Qy00000DEMO004/view",
  },
};

const SF_SCREENSHOT_DEMO = "/sf-record-preview.png";

type QueueStatus = (typeof queueItems)[number]["status"];
type QueueType = (typeof queueItems)[number]["type"];
type ChannelType = QueueType | "リアル";

const statusStyle: Record<QueueStatus, string> = {
  未処理: "bg-rose-100 text-rose-900 ring-2 ring-rose-300/80",
  確認待ち: "bg-amber-200 text-amber-950 ring-2 ring-amber-400/90",
  下書き作成済み: "bg-emerald-200 text-emerald-950 ring-2 ring-emerald-400/90",
};

const typeStyle: Record<ChannelType, string> = {
  リアル: "bg-sky-100 text-sky-950 ring-2 ring-sky-400/80",
  オンライン: "bg-violet-100 text-violet-950 ring-2 ring-violet-400/80",
  電話: "bg-orange-100 text-orange-950 ring-2 ring-orange-400/80",
  メール: "bg-emerald-100 text-emerald-950 ring-2 ring-emerald-400/80",
};

/** 案件カード左端のチャネル色（一覧で縦に並んでも識別しやすく） */
const caseStripeByType: Record<QueueType, string> = {
  メール: "border-l-[6px] border-l-emerald-500",
  オンライン: "border-l-[6px] border-l-violet-500",
  電話: "border-l-[6px] border-l-orange-500",
  リアル: "border-l-[6px] border-l-sky-500",
};

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type ApplyLocationState = {
  appliedDraft?: SalesReportDraft;
  queueId?: number;
};

export default function SalesReportAutomationArchitecture() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [draftOverrides, setDraftOverrides] = useState<Record<number, SalesReportDraft>>({});
  const [applyNotice, setApplyNotice] = useState(false);
  const [resummarizeCompare, setResummarizeCompare] = useState<{
    queueId: number;
    before: SalesReportDraft;
    after: SalesReportDraft;
  } | null>(null);

  const todayCases = useMemo(
    () => queueItems.filter((q) => q.meetingDate === TODAY_ISO),
    [],
  );

  useEffect(() => {
    const st = location.state as ApplyLocationState | null;
    if (st?.appliedDraft != null && typeof st.queueId === "number") {
      const qid = st.queueId;
      setDraftOverrides((prev) => ({ ...prev, [qid]: st.appliedDraft! }));
      setApplyNotice(true);
      navigate(location.pathname, { replace: true, state: {} });
      requestAnimationFrame(() => {
        document.getElementById(`sales-case-${qid}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      const t = window.setTimeout(() => setApplyNotice(false), 4000);
      return () => window.clearTimeout(t);
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!resummarizeCompare) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResummarizeCompare(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [resummarizeCompare]);

  const resummarizeTargetLabel = useMemo(() => {
    if (!resummarizeCompare) return "";
    const row = queueItems.find((i) => i.id === resummarizeCompare.queueId);
    return row ? `${row.company}／${row.project}` : "";
  }, [resummarizeCompare]);

  const handleCopyPlainForQueue = async (queueId: number) => {
    const row = queueItems.find((i) => i.id === queueId);
    if (!row) return;
    const draft = draftOverrides[queueId] ?? queueItemToDraft(row);
    const plain = formatSalesReportDraftPlain(draft);
    try {
      await navigator.clipboard.writeText(plain);
      setCopiedId(queueId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  const openResummarizeCompare = (queueId: number) => {
    const row = queueItems.find((i) => i.id === queueId);
    if (!row) return;
    const before = { ...(draftOverrides[queueId] ?? queueItemToDraft(row)) };
    setResummarizeCompare({
      queueId,
      before,
      after: mockResummarizeDraft(before),
    });
  };

  const adoptResummarize = () => {
    if (!resummarizeCompare) return;
    const qid = resummarizeCompare.queueId;
    setDraftOverrides((prev) => ({
      ...prev,
      [qid]: { ...resummarizeCompare.after },
    }));
    setResummarizeCompare(null);
  };

  const beforePlain = resummarizeCompare
    ? formatSalesReportDraftPlain(resummarizeCompare.before)
    : "";
  const afterPlain = resummarizeCompare
    ? formatSalesReportDraftPlain(resummarizeCompare.after)
    : "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header id="architecture-hero" className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-8 lg:px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
                <Sparkles className="h-4 w-4" />
                Sales Report Automation Architecture
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                営業報告自動化ツールの
                <span className="block text-sky-700">システム全体構造図</span>
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                目的は、録音やメールを集めることではなく、Salesforceに入れるための社内報告文を自動生成し、
                「思い出して書く報告」から「確認して登録する報告」へ変えることです。
              </p>
              <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-2.5 sm:max-w-5xl sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                <button
                  type="button"
                  onClick={() => scrollToAnchor("sales-slack-sample")}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-[3px] border-violet-700 bg-violet-600 px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-300/80 transition hover:bg-violet-700 sm:min-h-[52px] sm:px-4 sm:text-base"
                >
                  Slack画面
                </button>
                <button
                  type="button"
                  onClick={() => scrollToAnchor("sales-tool-workspace")}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-[3px] border-slate-600 bg-gradient-to-b from-slate-100 to-slate-200/90 px-3 py-2.5 text-sm font-bold leading-snug text-slate-900 shadow-md shadow-slate-400/30 ring-2 ring-slate-300/90 transition hover:border-slate-700 sm:min-h-[52px] sm:px-4 sm:text-base"
                >
                  ツールで確認する画面
                </button>
                <button
                  type="button"
                  onClick={() => scrollToAnchor("architecture-triggers")}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-[3px] border-sky-500 bg-sky-50 px-3 py-2.5 text-sm font-bold text-sky-950 shadow-md shadow-sky-200/50 ring-2 ring-sky-200 transition hover:bg-sky-100 sm:min-h-[52px] sm:px-4 sm:text-base"
                >
                  トリガー
                </button>
                <button
                  type="button"
                  onClick={() => scrollToAnchor("architecture-data-layer")}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-[3px] border-teal-600 bg-teal-50 px-3 py-2.5 text-sm font-bold text-teal-950 shadow-md shadow-teal-200/50 ring-2 ring-teal-200 transition hover:bg-teal-100 sm:min-h-[52px] sm:px-4 sm:text-base"
                >
                  データ取得レイヤー
                </button>
              </div>
              <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                このページは上から順に、Slack 通知イメージ → ブラウザツール → 起動のきっかけ → 取り込み元の4ブロックです。
              </p>
            </div>
          </div>
        </header>

            <section
              id="sales-slack-sample"
              className="scroll-mt-8 mt-8 rounded-3xl border-[3px] border-violet-500 bg-gradient-to-br from-violet-100/95 via-violet-50/80 to-fuchsia-50/50 p-1 shadow-lg shadow-violet-300/40 ring-4 ring-violet-200/60"
            >
                <div className="rounded-[1.15rem] bg-white/90 p-4 sm:p-5">
                  <div className="mb-5 flex flex-col gap-3 rounded-2xl border-2 border-violet-400 bg-gradient-to-r from-violet-100 to-fuchsia-50 px-4 py-4 shadow-inner sm:flex-row sm:items-start sm:gap-5 sm:px-5 sm:py-5">
                  <MessageSquare className="h-8 w-8 shrink-0 text-violet-600 sm:h-10 sm:w-10" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-violet-800 sm:text-base">1. Slack画面</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-violet-950 sm:text-2xl">Slack画面</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-violet-900 sm:text-base">
                      スマホの Slack に届く通知のイメージです。17:00 のまとめからリンクでツール（ブラウザ）へ遷移する想定です。
                    </p>
                  </div>
                  </div>
                  <div className="mx-auto flex w-full max-w-md flex-col gap-4">
                    <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 shadow-sm">
                      <p className="flex items-center gap-2 text-sm font-bold text-amber-950">
                        <Bell className="h-4 w-4 text-amber-600" aria-hidden />
                        仕事をした日の {DAILY_REVIEW_TIME} に Slack へ届く
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        この画面でまとめた今日の内容が、
                        <strong className="font-semibold text-slate-800">
                          仕事をした日（営業日）の {DAILY_REVIEW_TIME}
                        </strong>
                        に Slack に届く想定です。
                      </p>
                      <p className="mt-2 text-xs text-slate-500">※ デモのため実際の通知は発火しません。</p>
                    </div>

                    <div
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50"
                      role="img"
                      aria-label="Slack に届く通知のイメージ。本日案件一覧のスマホ表示（デモ・見た目のみ）"
                    >
                      <div className="flex items-center gap-2 bg-[#350d36] px-3 py-2.5 text-xs font-semibold text-white">
                        <Hash className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                        <span className="truncate">営業日報・今日のまとめ</span>
                      </div>
                      <div className="bg-[#f8f8f8] p-3">
                        <div className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
                          <div className="flex gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#611f69] text-[10px] font-bold leading-tight text-white"
                              aria-hidden
                            >
                              Bot
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                                <span className="text-sm font-bold text-slate-900">営業報告まとめ</span>
                                <span className="text-[11px] font-medium text-slate-400">
                                  アプリ · 今日 {DAILY_REVIEW_TIME}
                                </span>
                              </div>
                              <p className="mt-1 text-[12px] leading-snug text-slate-600">
                                <span className="font-semibold text-slate-800">{TODAY_LABEL_JA}</span>
                                ・ツール画面の本日一覧と同じ内容の
                                <span className="font-semibold text-slate-800">スマホ向けサマリー</span>
                                が届きます。
                              </p>

                              {/* スマホ画面イメージ（本日一覧テーブルのモバイル版） */}
                              <div className="mx-auto mt-3 max-w-[min(100%,272px)]">
                                <div className="rounded-[1.35rem] border-[5px] border-slate-800 bg-slate-800 shadow-lg ring-1 ring-slate-900/20">
                                  <div className="mx-auto h-1 w-10 rounded-full bg-slate-600" aria-hidden />
                                  <div className="mt-1 overflow-hidden rounded-[0.85rem] bg-white">
                                    <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-2">
                                      <p className="text-[10px] font-bold leading-tight text-white">
                                        本日の案件一覧（サマリー）
                                      </p>
                                      <p className="mt-0.5 text-[8px] font-medium leading-snug text-teal-50/95">
                                        「詳細へ」で該当カードへ
                                      </p>
                                    </div>
                                    <div className="max-h-[min(52vh,240px)] space-y-2 overflow-y-auto overscroll-y-contain bg-teal-50/40 px-2 py-2">
                                      {todayCases.map((row) => (
                                        <div
                                          key={row.id}
                                          className="rounded-xl border border-teal-100/90 bg-white p-2.5 shadow-sm"
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                                            <span
                                              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${typeStyle[row.type]}`}
                                            >
                                              {row.type}
                                            </span>
                                            <span
                                              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${statusStyle[row.status]}`}
                                            >
                                              {row.status}
                                            </span>
                                          </div>
                                          <p className="mt-2 text-[11px] font-bold leading-snug text-slate-900">
                                            {row.company}
                                          </p>
                                          <p className="mt-0.5 text-[10px] leading-snug text-slate-600">
                                            {row.project}
                                          </p>
                                          <p className="mt-1 text-[9px] leading-snug text-slate-500">{row.time}</p>
                                          <button
                                            type="button"
                                            className="mt-2 w-full rounded-lg bg-teal-600 py-1.5 text-[9px] font-bold text-white shadow-sm"
                                            tabIndex={-1}
                                          >
                                            詳細へ
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-1.5 text-center text-[9px] text-slate-500">
                                  スマホ幅イメージ（デモ）
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-center text-[10px] text-slate-500">
                        Slack で届くイメージ（体裁のみ・実際の投稿ではありません）
                      </p>
                    </div>
                  </div>
                </div>
            </section>

            <section
              id="sales-tool-workspace"
              className="scroll-mt-8 mt-10 rounded-3xl border-[3px] border-slate-600 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200/90 p-1 shadow-lg shadow-slate-400/35 ring-4 ring-slate-300/50"
            >
                <div className="space-y-5 rounded-[1.15rem] bg-white/95 p-4 sm:p-5">
                <div className="flex flex-col gap-3 rounded-2xl border-2 border-slate-500 bg-gradient-to-r from-slate-200 to-slate-100 px-4 py-4 shadow-inner sm:flex-row sm:items-start sm:gap-5 sm:px-5 sm:py-5">
                  <Monitor className="h-8 w-8 shrink-0 text-slate-600 sm:h-10 sm:w-10" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                      <span className="text-sm font-semibold text-slate-700 sm:text-base">2. </span>
                      ツールで確認する画面
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                      PC などのブラウザを想定。一覧から案件カードへ進み、SF 紐づけ・最終文面の確認・登録まで行います。
                    </p>
                  </div>
                </div>
                <div
                  className="overflow-hidden rounded-2xl border-2 border-slate-400 bg-slate-300 shadow-lg shadow-slate-400/25 ring-1 ring-slate-400/40"
                  aria-label="ツール画面のブラウザウィンドウ（デモ）"
                >
                  <div className="flex items-center gap-3 bg-slate-700 px-3 py-2.5">
                    <div className="flex gap-1.5" aria-hidden={true}>
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                    </div>
                    <div className="min-w-0 flex-1 truncate rounded-md bg-slate-800/90 px-3 py-1 text-center font-mono text-[10px] text-slate-300 sm:text-[11px]">
                      https://sales-report.example.com/daily-review
                    </div>
                  </div>
                  <div className="space-y-6 bg-slate-50 px-4 py-5 sm:px-6">
              {applyNotice ? (
                <p
                  role="status"
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
                >
                  編集内容を該当案件の最終確認エリアに反映しました。
                </p>
              ) : null}

              <div className="overflow-hidden rounded-2xl border-2 border-teal-200 bg-white shadow-md shadow-teal-100/40">
                <div className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3">
                  <h3 className="text-sm font-bold text-white">本日の案件一覧（サマリー）</h3>
                  <p className="mt-0.5 text-xs font-medium text-teal-50">
                    行の「詳細へ」で下の該当カードまでスクロールします。
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="border-b border-teal-100 bg-teal-50/90 text-xs font-bold text-teal-900">
                      <tr>
                        <th className="px-4 py-2.5">チャネル</th>
                        <th className="px-4 py-2.5">企業</th>
                        <th className="px-4 py-2.5">案件</th>
                        <th className="px-4 py-2.5">時間・メモ</th>
                        <th className="px-4 py-2.5">状態</th>
                        <th className="w-24 px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-100 bg-white">
                      {todayCases.map((item, rowIdx) => (
                        <tr
                          key={item.id}
                          className={`text-slate-800 transition-colors hover:bg-teal-50/70 ${rowIdx % 2 === 1 ? "bg-teal-50/25" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${typeStyle[item.type]}`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{item.company}</td>
                          <td className="px-4 py-3 text-slate-600">{item.project}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{item.time}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[item.status]}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => scrollToAnchor(`sales-case-${item.id}`)}
                              className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-teal-700"
                            >
                              詳細へ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-10">
                {todayCases.map((item) => {
                  const rowDraft = draftOverrides[item.id] ?? queueItemToDraft(item);
                  const sfLinks = salesforceRecordMock[item.id] ?? salesforceRecordMock[1];
                  const rowPlain = formatSalesReportDraftPlain(rowDraft);
                  return (
                    <article
                      key={item.id}
                      id={`sales-case-${item.id}`}
                      className={`scroll-mt-8 space-y-4 rounded-[1.75rem] border-2 border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50 sm:p-5 ${caseStripeByType[item.type]}`}
                    >
                      <header className="flex flex-col gap-3 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">本日の案件</p>
                          <h3 className="mt-1 text-lg font-bold text-slate-900">{item.company}</h3>
                          <p className="text-sm text-slate-600">{item.project}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${typeStyle[item.type]}`}
                          >
                            {item.type}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}>
                            {item.status}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                            {item.time}
                          </span>
                        </div>
                      </header>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">詳細確認（AI生成）</h3>
                            <p className="mt-1 text-sm text-slate-500">AIが生成した内容を確認して修正</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {[
                            { label: "企業名", value: rowDraft.company, icon: Building2 },
                            { label: "案件名", value: rowDraft.project, icon: CalendarDays },
                            { label: "形式", value: item.type, icon: Mic },
                            { label: "時間", value: item.time, icon: Clock3 },
                          ].map((field) => {
                            const Icon = field.icon;
                            return (
                              <div
                                key={field.label}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                              >
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                  <Icon className="h-3.5 w-3.5 text-slate-500" />
                                  {field.label}
                                </div>
                                <p className="mt-2 text-sm font-medium text-slate-900">{field.value}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">企業名・ツアー名の確認（SF紐づけ）</h3>
                            <p className="mt-1 text-sm text-slate-600">
                              最終確認に進む前に、
                              <strong className="font-semibold text-slate-900">Salesforce への紐づけ先</strong>
                              が正しいか必ず確認してください。
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">
                            要確認
                          </span>
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                              <Building2 className="h-4 w-4" aria-hidden />
                              企業名
                            </div>
                            <p className="mt-2 text-base font-semibold text-slate-900">{rowDraft.company}</p>
                            <p className="mt-2 text-xs text-slate-500">企業マスタ・取引先との一致を確認</p>
                            <div className="mt-4 border-t border-slate-100 pt-4">
                              <p className="text-xs font-semibold text-slate-700">Salesforce 取引先 URL</p>
                              <a
                                href={sfLinks.accountUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 underline decoration-sky-200 underline-offset-2 hover:text-sky-900"
                              >
                                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                                取引先レコードを開く
                              </a>
                              <p className="mt-1.5 break-all font-mono text-[10px] leading-relaxed text-slate-500">
                                {sfLinks.accountUrl}
                              </p>
                              <figure className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
                                <img
                                  src={SF_SCREENSHOT_DEMO}
                                  alt={`${rowDraft.company} の取引先画面のキャプチャ（デモ）`}
                                  className="max-h-40 w-full object-cover object-top sm:max-h-44"
                                  loading="lazy"
                                />
                                <figcaption className="border-t border-slate-100 bg-white px-2 py-1.5 text-center text-[10px] text-slate-500">
                                  保存済みスクリーンショット（本番では同期されたキャプチャを表示）
                                </figcaption>
                              </figure>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                              <Plane className="h-4 w-4" aria-hidden />
                              ツアー名（案件名）
                            </div>
                            <p className="mt-2 text-base font-semibold text-slate-900">{rowDraft.project}</p>
                            <p className="mt-2 text-xs text-slate-500">商談・ツアー案件との一致を確認</p>
                            <div className="mt-4 border-t border-slate-100 pt-4">
                              <p className="text-xs font-semibold text-slate-700">Salesforce 案件 URL</p>
                              <a
                                href={sfLinks.opportunityUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 underline decoration-sky-200 underline-offset-2 hover:text-sky-900"
                              >
                                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                                案件（Opportunity）を開く
                              </a>
                              <p className="mt-1.5 break-all font-mono text-[10px] leading-relaxed text-slate-500">
                                {sfLinks.opportunityUrl}
                              </p>
                              <figure className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
                                <img
                                  src={SF_SCREENSHOT_DEMO}
                                  alt={`${rowDraft.project} の案件画面のキャプチャ（デモ）`}
                                  className="max-h-40 w-full object-cover object-top sm:max-h-44"
                                  loading="lazy"
                                />
                                <figcaption className="border-t border-slate-100 bg-white px-2 py-1.5 text-center text-[10px] text-slate-500">
                                  保存済みスクリーンショット（案件ごとに別画像を紐づけ可能）
                                </figcaption>
                              </figure>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        id={item.id === todayCases[0]?.id ? "sales-final-confirm" : undefined}
                        className="scroll-mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">最終確認・登録用テキスト</h3>
                            <p className="mt-1 text-sm text-slate-500">Salesforceに登録するための最終文章</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPlainForQueue(item.id)}
                            className="shrink-0 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                          >
                            {copiedId === item.id ? "コピーしました" : "コピー"}
                          </button>
                        </div>

                        <div className="mt-4">
                          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">企業名（見出し）</p>
                                <p className="mt-1 break-words text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                                  【{rowDraft.company}】
                                </p>
                              </div>
                              <span
                                className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 sm:px-3 sm:text-xs ${typeStyle[item.type]}`}
                              >
                                {item.type === "メール" ? (
                                  <Mail className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
                                ) : (
                                  <Handshake className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
                                )}
                                <span className="whitespace-nowrap">
                                  {item.type === "メール" ? "メール起点" : "面談・通話起点"}
                                </span>
                              </span>
                            </div>

                            <ul className="space-y-3">
                              <li className="flex gap-3 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                                  <Briefcase className="h-5 w-5 text-slate-600" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-500">① 案件名</p>
                                  <p className="mt-1 text-sm font-medium text-slate-900">{rowDraft.project}</p>
                                </div>
                              </li>
                              <li className="flex gap-3 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                                  <UserCircle className="h-5 w-5 text-slate-600" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-500">② 面談者（部署と役職）</p>
                                  <p className="mt-1 text-sm font-medium text-slate-900">{rowDraft.contact}</p>
                                </div>
                              </li>
                              <li className="flex gap-3 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                                  <Target className="h-5 w-5 text-slate-600" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-500">③ 訪問意図・狙い</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-800">{rowDraft.intent}</p>
                                </div>
                              </li>
                              <li className="flex gap-3 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                                  <ListChecks className="h-5 w-5 text-slate-600" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-500">④ ネクストアクション</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-800">{rowDraft.nextAction}</p>
                                </div>
                              </li>
                            </ul>

                            <details className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-600">
                              <summary className="cursor-pointer select-none font-medium text-slate-700">
                                プレーンテキスト（貼り付け用）
                              </summary>
                              <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-700">{rowPlain}</pre>
                            </details>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openResummarizeCompare(item.id)}
                            className="inline-flex items-center gap-2 rounded-2xl border-2 border-sky-400 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-950 shadow-sm hover:bg-sky-100"
                          >
                            <RefreshCcw className="h-4 w-4 shrink-0 text-sky-700" aria-hidden />
                            再要約
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/handwritten-demo", {
                                state: {
                                  queueId: item.id,
                                  initialDraft: draftOverrides[item.id] ?? queueItemToDraft(item),
                                },
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-100"
                          >
                            <Keyboard className="h-4 w-4 shrink-0 text-amber-800" aria-hidden />
                            下書きを編集
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-500/40 hover:bg-emerald-700"
                          >
                            <Building2 className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                            Salesforceへ登録
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
                  </div>
                </div>
                </div>
            </section>

        <section
          id="architecture-triggers"
          className="scroll-mt-8 mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                <span className="text-sm font-semibold text-sky-700 sm:text-base">3. </span>
                トリガー
              </h2>
              <p className="mt-1 text-base font-medium text-slate-600">いつ・何をきっかけに動くか</p>
            </div>
            <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 lg:block">
              打ち合わせ終了 / 電話終了 / メール送信を起点に自動候補化
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {triggers.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="architecture-data-layer"
          className="scroll-mt-8 mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            <span className="text-sm font-semibold text-sky-700 sm:text-base">4. </span>
            データ取得レイヤー
          </h2>
          <p className="mt-1 text-base font-medium text-slate-600">材料を集める場所</p>
          <div className="mt-6 space-y-4">
            {sources.map((group) => (
              <div key={group.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    {group.title === "Outlook" ? (
                      <Mail className="h-5 w-5 text-slate-700" />
                    ) : group.title === "音声データ" ? (
                      <Mic className="h-5 w-5 text-slate-700" />
                    ) : (
                      <FileText className="h-5 w-5 text-slate-700" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{group.title}</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        
      </div>

      {resummarizeCompare ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resummarize-compare-title"
        >
          <button
            type="button"
            className="absolute inset-0 z-0 bg-slate-900/50 backdrop-blur-[2px]"
            aria-label="比較画面を閉じる"
            onClick={() => setResummarizeCompare(null)}
          />
          <div className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id="resummarize-compare-title" className="text-lg font-bold text-slate-900">
                  再要約の確認
                </h2>
                {resummarizeTargetLabel ? (
                  <p className="mt-1 text-sm font-medium text-slate-800">{resummarizeTargetLabel}</p>
                ) : null}
                <p className="mt-1 text-sm text-slate-600">
                  元のレポートと新しい要約を並べて確認し、採用するか決めてください（デモではAI応答をモック表示しています）。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResummarizeCompare(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
                <div className="flex flex-col border-b border-slate-200 p-4 sm:p-5 lg:border-b-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">元のレポート</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">再要約する前の文案</p>
                  <pre className="mt-3 max-h-[min(40vh,320px)] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700 ring-1 ring-slate-100 lg:max-h-[min(52vh,420px)]">
                    {beforePlain}
                  </pre>
                </div>
                <div className="flex flex-col p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-700">新しい要約</p>
                  <p className="mt-1 text-sm font-semibold text-sky-950">AIが再生成した案</p>
                  <pre className="mt-3 max-h-[min(40vh,320px)] overflow-auto whitespace-pre-wrap rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4 text-xs leading-6 text-slate-800 ring-1 ring-sky-100 lg:max-h-[min(52vh,420px)]">
                    {afterPlain}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setResummarizeCompare(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={adoptResummarize}
                className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-600/25 hover:bg-sky-700"
              >
                新しい要約を採用
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
