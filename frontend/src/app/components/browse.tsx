import { useState, useEffect, useCallback } from "react";
import { Filter, Database, Play, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { getAllKata, searchKata } from "../../services/api.js";
import { useNavigate, useSearchParams } from "react-router";

// ── Types ─────────────────────────────────────────────────────────────────────
interface KataEntry {
  latin: string;
  lontaraq: string;
  makna: string;
  tipe: string;
  id?: string;
}

interface BrowseProps {
  onSelectWord?: (id: string) => void;
}

const CATEGORIES = ["nomina", "verba", "adjektiva", "adverbia", "frasa"];
const PAGE_SIZE = 20;

// ── Skeleton row ──────────────────────────────────────────────────────────────
function EntrySkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-16 h-12 rounded-lg bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="h-5 w-14 rounded bg-slate-100" />
            <div className="h-5 w-16 rounded bg-slate-100" />
          </div>
          <div className="h-4 w-48 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// ── Tipe badge color ──────────────────────────────────────────────────────────
function typeBadge(tipe: string) {
  const t = tipe.toLowerCase();
  if (t.includes("nomina"))    return "bg-blue-50 text-[#0F3D6E]";
  if (t.includes("verba"))     return "bg-teal-50 text-[#0E7C86]";
  if (t.includes("adjektiva")) return "bg-amber-50 text-amber-700";
  if (t.includes("frasa"))     return "bg-purple-50 text-purple-700";
  return "bg-slate-100 text-slate-600";
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function Browse({ onSelectWord }: BrowseProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [entries, setEntries] = useState<KataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterText, setFilterText] = useState(searchParams.get("q") ?? "");
  const [filterQuery, setFilterQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  // Fetch data
  const fetchData = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      let data: KataEntry[];
      if (q.trim()) {
        data = await searchKata(q);
      } else {
        data = await getAllKata(p);
      }
      setEntries(data ?? []);
      setHasMore((data?.length ?? 0) === PAGE_SIZE);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + react to URL param
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setFilterText(q);
    setFilterQuery(q);
    setPage(0);
    fetchData(0, q);
  }, [searchParams, fetchData]);

  // Page change
  useEffect(() => {
    if (!filterQuery.trim()) {
      fetchData(page, "");
    }
  }, [page, fetchData, filterQuery]);

  const handleFilter = () => {
    setFilterQuery(filterText);
    setPage(0);
    fetchData(0, filterText);
    if (filterText.trim()) {
      navigate(`/jelajah?q=${encodeURIComponent(filterText)}`);
    }
  };

  const toggleCat = (c: string) =>
    setSelectedCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  // Client-side category filter
  const displayed = selectedCats.length > 0
    ? entries.filter((e) =>
        selectedCats.some((c) => e.tipe?.toLowerCase().includes(c))
      )
    : entries;

  const cleanTipe = (tipe: string) => {
    if (!tipe) return "";
    if (tipe.includes("#")) return tipe.substring(tipe.lastIndexOf("#") + 1).toLowerCase();
    return tipe.toLowerCase();
  };

  return (
    <section id="browse" className="py-20 lg:py-28 bg-[#F8FAFC] border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#0F3D6E] mb-2">Jelajah Kata</div>
            <h2
              className="font-display text-slate-900 tracking-tight"
              style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15 }}
            >
              Telusuri seluruh entri kamus.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Filter cepat…"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                className="w-56 bg-white pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2 border-slate-200 bg-white"
              onClick={handleFilter}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              Cari
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar filters */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl bg-white border border-slate-200 p-5 sticky top-20">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Kategori</div>
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={selectedCats.includes(c)}
                      onCheckedChange={() => toggleCat(c)}
                    />
                    <span className="text-sm text-slate-700 capitalize">{c}</span>
                  </label>
                ))}
              </div>

              {selectedCats.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs text-slate-400 w-full"
                  onClick={() => setSelectedCats([])}
                >
                  Hapus filter
                </Button>
              )}
            </div>
          </aside>

          {/* Entry list */}
          <div className="lg:col-span-3 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <EntrySkeleton key={i} />)
            ) : displayed.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center text-slate-400">
                {filterQuery
                  ? `Tidak ada hasil untuk "${filterQuery}"`
                  : "Tidak ada data."}
              </div>
            ) : (
              displayed.map((e, i) => {
                const tipe = cleanTipe(e.tipe);
                const wordId = e.id ?? e.latin;
                return (
                  <button
                    key={`${wordId}-${i}`}
                    onClick={() => onSelectWord ? onSelectWord(wordId) : navigate(`/jelajah?kata=${wordId}`)}
                    className="w-full block rounded-2xl bg-white border border-slate-200 hover:border-[#0E7C86] hover:shadow-sm transition-all p-5 text-left"
                  >
                    <div className="flex items-center gap-6 flex-wrap">
                      <div
                        className="font-lontara text-[#0F3D6E] leading-none w-16 shrink-0"
                        style={{ fontSize: "2.25rem" }}
                      >
                        {e.lontaraq}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-display text-slate-900" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                            {e.latin}
                          </span>
                          {tipe && (
                            <span className={`text-xs px-2 py-0.5 rounded-md ${typeBadge(e.tipe)}`}>
                              {tipe}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mt-1.5 line-clamp-2">{e.makna}</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}

            {/* Pagination (hanya tampil jika tidak sedang filter teks) */}
            {!filterQuery && !loading && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-slate-500">
                  Halaman {page + 1} · {displayed.length} entri
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 bg-white"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 py-1.5 text-sm text-slate-700 bg-[#0F3D6E] text-white rounded-md">
                    {page + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 bg-white"
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SPARQL Editor */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0E7C86]" />
              <span className="text-sm" style={{ fontWeight: 600 }}>SPARQL Query Editor</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300">
                pengguna teknis
              </span>
            </div>
            <Button size="sm" className="bg-[#0E7C86] hover:bg-[#0a6b73] gap-1.5">
              <Play className="w-3.5 h-3.5" /> Jalankan
            </Button>
          </div>
          <div className="grid lg:grid-cols-2">
            <pre className="px-5 py-4 text-xs leading-relaxed font-mono overflow-x-auto">
{`PREFIX bugis: <http://example.org/bugis#>
PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?latin ?lontaraq ?makna
WHERE {
  ?w rdf:type         bugis:Nomina ;
     bugis:bentukLatin    ?latin ;
     bugis:aksaraLontaraq ?lontaraq ;
     bugis:maknaIndonesia ?makna .
}
ORDER BY ?latin
LIMIT 25`}
            </pre>
            <div className="bg-slate-950/40 border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="grid grid-cols-3 text-xs text-slate-400 px-4 py-2 border-b border-white/10">
                <span>?latin</span><span>?lontaraq</span><span>?makna</span>
              </div>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-3 text-sm px-4 py-2 border-b border-white/5 animate-pulse">
                    <div className="h-4 w-16 rounded bg-slate-700" />
                    <div className="h-4 w-10 rounded bg-slate-700" />
                    <div className="h-4 w-24 rounded bg-slate-700" />
                  </div>
                ))
              ) : (
                entries.slice(0, 5).map((e, i) => (
                  <div key={i} className="grid grid-cols-3 text-sm px-4 py-2 border-b border-white/5">
                    <span className="text-amber-300">{e.latin}</span>
                    <span className="font-lontara text-white">{e.lontaraq}</span>
                    <span className="text-slate-300 truncate">{e.makna}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
