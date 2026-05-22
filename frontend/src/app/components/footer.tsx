import { Github, Mail, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0F3D6E] text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                <span className="font-lontara text-white text-xl leading-none">ᨅᨔ</span>
              </div>
              <div>
                <div className="font-display text-white" style={{ fontWeight: 700 }}>Kamus Bahasa Bugis Lontaraq</div>
                <div className="text-xs text-slate-400">Melestarikan aksara, menghidupkan makna.</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              Proyek riset terbuka yang menggabungkan linguistik komputasional
              dengan kearifan lokal Sulawesi Selatan. Dibangun untuk pelajar,
              peneliti, dan masyarakat Bugis di mana pun berada.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <SocialLink icon={<Github className="w-4 h-4" />} label="GitHub" />
              <SocialLink icon={<Mail className="w-4 h-4" />} label="Email" />
              <SocialLink icon={<BookOpen className="w-4 h-4" />} label="Jurnal" />
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-4">Statistik Proyek</div>
            <ul className="space-y-3">
              <FStat label="Entri Kata" value="12.480" accent="#FF7F6B" />
              <FStat label="Aksara Lontaraq" value="23" accent="#0E7C86" />
              <FStat label="Naskah Korpus" value="86" accent="#FFC857" />
              <FStat label="Kontributor" value="34" accent="#FF7F6B" />
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-4">Tim Pengembang</div>
            <ul className="space-y-3 text-sm">
              <Dev name="Andi Mappangara" role="Lead Linguist" />
              <Dev name="Nur Aisyah Tahir" role="UI/UX Designer" />
              <Dev name="Rizky Pratama" role="Full-stack Engineer" />
              <Dev name="Dr. Halilintar Latief" role="Penasehat Akademik" />
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © 2026 Kamus Bahasa Bugis Lontaraq. Dilisensikan di bawah CC BY-SA 4.0.
          </div>
          <div className="font-lontara text-slate-300" style={{ fontSize: "1.1rem" }}>
            ᨈᨑᨗᨆ ᨀᨔᨗ
            <span className="font-sans text-slate-500 ml-2">— terima kasih</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <a href="#" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">
      {icon}
      {label}
    </a>
  );
}

function FStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="font-display text-white" style={{ fontWeight: 700, color: accent }}>{value}</span>
    </li>
  );
}

function Dev({ name, role }: { name: string; role: string }) {
  return (
    <li>
      <div className="text-white">{name}</div>
      <div className="text-xs text-slate-400">{role}</div>
    </li>
  );
}
