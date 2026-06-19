import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, Sparkles, Loader2 } from "lucide-react";
import { NavLink, Link, useSearchParams, useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { searchKata } from "../../services/api.js";

const links = [
  { label: "Beranda", to: "/" },
  { label: "Jelajah Kata", to: "/jelajah" },
  { label: "Visualisasi Semantik", to: "/visualisasi" },
  { label: "Tanya AI", to: "/ai", accent: "amber" as const },
  { label: "Tentang", to: "/tentang" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setShowDropdown(true);
      try {
        const data = await searchKata(query);
        setResults(data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown suggestions list
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectWord = (id: string) => {
    const currentPath = location.pathname;
    if (currentPath === "/" || currentPath === "/jelajah") {
      setSearchParams((p) => {
        p.set("kata", id);
        return p;
      });
    } else {
      navigate(`/jelajah?kata=${id}`);
    }
    setQuery("");
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/jelajah?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

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
            {/* Expanded Navbar Search with suggestions */}
            <div className="relative hidden md:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kata…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-4 py-1.5 w-60 lg:w-72 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7C86] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />

              {/* Suggestions Dropdown */}
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-72 lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                  {loading ? (
                    <div className="px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E7C86]" /> Loading...
                    </div>
                  ) : results.length > 0 ? (
                    results.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelectWord(r.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                      >
                        <span className="font-lontara text-[#0F3D6E] w-8 shrink-0 leading-none text-base">
                          {r.lontaraq}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 text-xs truncate">{r.latin}</div>
                          <div className="text-[10px] text-slate-500 truncate">{r.makna}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-xs text-slate-400">
                      Tidak ditemukan hasil
                    </div>
                  )}
                </div>
              )}
            </div>

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
