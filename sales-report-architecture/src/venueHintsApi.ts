/**
 * メイン会場ヒント用バックエンドAPI（開発時は Vite が /api をプロキシ）。
 * ProjectScheduleMockPage の月軸本数と一致させること。
 */
export const GANTT_MONTH_COUNT = 21;

const API_PREFIX = import.meta.env.VITE_VENUE_API_BASE ?? "";

function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_PREFIX ? `${API_PREFIX.replace(/\/$/, "")}${p}` : p;
}

export type MainVenueHintRow = {
  officialUrl: string;
  suggestedLeadMonths: number;
  priority?: number;
  integrationNotes?: string;
};

export type MainVenueSuggestResponse = {
  mainVenueAxisIndex: number | null;
  matched: { venueName: string; officialUrl: string; suggestedLeadMonths: number; priority?: number }[];
  ganttMonthCount: number;
  source: "server_master";
};

export type MainVenueFetchOfficialResponse = {
  ok: boolean;
  venueName: string;
  officialUrl?: string;
  httpStatus?: number;
  excerpt?: string;
  message?: string;
  error?: string;
  staticFallback?: MainVenueHintRow | null;
};

export async function postMainVenueSuggest(
  eventAxisIndex: number,
  venueNames: readonly string[]
): Promise<MainVenueSuggestResponse> {
  const r = await fetch(apiUrl("/api/main-venue/suggest"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventAxisIndex,
      venueNames: [...venueNames],
      ganttMonthCount: GANTT_MONTH_COUNT,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `HTTP ${r.status}`);
  }
  return r.json() as Promise<MainVenueSuggestResponse>;
}

export async function postMainVenueFetchOfficial(
  venueName: string,
  officialUrl?: string
): Promise<MainVenueFetchOfficialResponse> {
  const r = await fetch(apiUrl("/api/main-venue/fetch-official"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ venueName, officialUrl }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `HTTP ${r.status}`);
  }
  return r.json() as Promise<MainVenueFetchOfficialResponse>;
}
