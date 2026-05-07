import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const emsalRouter = Router();

const PYTHON_API = "http://127.0.0.1:3002";

// POST /emsal/search
emsalRouter.post("/search", requireAuth, async (req, res) => {
  const {
    keyword = "",
    selected_bam_civil_court = "",
    selected_civil_court = "",
    selected_regional_civil_chambers = [],
    case_year_esas = "",
    case_start_seq_esas = "",
    case_end_seq_esas = "",
    decision_year_karar = "",
    decision_start_seq_karar = "",
    decision_end_seq_karar = "",
    start_date = "",
    end_date = "",
    sort_criteria = "1",
    sort_direction = "desc",
    page = 1,
    pageSize = 10,
  } = req.body as {
    keyword?: string;
    selected_bam_civil_court?: string;
    selected_civil_court?: string;
    selected_regional_civil_chambers?: string[];
    case_year_esas?: string;
    case_start_seq_esas?: string;
    case_end_seq_esas?: string;
    decision_year_karar?: string;
    decision_start_seq_karar?: string;
    decision_end_seq_karar?: string;
    start_date?: string;
    end_date?: string;
    sort_criteria?: string;
    sort_direction?: string;
    page?: number;
    pageSize?: number;
  };

  try {
    const pythonRes = await fetch(`${PYTHON_API}/emsal/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword,
        selected_bam_civil_court,
        selected_civil_court,
        selected_regional_civil_chambers,
        case_year_esas,
        case_start_seq_esas,
        case_end_seq_esas,
        decision_year_karar,
        decision_start_seq_karar,
        decision_end_seq_karar,
        start_date,
        end_date,
        sort_criteria,
        sort_direction,
        page,
        pageSize,
      }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[emsal] proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Emsal search service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[emsal] proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});

// GET /emsal/decision/:docId
emsalRouter.get("/decision/:docId", requireAuth, async (req, res) => {
  const { docId } = req.params;

  if (!docId?.trim()) {
    return res.status(400).json({ detail: "docId is required" });
  }

  try {
    const pythonRes = await fetch(`${PYTHON_API}/emsal/document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: docId }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[emsal] decision proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Emsal document service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[emsal] decision proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});
