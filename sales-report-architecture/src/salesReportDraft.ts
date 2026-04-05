export type SalesReportDraft = {
  company: string;
  project: string;
  contact: string;
  intent: string;
  nextAction: string;
};

const DEFAULT_NEXT =
  "内容を反映した見積・資料を提出し、条件確認を継続する。";

export function queueItemToDraft(item: {
  company: string;
  project: string;
  summary: string;
}): SalesReportDraft {
  return {
    company: item.company,
    project: item.project,
    contact: "●●部 ご担当者様",
    intent: item.summary,
    nextAction: DEFAULT_NEXT,
  };
}

export function formatSalesReportDraftPlain(d: SalesReportDraft): string {
  return `【${d.company}】

①案件名：${d.project}
②面談者（部署と役職）：${d.contact}
③訪問意図・狙い：
${d.intent}

④ネクストアクション：
${d.nextAction}`;
}

/** デモ用：再要約APIの代わりに差分が分かる文案を返す */
export function mockResummarizeDraft(d: SalesReportDraft): SalesReportDraft {
  return {
    company: d.company,
    project: d.project,
    contact: d.contact,
    intent: `【再要約】\n${d.intent}\n\n（整理）顧客の関心点と当社の提案ポイントを分けて記載しました。`,
    nextAction: `${d.nextAction}\n\n（追記）次回までに社内メモへ進捗を1行更新してください。`,
  };
}
