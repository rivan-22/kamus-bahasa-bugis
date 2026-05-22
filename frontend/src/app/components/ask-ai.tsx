import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Wand2, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { tanyaAI } from "../../services/api.js";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  sumber?: string;
  loading?: boolean;
  error?: boolean;
}

const QUICK_PROMPTS = [
  "Apa makna filosofis dari kata siri' dalam budaya Bugis?",
  "Jelaskan perbedaan antara siri' dan pesse.",
  "Apa itu aksara Lontaraq? Berikan contohnya.",
  "Terjemahkan: 'Narekko de'na siri'mu, pura mupa matemu.'",
];

let msgIdCounter = 1;

// ── Streaming-style text reveal ───────────────────────────────────────────────
function useStreamText(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active || !text) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i += Math.floor(Math.random() * 4) + 2; // 2–5 chars per tick
      if (i >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [text, active]);
  return displayed;
}

// ── Loading bubble ─────────────────────────────────────────────────────────────
function LoadingBubble() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-3 flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
        <span className="text-sm text-slate-500">Memproses…</span>
      </div>
    </div>
  );
}

// ── AI Message bubble with streaming ─────────────────────────────────────────
function AIBubble({ msg, isLatest }: { msg: Message; isLatest: boolean }) {
  const streamedText = useStreamText(msg.content, isLatest && !msg.error);
  const textToShow = isLatest && !msg.error ? streamedText : msg.content;

  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        msg.error ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
      }`}>
        {msg.error ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] text-sm ${
        msg.error
          ? "bg-red-50 border border-red-200 text-red-700"
          : "bg-white border border-slate-200 text-slate-800"
      }`}>
        <p>{textToShow}</p>
        {msg.sumber && (
          <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">
            📚 {msg.sumber}
          </p>
        )}
        {/* Blinking cursor while streaming */}
        {isLatest && !msg.error && streamedText !== msg.content && (
          <span className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// ── User Message ──────────────────────────────────────────────────────────────
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-3 flex-row-reverse">
      <div className="w-8 h-8 rounded-full bg-[#0F3D6E] text-white flex items-center justify-center shrink-0">
        <User className="w-4 h-4" />
      </div>
      <div className="rounded-2xl rounded-tr-sm bg-[#0F3D6E] text-white px-4 py-3 max-w-[88%] text-sm">
        {content}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AskAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      content:
        "Halo! Saya Asisten Lontaraq. Tanyakan apa saja tentang bahasa, aksara, dan budaya Bugis. Saya siap membantu! 🌿",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [genWord, setGenWord] = useState("warani");
  const [genResult, setGenResult] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { id: ++msgIdCounter, role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await tanyaAI(trimmed);
      const aiMsg: Message = {
        id: ++msgIdCounter,
        role: "ai",
        content: res?.jawaban ?? res?.answer ?? JSON.stringify(res),
        sumber: res?.sumber ?? res?.source,
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (err: unknown) {
      const errMsg: Message = {
        id: ++msgIdCounter,
        role: "ai",
        content:
          err instanceof Error && err.message.includes("dijangkau")
            ? "Maaf, saya tidak dapat terhubung ke server saat ini. Pastikan backend berjalan."
            : "Maaf, terjadi kesalahan. Silakan coba lagi.",
        error: true,
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerate = async () => {
    if (!genWord.trim() || genLoading) return;
    setGenLoading(true);
    setGenResult(null);
    try {
      const res = await tanyaAI(`Buatkan contoh kalimat Bugis yang menggunakan kata "${genWord}" beserta terjemahannya.`);
      setGenResult(res?.jawaban ?? res?.answer ?? "Tidak ada hasil.");
    } catch {
      setGenResult("Gagal menghasilkan contoh. Coba lagi.");
    } finally {
      setGenLoading(false);
    }
  };

  const latestAiIdx = messages.map((m) => m.role).lastIndexOf("ai");

  return (
    <section id="ai" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Chat Panel ── */}
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-100">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display text-slate-900" style={{ fontWeight: 600 }}>
                    Asisten Lontaraq
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {isTyping ? "Sedang mengetik…" : "Daring · siap membantu"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="py-4 px-4 space-y-4 max-h-80 overflow-y-auto">
                {messages.map((msg, idx) =>
                  msg.role === "user" ? (
                    <UserBubble key={msg.id} content={msg.content} />
                  ) : (
                    <AIBubble
                      key={msg.id}
                      msg={msg}
                      isLatest={idx === latestAiIdx}
                    />
                  )
                )}
                {isTyping && <LoadingBubble />}
                <div ref={chatEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    disabled={isTyping}
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {p.length > 40 ? p.slice(0, 40) + "…" : p}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-amber-100 p-3">
                <div className="rounded-xl border border-slate-200 bg-white p-2 flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Tanya apa saja tentang bahasa Bugis…"
                    disabled={isTyping}
                    className="flex-1 px-2 py-1.5 text-sm bg-transparent outline-none disabled:opacity-50"
                  />
                  <Button
                    size="sm"
                    onClick={() => sendMessage(input)}
                    disabled={isTyping || !input.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shrink-0"
                  >
                    {isTyping ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Kirim
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Info + Generator ── */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Tanya AI
            </div>
            <h2
              className="font-display text-slate-900 tracking-tight"
              style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15 }}
            >
              Tanyakan apa saja tentang aksara dan budaya Bugis.
            </h2>
            <p className="mt-4 text-slate-600">
              Asisten kami dilatih dari naskah Lontaraq, jurnal linguistik, dan
              terjemahan kontemporer. Setiap jawaban disertai rujukan agar Anda
              dapat menelusuri sumber aslinya.
            </p>

            {/* Contoh Kalimat AI */}
            <div className="mt-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="w-4 h-4 text-amber-600" />
                <span className="font-display text-slate-900" style={{ fontWeight: 600 }}>
                  Contoh Kalimat AI
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  RAG + LLM
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Masukkan kata Bugis untuk menghasilkan contoh kalimat kontekstual.
              </p>
              <div className="flex gap-2">
                <Input
                  value={genWord}
                  onChange={(e) => setGenWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  className="bg-white"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={genLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shrink-0"
                >
                  {genLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Hasilkan
                </Button>
              </div>

              {/* Result */}
              <div className="mt-4">
                {genLoading ? (
                  <div className="rounded-lg bg-white border border-amber-100 p-3 animate-pulse space-y-2">
                    <div className="h-5 w-40 rounded bg-amber-100" />
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-3 w-56 rounded bg-slate-100" />
                  </div>
                ) : genResult ? (
                  <div className="rounded-lg bg-white border border-amber-100 p-3">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{genResult}</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-white border border-amber-100 p-3">
                    <div className="font-lontara text-[#0F3D6E]" style={{ fontSize: "1.1rem" }}>
                      ᨓᨑᨊᨗ ᨈᨕᨘᨓᨙ ᨒᨙᨄ
                    </div>
                    <div className="text-sm italic text-slate-700 mt-1">
                      Warani tau iyya lempu'.
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Berani adalah orang yang jujur.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                "Transliterasi paragraf dari aksara Latin ke Lontaraq",
                "Penjelasan etimologi dan perkembangan makna kata",
                "Saran sinonim, antonim, dan ungkapan idiomatik",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-700 text-sm">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
