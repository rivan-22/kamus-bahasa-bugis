import { BookOpen, Network, Sparkles } from "lucide-react";
import { Link } from "react-router";

const features = [
  {
    title: "Jelajah Kata",
    desc: "Pencarian cepat dengan filter kategori, dialek, dan rentang waktu penggunaan.",
    icon: BookOpen,
    tone: "blue",
    id: "jelajah",
    path: "/jelajah",
  },
  {
    title: "Visualisasi Semantik",
    desc: "Peta jaringan makna dan relasi antar kata berdasarkan korpus klasik Bugis.",
    icon: Network,
    tone: "teal",
    id: "visualisasi",
    path: "/visualisasi",
  },
  {
    title: "Tanya AI",
    desc: "Asisten cerdas untuk konteks budaya, etimologi, dan terjemahan paragraf.",
    icon: Sparkles,
    tone: "amber",
    id: "ai",
    path: "/ai",
  },
];

const toneMap: Record<string, { bg: string; text: string; ring: string }> = {
  blue: { bg: "bg-blue-50", text: "text-[#0F3D6E]", ring: "ring-blue-100" },
  teal: { bg: "bg-teal-50", text: "text-[#0E7C86]", ring: "ring-teal-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-100" },
};

export function Features() {
  return (
    <section id="jelajah" className="pt-12 pb-20 lg:pt-16 lg:pb-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <div className="text-xs uppercase tracking-widest text-[#0E7C86] mb-3">Fitur Unggulan</div>
          <h2 className="font-display text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15 }}>
            Satu kamus, banyak cara memahami{" "}
            <span className="font-lontara text-[#0F3D6E]">ᨒᨚᨈᨑ</span>.
          </h2>
          <p className="mt-4 text-slate-600">
            Dirancang bersama ahli bahasa dan komunitas Bugis untuk menjaga
            warisan aksara Lontaraq tetap hidup di era digital.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const t = toneMap[f.tone];
            const Icon = f.icon;
            return (
              <Link
                key={f.title}
                id={f.id}
                to={f.path}
                className="group block p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86]"
              >
                <div className={`w-11 h-11 rounded-xl ${t.bg} ${t.text} ring-4 ${t.ring} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-slate-900 mb-1.5" style={{ fontWeight: 600 }}>
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
