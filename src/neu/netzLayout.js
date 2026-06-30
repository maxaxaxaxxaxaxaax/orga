// Zell-Offsets (Spalte, Reihe) relativ zum Zentrum. Ring 1 = 3x3 ohne Mitte,
// Reihenfolge wie im Mockup: oben, oben-rechts, rechts, unten, links, oben-links,
// dann die unteren Ecken. Bei mehr als 8 Knoten kommt ein zweiter Ring dazu.
function zellOffsets(m) {
  const ring1 = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [1, 1], [-1, 1]];
  if (m <= ring1.length) return ring1;
  const ring2 = [];
  for (let c = -2; c <= 2; c++)
    for (let r = -2; r <= 2; r++)
      if (Math.max(Math.abs(c), Math.abs(r)) === 2) ring2.push([c, r]);
  return ring1.concat(ring2);
}

// Grid-Layout: Zentrum-Knoten in die Mitte, die uebrigen in ein ausgerichtetes
// Raster (gleiche Spalten-x und Reihen-y) rundherum statt auf einen Kreis, damit
// nichts hoehenversetzt steht. Reihenfolge aus einem Graph-Durchlauf (DFS) ab dem
// Zentrum, damit verbundene Knoten benachbart liegen. Deterministisch. Map id -> {x, y}.
function gridLayout(nodes, links, zentrumId, W, H, PAD, cx, cy) {
  const adj = {};
  nodes.forEach((nd) => (adj[nd.id] = []));
  for (const l of links)
    if (adj[l.from] && adj[l.to]) {
      adj[l.from].push(l.to);
      adj[l.to].push(l.from);
    }
  const reihenfolge = [];
  const besucht = new Set([zentrumId]);
  (function dfs(id) {
    for (const nb of adj[id] || [])
      if (!besucht.has(nb)) {
        besucht.add(nb);
        reihenfolge.push(nb);
        dfs(nb);
      }
  })(zentrumId);
  for (const nd of nodes)
    if (nd.id !== zentrumId && !besucht.has(nd.id)) reihenfolge.push(nd.id);

  const offsets = zellOffsets(reihenfolge.length);
  const maxAbs = offsets
    .slice(0, reihenfolge.length)
    .reduce((a, [c, r]) => Math.max(a, Math.abs(c), Math.abs(r)), 1);
  const colGap = Math.min(210, (W / 2 - PAD - 40) / maxAbs);
  const rowGap = Math.min(150, (H / 2 - PAD - 40) / maxAbs);

  const out = {};
  out[zentrumId] = { x: cx, y: cy };
  reihenfolge.forEach((id, i) => {
    const [c, r] = offsets[i];
    out[id] = { x: cx + c * colGap, y: cy + r * rowGap };
  });
  return out;
}

// Radiales Baum-Layout (tidy tree) fuer die Karten-Ansicht: gedachte Wurzel = Fach
// in der Mitte, Kategorien (Ebene 1) auf dem inneren Ring, Subkategorien (2) und
// Lernwege (3) auf weiteren Ringen NACH AUSSEN. Jeder Ast bekommt einen eigenen
// Winkelsektor, dessen Breite sich nach der Blattzahl richtet; Kinder faechern in
// diesem Sektor auf. So ueberlappt nichts und es breitet sich wie eine Mindmap aus.
// Deterministisch. Map id -> {x, y}.
export function layoutKarte(nodes, opt = {}) {
  const W = opt.width || 680;
  const H = opt.height || 520;
  const cx = W / 2, cy = H / 2;
  // Radien proportional zur Box, damit der Baum die (auch hohe) Fläche füllt.
  // Ebene 0 = Fächer (innen), dann Kategorien, Subkategorien, Lernwege nach außen.
  const basis = Math.min(W, H);
  const ringR = { 0: basis * 0.16, 1: basis * 0.4, 2: basis * 0.64, 3: basis * 0.88 };
  const kinderVon = (id) => nodes.filter((n) => n.parent === id);
  const blattZahl = (n) => {
    const kids = kinderVon(n.id);
    return kids.length ? kids.reduce((s, k) => s + blattZahl(k), 0) : 1;
  };
  const pos = {};
  // Knoten in die Mitte seines Winkelsektors auf den Ring seiner Ebene setzen und
  // den Sektor anteilig (nach Blattzahl) auf die Kinder verteilen.
  const setze = (node, aVon, aBis) => {
    const ang = (aVon + aBis) / 2;
    const r = ringR[node.ebene] || ringR[3];
    pos[node.id] = { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r };
    const kids = kinderVon(node.id);
    if (!kids.length) return;
    const total = kids.reduce((s, k) => s + blattZahl(k), 0) || 1;
    let a = aVon;
    for (const kid of kids) {
      const span = (aBis - aVon) * (blattZahl(kid) / total);
      setze(kid, a, a + span);
      a += span;
    }
  };
  // Wurzeln = elternlose Knoten (im fachübergreifenden Netz die Fächer).
  const wurzeln = nodes.filter((n) => !n.parent);
  const total = wurzeln.reduce((s, k) => s + blattZahl(k), 0) || 1;
  let a = -Math.PI / 2; // oben beginnen
  for (const w of wurzeln) {
    const span = Math.PI * 2 * (blattZahl(w) / total);
    setze(w, a, a + span);
    a += span;
  }
  return pos;
}

// Deterministisches Layout. Mit opt.zentrumId als Grid (Zentrum mittig, Rest im
// ausgerichteten Raster); sonst als Fallback ein eingefrorenes Kraft-Layout.
// Gleiche Eingabe -> gleiche Ausgabe. Gibt eine Map id -> {x, y} zurueck.
export function layoutNetz(nodes, links, opt = {}) {
  const W = opt.width || 680;
  const H = opt.height || 520;
  const PAD = 44;
  const ITER = opt.iterationen || 500;
  const n = nodes.length;
  if (!n) return {};
  const cx = W / 2, cy = H / 2;
  if (opt.zentrumId && nodes.some((nd) => nd.id === opt.zentrumId))
    return gridLayout(nodes, links, opt.zentrumId, W, H, PAD, cx, cy);
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
