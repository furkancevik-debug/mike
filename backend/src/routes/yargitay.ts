import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const yargitayRouter = Router();

const PYTHON_API = "http://127.0.0.1:3002";

// POST /yargitay/search — keyword search (legacy)
yargitayRouter.post("/search", requireAuth, async (req, res) => {
  const { keyword, page = 1, page_size = 10 } = req.body as {
    keyword?: string;
    page?: number;
    page_size?: number;
  };

  if (!keyword?.trim()) {
    return res.status(400).json({ detail: "keyword is required" });
  }

  try {
    const pythonRes = await fetch(`${PYTHON_API}/yargitay/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: keyword.trim(), page, pageSize: page_size }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[yargitay] proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Yargıtay search service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[yargitay] proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});

// POST /yargitay/search-detailed — advanced search with filters
yargitayRouter.post("/search-detailed", requireAuth, async (req, res) => {
  const {
    keyword = "",
    daire = "",
    esasYil = "",
    esasIlkSiraNo = "",
    esasSonSiraNo = "",
    kararYil = "",
    kararIlkSiraNo = "",
    kararSonSiraNo = "",
    baslangicTarihi = "",
    bitisTarihi = "",
    siralama = "3",
    siralamaDirection = "desc",
    page = 1,
    pageSize = 10,
  } = req.body as {
    keyword?: string;
    daire?: string;
    esasYil?: string;
    esasIlkSiraNo?: string;
    esasSonSiraNo?: string;
    kararYil?: string;
    kararIlkSiraNo?: string;
    kararSonSiraNo?: string;
    baslangicTarihi?: string;
    bitisTarihi?: string;
    siralama?: string;
    siralamaDirection?: string;
    page?: number;
    pageSize?: number;
  };

  try {
    const pythonRes = await fetch(`${PYTHON_API}/yargitay/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword,
        daire,
        esasYil,
        esasIlkSiraNo,
        esasSonSiraNo,
        kararYil,
        kararIlkSiraNo,
        kararSonSiraNo,
        baslangicTarihi,
        bitisTarihi,
        siralama,
        siralamaDirection,
        page,
        pageSize,
      }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[yargitay] detailed proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Yargıtay detailed search service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[yargitay] detailed proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});

// GET /yargitay/decision/:docId — get full decision text
yargitayRouter.get("/decision/:docId", requireAuth, async (req, res) => {
  const { docId } = req.params;

  if (!docId?.trim()) {
    return res.status(400).json({ detail: "docId is required" });
  }

  try {
    const pythonRes = await fetch(`${PYTHON_API}/yargitay/document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: docId }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[yargitay] decision proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Yargıtay document service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[yargitay] decision proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});
