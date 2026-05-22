/**
 * api.js — Kamus Bugis API Service Layer
 * Base URL dikonfigurasi via VITE_API_URL (environment variable).
 *
 * Development : http://localhost:8080  (default)
 * Production  : https://api.kamusbugis.com
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ── Shared fetch wrapper ──────────────────────────────────────────────────────

/**
 * Fetch JSON dari backend dengan error handling terpusat.
 * @throws {ApiError} jika response tidak OK atau network gagal
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ApiError(
        `Request gagal: ${res.status} ${res.statusText}`,
        res.status,
        text
      );
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network error / CORS / timeout
    throw new ApiError(
      "Tidak dapat menghubungi server. Pastikan backend berjalan.",
      0,
      err.message
    );
  }
}

// ── Custom Error class ────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, status = 0, detail = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Cari kata berdasarkan query string.
 * GET /api/cari?q={query}
 * @returns {Promise<Array<{id,lontaraq,latin,makna}>>}
 */
export async function searchKata(query) {
  if (!query || !query.trim()) return [];
  const q = encodeURIComponent(query.trim());
  return apiFetch(`/api/cari?q=${q}`);
}

/**
 * Ambil detail lengkap sebuah kata.
 * GET /api/kata/{id}
 * @returns {Promise<Array<{properti,nilai}>>}
 */
export async function getDetailKata(id) {
  return apiFetch(`/api/kata/${encodeURIComponent(id)}`);
}

/**
 * Ambil daftar sinonim sebuah kata.
 * GET /api/sinonim/{id}
 * @returns {Promise<Array<{sinonim,lontaraq,latin}>>}
 */
export async function getSinonim(id) {
  return apiFetch(`/api/sinonim/${encodeURIComponent(id)}`);
}

/**
 * Ambil daftar antonim sebuah kata.
 * GET /api/antonim/{id}
 * @returns {Promise<Array<{antonim,lontaraq,latin}>>}
 */
export async function getAntonim(id) {
  return apiFetch(`/api/antonim/${encodeURIComponent(id)}`);
}

/**
 * Ambil data graf relasi semantik sebuah kata.
 * GET /api/graf/{id}
 * @returns {Promise<Array<{relasi,ke,labelKe}>>}
 */
export async function getGrafRelasi(id) {
  return apiFetch(`/api/graf/${encodeURIComponent(id)}`);
}

/**
 * Ambil semua kata dengan pagination.
 * GET /api/semua?page={page}
 * @param {number} page - halaman (0-indexed)
 * @returns {Promise<Array<{latin,lontaraq,makna,tipe}>>}
 */
export async function getAllKata(page = 0) {
  return apiFetch(`/api/semua?page=${page}`);
}

/**
 * Kirim pertanyaan ke AI.
 * POST /api/tanya  { pertanyaan: string }
 * @returns {Promise<{jawaban: string, sumber?: string}>}
 */
export async function tanyaAI(pertanyaan) {
  return apiFetch("/api/tanya", {
    method: "POST",
    body: JSON.stringify({ pertanyaan }),
  });
}

// ── Utility: label relasi untuk tampilan ─────────────────────────────────────

export const LABEL_RELASI = {
  sinonimDari: "Sinonim",
  antonimDari: "Antonim",
  diturunkanDari: "Diturunkan dari",
  berkaitanDengan: "Berkaitan dengan",
};

export const WARNA_RELASI = {
  sinonimDari: "#0E7C86",
  antonimDari: "#D6553E",
  diturunkanDari: "#7C3AED",
  berkaitanDengan: "#0F3D6E",
};
