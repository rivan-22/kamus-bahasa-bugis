import { useState, useEffect, useRef, useCallback } from "react";
import { Network, Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { getGrafRelasi, WARNA_RELASI, LABEL_RELASI } from "../../services/api.js";
import { useSearchParams } from "react-router";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GrafEdge {
  relasi: string;
  ke: string;
  labelKe: string;
}

interface GraphNode {
  id: string;
  label: string;
  lontaraq?: string;
  x: number;
  y: number;
  r: number;
  primary?: boolean;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  relasi: string;
}

// ── Default demo graph (saat tidak ada data) ──────────────────────────────────
const DEFAULT_NODES: GraphNode[] = [
  { id: "siri'", label: "siri'", lontaraq: "ᨔᨗᨑᨗ", x: 50, y: 50, r: 38, primary: true, color: "#0F3D6E" },
  { id: "pesse",   label: "pesse",   lontaraq: "ᨄᨙᨔ",  x: 18, y: 25, r: 26, color: "#0E7C86" },
  { id: "ade'",    label: "ade'",    lontaraq: "ᨕᨉ",   x: 82, y: 28, r: 26, color: "#0E7C86" },
  { id: "lempu'",  label: "lempu'",  lontaraq: "ᨒᨙᨄ",  x: 80, y: 78, r: 22, color: "#7C3AED" },
  { id: "warani",  label: "warani",  lontaraq: "ᨓᨑᨊᨗ", x: 15, y: 75, r: 22, color: "#D6553E" },
  { id: "getteng", label: "getteng", lontaraq: "ᨁᨈ",   x: 50, y: 12, r: 18, color: "#0E7C86" },
  { id: "macca",   label: "macca",   lontaraq: "ᨆᨌ",   x: 50, y: 90, r: 18, color: "#0E7C86" },
];
const DEFAULT_LINKS: GraphLink[] = [
  { source: "siri'", target: "pesse",   relasi: "berkaitanDengan" },
  { source: "siri'", target: "ade'",    relasi: "berkaitanDengan" },
  { source: "siri'", target: "lempu'",  relasi: "diturunkanDari"  },
  { source: "siri'", target: "warani",  relasi: "antonimDari"     },
  { source: "siri'", target: "getteng", relasi: "sinonimDari"     },
  { source: "siri'", target: "macca",   relasi: "berkaitanDengan" },
];

// ── Layout: lingkaran di sekitar node pusat ───────────────────────────────────
function buildGraph(centerId: string, edges: GrafEdge[]): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [
    { id: centerId, label: centerId, x: 50, y: 50, r: 36, primary: true, color: "#0F3D6E" },
  ];
  const links: GraphLink[] = [];
  const step = edges.length > 0 ? (2 * Math.PI) / edges.length : 0;

  edges.forEach((e, i) => {
    const angle = step * i - Math.PI / 2;
    const dist = 34;
    const x = 50 + dist * Math.cos(angle);
    const y = 50 + dist * Math.sin(angle);
    const relasiKey = e.relasi?.includes("#")
      ? e.relasi.substring(e.relasi.lastIndexOf("#") + 1)
      : e.relasi;
    const color = WARNA_RELASI[relasiKey as keyof typeof WARNA_RELASI] ?? "#0E7C86";

    nodes.push({ id: e.ke, label: e.labelKe || e.ke, x, y, r: 22, color });
    links.push({ source: centerId, target: e.ke, relasi: relasiKey });
  });

  return { nodes, links };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function GraphSkeleton() {
  return (
    <div className="w-full aspect-square rounded-3xl bg-slate-100 animate-pulse flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function SemanticViz() {
  const [searchParams] = useSearchParams();
  const [wordInput, setWordInput] = useState(searchParams.get("kata") ?? "siri'");
  const [activeWord, setActiveWord] = useState(searchParams.get("kata") ?? "");
  const [nodes, setNodes] = useState<GraphNode[]>(DEFAULT_NODES);
  const [links, setLinks] = useState<GraphLink[]>(DEFAULT_LINKS);
  const [loading, setLoading] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const loadGraph = useCallback(async (word: string) => {
    if (!word.trim()) return;
    setLoading(true);
    try {
      const edges: GrafEdge[] = await getGrafRelasi(word);
      if (edges && edges.length > 0) {
        const { nodes: n, links: l } = buildGraph(word, edges);
        setNodes(n);
        setLinks(l);
        setActiveWord(word);
      } else {
        // Tidak ada relasi — tampilkan node tunggal
        setNodes([{ id: word, label: word, x: 50, y: 50, r: 36, primary: true, color: "#0F3D6E" }]);
        setLinks([]);
        setActiveWord(word);
      }
    } catch {
      // Gunakan demo graph
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dari URL param saat pertama kali
  useEffect(() => {
    const kata = searchParams.get("kata");
    if (kata) loadGraph(kata);
  }, [searchParams, loadGraph]);

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    if (nodeId !== activeWord) {
      setWordInput(nodeId);
    }
  };

  return (
    <section id="visualisasi" className="py-20 lg:py-28 bg-gradient-to-b from-[#F5F1E8] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: info + controls */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#0E7C86] text-xs mb-5">
              <Network className="w-3.5 h-3.5" />
              Visualisasi Semantik
            </div>
            <h2
              className="font-display text-slate-900 tracking-tight"
              style={{ fontSize: "clamp(1.875rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.15 }}
            >
              Lihat bagaimana kata-kata Bugis saling terhubung.
            </h2>
            <p className="mt-4 text-slate-600">
              Peta semantik dibangun dari ribuan halaman lontaraq dan referensi
              modern. Klik simpul untuk menjelajahi relasi lebih dalam.
            </p>

            {/* Input pencarian kata */}
            <div className="mt-8 flex gap-2">
              <Input
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadGraph(wordInput)}
                placeholder="Masukkan kata Bugis…"
                className="bg-white"
              />
              <Button
                onClick={() => loadGraph(wordInput)}
                disabled={loading}
                className="bg-[#0E7C86] hover:bg-[#0a6b73] gap-1.5 shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Tampilkan
              </Button>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2.5">
              {Object.entries(LABEL_RELASI).map(([key, label]) => (
                <LegendRow
                  key={key}
                  color={WARNA_RELASI[key as keyof typeof WARNA_RELASI] ?? "#999"}
                  label={label}
                />
              ))}
            </div>

            {/* Info node yang dipilih */}
            {selectedNode && selectedNode !== activeWord && (
              <div className="mt-6 rounded-2xl border border-[#0E7C86]/30 bg-teal-50 p-4">
                <div className="text-xs uppercase tracking-widest text-[#0E7C86] mb-1">Node Dipilih</div>
                <div className="font-display text-slate-900 font-semibold">{selectedNode}</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-[#0E7C86]/30 text-[#0E7C86] hover:bg-teal-100"
                  onClick={() => {
                    setWordInput(selectedNode);
                    loadGraph(selectedNode);
                  }}
                >
                  Jadikan pusat graf
                </Button>
              </div>
            )}

            {activeWord && (
              <p className="mt-4 text-xs text-slate-400">
                Menampilkan graf relasi untuk:{" "}
                <span className="font-medium text-[#0F3D6E]">{activeWord}</span>
                {" · "}{links.length} relasi ditemukan
              </p>
            )}
          </div>

          {/* Right: SVG graph */}
          <div className="relative">
            <div className="relative aspect-square rounded-3xl bg-white border border-slate-200 shadow-lg p-4 overflow-hidden">
              {/* Dot grid background */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, #0F3D6E 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />

              {loading ? (
                <GraphSkeleton />
              ) : (
                <svg
                  ref={svgRef}
                  viewBox="0 0 100 100"
                  className="w-full h-full relative"
                >
                  {/* Links */}
                  {links.map((l, i) => {
                    const src = nodeMap[l.source];
                    const tgt = nodeMap[l.target];
                    if (!src || !tgt) return null;
                    const color = WARNA_RELASI[l.relasi as keyof typeof WARNA_RELASI] ?? "#0E7C86";
                    const isHovered =
                      hoveredNode === l.source || hoveredNode === l.target;
                    return (
                      <line
                        key={i}
                        x1={src.x} y1={src.y}
                        x2={tgt.x} y2={tgt.y}
                        stroke={color}
                        strokeOpacity={isHovered ? 0.9 : 0.35}
                        strokeWidth={isHovered ? 0.6 : 0.3}
                        style={{ transition: "all 0.2s" }}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((n) => {
                    const isHovered = hoveredNode === n.id;
                    const isSelected = selectedNode === n.id;
                    return (
                      <g
                        key={n.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNodeClick(n.id)}
                        onMouseEnter={() => setHoveredNode(n.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* Outer ring */}
                        <circle
                          cx={n.x} cy={n.y}
                          r={n.r / 8 + (isHovered || isSelected ? 2.5 : 1.5)}
                          fill="none"
                          stroke={isSelected ? "#FF7F6B" : n.color}
                          strokeOpacity={isSelected ? 0.8 : isHovered ? 0.5 : 0.2}
                          strokeWidth={isSelected ? 0.5 : 0.3}
                          style={{ transition: "all 0.2s" }}
                        />
                        {/* Main circle */}
                        <circle
                          cx={n.x} cy={n.y}
                          r={n.r / 8 + (isHovered ? 0.5 : 0)}
                          fill={n.color}
                          fillOpacity={n.primary ? 1 : isHovered ? 1 : 0.82}
                          style={{ transition: "all 0.2s" }}
                        />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* HTML labels overlay */}
              {!loading && (
                <div className="absolute inset-4 pointer-events-none">
                  {nodes.map((n) => (
                    <div
                      key={n.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto cursor-pointer"
                      style={{ left: `${n.x}%`, top: `${n.y}%` }}
                      onClick={() => handleNodeClick(n.id)}
                      onMouseEnter={() => setHoveredNode(n.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {n.lontaraq && (
                        <div
                          className="font-lontara text-white leading-none select-none"
                          style={{ fontSize: n.primary ? "1.4rem" : "0.8rem" }}
                        >
                          {n.lontaraq}
                        </div>
                      )}
                      <div
                        className={`mt-0.5 select-none ${n.primary ? "text-[#0F3D6E]" : "text-slate-700"}`}
                        style={{
                          fontSize: n.primary ? "0.8rem" : "0.65rem",
                          fontWeight: n.primary ? 700 : 500,
                        }}
                      >
                        {n.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}
