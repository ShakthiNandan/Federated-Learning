import { useState, useEffect, useRef } from "react";

// ── Embedded data (paste your actual JSON values here) ────────────
const CENTRALIZED = { approach:"centralized", accuracy:0.7833, precision:0.7805, recall:0.6531, f1_score:0.7111 };
const FEDERATED   = { approach:"federated",   accuracy:0.8083, precision:0.8095, recall:0.6939, f1_score:0.7473 };
const H1          = { approach:"single_hospital_1", accuracy:0.85,   precision:0.8163, recall:0.8163, f1_score:0.8163 };
const H2          = { approach:"single_hospital_2", accuracy:0.775,  precision:0.775,  recall:0.6327, f1_score:0.6966 };
const ROUNDS = [
  {round:1,  accuracy:0.85,   precision:0.8163, recall:0.8163, f1_score:0.8163},
  {round:2,  accuracy:0.8917, precision:0.875,  recall:0.8571, f1_score:0.866},
  {round:3,  accuracy:0.8583, precision:0.8636, recall:0.7755, f1_score:0.8172},
  {round:4,  accuracy:0.8667, precision:0.8837, recall:0.7755, f1_score:0.8261},
  {round:5,  accuracy:0.8583, precision:0.881,  recall:0.7551, f1_score:0.8132},
  {round:6,  accuracy:0.8583, precision:0.881,  recall:0.7551, f1_score:0.8132},
  {round:7,  accuracy:0.85,   precision:0.8605, recall:0.7551, f1_score:0.8043},
  {round:8,  accuracy:0.8417, precision:0.8571, recall:0.7347, f1_score:0.7912},
  {round:9,  accuracy:0.825,  precision:0.85,   recall:0.6939, f1_score:0.764},
  {round:10, accuracy:0.825,  precision:0.85,   recall:0.6939, f1_score:0.764},
  {round:11, accuracy:0.825,  precision:0.8684, recall:0.6735, f1_score:0.7586},
  {round:12, accuracy:0.825,  precision:0.8684, recall:0.6735, f1_score:0.7586},
  {round:13, accuracy:0.825,  precision:0.8684, recall:0.6735, f1_score:0.7586},
  {round:14, accuracy:0.8167, precision:0.8462, recall:0.6735, f1_score:0.75},
  {round:15, accuracy:0.8083, precision:0.825,  recall:0.6735, f1_score:0.7416},
  {round:16, accuracy:0.8,    precision:0.8049, recall:0.6735, f1_score:0.7333},
  {round:17, accuracy:0.8,    precision:0.8049, recall:0.6735, f1_score:0.7333},
  {round:18, accuracy:0.8,    precision:0.8049, recall:0.6735, f1_score:0.7333},
  {round:19, accuracy:0.8083, precision:0.8095, recall:0.6939, f1_score:0.7473},
  {round:20, accuracy:0.8083, precision:0.8095, recall:0.6939, f1_score:0.7473},
];

// ── Colour tokens ─────────────────────────────────────────────────
const C = {
  bg:      "#0a0e1a",
  surface: "#111827",
  border:  "#1e2d45",
  accent:  "#00d4ff",
  green:   "#00e5a0",
  amber:   "#f59e0b",
  red:     "#ff4d6d",
  muted:   "#4b6080",
  text:    "#e2eaf4",
  dim:     "#7a90aa",
};

const APPROACH_COLORS = {
  "Hospital 1\n(Cleveland)": "#00d4ff",
  "Hospital 2\n(Hungarian)": "#f59e0b",
  "Federated\n(FedAvg)":     "#00e5a0",
  "Centralized\n(Baseline)": "#a78bfa",
};

// ── Tiny animated counter ─────────────────────────────────────────
function Counter({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(+(value * p).toFixed(4));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <span>{display.toFixed(4)}</span>;
}

// ── SVG Line Chart ────────────────────────────────────────────────
function LineChart({ rounds }) {
  const W = 720, H = 200, PL = 48, PR = 16, PT = 16, PB = 32;
  const iW = W - PL - PR, iH = H - PT - PB;
  const minY = 0.5, maxY = 1.0;
  const toX = (i) => PL + (i / (rounds.length - 1)) * iW;
  const toY = (v) => PT + iH - ((v - minY) / (maxY - minY)) * iH;

  const accPath = rounds.map((r, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(r.accuracy)}`).join(" ");
  const f1Path  = rounds.map((r, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(r.f1_score)}`).join(" ");
  const benchY  = toY(CENTRALIZED.accuracy);

  const yTicks = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      {/* grid */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PL} x2={W - PR} y1={toY(v)} y2={toY(v)} stroke={C.border} strokeWidth="1" />
          <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fill={C.dim} fontSize="10">{v.toFixed(1)}</text>
        </g>
      ))}
      {/* x labels every 4 rounds */}
      {rounds.filter((_, i) => i % 4 === 0 || i === rounds.length - 1).map((r) => (
        <text key={r.round} x={toX(r.round - 1)} y={H - 4} textAnchor="middle" fill={C.dim} fontSize="10">{r.round}</text>
      ))}
      {/* benchmark */}
      <line x1={PL} x2={W - PR} y1={benchY} y2={benchY} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x={W - PR + 4} y={benchY + 4} fill="#a78bfa" fontSize="9">Centralized</text>
      {/* lines */}
      <path d={accPath} fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={f1Path}  fill="none" stroke={C.green}  strokeWidth="2.5" strokeLinejoin="round" />
      {/* dots */}
      {rounds.map((r, i) => (
        <g key={r.round}>
          <circle cx={toX(i)} cy={toY(r.accuracy)} r="3.5" fill={C.accent} />
          <circle cx={toX(i)} cy={toY(r.f1_score)}  r="3.5" fill={C.green} />
        </g>
      ))}
    </svg>
  );
}

// ── SVG Bar Chart ─────────────────────────────────────────────────
function BarChart({ metric }) {
  const entries = [
    { label: "Hospital 1\n(Cleveland)", value: H1[metric] },
    { label: "Hospital 2\n(Hungarian)", value: H2[metric] },
    { label: "Federated\n(FedAvg)",     value: FEDERATED[metric] },
    { label: "Centralized\n(Baseline)", value: CENTRALIZED[metric] },
  ];
  const W = 360, H = 160, PL = 8, PR = 8, PT = 12, PB = 40;
  const iW = W - PL - PR, iH = H - PT - PB;
  const barW = iW / entries.length * 0.55;
  const gap  = iW / entries.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {[0, 0.25, 0.5, 0.75, 1.0].map(v => (
        <line key={v} x1={PL} x2={W - PR} y1={PT + iH * (1 - v)} y2={PT + iH * (1 - v)}
              stroke={C.border} strokeWidth="1" />
      ))}
      {entries.map((e, i) => {
        const x = PL + gap * i + gap / 2 - barW / 2;
        const bH = e.value * iH;
        const y = PT + iH - bH;
        const col = Object.values(APPROACH_COLORS)[i];
        const lines = e.label.split("\n");
        return (
          <g key={e.label}>
            <rect x={x} y={y} width={barW} height={bH} fill={col} opacity="0.85" rx="3" />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={col} fontSize="9.5" fontWeight="700">
              {e.value.toFixed(3)}
            </text>
            {lines.map((l, li) => (
              <text key={li} x={x + barW / 2} y={PT + iH + 12 + li * 11}
                    textAnchor="middle" fill={C.dim} fontSize="8.5">{l}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Hospital status card ──────────────────────────────────────────
function HospitalCard({ name, dataset, status, metrics, color }) {
  const statusColor = { training: C.amber, idle: C.muted, done: C.green }[status];
  const statusLabel = { training: "● TRAINING", idle: "○ IDLE", done: "✓ DONE" }[status];
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: 12, padding: "20px 22px", flex: 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            {name}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{dataset}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, letterSpacing: "0.1em" }}>
          {statusLabel}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
        {[["Accuracy", metrics.accuracy], ["F1 Score", metrics.f1_score],
          ["Precision", metrics.precision], ["Recall", metrics.recall]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{k}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
              {(v * 100).toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, color: C.dim }}>%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function App() {
  const [activeRound, setActiveRound] = useState(ROUNDS.length - 1);
  const [metric, setMetric] = useState("accuracy");
  const [animating, setAnimating] = useState(false);
  const [visibleRounds, setVisibleRounds] = useState(ROUNDS.length);
  const interval = useRef();

  const currentRound = ROUNDS[activeRound];

  function replay() {
    if (animating) return;
    setAnimating(true);
    setVisibleRounds(1);
    setActiveRound(0);
    let r = 1;
    interval.current = setInterval(() => {
      r++;
      setVisibleRounds(r);
      setActiveRound(r - 1);
      if (r >= ROUNDS.length) {
        clearInterval(interval.current);
        setAnimating(false);
      }
    }, 180);
  }

  useEffect(() => () => clearInterval(interval.current), []);

  const metricBtns = ["accuracy", "precision", "recall", "f1_score"];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      padding: "32px 24px", boxSizing: "border-box",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: C.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          Federated Learning
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 36px)", fontFamily: "'Syne', sans-serif",
                     fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>
          Heart Disease Prediction Dashboard
        </h1>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>
          Cleveland Clinic  ×  Hungarian Institute  ·  FedAvg  ·  20 Communication Rounds
        </div>
      </div>

      {/* Top KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Final Round", value: `${activeRound + 1} / ${ROUNDS.length}`, raw: false, color: C.accent },
          { label: "Fed Accuracy", value: currentRound.accuracy, raw: true, color: C.green },
          { label: "Fed F1 Score", value: currentRound.f1_score, raw: true, color: C.amber },
          { label: "vs Centralized", value: ((currentRound.accuracy - CENTRALIZED.accuracy) * 100).toFixed(1) + "%",
            raw: false, color: currentRound.accuracy >= CENTRALIZED.accuracy ? C.green : C.red },
        ].map(({ label, value, raw, color }) => (
          <div key={label} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "16px 20px",
          }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
              {raw ? <Counter value={value} /> : value}
            </div>
          </div>
        ))}
      </div>

      {/* Rounds chart */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Performance Across Rounds</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
              Federated accuracy &amp; F1 per communication round
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: C.dim }}>
              <span><span style={{ color: C.accent }}>●</span> Accuracy</span>
              <span><span style={{ color: C.green }}>●</span> F1 Score</span>
              <span><span style={{ color: "#a78bfa" }}>- -</span> Centralized</span>
            </div>
            <button onClick={replay} disabled={animating} style={{
              background: animating ? C.muted : C.accent, color: C.bg,
              border: "none", borderRadius: 6, padding: "6px 14px",
              fontSize: 11, fontWeight: 700, cursor: animating ? "default" : "pointer",
              letterSpacing: "0.05em", fontFamily: "inherit",
            }}>
              {animating ? "PLAYING…" : "▶ REPLAY"}
            </button>
          </div>
        </div>
        <LineChart rounds={ROUNDS.slice(0, visibleRounds)} />
        {/* Round scrubber */}
        <div style={{ marginTop: 12 }}>
          <input type="range" min={0} max={ROUNDS.length - 1} value={activeRound}
            onChange={e => { setActiveRound(+e.target.value); setVisibleRounds(+e.target.value + 1); }}
            style={{ width: "100%", accentColor: C.accent }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginTop: 2 }}>
            <span>Round 1</span><span style={{ color: C.accent }}>Round {activeRound + 1} selected</span><span>Round 20</span>
          </div>
        </div>
      </div>

      {/* Hospital cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <HospitalCard name="Hospital 1" dataset="Cleveland Clinic" status="done"
          metrics={H1} color={C.accent} />
        <HospitalCard name="Hospital 2" dataset="Hungarian Institute" status="done"
          metrics={H2} color={C.amber} />
      </div>

      {/* Comparison bar charts */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Approach Comparison</div>
          <div style={{ display: "flex", gap: 8 }}>
            {metricBtns.map(m => (
              <button key={m} onClick={() => setMetric(m)} style={{
                background: metric === m ? C.accent : "transparent",
                color: metric === m ? C.bg : C.dim,
                border: `1px solid ${metric === m ? C.accent : C.border}`,
                borderRadius: 6, padding: "4px 12px", fontSize: 11,
                cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                textTransform: "capitalize", letterSpacing: "0.03em",
              }}>
                {m.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        <BarChart metric={metric} />
      </div>

      {/* Summary table */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "20px 24px",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>Full Results Summary</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Approach", "Accuracy", "Precision", "Recall", "F1 Score"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 12px", color: C.dim,
                                     fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Hospital 1 (Cleveland)", data: H1,          color: C.accent },
              { label: "Hospital 2 (Hungarian)", data: H2,          color: C.amber },
              { label: "Federated (FedAvg)",     data: FEDERATED,   color: C.green },
              { label: "Centralized (Baseline)", data: CENTRALIZED, color: "#a78bfa" },
            ].map(({ label, data, color }) => (
              <tr key={label} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", color, fontWeight: 600 }}>{label}</td>
                {["accuracy", "precision", "recall", "f1_score"].map(k => (
                  <td key={k} style={{ padding: "10px 12px", color: C.text, fontVariantNumeric: "tabular-nums" }}>
                    {(data[k] * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, textAlign: "center", fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>
        FEDERATED LEARNING PROJECT · CLEVELAND + HUNGARIAN UCI HEART DISEASE DATASETS
      </div>
    </div>
  );
}