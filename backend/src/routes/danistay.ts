import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const danistayRouter = Router();

const PYTHON_API = "http://127.0.0.1:3002";

// POST /danistay/search — keyword search
danistayRouter.post("/search", requireAuth, async (req, res) => {
  const {
    andKelimeler = [],
    orKelimeler = [],
    notAndKelimeler = [],
    notOrKelimeler = [],
    page = 1,
    pageSize = 10,
  } = req.body as {
    andKelimeler?: string[];
    orKelimeler?: string[];
    notAndKelimeler?: string[];
    notOrKelimeler?: string[];
    page?: number;
    pageSize?: number;
  };

  try {
    const pythonRes = await fetch(`${PYTHON_API}/danistay/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        andKelimeler,
        orKelimeler,
        notAndKelimeler,
        notOrKelimeler,
        page,
        pageSize,
      }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[danistay] proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Danıştay search service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[danistay] proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});

// POST /danistay/search-detailed — detailed search
danistayRouter.post("/search-detailed", requireAuth, async (req, res) => {
  const {
    daire = "",
    esasYil = "",
    esasIlkSiraNo = "",
    esasSonSiraNo = "",
    kararYil = "",
    kararIlkSiraNo = "",
    kararSonSiraNo = "",
    baslangicTarihi = "",
    bitisTarihi = "",
    mevzuatNumarasi = "",
    mevzuatAdi = "",
    madde = "",
    siralama = "1",
    siralamaDirection = "desc",
    page = 1,
    pageSize = 10,
  } = req.body as {
    daire?: string;
    esasYil?: string;
    esasIlkSiraNo?: string;
    esasSonSiraNo?: string;
    kararYil?: string;
    kararIlkSiraNo?: string;
    kararSonSiraNo?: string;
    baslangicTarihi?: string;
    bitisTarihi?: string;
    mevzuatNumarasi?: string;
    mevzuatAdi?: string;
    madde?: string;
    siralama?: string;
    siralamaDirection?: string;
    page?: number;
    pageSize?: number;
  };

  try {
    const pythonRes = await fetch(`${PYTHON_API}/danistay/search-detailed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        daire,
        esasYil,
        esasIlkSiraNo,
        esasSonSiraNo,
        kararYil,
        kararIlkSiraNo,
        kararSonSiraNo,
        baslangicTarihi,
        bitisTarihi,
        mevzuatNumarasi,
        mevzuatAdi,
        madde,
        siralama,
        siralamaDirection,
        page,
        pageSize,
      }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[danistay] detailed proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Danıştay detailed search service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[danistay] detailed proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});

// GET /danistay/decision/:docId
danistayRouter.get("/decision/:docId", requireAuth, async (req, res) => {
  const { docId } = req.params;

  if (!docId?.trim()) {
    return res.status(400).json({ detail: "docId is required" });
  }

  try {
    const pythonRes = await fetch(`${PYTHON_API}/danistay/document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: docId }),
    });

    if (!pythonRes.ok) {
      const text = await pythonRes.text();
      console.error("[danistay] decision proxy error:", pythonRes.status, text);
      return res.status(502).json({ detail: "Danıştay document service error" });
    }

    const json = await pythonRes.json();
    res.json(json);
  } catch (e) {
    console.error("[danistay] decision proxy exception:", (e as Error).message);
    res.status(500).json({ detail: (e as Error).message ?? "Unknown error" });
  }
});
