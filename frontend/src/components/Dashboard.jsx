import { useEffect, useState } from "react";
import { getCoastalData } from "../services/api";

const RISK_CONFIG = {
  SAFE:     { color: "#10d98a", glow: "rgba(16,217,138,0.25)", label: "All Clear", icon: "✦" },
  MODERATE: { color: "#f5a623", glow: "rgba(245,166,35,0.25)",  label: "Caution",   icon: "◈" },
  HIGH:     { color: "#ff4d4d", glow: "rgba(255,77,77,0.25)",   label: "Alert",     icon: "⚠" },
};

const FISHING_CONFIG = {
  GOOD:     { color: "#10d98a", glow: "rgba(16,217,138,0.2)",  bg: "rgba(16,217,138,0.06)",  icon: "🎣", border: "rgba(16,217,138,0.25)" },
  LIMITED:  { color: "#f5a623", glow: "rgba(245,166,35,0.2)",  bg: "rgba(245,166,35,0.06)",  icon: "⚠️", border: "rgba(245,166,35,0.25)" },
  "NOT SAFE": { color: "#ff4d4d", glow: "rgba(255,77,77,0.2)", bg: "rgba(255,77,77,0.06)",   icon: "🚫", border: "rgba(255,77,77,0.25)" },
};

function Particle({ style }) {
  return <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }} />;
}

function GaugeNeedle({ score }) {
  const angle = -90 + score * 1.8;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "4%" }}>
      <div style={{
        width: 3, height: "42%",
        background: "linear-gradient(to top, #fff, rgba(255,255,255,0.3))",
        borderRadius: "2px 2px 0 0",
        transformOrigin: "bottom center",
        transform: `rotate(${angle}deg)`,
        transition: "transform 1.2s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 0 12px rgba(255,255,255,0.6)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", bottom: -8, left: "50%",
          transform: "translateX(-50%)",
          width: 16, height: 16, borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 3px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.4)",
        }} />
      </div>
    </div>
  );
}

function Gauge({ score, riskLevel }) {
  const cfg = RISK_CONFIG[riskLevel] || RISK_CONFIG.SAFE;
  return (
    <div style={{ position: "relative", width: 240, height: 130, margin: "0 auto" }}>
      <svg viewBox="0 0 240 130" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10d98a" />
            <stop offset="50%" stopColor="#f5a623" />
            <stop offset="100%" stopColor="#ff4d4d" />
          </linearGradient>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M 24 118 A 96 96 0 0 1 216 118" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
        <path d="M 24 118 A 96 96 0 0 1 216 118" fill="none" stroke="url(#arcGrad)" strokeWidth="10" strokeLinecap="round" filter="url(#arcGlow)" />
        {[0, 25, 50, 75, 100].map((v, i) => {
          const a = (-180 + v * 1.8) * Math.PI / 180;
          const cx = 120 + 96 * Math.cos(a), cy = 118 + 96 * Math.sin(a);
          const cx2 = 120 + 108 * Math.cos(a), cy2 = 118 + 108 * Math.sin(a);
          return <line key={i} x1={cx} y1={cy} x2={cx2} y2={cy2} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />;
        })}
        {[{v:0,l:"0"},{v:50,l:"50"},{v:100,l:"100"}].map(({v,l}) => {
          const a = (-180 + v * 1.8) * Math.PI / 180;
          const x = 120 + 120 * Math.cos(a), y = 118 + 120 * Math.sin(a);
          return <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="'Courier New', monospace">{l}</text>;
        })}
      </svg>
      <GaugeNeedle score={score} />
      <div style={{ position: "absolute", bottom: "2%", left: "50%", transform: "translateX(-50%)", textAlign: "center", pointerEvents: "none" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: cfg.color, textShadow: `0 0 20px ${cfg.glow}`, fontFamily: "'Courier New', monospace", lineHeight: 1 }}>{Math.round(score)}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginTop: 2 }}>RISK SCORE</div>
      </div>
    </div>
  );
}

// ── FISHING BANNER (current conditions) ──────────────────────────────────────
function FishingBanner({ fishing }) {
  if (!fishing) return null;
  const status = fishing.status || "GOOD";
  const fcfg = FISHING_CONFIG[status] || FISHING_CONFIG["GOOD"];

  return (
    <div style={{
      background: fcfg.bg,
      border: `1px solid ${fcfg.border}`,
      borderRadius: 16,
      padding: "18px 24px",
      marginBottom: 24,
      display: "flex",
      alignItems: "center",
      gap: 18,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* shimmer top */}
      <div style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: 1, background: `linear-gradient(90deg, transparent, ${fcfg.color}50, transparent)` }} />

      {/* icon circle */}
      <div style={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
        background: `radial-gradient(circle, ${fcfg.glow} 0%, transparent 70%)`,
        border: `1.5px solid ${fcfg.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
        boxShadow: `0 0 20px ${fcfg.glow}`,
      }}>
        {fcfg.icon}
      </div>

      {/* text block */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}>
            🎣 FISHING CONDITIONS
          </span>
          <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: fcfg.color, letterSpacing: "0.5px", textShadow: `0 0 16px ${fcfg.glow}` }}>
          {status}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>
          {fishing.message}
        </div>
      </div>

      {/* right glow blob */}
      <div style={{ position: "absolute", right: -30, top: "50%", transform: "translateY(-50%)", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${fcfg.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />
    </div>
  );
}

// ── 7-DAY FORECAST STRIP ─────────────────────────────────────────────────────
function ForecastStrip({ forecast }) {
  const [hovered, setHovered] = useState(null);
  if (!forecast || forecast.length === 0) return null;
  const maxWave = Math.max(...forecast.map(d => d.wave_height));

  return (
    <div style={{
      background: "rgba(255,255,255,0.018)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20,
      padding: "22px 24px",
      marginTop: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.35), transparent)" }} />

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}>
          ≋ 7-DAY FORECAST
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "1px", fontFamily: "'Courier New', monospace" }}>{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* day cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {forecast.map((day, i) => {
          const cfg = RISK_CONFIG[day.risk] || RISK_CONFIG.SAFE;
          const fishing = day.fishing;
          const fishStatus = fishing?.status || "GOOD";
          const fcfg = FISHING_CONFIG[fishStatus] || FISHING_CONFIG["GOOD"];
          const isHovered = hovered === i;
          const isToday = i === 0;

          const dateObj = new Date(day.date + "T00:00:00");
          const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
          const dayNum  = dateObj.toLocaleDateString("en-US", { day: "2-digit" });
          const barPct  = Math.max(10, Math.round((day.wave_height / maxWave) * 100));

          return (
            <div
              key={day.date}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHovered
                  ? `linear-gradient(180deg, ${cfg.glow} 0%, rgba(10,17,32,0.9) 100%)`
                  : isToday ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.022)",
                border: isToday
                  ? `1px solid ${cfg.color}50`
                  : `1px solid ${isHovered ? cfg.color + "40" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 14,
                padding: "14px 10px 12px",
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 7, cursor: "default",
                transition: "all 0.2s ease",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* TODAY pill */}
              {isToday && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  background: cfg.color, borderRadius: "0 0 6px 6px",
                  padding: "2px 8px", fontSize: 7, fontWeight: 700,
                  color: "#060c18", letterSpacing: "1px", fontFamily: "'Courier New', monospace",
                }}>NOW</div>
              )}

              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", fontFamily: "'Courier New', monospace", marginTop: isToday ? 8 : 0 }}>{weekday}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.75)", lineHeight: 1 }}>{dayNum}</div>

              {/* risk badge */}
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: cfg.glow, border: `1.5px solid ${cfg.color}60`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                boxShadow: isHovered ? `0 0 16px ${cfg.color}50` : "none",
                transition: "box-shadow 0.2s ease",
              }}>{cfg.icon}</div>

              <div style={{ fontSize: 8, fontWeight: 700, color: cfg.color, letterSpacing: "1px", fontFamily: "'Courier New', monospace" }}>{day.risk}</div>

              {/* wave bar */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "70%", height: 28, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{
                    width: "60%", height: `${barPct}%`,
                    background: `linear-gradient(to top, ${cfg.color}90, ${cfg.color}30)`,
                    borderRadius: "3px 3px 0 0", minHeight: 4,
                    transition: "height 0.3s ease",
                  }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                  {day.wave_height.toFixed(1)}<span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>m</span>
                </div>
              </div>

              {/* ── fishing pill (always visible) ── */}
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                background: fcfg.bg,
                border: `1px solid ${fcfg.border}`,
                borderRadius: 20, padding: "3px 8px",
                width: "100%", justifyContent: "center",
              }}>
                <span style={{ fontSize: 10 }}>{fcfg.icon}</span>
                <span style={{ fontSize: 7, fontWeight: 700, color: fcfg.color, letterSpacing: "0.8px", fontFamily: "'Courier New', monospace", whiteSpace: "nowrap" }}>
                  {fishStatus}
                </span>
              </div>

              {/* hover details */}
              <div style={{
                overflow: "hidden",
                maxHeight: isHovered ? 80 : 0,
                opacity: isHovered ? 1 : 0,
                transition: "max-height 0.25s ease, opacity 0.2s ease",
                width: "100%",
              }}>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    { label: "WIND", value: `${day.wind_speed}m/s` },
                    { label: "SEA",  value: day.sea_state },
                    { label: "FISH", value: fishing?.message?.split(".")[0] || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", letterSpacing: "1px", fontFamily: "'Courier New', monospace", flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 8, fontWeight: 600, color: label === "FISH" ? fcfg.color : "rgba(255,255,255,0.6)", textAlign: "right", lineHeight: 1.3 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* timeline bar */}
      <div style={{ marginTop: 18, display: "flex", gap: 3, height: 4, borderRadius: 4, overflow: "hidden" }}>
        {forecast.map((day, i) => {
          const cfg = RISK_CONFIG[day.risk] || RISK_CONFIG.SAFE;
          return <div key={i} style={{ flex: 1, background: cfg.color, opacity: hovered === null ? 0.5 : hovered === i ? 1 : 0.2, transition: "opacity 0.2s ease", borderRadius: 2 }} />;
        })}
      </div>

      {/* fishing timeline bar */}
      <div style={{ marginTop: 6, display: "flex", gap: 3, height: 3, borderRadius: 4, overflow: "hidden" }}>
        {forecast.map((day, i) => {
          const fcfg = FISHING_CONFIG[day.fishing?.status] || FISHING_CONFIG["GOOD"];
          return <div key={i} style={{ flex: 1, background: fcfg.color, opacity: hovered === null ? 0.4 : hovered === i ? 1 : 0.15, transition: "opacity 0.2s ease", borderRadius: 2 }} />;
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "'Courier New', monospace" }}>TODAY</span>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.12)", fontFamily: "'Courier New', monospace" }}>— risk · — fishing</span>
        </div>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "'Courier New', monospace" }}>DAY 7</span>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [time, setTime] = useState(new Date());
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: 1 + Math.random() * 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 8 + Math.random() * 16,
      delay: Math.random() * 10,
      opacity: 0.05 + Math.random() * 0.12,
    }))
  );

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCoastalData();
      const normalized = {
        ...res.data,
        ml_risk: res.data?.ml_risk ?? "NO DATA",
        risk_level: (res.data?.risk_level || "SAFE").toUpperCase(),
      };
      setData(normalized);
    } catch (e) {
      console.error("API ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  const cfg = data ? (RISK_CONFIG[data?.risk_level] || RISK_CONFIG.SAFE) : RISK_CONFIG.SAFE;

  return (
    <div style={{
      minHeight: "100vh", background: "#060c18",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "30px 20px", fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .metric-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.12) !important; }
        .refresh-btn:hover { background: rgba(56,189,248,0.15) !important; }
        .refresh-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Background particles */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {particles.map((p) => (
          <Particle key={p.id} style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, background: "#38bdf8", opacity: p.opacity, animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite` }} />
        ))}
        <div style={{ position: "absolute", top: "-15%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,217,138,0.04) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* Main panel */}
      <div style={{
        width: "100%", maxWidth: 1080,
        background: "rgba(10,17,32,0.85)", backdropFilter: "blur(32px)",
        border: "1px solid rgba(255,255,255,0.06)", borderRadius: 28, overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.6) 30%, rgba(16,217,138,0.6) 70%, transparent 100%)" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 32px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(16,217,138,0.1))", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌊</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Coastal Intelligence System</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginTop: 1 }}>KARACHI — ARABIAN SEA</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "1px" }}>
                {time.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" }).toUpperCase()}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(16,217,138,0.08)", border: "1px solid rgba(16,217,138,0.2)", borderRadius: 20, padding: "6px 12px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10d98a", boxShadow: "0 0 8px #10d98a", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#10d98a", letterSpacing: "2px" }}>LIVE</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "80px 32px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(56,189,248,0.15)", borderTopColor: "#38bdf8", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: "2px" }}>ACQUIRING SENSOR DATA…</div>
          </div>
        ) : (
          <div style={{ padding: "28px 32px 32px" }}>

            {/* ── FISHING BANNER (today) ── */}
            <FishingBanner fishing={data?.fishing_recommendation} />

            {/* Risk hero + gauge */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div style={{
                background: `linear-gradient(135deg, rgba(10,17,32,0.8) 0%, ${cfg.glow} 100%)`,
                border: `1px solid ${cfg.color}30`, borderRadius: 20, padding: "28px 28px",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                position: "relative", overflow: "hidden", minHeight: 220,
              }}>
                <div style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", fontSize: 120, opacity: 0.05, userSelect: "none", lineHeight: 1, color: cfg.color }}>{cfg.icon}</div>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "2px", marginBottom: 8, fontFamily: "'Courier New', monospace" }}>THREAT ASSESSMENT</div>
                  <div style={{ fontSize: 42, fontWeight: 800, color: cfg.color, letterSpacing: "-1px", textShadow: `0 0 30px ${cfg.glow}`, lineHeight: 1 }}>{data?.risk_level}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{cfg.label} — Zone active</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 13 }}>🤖 AI Model: <b>{data?.ml_risk}</b></div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                  {[{ k: "Sea State", v: data?.sea_state }, { k: "Boating", v: data?.boating_risk }].map(({ k, v }) => (
                    <div key={k} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                      <span style={{ color: "rgba(255,255,255,0.35)" }}>{k}: </span>
                      <span style={{ color: "#fff", fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "2px", marginBottom: 16, fontFamily: "'Courier New', monospace", textAlign: "center" }}>RISK INDEX</div>
                <Gauge score={data?.risk_score || 0} riskLevel={data?.risk_level || "SAFE"} />
                <div style={{ display: "flex", justifyContent: "space-between", width: "85%", marginTop: 10 }}>
                  {["LOW", "MED", "HIGH"].map((l, i) => (
                    <span key={l} style={{ fontSize: 9, color: ["#10d98a","#f5a623","#ff4d4d"][i], letterSpacing: "1.5px", fontFamily: "'Courier New', monospace" }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
              {[
                { label: "Temperature", value: data.temperature, unit: "°C",  icon: "▲", accent: "rgba(245,166,35,0.4)" },
                { label: "Wind Speed",  value: data.wind_speed,  unit: "m/s", icon: "≋", accent: "rgba(56,189,248,0.4)" },
                { label: "Humidity",    value: `${data.humidity}`, unit: "%", icon: "◉", accent: "rgba(56,189,248,0.3)" },
                { label: "Wave Height", value: data.wave_height, unit: "m",   icon: "∿", accent: "rgba(16,217,138,0.35)" },
                { label: "Pressure",    value: data.pressure,    unit: "hPa", icon: "◈", accent: "rgba(138,43,226,0.3)" },
                { label: "Visibility",  value: data.visibility,  unit: "km",  icon: "◎", accent: "rgba(255,255,255,0.15)" },
                { label: "ML Prediction", value: data?.ml_risk || "NO DATA", unit: "", icon: "🤖", accent: "rgba(255,77,77,0.35)" },
              ].map((m) => (
                <div key={m.label} className="metric-card" style={{ background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "18px 20px", position: "relative", overflow: "hidden", cursor: "default", transition: "transform 0.2s ease, border-color 0.2s ease" }}>
                  <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: `linear-gradient(90deg, transparent, ${m.accent}, transparent)` }} />
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", marginBottom: 10, fontFamily: "'Courier New', monospace" }}>{m.icon} {m.label.toUpperCase()}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                    {m.value}<span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 3 }}>{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 7-day forecast + fishing */}
            <ForecastStrip forecast={data?.forecast} />

            {/* Footer */}
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
                Last updated · {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} PKT
              </div>
              <button className="refresh-btn" onClick={fetchData} disabled={refreshing} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "9px 18px", color: "#38bdf8", fontSize: 12, fontWeight: 600, cursor: refreshing ? "not-allowed" : "pointer", transition: "background 0.2s ease", opacity: refreshing ? 0.6 : 1 }}>
                <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>⟳</span>
                {refreshing ? "Refreshing…" : "Refresh Data"}
              </button>
            </div>
          </div>
        )}

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)" }} />
      </div>
    </div>
  );
}
