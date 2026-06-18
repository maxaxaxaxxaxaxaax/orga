// Deterministisches Kraft-Layout: Startpositionen auf einem Kreis nach Index
// (kein Zufall), dann feste Anzahl Iterationen (Zentrum-Anziehung, Abstossung,
// Kanten-Feder), danach eingefroren. Gleiche Eingabe -> gleiche Ausgabe.
// Gibt eine Map id -> {x, y} zurueck.
export function layoutNetz(nodes, links, opt = {}) {
  const W = opt.width || 680;
  const H = opt.height || 520;
  const PAD = 44;
  const ITER = opt.iterationen || 500;
  const n = nodes.length;
  if (!n) return {};
  const cx = W / 2, cy = H / 2;
  const r0 = Math.min(W, H) / 3;
  const idx = {};
  nodes.forEach((nd, i) => (idx[nd.id] = i));
  const P = nodes.map((_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r0, y: cy + Math.sin(a) * r0, vx: 0, vy: 0 };
  });
  const E = links
    .map((l) => [idx[l.from], idx[l.to], l.art])
    .filter(([a, b]) => a != null && b != null);

  for (let s = 0; s < ITER; s++) {
    const fx = new Array(n).fill(0);
    const fy = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      fx[i] += (cx - P[i].x) * 0.015;
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
    for (const [a, b, art] of E) {
      const soll = art === "baut" ? 150 : 60;
      const dx = P[b].x - P[a].x;
      const dy = P[b].y - P[a].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - soll) * (art === "baut" ? 0.01 : 0.05);
      const ux = dx / d, uy = dy / d;
      fx[a] += ux * f; fy[a] += uy * f;
      fx[b] -= ux * f; fy[b] -= uy * f;
    }
    for (let i = 0; i < n; i++) {
      P[i].vx = (P[i].vx + fx[i]) * 0.85;
      P[i].vy = (P[i].vy + fy[i]) * 0.85;
      P[i].x = Math.max(PAD, Math.min(W - PAD, P[i].x + P[i].vx));
      P[i].y = Math.max(PAD, Math.min(H - PAD, P[i].y + P[i].vy));
    }
  }
  const out = {};
  nodes.forEach((nd, i) => (out[nd.id] = { x: P[i].x, y: P[i].y }));
  return out;
}
