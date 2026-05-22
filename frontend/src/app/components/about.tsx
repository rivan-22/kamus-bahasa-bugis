const alphabet = [
  { c: "ᨀ", r: "ka" }, { c: "ᨁ", r: "ga" }, { c: "ᨂ", r: "nga" }, { c: "ᨃ", r: "ngka" },
  { c: "ᨄ", r: "pa" }, { c: "ᨅ", r: "ba" }, { c: "ᨆ", r: "ma" }, { c: "ᨇ", r: "mpa" },
  { c: "ᨈ", r: "ta" }, { c: "ᨉ", r: "da" }, { c: "ᨊ", r: "na" }, { c: "ᨋ", r: "nra" },
  { c: "ᨌ", r: "ca" }, { c: "ᨍ", r: "ja" }, { c: "ᨎ", r: "nya" }, { c: "ᨏ", r: "nca" },
  { c: "ᨐ", r: "ya" }, { c: "ᨑ", r: "ra" }, { c: "ᨒ", r: "la" }, { c: "ᨓ", r: "wa" },
  { c: "ᨔ", r: "sa" }, { c: "ᨕ", r: "a" }, { c: "ᨖ", r: "ha" },
];

export function About() {
  return (
    <section id="tentang" className="py-20 lg:py-28 bg-gradient-to-b from-white to-[#F5F1E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-[#FF7F6B] mb-3">Tentang</div>
          <h2 className="font-display text-slate-900 tracking-tight" style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15 }}>
            23 aksara Lontaraq, satu warisan tak ternilai.
          </h2>
          <p className="mt-4 text-slate-600">
            Lontaraq adalah sistem aksara Brahmi yang digunakan suku Bugis dan
            Makassar untuk menulis bahasa daerah, naskah kerajaan, hingga
            catatan harian sejak abad ke-17.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-10">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
            {alphabet.map((a) => (
              <div
                key={a.c}
                className="group aspect-square rounded-xl border border-slate-100 bg-gradient-to-br from-[#F5F1E8] to-white flex flex-col items-center justify-center hover:border-[#0E7C86] hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="font-lontara text-[#0F3D6E] leading-none" style={{ fontSize: "1.85rem" }}>
                  {a.c}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">{a.r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
