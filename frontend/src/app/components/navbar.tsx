import { useState } from "react";
import { Menu, X, Search, Sparkles } from "lucide-react";
import { NavLink, Link } from "react-router";
import { Button } from "./ui/button";

const links = [
  { label: "Beranda", to: "/" },
  { label: "Jelajah Kata", to: "/jelajah" },
  { label: "Visualisasi Semantik", to: "/visualisasi" },
  { label: "Tanya AI", to: "/ai", accent: "amber" as const },
  { label: "Tentang", to: "/tentang" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F3D6E] to-[#0E7C86] flex items-center justify-center shadow-sm">
              <span className="font-lontara text-white text-xl leading-none">ᨅᨔ</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-[#0F3D6E]" style={{ fontWeight: 700 }}>
                Kamus Bugis
              </div>
              <div className="text-xs text-slate-500 -mt-0.5">Lontaraq Digital</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => {
                  const base = "px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5";
                  if (l.accent === "amber") {
                    return `${base} ${isActive ? "bg-amber-100 text-amber-800" : "text-amber-700 hover:bg-amber-50"}`;
                  }
                  return `${base} ${isActive ? "bg-[#0F3D6E] text-white hover:bg-[#0d3460]" : "text-slate-700 hover:bg-slate-100 hover:text-[#0F3D6E]"}`;
                }}
              >
                {l.accent === "amber" && <Sparkles className="w-3.5 h-3.5" />}
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex text-slate-600 gap-2"
            >
              <Search className="w-4 h-4" />
              Cari…
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-slate-100 rounded border border-slate-200">⌘K</kbd>
            </Button>
            <Link to="/jelajah" className="hidden sm:inline-flex">
              <Button size="sm" className="bg-[#0F3D6E] hover:bg-[#0d3460] text-white">
                Mulai Jelajah
              </Button>
            </Link>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-slate-100"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) => {
                  const base = "px-3 py-2.5 rounded-lg text-sm";
                  if (l.accent === "amber") {
                    return `${base} ${isActive ? "bg-amber-100 text-amber-800" : "text-amber-700 bg-amber-50"}`;
                  }
                  return `${base} ${isActive ? "bg-[#0F3D6E] text-white" : "text-slate-700 hover:bg-slate-100"}`;
                }}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
