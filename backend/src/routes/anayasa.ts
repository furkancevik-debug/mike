import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const anayasaRouter = Router();

// POST /anayasa/search — Norm Denetimi arama
anayasaRouter.post("/search", requireAuth, async (req, res) => {
  const {
    keywords_all = [],
    keywords_any = [],
    keywords_exclude = [],
    period = "",
    case_number = "",
    decision_number = "",
    decision_date_start = "",
    decision_date_end = "",
    norm_type = "",
    results_per_page = 10,
    page = 1,
    sort_by = "KararTarihi",
  } = req.body as {
    keywords_all?: string[];
    keywords_any?: string[];
    keywords_exclude?: string[];
    period?: string;
    case_number?: string;
    decision_number?: string;
    decision_date_start?: string;
    decision_date_end?: string;
    norm_type?: string;
    results_per_page?: number;
    page?: number;
    sort_by?: string;
  };

  const headers = {
    Host: "normkararlarbilgibankasi.anayasa.gov.tr",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Origin: "https://normkararlarbilgibankasi.anayasa.gov.tr",
    Referer: "https://normkararlarbilgibankasi.anayasa.gov.tr/Ara",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
  };

  const params = new URLSearchParams();
  if (keywords_all.length) keywords_all.forEach((k) => params.append("KelimeAra[]", k));
  if (keywords_any.length) keywords_any.forEach((k) => params.append("HerhangiBirKelimeAra[]", k));
  if (keywords_exclude.length) keywords_exclude.forEach((k) => params.append("BulunmayanKelimeAra[]", k));
  if (period) params.append("Donemler_id", period);
  if (case_number) params.append("EsasNo", case_number);
  if (decision_number) params.append("KararNo", decision_number);
  if (decision_date_start) params.append("KararTarihiIlk", decision_date_start);
  if (decision_date_end) params.append("KararTarihiSon", decision_date_end);
  if (norm_type) params.append("NormunTurler_id", norm_type);
  params.append("Ara", "Ara");
  params.append("page", String(page));
  params.append("rowcount", String(results_per_page));
  params.append("order", sort_by);

  try {
    const searchResponse = await fetch(
      "https://normkararlarbilgibankasi.anayasa.gov.tr/Ara",
      {
        method: "POST",
        headers,
        body: params.toString(),
      }
    );

    if (!searchResponse.ok) {
      const text = await searchResponse.text();
      console.error("[anayasa] search error:", searchResponse.status, text.substring(0, 200));
      return res.status(502).json({ detail: "Anayasa API returned error" });
    }

    const html = await searchResponse.text();

    // Parse results from HTML table
    const results = parseAnayasaResults(html);

    res.json({ data: results, page, resultsPerPage: results_per_page });
  } catch (e) {
    console.error("[anayasa] search exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});

// GET /anayasa/decision/:docId — get decision detail
anayasaRouter.get("/decision/:docId", requireAuth, async (req, res) => {
  const { docId } = req.params;

  if (!docId?.trim()) {
    return res.status(400).json({ detail: "docId is required" });
  }

  const headers = {
    Host: "normkararlarbilgibankasi.anayasa.gov.tr",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Origin: "https://normkararlarbilgibankasi.anayasa.gov.tr",
    Referer: "https://normkararlarbilgibankasi.anayasa.gov.tr/Ara",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  };

  try {
    const detailResponse = await fetch(
      `https://normkararlarbilgibankasi.anayasa.gov.tr/MedenDosyaVeriArayüz/Detay?esassira=${encodeURIComponent(docId)}`,
      { method: "GET", headers }
    );

    if (!detailResponse.ok) {
      const text = await detailResponse.text();
      console.error("[anayasa] decision error:", detailResponse.status, text.substring(0, 200));
      return res.status(502).json({ detail: "Anayasa decision API error" });
    }

    const json = await detailResponse.json();
    res.json(json);
  } catch (e) {
    console.error("[anayasa] decision exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});

// Simple HTML parser for Anayasa search results
function parseAnayasaResults(html: string) {
  const results: Array<{
    id: string;
    esasNo: string;
    kararNo: string;
    kararTarihi: string;
    basvuruTuru: string;
    normTuru: string;
    kararSonuc: string;
  }> = [];

  // Match table rows with decision data
  const rowRegex = new RegExp("<tr[^>]*>([\\s\\S]*?)</tr>", "gi");
  let match;
  let count = 0;

  // Simple approach: split by </tr> then parse each row
  const rows = html.split("</tr>");

  for (const row of rows) {
    if (count >= 100) break;
    const idMatch = row.match(/Detay\?esassira=([^&"']+)/);
    if (!idMatch) continue;

    const id = idMatch[1];
    const cells: string[] = [];
    const cellMatches = row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    for (const cellMatch of cellMatches) {
      cells.push(stripHtml(cellMatch[1] || ""));
    }

    if (cells.length >= 6) {
      results.push({
        id,
        esasNo: cells[0] || "",
        kararNo: cells[1] || "",
        kararTarihi: cells[2] || "",
        basvuruTuru: cells[3] || "",
        normTuru: cells[4] || "",
        kararSonuc: cells[5] || "",
      });
      count++;
    }
  }

  return results;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

