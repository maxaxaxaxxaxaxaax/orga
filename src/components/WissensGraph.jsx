/* Imperatives Force-Layout: Die Knoten-Positionen leben bewusst in einer ref und
   werden per requestAnimationFrame aktualisiert; das Rendern liest sie direkt. Dieses
   Animationsmuster verletzt die Purity-/Ref-Regeln des React-Compilers absichtlich. */
/* eslint-disable react-hooks/refs, react-hooks/purity */
import { useEffect, useRef, useState } from "react";

// Die Knotenfarbe zeigt den Lernstand (klar und einheitlich):
// done = grün, current = blau (gefüllt + Glühen), upcoming = hohl/grau gestrichelt.
const statusFarbe = {
  done: "#2f9e44",
  current: "#3b5bdb",
  upcoming: "#adb5bd",
};
function statusColor(status) {
  return statusFarbe[status] || statusFarbe.upcoming;
}
function knotenStil(status) {
  const c = statusColor(status);
  if (status === "done") {
    return { fill: `color-mix(in srgb, ${c} 16%, white)`, stroke: c };
  }
  if (status === "current") {
    return { fill: c, stroke: c };
  }
  return { fill: "#ffffff", stroke: c, strokeDasharray: "4 4" };
}

const HEIGHT = 520;
const PAD = 48;

export default function WissensGraph({ nodes, links, farbe, selectedId, onSelect }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const posRef = useRef(null);
  const dragRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [, setTick] = useState(0);
  const [hover, setHover] = useState(null);

  // id -> index
  const index = {};
  nodes.forEach((n, i) => (index[n.id] = i));
  const linkIdx = links
    .map(([a, b]) => [index[a], index[b]])
    .filter(([a, b]) => a != null && b != null);

  // Nachbarschaft (für Hervorhebung).
  const nachbarn = {};
  nodes.forEach((n) => (nachbarn[n.id] = new Set()));
  links.forEach(([a, b]) => {
    nachbarn[a]?.add(b);
    nachbarn[b]?.add(a);
  });

  // Breite messen.
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Positionen initialisieren (Kreis um die Mitte mit etwas Streuung).
  if (!posRef.current || posRef.current.length !== nodes.length) {
    const cx = width / 2;
    const cy = HEIGHT / 2;
    const r = Math.min(width, HEIGHT) / 3.2;
    posRef.current = nodes.map((_, i) => {
      const a = (i / nodes.length) * Math.PI * 2;
      return {
        x: cx + Math.cos(a) * r + (Math.random() - 0.5) * 30,
        y: cy + Math.sin(a) * r + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
      };
    });
  }

  // Physik-Schleife (bei "prefers-reduced-motion" statisch lassen).
  useEffect(() => {
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // statisches Layout, keine Animation
    let raf;
    const W = width;
    const L = 108; // Soll-Kantenlänge
    const step = () => {
      const P = posRef.current;
      const n = P.length;
      const fx = new Array(n).fill(0);
      const fy = new Array(n).fill(0);
      const cx = W / 2;
      const cy = HEIGHT / 2;

      for (let i = 0; i < n; i++) {
        fx[i] += (cx - P[i].x) * 0.014;
        fy[i] += (cy - P[i].y) * 0.02;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          const dx = P[i].x - P[j].x;
          const dy = P[i].y - P[j].y;
          const d2 = dx * dx + dy * dy + 0.01;
          const d = Math.sqrt(d2);
          const f = 6400 / d2;
          fx[i] += (dx / d) * f;
          fy[i] += (dy / d) * f;
        }
      }
      for (const [a, b] of linkIdx) {
        const dx = P[b].x - P[a].x;
        const dy = P[b].y - P[a].y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - L) * 0.022;
        const ux = dx / d;
        const uy = dy / d;
        fx[a] += ux * f;
        fy[a] += uy * f;
        fx[b] -= ux * f;
        fy[b] -= uy * f;
      }

      let moved = false;
      const drag = dragRef.current;
      for (let i = 0; i < n; i++) {
        if (drag && drag.i === i) continue;
        P[i].vx = (P[i].vx + fx[i]) * 0.85;
        P[i].vy = (P[i].vy + fy[i]) * 0.85;
        const ox = P[i].x;
        const oy = P[i].y;
        P[i].x = Math.max(PAD, Math.min(W - PAD, P[i].x + P[i].vx));
        P[i].y = Math.max(PAD, Math.min(HEIGHT - PAD, P[i].y + P[i].vy));
        if (Math.abs(P[i].x - ox) > 0.08 || Math.abs(P[i].y - oy) > 0.08) moved = true;
      }
      if (drag) moved = true;
      if (moved) setTick((t) => t + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, nodes.length]);

  // Zeigerkoordinaten -> SVG-Koordinaten.
  function toSvg(e) {
    const r = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerDown(e, i) {
    e.target.setPointerCapture?.(e.pointerId);
    const p = toSvg(e);
    dragRef.current = { i, moved: false, x: p.x, y: p.y };
  }
  function onPointerMove(e) {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toSvg(e);
    if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) drag.moved = true;
    const P = posRef.current[drag.i];
    P.x = Math.max(PAD, Math.min(width - PAD, p.x));
    P.y = Math.max(PAD, Math.min(HEIGHT - PAD, p.y));
    P.vx = 0;
    P.vy = 0;
    setTick((t) => t + 1);
  }
  function onPointerUp(node) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved) onSelect?.(node);
  }

  const P = posRef.current;
  const aktiv = hover || selectedId;

  return (
    <div className="graph-flaeche" ref={wrapRef}>
      <svg
        ref={svgRef}
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="graph-svg"
      >
        {/* Kanten */}
        {linkIdx.map(([a, b], k) => {
          const hervor =
            aktiv && (nodes[a].id === aktiv || nodes[b].id === aktiv);
          return (
            <line
              key={k}
              x1={P[a].x}
              y1={P[a].y}
              x2={P[b].x}
              y2={P[b].y}
              stroke={hervor ? farbe : "#d2d6dd"}
              strokeWidth={hervor ? 2.4 : 1.4}
              strokeOpacity={hervor ? 0.9 : 0.6}
            />
          );
        })}

        {/* Knoten */}
        {nodes.map((n, i) => {
          const c = statusColor(n.status); // Farbe = Lernstand
          const stil = knotenStil(n.status);
          const istAktiv = aktiv === n.id;
          const istNachbar = aktiv && nachbarn[aktiv]?.has(n.id);
          const gedimmt = aktiv && !istAktiv && !istNachbar;
          const r = (n.status === "current" ? 19 : 16) + (istAktiv ? 3 : 0);
          return (
            <g
              key={n.id}
              transform={`translate(${P[i].x},${P[i].y})`}
              className="graph-node"
              opacity={gedimmt ? 0.4 : 1}
              role="button"
              tabIndex={0}
              aria-label={`Lernweg ${n.label}`}
              onPointerDown={(e) => onPointerDown(e, i)}
              onPointerMove={onPointerMove}
              onPointerUp={() => onPointerUp(n)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(n);
                }
              }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
            >
              {n.status === "current" && (
                <circle r={r + 6} style={{ fill: c }} opacity="0.18" />
              )}
              <circle r={r} style={{ ...stil, strokeWidth: 2.5 }} />
              {n.status === "done" && (
                <path
                  d="M -5 0 L -1.5 3.5 L 5 -4"
                  fill="none"
                  stroke={c}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              <text className="graph-label" y={r + 16} textAnchor="middle">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
