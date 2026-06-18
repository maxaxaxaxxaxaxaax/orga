# Wissens-Landkarte (Themen-Netz) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine zusaetzliche grafische Ansicht im Wissens-Bereich, die die Themen eines Fachs als geclustertes Netz zeigt (Farbe = Kategorie, Groesse = Hierarchie-Ebene, Fuellung = Lernstand, Pfeile = baut-auf zwischen Bereichen), waehrend die Listen-Ablage Standard und barrierearme Alternative bleibt.

**Architecture:** Reine Daten-/Layout-Module (`netzModell.js`, `netzLayout.js`, `voraussetzungen.js`) erzeugen Knoten, Kanten und stabile Positionen aus den vorhandenen Daten. Die Praesentationskomponente `Netz.jsx` rendert daraus SVG. `Ablage.jsx` bekommt einen Umschalter `Liste | Netz` und tauscht nur die linke Spalte; die Detail-Spalte (`KbInhalt`) bleibt geteilt. Kein neues Runtime-Paket.

**Tech Stack:** Vite + React 19, reines SVG, CSS-Variablen (dark-mode-sicher), localStorage. Verifikation: `npm run lint`, `npm run build`, Browser via preview_eval (kein Test-Runner im Projekt).

---

## Dateistruktur

- Create `src/data/voraussetzungen.js` — gerichtete "baut-auf"-Kanten grob zwischen Kategorien je Fach + Validator `pruefeVoraussetzungen`.
- Create `src/neu/netzModell.js` — reine Builder: Farbpalette je Kategorie, `lernwegStatus`, `aggregatStatus`, `baueNetz` (Knoten + Kanten).
- Create `src/neu/netzLayout.js` — deterministisches "settle-then-freeze"-Layout (reine Funktion, Positionen je id).
- Create `src/neu/Netz.jsx` — SVG-Rendering aus Modell + Layout, Hover-Hervorhebung, Klick, Tastatur, Pan/Zoom, aufklappbare Subkategorien.
- Create `src/neu/Netz.css` — Styles (Farben ueber Variablen).
- Modify `src/neu/Ablage.jsx` — Umschalter `Liste | Netz`, linke Spalte bedingt rendern.

Jede Kategorie-/Subkategorie-/Lernweg-Einheit hat eine klare Verantwortung; die Layout-Mathematik ist von der Darstellung getrennt, damit sie isoliert nachvollziehbar bleibt.

---

### Task 1: Voraussetzungs-Kanten + Validator

**Files:**
- Create: `src/data/voraussetzungen.js`

- [ ] **Step 1: Datei mit kuratierten baut-auf-Kanten und Validator anlegen**

Die Kanten sind grob auf Bereichs-Ebene am deutschen Lehrplan orientiert kuratiert (Grundlagen/Sprachgrundlagen als Wurzel). Konvention: `[voraussetzung, baut-darauf-auf]`. Nur Kategorie-Namen, die in `FACH_STRUKTUR[fach].kategorien` existieren.

```js
import { FACH_STRUKTUR } from "./fachStruktur";

// Gerichtete "baut auf"-Kanten GROB zwischen den Kategorien eines Fachs.
// Konvention: [voraussetzung, baut-darauf-auf] (Pfeil zeigt von der Grundlage
// zum darauf Aufbauenden). Nur Kategorie-Namen aus FACH_STRUKTUR. Einmalig am
// Lehrplan orientiert kuratiert, nicht aus Nutzerdaten erzeugt.
export const VORAUSSETZUNGEN = {
  mathe: [
    ["Mathematische Grundlagen", "Algebra"],
    ["Mathematische Grundlagen", "Funktionen"],
    ["Mathematische Grundlagen", "Geometrie"],
    ["Mathematische Grundlagen", "Stochastik"],
    ["Mathematische Grundlagen", "Angewandte Mathematik"],
    ["Algebra", "Funktionen"],
    ["Funktionen", "Analysis"],
    ["Funktionen", "Geometrie"],
    ["Funktionen", "Stochastik"],
    ["Analysis", "Stochastik"],
    ["Algebra", "Angewandte Mathematik"],
    ["Funktionen", "Angewandte Mathematik"],
  ],
  deutsch: [
    ["Grammatik", "Textarten und Schreiben"],
    ["Rechtschreibung", "Textarten und Schreiben"],
    ["Grammatik", "Sprache und Kommunikation"],
    ["Grammatik", "Stilmittel"],
    ["Stilmittel", "Lyrik"],
    ["Stilmittel", "Epik und Dramatik"],
    ["Lyrik", "Literaturepochen"],
    ["Epik und Dramatik", "Literaturepochen"],
    ["Literaturepochen", "Literarische Werke"],
    ["Epik und Dramatik", "Literarische Werke"],
  ],
  englisch: [
    ["Wortarten", "Satzbau"],
    ["Zeitformen", "Satzbau"],
    ["Zeitformen", "Verben"],
    ["Verben", "Satzbau"],
    ["Wortschatz und Rechtschreibung", "Schreiben und Textarten"],
    ["Satzbau", "Schreiben und Textarten"],
    ["Schreiben und Textarten", "Analyse und Interpretation"],
    ["Satzbau", "Sprachmittlung und Kommunikation"],
    ["Wortschatz und Rechtschreibung", "Sprachmittlung und Kommunikation"],
  ],
};

// Prueft die Kanten eines Fachs: existierende Kategorien, keine Selbstkante,
// keine Dublette, kein Zyklus. Gibt eine Fehlerliste zurueck (leer = ok).
export function pruefeVoraussetzungen(fachId) {
  const fehler = [];
  const struktur = FACH_STRUKTUR[fachId];
  const kanten = VORAUSSETZUNGEN[fachId] || [];
  if (!struktur) {
    if (kanten.length) fehler.push("Fach ohne Struktur hat Kanten: " + fachId);
    return fehler;
  }
  const kats = new Set(struktur.kategorien);
  const gesehen = new Set();
  const nachfolger = {};
  for (const [a, b] of kanten) {
    if (!kats.has(a)) fehler.push("Unbekannte Kategorie (von): " + a);
    if (!kats.has(b)) fehler.push("Unbekannte Kategorie (nach): " + b);
    if (a === b) fehler.push("Selbstkante: " + a);
    const key = a + "->" + b;
    if (gesehen.has(key)) fehler.push("Doppelte Kante: " + key);
    gesehen.add(key);
    (nachfolger[a] = nachfolger[a] || []).push(b);
  }
  // Zyklus-Check per DFS.
  const farbe = {};
  function hatZyklus(k) {
    farbe[k] = 1;
    for (const n of nachfolger[k] || []) {
      if (farbe[n] === 1) return true;
      if (!farbe[n] && hatZyklus(n)) return true;
    }
    farbe[k] = 2;
    return false;
  }
  for (const k of kats) {
    if (!farbe[k] && hatZyklus(k)) {
      fehler.push("Zyklus ab Kategorie: " + k);
      break;
    }
  }
  return fehler;
}
```

- [ ] **Step 2: Build pruefen**

Run: `npm run build`
Expected: PASS (keine Syntax-/Importfehler).

- [ ] **Step 3: Kanten im Browser validieren**

Dev-Server via preview_start (Name `dev`), dann preview_eval:

```js
(async () => {
  const v = await import('/src/data/voraussetzungen.js?t=' + Date.now());
  return { mathe: v.pruefeVoraussetzungen('mathe'), deutsch: v.pruefeVoraussetzungen('deutsch'), englisch: v.pruefeVoraussetzungen('englisch') };
})()
```
Expected: `{ mathe: [], deutsch: [], englisch: [] }`. Bei Fehlern die genannten Kategorienamen gegen `FACH_STRUKTUR` korrigieren.

- [ ] **Step 4: Commit**

```bash
git add src/data/voraussetzungen.js
git commit -F - <<'EOF'
Netz: baut-auf-Kanten zwischen Kategorien + Validator

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: Netz-Modell (Knoten + Kanten + Status)

**Files:**
- Create: `src/neu/netzModell.js`

- [ ] **Step 1: Modul mit Palette, Status und Netz-Builder anlegen**

```js
import { koennensbeweise } from "../data/koennensbeweise";
import { ladeSchritte } from "./lernschritte";

// Kategoriale Farbpalette (mittlere Ton-Stufen, lesbar in hell und dunkel).
// Zuordnung ueber den Index der Kategorie in FACH_STRUKTUR.kategorien.
export const KATEGORIE_PALETTE = [
  "#888780", "#E24B4A", "#639922", "#378ADD", "#D4537E",
  "#BA7517", "#1D9E75", "#7F77DD", "#D85A30",
];

export function farbeFuerKategorie(struktur, kategorie) {
  const i = struktur.kategorien.indexOf(kategorie);
  return KATEGORIE_PALETTE[(i < 0 ? 0 : i) % KATEGORIE_PALETTE.length];
}

// Lernstand eines einzelnen Lernwegs: erledigt > aktuell > offen.
export function lernwegStatus(thema, erledigt) {
  if (erledigt[thema.kbId]) return "erledigt";
  const aktiverKb =
    !thema.landkarte && koennensbeweise.some((k) => k.id === thema.kbId);
  if (aktiverKb) return "aktuell";
  const schritte = thema.schritte || [];
  if (schritte.length) {
    const stand = ladeSchritte(thema.kbId);
    const fertig = schritte.filter((st, i) =>
      stand[i] != null ? stand[i] : !!st.fertig
    ).length;
    if (fertig > 0) return "aktuell";
  }
  return "offen";
}

// Status einer Gruppe (Kategorie/Subkategorie): alle erledigt = erledigt,
// sonst wenn etwas begonnen/aktiv = aktuell, sonst offen.
export function aggregatStatus(themen, erledigt) {
  if (!themen.length) return "offen";
  const stati = themen.map((t) => lernwegStatus(t, erledigt));
  if (stati.every((s) => s === "erledigt")) return "erledigt";
  if (stati.some((s) => s !== "offen")) return "aktuell";
  return "offen";
}

const RADIUS = { 1: 22, 2: 14, 3: 9 };

// Baut Knoten und Kanten fuer ein Fach. `offeneSubs` ist ein Set der
// Subkategorie-ids, deren Lernwege sichtbar sein sollen (progressive
// Offenlegung gegen Dichte). Kategorie- und Subkategorie-Knoten sind immer da.
export function baueNetz(fach, struktur, erledigt, voraussetzungen, offeneSubs) {
  const nodes = [];
  const links = [];
  const subId = (kat, sub) => "sub:" + kat + "||" + sub;
  const katId = (kat) => "kat:" + kat;

  for (const kat of struktur.kategorien) {
    const katThemen = fach.themen.filter((t) => t.kategorie === kat);
    if (!katThemen.length) continue;
    const color = farbeFuerKategorie(struktur, kat);
    nodes.push({
      id: katId(kat), label: kat, ebene: 1, kategorie: kat, color,
      r: RADIUS[1], status: aggregatStatus(katThemen, erledigt),
    });
    for (const sub of struktur.subkategorien[kat] || []) {
      const subThemen = katThemen.filter((t) => t.subkategorie === sub);
      if (!subThemen.length) continue;
      const sid = subId(kat, sub);
      nodes.push({
        id: sid, label: sub, ebene: 2, kategorie: kat, color,
        r: RADIUS[2], status: aggregatStatus(subThemen, erledigt),
      });
      links.push({ from: katId(kat), to: sid, art: "gehoert" });
      if (offeneSubs.has(sid)) {
        for (const t of subThemen) {
          nodes.push({
            id: t.id, label: t.label, ebene: 3, kategorie: kat, color,
            r: RADIUS[3], status: lernwegStatus(t, erledigt), themaId: t.id,
          });
          links.push({ from: sid, to: t.id, art: "gehoert" });
        }
      }
    }
  }

  const vorhanden = new Set(nodes.map((n) => n.id));
  for (const [a, b] of voraussetzungen || []) {
    const fa = katId(a), fb = katId(b);
    if (vorhanden.has(fa) && vorhanden.has(fb)) {
      links.push({ from: fa, to: fb, art: "baut" });
    }
  }
  return { nodes, links };
}
```

- [ ] **Step 2: Build pruefen**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Modell im Browser pruefen**

preview_eval:

```js
(async () => {
  const w = await import('/src/data/wissen.js?t=' + Date.now());
  const fs = await import('/src/data/fachStruktur.js?t=' + Date.now());
  const v = await import('/src/data/voraussetzungen.js?t=' + Date.now());
  const m = await import('/src/neu/netzModell.js?t=' + Date.now());
  const p = await import('/src/neu/planung.js?t=' + Date.now());
  const fach = w.faecher.find(f => f.id === 'mathe');
  const erledigt = p.lade(p.ERLEDIGT_KEY);
  const netz = m.baueNetz(fach, fs.FACH_STRUKTUR.mathe, erledigt, v.VORAUSSETZUNGEN.mathe, new Set());
  return {
    knoten: netz.nodes.length,
    ebenen: netz.nodes.reduce((a,n)=>{a[n.ebene]=(a[n.ebene]||0)+1;return a;},{}),
    bautKanten: netz.links.filter(l=>l.art==='baut').length,
    beispielStatus: netz.nodes.slice(0,3).map(n=>({l:n.label,s:n.status})),
  };
})()
```
Expected: ebene 1 = 7 (Mathe-Kategorien mit Themen), ebene 2 > 0, ebene 3 = 0 (keine Subs offen), bautKanten = 12.

- [ ] **Step 4: Commit**

```bash
git add src/neu/netzModell.js
git commit -F - <<'EOF'
Netz: Modell-Builder fuer Knoten, Kanten und Lernstand

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: Deterministisches Layout

**Files:**
- Create: `src/neu/netzLayout.js`

- [ ] **Step 1: Reine Layout-Funktion anlegen (settle-then-freeze, kein Zufall)**

```js
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
```

- [ ] **Step 2: Build pruefen**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Determinismus + Grenzen im Browser pruefen**

preview_eval:

```js
(async () => {
  const L = await import('/src/neu/netzLayout.js?t=' + Date.now());
  const nodes = [{id:'a'},{id:'b'},{id:'c'},{id:'d'}];
  const links = [{from:'a',to:'b',art:'gehoert'},{from:'a',to:'c',art:'baut'}];
  const r1 = L.layoutNetz(nodes, links);
  const r2 = L.layoutNetz(nodes, links);
  const gleich = JSON.stringify(r1) === JSON.stringify(r2);
  const imRahmen = Object.values(r1).every(p => p.x>=0 && p.x<=680 && p.y>=0 && p.y<=520);
  return { gleich, imRahmen, r1 };
})()
```
Expected: `gleich: true`, `imRahmen: true`.

- [ ] **Step 4: Commit**

```bash
git add src/neu/netzLayout.js
git commit -F - <<'EOF'
Netz: deterministisches settle-then-freeze Layout

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: Netz-Komponente (SVG-Rendering)

**Files:**
- Create: `src/neu/Netz.jsx`
- Create: `src/neu/Netz.css`

- [ ] **Step 1: Netz.css anlegen**

```css
.netz-flaeche {
  width: 100%;
  height: 520px;
  border: 1px solid var(--rand, rgba(0,0,0,0.08));
  border-radius: 14px;
  background: var(--flaeche-2, rgba(0,0,0,0.02));
  overflow: hidden;
  touch-action: none;
}
.netz-svg { display: block; width: 100%; height: 100%; cursor: grab; }
.netz-svg.greift { cursor: grabbing; }
.netz-knoten { cursor: pointer; outline: none; }
.netz-knoten:focus-visible .netz-knoten-ring { opacity: 1; }
.netz-label {
  font-size: 12px;
  fill: var(--text, #1d1d1f);
  paint-order: stroke;
  stroke: var(--flaeche, #fff);
  stroke-width: 3px;
  stroke-linejoin: round;
  pointer-events: none;
}
.netz-label.gross { font-size: 14px; }
.netz-legende {
  display: flex; flex-wrap: wrap; gap: 14px;
  font-size: 13px; color: var(--text-2, #6b6b6b);
  margin: 0 0 10px;
}
.netz-legende span { display: inline-flex; align-items: center; gap: 6px; }
.netz-punkt { width: 13px; height: 13px; border-radius: 50%; display: inline-block; }
```

Hinweis: Variablennamen an `index.css`/`App.css` anpassen, falls dort andere Namen fuer Flaeche/Text/Rand verwendet werden (Werte sind als Fallback gesetzt).

- [ ] **Step 2: Netz.jsx anlegen**

```jsx
import { useMemo, useState, useRef } from "react";
import { baueNetz } from "./netzModell";
import { layoutNetz } from "./netzLayout";
import { VORAUSSETZUNGEN } from "../data/voraussetzungen";
import "./Netz.css";

const W = 680;
const H = 520;
const EBENE_LABEL = { 1: "Bereich", 2: "Unterthema", 3: "Lernweg" };
const STATUS_LABEL = { erledigt: "erledigt", aktuell: "aktuell", offen: "offen" };

export default function Netz({ fach, struktur, erledigt, onSelect }) {
  const [offeneSubs, setOffeneSubs] = useState(() => new Set());
  const [view, setView] = useState({ tx: 0, ty: 0, k: 1 });
  const [hover, setHover] = useState(null);
  const panRef = useRef(null);
  const [greift, setGreift] = useState(false);

  const { nodes, links } = useMemo(
    () => baueNetz(fach, struktur, erledigt, VORAUSSETZUNGEN[fach.id], offeneSubs),
    [fach, struktur, erledigt, offeneSubs]
  );
  const sig = nodes.map((n) => n.id).join("|");
  const pos = useMemo(() => layoutNetz(nodes, links, { width: W, height: H }), [sig]);

  const nachbarn = useMemo(() => {
    const map = {};
    nodes.forEach((n) => (map[n.id] = new Set()));
    links.forEach((l) => { map[l.from]?.add(l.to); map[l.to]?.add(l.from); });
    return map;
  }, [nodes, links]);

  function klick(n) {
    if (n.ebene === 2) {
      setOffeneSubs((prev) => {
        const next = new Set(prev);
        next.has(n.id) ? next.delete(n.id) : next.add(n.id);
        return next;
      });
    } else if (n.ebene === 3 && n.themaId) {
      onSelect?.(n.themaId);
    }
  }

  function onWheel(e) {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.1 : 0.9;
    setView((v) => ({ ...v, k: Math.max(0.5, Math.min(2.5, v.k * f)) }));
  }
  function onDown(e) {
    if (e.target.closest(".netz-knoten")) return;
    panRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    setGreift(true);
  }
  function onMove(e) {
    if (!panRef.current) return;
    setView((v) => ({ ...v, tx: panRef.current.tx + (e.clientX - panRef.current.x), ty: panRef.current.ty + (e.clientY - panRef.current.y) }));
  }
  function onUp() { panRef.current = null; setGreift(false); }

  const aktiv = hover;
  return (
    <div>
      <div className="netz-legende" aria-hidden="true">
        <span>Farbe = Bereich</span>
        <span><span className="netz-punkt" style={{ background: "#888780", opacity: 0.4 }} />offen</span>
        <span><span className="netz-punkt" style={{ background: "#888780" }} />erledigt</span>
        <span><span className="netz-punkt" style={{ background: "#888780", border: "2px solid var(--text,#1d1d1f)" }} />aktuell</span>
      </div>
      <div className="netz-flaeche">
        <svg
          className={"netz-svg" + (greift ? " greift" : "")}
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label={`Themen-Netz ${fach.fach}`}
          onWheel={onWheel}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          <defs>
            <marker id="netz-pfeil" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--text-2,#888780)" />
            </marker>
          </defs>
          <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
            {links.map((l, i) => {
              const a = pos[l.from], b = pos[l.to];
              if (!a || !b) return null;
              const na = nodes.find((n) => n.id === l.from);
              const nb = nodes.find((n) => n.id === l.to);
              const dx = b.x - a.x, dy = b.y - a.y;
              const d = Math.hypot(dx, dy) || 1;
              const ux = dx / d, uy = dy / d;
              const x1 = a.x + ux * ((na?.r || 10) + 2);
              const y1 = a.y + uy * ((na?.r || 10) + 2);
              const x2 = b.x - ux * ((nb?.r || 10) + (l.art === "baut" ? 8 : 2));
              const y2 = b.y - uy * ((nb?.r || 10) + (l.art === "baut" ? 8 : 2));
              const hervor = aktiv && (l.from === aktiv || l.to === aktiv);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={l.art === "baut" ? "var(--text-2,#888780)" : na?.color}
                  strokeWidth={l.art === "baut" ? 2.4 : 1.3}
                  strokeOpacity={hervor ? 0.9 : l.art === "baut" ? 0.6 : 0.3}
                  markerEnd={l.art === "baut" ? "url(#netz-pfeil)" : undefined} />
              );
            })}
            {nodes.map((n) => {
              const p = pos[n.id];
              if (!p) return null;
              const istAktiv = aktiv === n.id;
              const nachbar = aktiv && nachbarn[aktiv]?.has(n.id);
              const gedimmt = aktiv && !istAktiv && !nachbar;
              const voll = n.status === "erledigt" || n.status === "aktuell";
              return (
                <g key={n.id} className="netz-knoten" transform={`translate(${p.x},${p.y})`}
                  opacity={gedimmt ? 0.35 : 1}
                  role="button" tabIndex={0}
                  aria-label={`${n.label}, ${EBENE_LABEL[n.ebene]}, Status ${STATUS_LABEL[n.status]}`}
                  onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
                  onClick={() => klick(n)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); klick(n); } }}>
                  {n.status === "aktuell" && (
                    <circle className="netz-knoten-ring" r={n.r + 5} fill="none" stroke="var(--text,#1d1d1f)" strokeWidth="2.5" />
                  )}
                  <circle r={n.r} fill={n.color} fillOpacity={voll ? 1 : 0.4} stroke={n.color} strokeWidth="2" />
                  {n.status === "erledigt" && (
                    <path d="M -5 0 L -1.5 3.5 L 5 -4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  <text className={"netz-label" + (n.ebene === 1 ? " gross" : "")} y={n.r + 14} textAnchor="middle">
                    {n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + lint pruefen**

Run: `npm run lint` und `npm run build`
Expected: beide PASS. Falls ESLint den Pointer/Hover-State bemaengelt, betroffene Stelle mit gezieltem `// eslint-disable-next-line` versehen (kein pauschales Disable).

- [ ] **Step 4: Commit**

```bash
git add src/neu/Netz.jsx src/neu/Netz.css
git commit -F - <<'EOF'
Netz: SVG-Komponente fuer das Themen-Netz

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: Umschalter in der Ablage

**Files:**
- Modify: `src/neu/Ablage.jsx`

- [ ] **Step 1: Netz importieren**

Nach den bestehenden Importen (bei `import { FACH_STRUKTUR } from "../data/fachStruktur";`, Zeile 15) ergaenzen:

```jsx
import Netz from "./Netz";
```

- [ ] **Step 2: Ansichts-State ergaenzen**

Direkt nach `const [gewaehltId, setGewaehltId] = useState(null);` (Zeile 136) einfuegen:

```jsx
const [ansicht, setAnsicht] = useState("liste"); // liste | netz
```

- [ ] **Step 3: Umschalter und bedingte linke Spalte einbauen**

In der "Schritt 2"-Ansicht die linke Spalte ersetzen. Aktuell beginnt sie bei `<nav className="ab-liste" aria-label="Lernwege">` (Zeile 540). Den Umschalter davor setzen und die `<nav>` nur im Listen-Modus rendern, sonst das Netz. Konkret den Block von Zeile 540 (`<nav ...>`) bis zum schliessenden `</nav>` (Zeile 660) so umschliessen:

```jsx
<div className="ab-spalten" style={{ "--c": farbe }}>
  {FACH_STRUKTUR[fach.id] && (
    <div className="ab-ansicht-schalter" role="tablist" aria-label="Ansicht">
      <button type="button" role="tab" aria-selected={ansicht === "liste"}
        className={"ab-ansicht-chip" + (ansicht === "liste" ? " an" : "")}
        onClick={() => setAnsicht("liste")}>Liste</button>
      <button type="button" role="tab" aria-selected={ansicht === "netz"}
        className={"ab-ansicht-chip" + (ansicht === "netz" ? " an" : "")}
        onClick={() => setAnsicht("netz")}>Netz</button>
    </div>
  )}
  {ansicht === "netz" && FACH_STRUKTUR[fach.id] ? (
    <div className="ab-liste ab-netz-spalte">
      <Netz fach={fach} struktur={FACH_STRUKTUR[fach.id]} erledigt={erledigt}
        onSelect={(themaId) => setGewaehltId(themaId)} />
    </div>
  ) : (
    <nav className="ab-liste" aria-label="Lernwege">
      ... bestehender Inhalt der nav unveraendert ...
    </nav>
  )}
  <section className="ab-detail"> ... unveraendert ... </section>
</div>
```

Wichtig: Der `style={{ "--c": farbe }}`-Wrapper `ab-spalten` und die `ab-detail`-Section bleiben unveraendert; nur die linke Spalte wird umschaltbar. Der Umschalter erscheint nur, wenn `FACH_STRUKTUR[fach.id]` existiert (also nicht bei Latein/Griechisch).

- [ ] **Step 4: Styles fuer den Umschalter ergaenzen**

In `src/neu/Ablage.css` ans Ende anfuegen:

```css
.ab-ansicht-schalter { display: flex; gap: 6px; margin: 0 0 10px; }
.ab-ansicht-chip {
  border: 1px solid var(--rand, rgba(0,0,0,0.12));
  background: transparent; border-radius: 999px;
  padding: 4px 14px; font-size: 14px; cursor: pointer;
  color: var(--text-2, #6b6b6b);
}
.ab-ansicht-chip.an {
  background: var(--c, #4263eb); color: #fff; border-color: transparent;
}
.ab-netz-spalte { display: block; }
```

- [ ] **Step 5: Build + lint pruefen**

Run: `npm run lint` und `npm run build`
Expected: beide PASS.

- [ ] **Step 6: Im Browser pruefen**

preview_start (Name `dev`), dann manuell ueber preview_eval:
1. Zu Wissen/Ablage navigieren, ein Fach (z. B. Mathe) waehlen.
2. preview_snapshot: Umschalter `Liste | Netz` sichtbar, Default `Liste`.
3. Auf `Netz` klicken (preview_eval: Button mit Text "Netz" klicken).
4. preview_eval: `document.querySelectorAll('.netz-knoten').length` > 0; SVG sichtbar.
5. Eine Subkategorie anklicken -> Lernweg-Knoten erscheinen (Knotenzahl steigt).
6. Einen Lernweg-Knoten anklicken -> rechts erscheint `KbInhalt` (preview_eval: `.ki-landkarte` oder `.ab-detail-titel` zeigt den Lernweg).
7. Zurueck auf `Liste` -> die gewohnte Liste ist unveraendert.

Erwartung: alle Punkte erfuellt, keine Konsolenfehler (preview_console_logs leer von echten Errors).

- [ ] **Step 7: Commit**

```bash
git add src/neu/Ablage.jsx src/neu/Ablage.css
git commit -F - <<'EOF'
Netz: Umschalter Liste/Netz in der Ablage, Liste bleibt Default

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 6: Barrierefreiheit, Dark Mode, Abschluss

**Files:**
- Modify (bei Bedarf): `src/neu/Netz.jsx`, `src/neu/Netz.css`

- [ ] **Step 1: Dark Mode pruefen**

preview_eval: `document.documentElement.classList.add('dark')` (bzw. ueber die App-Einstellung Theme `dunkel`). Pruefen, dass Knotenfarben, Labels (Halo), Pfeile und der `aktuell`-Ring lesbar bleiben. Falls Label-Halo (`stroke: var(--flaeche)`) im Dark Mode nicht passt, Variablennamen an `index.css` angleichen.

- [ ] **Step 2: Tastatur + Screenreader pruefen**

preview_eval: erstes `.netz-knoten` fokussieren (`document.querySelector('.netz-knoten').focus()`), `getAttribute('aria-label')` enthaelt Titel + Ebene + Status. Mit Enter laesst sich ein Lernweg-Knoten oeffnen (KeyDown-Handler). Bestaetigen, dass die `Liste`-Ansicht weiterhin die vollstaendige, lineare Alternative ist.

- [ ] **Step 3: prefers-reduced-motion**

Da das Layout vorab gerechnet und eingefroren ist, gibt es keine Dauer-Animation. Sicherstellen, dass keine CSS-Transition Bewegung erzwingt; falls doch hinzugefuegt, in `Netz.css` mit `@media (prefers-reduced-motion: reduce) { * { transition: none; } }` im Komponenten-Scope abfangen.

- [ ] **Step 4: Voller Lauf lint + build**

Run: `npm run lint` und `npm run build`
Expected: beide PASS.

- [ ] **Step 5: Screenshot zur Bestaetigung**

preview_screenshot der Netz-Ansicht (Mathe), zum Abgleich mit dem Vorbild.

- [ ] **Step 6: Commit (falls Anpassungen)**

```bash
git add src/neu/Netz.jsx src/neu/Netz.css
git commit -F - <<'EOF'
Netz: Feinschliff Barrierefreiheit und Dark Mode

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
```

---

## Self-Review

**Spec-Abdeckung:**
- Form geclustertes Netz -> Task 4 (SVG), Task 3 (Layout). OK.
- Pro Fach -> `Netz` bekommt ein `fach`, baut nur dessen Knoten. OK.
- Zusatz-Ansicht, Liste bleibt Default -> Task 5 (Umschalter, Default `liste`). OK.
- Linien baut-auf grob + gehoert-zu -> Task 1 (Daten) + Task 2 (Kanten) + Task 4 (Render, Pfeil vs duenn). OK.
- Quelle generiert/geprueft -> Task 1 (kuratiert + `pruefeVoraussetzungen`). OK.
- Groesse = Ebene -> `RADIUS` in Task 2. OK.
- Farbe = Kategorie -> `KATEGORIE_PALETTE` in Task 2. OK.
- Lernstand = Fuellung + Ring + Haken, nicht nur Farbe -> Task 4. OK.
- Kein neues Paket -> alles reines React/SVG. OK.
- Barrierefreiheit (Liste als Alternative, Tastatur, aria) -> Task 5/6. OK.
- Faecher ohne Struktur kein Netz -> Umschalter nur bei `FACH_STRUKTUR[fach.id]` (Task 5). OK.
- Klick oeffnet Lernweg-Detail -> `onSelect` setzt `gewaehltId`, `ab-detail` rendert `KbInhalt` (Task 5). OK.
- Progressive Offenlegung -> `offeneSubs`, Klick auf Subkategorie (Task 2/4). OK.

**Platzhalter-Scan:** keine TBD/TODO; jeder Code-Schritt enthaelt vollstaendigen Code.

**Typ-Konsistenz:** `baueNetz(fach, struktur, erledigt, voraussetzungen, offeneSubs)` einheitlich verwendet; `layoutNetz(nodes, links, opt)` liefert `{id:{x,y}}`, in Netz so gelesen; Knoten-Felder (`id,label,ebene,kategorie,color,r,status,themaId`) konsistent zwischen Task 2 und Task 4; Kanten-Felder (`from,to,art`) konsistent.
