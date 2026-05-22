import { useState, useEffect } from "react";
import { BookOpen, Network, ArrowLeftRight, Layers, X, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { getDetailKata, getSinonim, getAntonim } from "../../services/api.js";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Properti {
  properti: string;
  nilai: string;
}
interface RelatedWord {
  sinonim?: string;
  antonim?: string;
  lontaraq: string;
  latin: string;
}

interface WordDetailProps {
  wordId: string | null;
  onClose?: () => void;
  onSelectWord?: (id: string) => void;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5 p-6">
      <div className="flex gap-4 items-start">
        <Skeleton className="w-24 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
      <div className="space-y-2 mt-4">
        <Skeleton className="h-5 w-24" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    </div>
  );
}

// ── Label mapping untuk properti SPARQL ──────────────────────────────────────
const PROP_LABEL: Record<string, string> = {
  aksaraLontaraq: "Aksara Lontaraq",
  bentukLatin: "Bentuk Latin",
  maknaIndonesia: "Makna",
  contohKalimat: "Contoh Kalimat",
  pelafalan: "Pelafalan (IPA)",
  kategoriGramatikal: "Kategori",
  domainSemantik: "Domain",
  sumberKorpus: "Sumber Korpus",
  etimologi: "Etimologi",
  catatanBudaya: "Catatan Budaya",
};

function cleanUri(val: string) {
  if (val.includes("#")) return val.substring(val.lastIndexOf("#") + 1);
  if (val.includes("/")) return val.substring(val.lastIndexOf("/") + 1);
  return val;
}

// ── Main Component ────────────────────────────────────────────────────────────
export function WordDetail({ wordId, onClose, onSelectWord }: WordDetailProps) {
  const [detail, setDetail] = useState<Properti[]>([]);
  const [sinonim, setSinonim] = useState<RelatedWord[]>([]);
  const [antonim, setAntonim] = useState<RelatedWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "sinonim" | "antonim">("detail");

  useEffect(() => {
    if (!wordId) return;
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setDetail([]);
      setSinonim([]);
      setAntonim([]);
      setActiveTab("detail");

      try {
        const [d, s, a] = await Promise.all([
          getDetailKata(wordId!),
          getSinonim(wordId!),
          getAntonim(wordId!),
        ]);
        if (cancelled) return;
        setDetail(d ?? []);
        setSinonim(s ?? []);
        setAntonim(a ?? []);
      } catch {
        if (!cancelled) {
          toast.error("Gagal memuat detail kata", {
            description: "Periksa koneksi ke backend.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [wordId]);

  if (!wordId) return null;

  // Ekstrak nilai utama dari detail
  const getValue = (key: string) =>
    detail.find((d) => d.properti?.includes(key) || d.properti === key)?.nilai ?? "";

  const lontaraq = getValue("aksaraLontaraq");
  const latin = getValue("bentukLatin") || wordId;
  const makna = getValue("maknaIndonesia");
  const kategori = cleanUri(getValue("kategoriGramatikal"));
  const domain = cleanUri(getValue("domainSemantik"));
  const contoh = getValue("contohKalimat");
  const catatan = getValue("catatanBudaya");

  // Properti lain untuk tabel
  const extraProps = detail.filter((d) => {
    const key = d.properti?.includes("#")
      ? d.properti.substring(d.properti.lastIndexOf("#") + 1)
      : d.properti;
    return !["aksaraLontaraq", "bentukLatin", "maknaIndonesia",
             "kategoriGramatikal", "domainSemantik", "contohKalimat",
             "catatanBudaya"].includes(key);
  });

  return (
    <section
      id="detail"
      className="py-16 lg:py-20 bg-gradient-to-b from-white to-[#F8FAFC]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0F3D6E] to-[#0E7C86] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-5">
                  {loading ? (
                    <div className="w-20 h-16 rounded-xl bg-white/20 animate-pulse" />
                  ) : lontaraq ? (
                    <div className="font-lontara text-white leading-none" style={{ fontSize: "3.5rem" }}>
                      {lontaraq}
                    </div>
                  ) : null}
                  <div>
                    {loading ? (
                      <div className="space-y-2">
                        <div className="w-32 h-7 rounded bg-white/20 animate-pulse" />
                        <div className="w-20 h-4 rounded bg-white/20 animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <h2 className="font-display text-white" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                          {latin}
                        </h2>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {kategori && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/20 text-white/90">
                              {kategori}
                            </span>
                          )}
                          {domain && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-[#FF7F6B]/40 text-white/90">
                              {domain}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {(["detail", "sinonim", "antonim"] as const).map((tab) => {
                const count =
                  tab === "sinonim" ? sinonim.length :
                  tab === "antonim" ? antonim.length : null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      activeTab === tab
                        ? "border-b-2 border-[#0E7C86] text-[#0E7C86] bg-teal-50/50"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tab === "detail" && <BookOpen className="w-3.5 h-3.5" />}
                    {tab === "sinonim" && <Layers className="w-3.5 h-3.5" />}
                    {tab === "antonim" && <ArrowLeftRight className="w-3.5 h-3.5" />}
                    <span className="capitalize">{tab}</span>
                    {count !== null && !loading && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="min-h-[280px]">
              {loading ? (
                <DetailSkeleton />
              ) : (
                <>
                  {/* ── Tab: Detail ── */}
                  {activeTab === "detail" && (
                    <div className="p-6 space-y-5">
                      {makna && (
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">Makna</div>
                          <p className="text-slate-800" style={{ fontSize: "1.05rem" }}>{makna}</p>
                        </div>
                      )}
                      {contoh && (
                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                          <div className="text-xs uppercase tracking-widest text-amber-700 mb-1.5">Contoh Kalimat</div>
                          <p className="italic text-slate-700">{contoh}</p>
                        </div>
                      )}
                      {catatan && (
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                          <div className="text-xs uppercase tracking-widest text-blue-700 mb-1.5">Catatan Budaya</div>
                          <p className="text-slate-700 text-sm">{catatan}</p>
                        </div>
                      )}
                      {extraProps.length > 0 && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          {extraProps.map((p, i) => {
                            const key = p.properti?.includes("#")
                              ? p.properti.substring(p.properti.lastIndexOf("#") + 1)
                              : p.properti;
                            return (
                              <div
                                key={i}
                                className={`flex gap-4 px-4 py-2.5 text-sm ${
                                  i % 2 === 0 ? "bg-slate-50" : "bg-white"
                                }`}
                              >
                                <span className="text-slate-500 w-36 shrink-0">
                                  {PROP_LABEL[key] ?? key}
                                </span>
                                <span className="text-slate-800">{cleanUri(p.nilai)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {detail.length === 0 && !loading && (
                        <p className="text-slate-400 text-sm text-center py-8">
                          Tidak ada data detail untuk kata ini.
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Tab: Sinonim ── */}
                  {activeTab === "sinonim" && (
                    <div className="p-6">
                      {sinonim.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">
                          Tidak ada sinonim terdaftar.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {sinonim.map((s, i) => (
                            <RelatedWordCard
                              key={i}
                              word={s}
                              accentColor="#0E7C86"
                              onSelect={onSelectWord}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Tab: Antonim ── */}
                  {activeTab === "antonim" && (
                    <div className="p-6">
                      {antonim.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">
                          Tidak ada antonim terdaftar.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {antonim.map((a, i) => (
                            <RelatedWordCard
                              key={i}
                              word={a}
                              accentColor="#D6553E"
                              onSelect={onSelectWord}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer: link ke visualisasi */}
            {!loading && wordId && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5" />
                  Lihat peta relasi semantik
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-teal-200 text-[#0E7C86] hover:bg-teal-50 gap-1.5"
                  onClick={() => {
                    window.location.href = `/visualisasi?kata=${wordId}`;
                  }}
                >
                  Graf Relasi
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Related Word Card ─────────────────────────────────────────────────────────
function RelatedWordCard({
  word,
  accentColor,
  onSelect,
}: {
  word: RelatedWord;
  accentColor: string;
  onSelect?: (id: string) => void;
}) {
  const id = word.sinonim ?? word.antonim ?? word.latin;
  return (
    <button
      onClick={() => onSelect?.(id)}
      className="w-full flex items-center gap-4 rounded-xl border border-slate-200 bg-white hover:border-[#0E7C86] hover:shadow-sm transition-all p-4 text-left"
    >
      <div
        className="font-lontara leading-none shrink-0"
        style={{ fontSize: "1.75rem", color: accentColor }}
      >
        {word.lontaraq}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-800">{word.latin}</div>
        <div className="text-xs text-slate-400">{id}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
}
