import { Sparkles, BookOpen, Network } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

interface HeroProps {
  onSelectWord?: (id: string) => void;
}

// ── Hero Component ─────────────────────────────────────────────────────────────
export function Hero({ onSelectWord }: HeroProps) {
  const navigate = useNavigate();

  return (
    <section id="beranda" className="relative overflow-hidden">
      {/* decorative bg */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F1E8] via-white to-white" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#0E7C86]/10 blur-3xl" />
        <div className="absolute top-40 -left-32 w-96 h-96 rounded-full bg-[#FF7F6B]/15 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Dilengkapi AI Linguistik Lokal
            </div>

            <h1
              className="font-display text-slate-900 tracking-tight"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 800, lineHeight: 1.05 }}
            >
              Menjelajahi kekayaan{" "}
              <span className="bg-gradient-to-r from-[#0F3D6E] via-[#0E7C86] to-[#FF7F6B] bg-clip-text text-transparent">
                Bahasa Bugis
              </span>{" "}
              melalui aksara Lontaraq.
            </h1>

            <p className="mt-5 text-slate-600 max-w-xl" style={{ fontSize: "1.05rem", lineHeight: 1.65 }}>
              Kamus digital pertama yang menyatukan korpus klasik, visualisasi
              semantik, dan asisten AI untuk membantu Anda memahami makna,
              etimologi, dan konteks budaya setiap kata.
            </p>

            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <Stat label="Entri Kata" value="12.480" color="#0F3D6E" />
              <Stat label="Aksara Lontaraq" value="23" color="#0E7C86" />
              <Stat label="Sumber Korpus" value="86" color="#FF7F6B" />
            </div>
          </div>

          {/* Lontaraq display card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#0F3D6E]/10 via-[#0E7C86]/10 to-[#FF7F6B]/10 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl p-8 lg:p-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF7F6B]" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Kata Hari Ini</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-teal-50 text-[#0E7C86]">nomina</span>
              </div>

              <div
                className="font-lontara text-[#0F3D6E] leading-none mb-4"
                style={{ fontSize: "clamp(4rem, 10vw, 7rem)" }}
              >
                ᨔᨗᨑᨗ
              </div>
              <div className="font-display text-slate-900" style={{ fontSize: "2rem", fontWeight: 700 }}>
                siri'
              </div>
              <p className="mt-2 text-slate-600">
                Rasa harga diri, malu, dan kehormatan — konsep inti dalam falsafah
                hidup masyarakat Bugis.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <MiniCard icon={<BookOpen className="w-4 h-4" />} label="3 makna" tone="blue" />
                <MiniCard icon={<Network className="w-4 h-4" />} label="14 relasi" tone="teal" />
                <MiniCard icon={<Sparkles className="w-4 h-4" />} label="AI ringkas" tone="amber" />
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-2">Contoh penggunaan</div>
                <div className="italic text-slate-700">
                  "Tau makkeda ade', tau makkeda siri'."
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Orang yang menjunjung adat adalah orang yang memiliki siri'.
                </div>
              </div>

              <Button
                onClick={() => {
                  const id = "siri";
                  if (onSelectWord) {
                    onSelectWord(id);
                  } else {
                    navigate(`/jelajah?kata=${id}`);
                  }
                }}
                variant="outline"
                className="mt-5 w-full border-slate-200 hover:border-[#0E7C86] hover:text-[#0E7C86]"
              >
                Lihat Detail Lengkap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-10 rounded-full" style={{ backgroundColor: color }} />
      <div>
        <div className="font-display text-slate-900" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {value}
        </div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function MiniCard({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "blue" | "teal" | "amber";
}) {
  const map = {
    blue: "bg-blue-50 text-[#0F3D6E]",
    teal: "bg-teal-50 text-[#0E7C86]",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl p-3 flex flex-col items-start gap-1.5 ${map[tone]}`}>
      {icon}
      <span className="text-xs">{label}</span>
    </div>
  );
}
