/**
 * メイン会場マスタAPI（Node 18+）
 * - GET  /api/main-venue/hint?name=会場名
 * - POST /api/main-venue/suggest  { eventAxisIndex, venueNames[], ganttMonthCount }
 * - POST /api/main-venue/fetch-official { venueName, officialUrl? }  … HTML抜粋のみ（パース未実装）
 *
 * 起動: npm run venue-api
 * フロント開発: npm run dev（Vite が /api をこのポートへプロキシ）
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HINTS_PATH = join(__dirname, "../src/data/mainVenueHints.json");
const hints = JSON.parse(readFileSync(HINTS_PATH, "utf8"));

const PORT = Number(process.env.VENUE_API_PORT || 8787);

function json(res, status, body) {
  const s = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(s),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(s);
}

function getHint(name) {
  const k = String(name || "").trim();
  if (!k || !(k in hints)) return null;
  const row = hints[k];
  if (!row || typeof row !== "object" || typeof row.officialUrl !== "string") return null;
  return row;
}

function suggestAxis(eventAxisIndex, venueNames, ganttMonthCount) {
  const mc = Math.max(1, Math.floor(Number(ganttMonthCount) || 21));
  const em = Math.max(0, Math.min(mc - 1, Math.floor(Number(eventAxisIndex) || 0)));
  const matched = [];
  const starts = [];
  for (const raw of venueNames || []) {
    const row = getHint(raw);
    if (!row) continue;
    matched.push({
      venueName: String(raw).trim(),
      officialUrl: row.officialUrl,
      suggestedLeadMonths: row.suggestedLeadMonths,
      priority: row.priority,
    });
    const lead = Number(row.suggestedLeadMonths) || 0;
    starts.push(Math.max(0, em - lead));
  }
  if (starts.length === 0) return { mainVenueAxisIndex: null, matched };
  return { mainVenueAxisIndex: Math.min(...starts), matched };
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (url.pathname === "/api/health" && req.method === "GET") {
    json(res, 200, { ok: true, service: "venue-hints", hintCount: Object.keys(hints).length });
    return;
  }

  if (url.pathname === "/api/main-venue/hint" && req.method === "GET") {
    const name = url.searchParams.get("name");
    const row = getHint(name);
    if (!row) {
      json(res, 404, { error: "not_in_master", name: name?.trim?.() ?? "" });
      return;
    }
    json(res, 200, {
      venueName: name.trim(),
      officialUrl: row.officialUrl,
      suggestedLeadMonths: row.suggestedLeadMonths,
      priority: row.priority,
      integrationNotes: row.integrationNotes,
      source: "server_static_json",
      fetchedAt: new Date().toISOString(),
    });
    return;
  }

  if (url.pathname === "/api/main-venue/suggest" && req.method === "POST") {
    const body = await readBody(req);
    const { eventAxisIndex, venueNames, ganttMonthCount } = body;
    const { mainVenueAxisIndex, matched } = suggestAxis(eventAxisIndex, venueNames, ganttMonthCount);
    json(res, 200, {
      mainVenueAxisIndex,
      matched,
      ganttMonthCount: Math.max(1, Math.floor(Number(ganttMonthCount) || 21)),
      source: "server_master",
    });
    return;
  }

  if (url.pathname === "/api/main-venue/fetch-official" && req.method === "POST") {
    const body = await readBody(req);
    const venueName = String(body.venueName || "").trim();
    const row = getHint(venueName);
    const officialUrl = String(body.officialUrl || row?.officialUrl || "").trim();
    if (!officialUrl) {
      json(res, 400, {
        ok: false,
        venueName,
        error: "officialUrl が必要です（マスタ未登録会場は URL を指定してください）",
        staticFallback: row || null,
      });
      return;
    }
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 12000);
      const r = await fetch(officialUrl, {
        redirect: "follow",
        signal: ac.signal,
        headers: {
          "User-Agent": "VenueHintsDemo/1.0 (+https://localhost; デモ用)",
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(t);
      const text = await r.text();
      const excerpt = text.replace(/\s+/g, " ").slice(0, 1200);
      json(res, 200, {
        ok: true,
        venueName,
        officialUrl,
        httpStatus: r.status,
        excerpt,
        message:
          "HTML先頭付近の抜粋のみです。予約開始日の自動抽出は会場別パーサー／CMS連携が必要です。",
        staticFallback: row || null,
      });
    } catch (e) {
      json(res, 200, {
        ok: false,
        venueName,
        officialUrl,
        error: String(e?.message || e),
        staticFallback: row || null,
        message: "取得失敗時は静的マスタまたは手入力で運用してください。",
      });
    }
    return;
  }

  json(res, 404, { error: "not_found" });
});

server.listen(PORT, () => {
  console.log(`[venue-api] http://127.0.0.1:${PORT}  (hints: ${Object.keys(hints).length} venues)`);
});
