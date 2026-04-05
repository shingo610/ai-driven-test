import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ClipboardCopy, Keyboard, RotateCcw } from "lucide-react";
import {
  formatSalesReportDraftPlain,
  type SalesReportDraft,
} from "./salesReportDraft";

const DEFAULT_DRAFT: SalesReportDraft = {
  company: "株式会社みらい商事",
  project: "インセンティブツアー",
  contact: "●●部 ご担当者様",
  intent: "見積送付、日程候補共有、添付資料の補足説明を案件単位で集約。",
  nextAction: "内容を反映した見積・資料を提出し、条件確認を継続する。",
};

type EditorState = {
  queueId?: number;
  initialDraft?: SalesReportDraft;
};

export default function HandwrittenCorrectionDemoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queueIdRef = useRef(1);

  const [draft, setDraft] = useState<SalesReportDraft>(() => ({ ...DEFAULT_DRAFT }));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const st = location.state as EditorState | null;
    if (typeof st?.queueId === "number") queueIdRef.current = st.queueId;
    if (st?.initialDraft) setDraft({ ...st.initialDraft });
  }, [location.key]);

  const plain = useMemo(() => formatSalesReportDraftPlain(draft), [draft]);

  const resetDraft = () => {
    setDraft({ ...DEFAULT_DRAFT });
    setCopied(false);
  };

  const copyPlain = async () => {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const applyAndReturn = () => {
    navigate("/sales-report", {
      state: { appliedDraft: draft, queueId: queueIdRef.current },
    });
  };

  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-4xl lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/sales-report"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            構造図に戻る
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 ring-1 ring-sky-200">
            <Keyboard className="h-3.5 w-3.5" aria-hidden />
            デモ（キーボードで編集）
          </span>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">下書きの修正</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            AIが出した報告文案を、キーボードでそのまま直してから登録する想定です。各項目は自由に書き換え、
            <strong className="font-semibold text-slate-800">適用</strong>
            で実務画面イメージに反映されます。
          </p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetDraft}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4 text-slate-600" aria-hidden />
            初期文案に戻す
          </button>
          <button
            type="button"
            onClick={copyPlain}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <ClipboardCopy className="h-4 w-4 opacity-95" aria-hidden />
            {copied ? "コピーしました" : "整形テキストをコピー"}
          </button>
          <button
            type="button"
            onClick={applyAndReturn}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
          >
            <Check className="h-4 w-4 opacity-95" aria-hidden />
            適用
          </button>
        </div>

        <div className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <label htmlFor="draft-company" className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              企業名（見出し用）
            </label>
            <input
              id="draft-company"
              type="text"
              value={draft.company}
              onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
              className={fieldClass}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="draft-project" className="text-sm font-semibold text-slate-800">
              ① 案件名
            </label>
            <input
              id="draft-project"
              type="text"
              value={draft.project}
              onChange={(e) => setDraft((d) => ({ ...d, project: e.target.value }))}
              className={fieldClass}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="draft-contact" className="text-sm font-semibold text-slate-800">
              ② 面談者（部署と役職）
            </label>
            <input
              id="draft-contact"
              type="text"
              value={draft.contact}
              onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))}
              className={fieldClass}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="draft-intent" className="text-sm font-semibold text-slate-800">
              ③ 訪問意図・狙い
            </label>
            <textarea
              id="draft-intent"
              value={draft.intent}
              onChange={(e) => setDraft((d) => ({ ...d, intent: e.target.value }))}
              rows={4}
              className={`${fieldClass} resize-y min-h-[6rem]`}
            />
          </div>

          <div>
            <label htmlFor="draft-next" className="text-sm font-semibold text-slate-800">
              ④ ネクストアクション
            </label>
            <textarea
              id="draft-next"
              value={draft.nextAction}
              onChange={(e) => setDraft((d) => ({ ...d, nextAction: e.target.value }))}
              rows={3}
              className={`${fieldClass} resize-y min-h-[5rem]`}
            />
          </div>
        </div>

        <details className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          <summary className="cursor-pointer select-none font-medium text-slate-700">プレーンテキストプレビュー（貼り付け用）</summary>
          <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-700">{plain}</pre>
        </details>
      </div>
    </div>
  );
}
