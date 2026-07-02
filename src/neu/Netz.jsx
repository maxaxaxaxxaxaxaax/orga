import { useMemo, useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import { baueFaecherNetz } from "./netzModell";
import "./Netz.css";

const EBENE_LABEL = { 0: "Fach", 1: "Kompetenzbereich", 2: "Inhaltsbereich", 3: "Lernweg" };
const STATUS_LABEL = { erledigt: "erledigt", aktuell: "aktuell", offen: "offen" };
const NEUTRAL = "#868e96";

// Die drei Lernstand-Spalten (links nach rechts = Fortschritt, monoton). Status ->
// Spalte. "Dran" sitzt mittig als Blickfang; Prominenz über Gewicht, nicht Umordnung.
const SPALTEN = [
  { status: "offen", titel: "Noch offen", leer: "nichts offen", punkt: "var(--muted)" },
  { status: "aktuell", titel: "Dran", leer: "nichts gerade dran", punkt: "var(--text)" },
  { status: "erledigt", titel: "Geschafft", leer: "noch nichts geschafft", punkt: "var(--ok-text)" },
];
// Geometrie des Fortschritts-Boards: Anker links als Ausgangspunkt, rechts daneben
// drei gleich breite Spalten über die Fläche.
function boardGeometrie(W, H, hatAnker) {
  const left = hatAnker ? W * 0.17 : W * 0.04;
  const right = W * 0.98;
  const zoneW = (right - left) / 3;
  return { left, right, zoneW, padTop: 52, padBot: 30,
    zoneX: (i) => left + i * zoneW, mitteX: (i) => left + (i + 0.5) * zoneW };
}

// Fortschritts-Board: jeder Bereich liegt sichtbar in der Spalte seines Lernstands
// (Noch offen / Dran / Geschafft, links nach rechts). Das ist die Bedeutung der
// Position, unmissverständlich wie ein To-do-Board. Beantwortet "Wo stehe ich".
function layoutFortschritt(sichtbar, anchorId, W, H) {
  const pos = {};
  const kinder = anchorId ? sichtbar.filter((n) => n.id !== anchorId) : sichtbar;
  if (!anchorId) {
    // Wurzel: 4 Fächer in einer Reihe (Fortschritt wird erst IM Fach zur Aussage).
    const n = kinder.length || 1;
    kinder.forEach((node, i) => (pos[node.id] = { x: W * ((i + 0.5) / n), y: H / 2 }));
    return pos;
  }
  const G = boardGeometrie(W, H, true);
  pos[anchorId] = { x: W * 0.065, y: H / 2 };
  SPALTEN.forEach((sp, si) => {
    const col = kinder.filter((n) => n.status === sp.status);
    const n = col.length;
    if (!n) return;
    const cx = G.mitteX(si);
    const subCols = Math.max(1, Math.ceil(n / 8));
    const perCol = Math.ceil(n / subCols);
    const subGap = G.zoneW / (subCols + 1);
    col.forEach((node, i) => {
      const sc = Math.floor(i / perCol), row = i % perCol;
      const x = cx + (sc - (subCols - 1) / 2) * subGap;
      const y = G.padTop + (H - G.padTop - G.padBot) * ((row + 0.5) / perCol);
      pos[node.id] = { x, y };
    });
  });
  return pos;
}

// Fachübergreifende Wissens-Landkarte als Drilldown: Start = die 4 Fächer. Klick auf
// eine Bubble öffnet eine Ebene tiefer und zeigt NUR deren Kinder (Fach →
// Kompetenzbereich → Inhaltsbereich → Lernweg). Klick auf die zentrale Bubble springt
// eine Ebene hoch. Die Kamera fliegt beim Wechsel weich (kein harter Sprung). Es gibt
// keine "baut auf"-Pfeile: die einzige wahrheitsgetreue Beziehung ist die Zugehörig-
// keit (Inhalt gehört zu Kompetenzbereich), siehe netzModell.js / voraussetzungen.js.
export default function Netz({ erledigt, onSelect }) {
  const [view, setView] = useState({ tx: 0, ty: 0, k: 1 });
  const [hover, setHover] = useState(null);
  const [pfad, setPfad] = useState(null); // fokussierter Knoten (null = Wurzel/Fächer)
  const panRef = useRef(null);
  const [greift, setGreift] = useState(false);
  const animRef = useRef(0);

  const flaecheRef = useRef(null);
  const [mass, setMass] = useState({ w: 680, h: 520 });
  const W = mass.w;
  const H = mass.h;
  useEffect(() => {
    const el = flaecheRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const messen = () => {
      const w = Math.round(el.clientWidth) || 680;
      const h = Math.round(el.clientHeight) || 520;
      setMass((m) => (m.w === w && m.h === h ? m : { w, h }));
    };
    messen();
    const ro = new ResizeObserver(messen);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { nodes, links } = useMemo(() => baueFaecherNetz(erledigt), [erledigt]);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const wurzeln = useMemo(() => nodes.filter((n) => n.ebene === 0), [nodes]);

  // Sichtbar: die Wurzel-Fächer, oder die fokussierte Bubble + ihre Kinder.
  const sichtbar = useMemo(() => {
    if (!pfad) return wurzeln;
    return [pfad, ...nodes.filter((n) => n.parent === pfad.id)];
  }, [pfad, nodes, wurzeln]);
  const pos = useMemo(
    () => layoutFortschritt(sichtbar, pfad?.id || null, W, H),
    [sichtbar, pfad, W, H]
  );
  // Board-Geometrie (nur im Drilldown): drei Lernstand-Spalten als Hintergrund.
  const board = pfad ? boardGeometrie(W, H, true) : null;
  const nachbarn = useMemo(() => {
    const map = {};
    sichtbar.forEach((n) => (map[n.id] = new Set()));
    links.forEach((l) => {
      if (map[l.from] && map[l.to]) {
        map[l.from].add(l.to);
        map[l.to].add(l.from);
      }
    });
    return map;
  }, [sichtbar, links]);

  // Breadcrumb-Kette aus der Eltern-Reihe des Fokus.
  const kette = useMemo(() => {
    const arr = [];
    let n = pfad;
    while (n) {
      arr.unshift(n);
      n = n.parent ? nodeById.get(n.parent) : null;
    }
    return arr;
  }, [pfad, nodeById]);

  // ---- Kamera-Animation -----------------------------------------------------
  function tween(von, bis, dauer, onDone) {
    cancelAnimationFrame(animRef.current);
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / dauer);
      const e = 1 - Math.pow(1 - t, 3);
      setView({
        tx: von.tx + (bis.tx - von.tx) * e,
        ty: von.ty + (bis.ty - von.ty) * e,
        k: von.k + (bis.k - von.k) * e,
      });
      if (t < 1) animRef.current = requestAnimationFrame(step);
      else if (onDone) onDone();
    };
    animRef.current = requestAnimationFrame(step);
  }
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);
  const zentriert = (k) => ({ tx: (W / 2) * (1 - k), ty: (H / 2) * (1 - k), k });

  // Ebene wechseln: neue Ebene aus startK weich auf Normalsicht ausklingen lassen.
  function wechsel(neuPfad, startK) {
    setPfad(neuPfad);
    setHover(null);
    tween(zentriert(startK), { tx: 0, ty: 0, k: 1 }, 280);
  }
  // Reinzoomen: erst in die geklickte Bubble fliegen, dann öffnet sie sich.
  function drill(child) {
    const p = pos[child.id];
    if (!p) {
      wechsel(child, 1.12);
      return;
    }
    const K = 2.4;
    tween(view, { tx: W / 2 - K * p.x, ty: H / 2 - K * p.y, k: K }, 300, () =>
      wechsel(child, K)
    );
  }
  function hoch() {
    if (!pfad) return;
    wechsel(pfad.parent ? nodeById.get(pfad.parent) || null : null, 0.82);
  }
  function springeZu(node) {
    wechsel(node, node && pfad && istVorfahr(node, pfad) ? 0.82 : 1.12);
  }
  function istVorfahr(moeglich, von) {
    let n = von.parent ? nodeById.get(von.parent) : null;
    while (n) {
      if (n.id === moeglich.id) return true;
      n = n.parent ? nodeById.get(n.parent) : null;
    }
    return false;
  }

  function klick(n) {
    if (pfad && n.id === pfad.id) {
      hoch();
      return;
    }
    if (n.aktion === "lernweg") {
      onSelect?.(n);
      return;
    }
    drill(n);
  }

  // ---- Eingaben (Pan/Zoom zum Erkunden innerhalb einer Ebene) ---------------
  function onWheel(e) {
    e.preventDefault();
    cancelAnimationFrame(animRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const cxp = ((e.clientX - rect.left) / rect.width) * W;
    const cyp = ((e.clientY - rect.top) / rect.height) * H;
    setView((v) => {
      const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const k2 = Math.max(0.6, Math.min(3, v.k * f));
      const mx = (cxp - v.tx) / v.k;
      const my = (cyp - v.ty) / v.k;
      return { k: k2, tx: cxp - mx * k2, ty: cyp - my * k2 };
    });
  }
  function onDown(e) {
    if (e.target.closest(".netz-knoten")) return;
    cancelAnimationFrame(animRef.current);
    panRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    setGreift(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onMove(e) {
    const pan = panRef.current;
    if (!pan) return;
    const dx = e.clientX - pan.x;
    const dy = e.clientY - pan.y;
    setView((v) => ({ ...v, tx: pan.tx + dx, ty: pan.ty + dy }));
  }
  function onUp() {
    panRef.current = null;
    setGreift(false);
  }

  const aktiv = hover;
  const fokusFarbe = pfad?.color || NEUTRAL;
  const aktuellStil = {
    background: `color-mix(in srgb, ${fokusFarbe} 14%, var(--card))`,
    color: fokusFarbe,
  };
  const ebeneKey = pfad?.id || "wurzel";

  return (
    <div className="netz">
      <div className="netz-flaeche" ref={flaecheRef}>
        <nav className="netz-brotkrumen" aria-label="Netz">
          <span
            className="netz-krume-punkt"
            style={{ background: fokusFarbe }}
            aria-hidden="true"
          />
          <button
            type="button"
            className={"netz-krume" + (!pfad ? " aktuell" : "")}
            style={!pfad ? aktuellStil : undefined}
            onClick={() => wechsel(null, 0.82)}
            title="Alle Fächer zeigen"
            disabled={!pfad}
          >
            Übersicht
          </button>
          {kette.map((node, i) => {
            const aktuell = i === kette.length - 1;
            return (
              <span key={node.id} style={{ display: "contents" }}>
                <span className="netz-krume-sep" aria-hidden="true">
                  <Icon name="chevron-right" size={13} />
                </span>
                {aktuell ? (
                  <span className="netz-krume aktuell" style={aktuellStil}>
                    {node.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="netz-krume"
                    onClick={() => springeZu(node)}
                  >
                    {node.label}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
        <svg
          className={"netz-svg" + (greift ? " greift" : "")}
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label="Wissens-Netz aller Fächer"
          onWheel={onWheel}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
            <g className="netz-ebene" key={ebeneKey}>
              {board &&
                SPALTEN.map((sp, si) => {
                  const x = board.zoneX(si) + 4;
                  const w = board.zoneW - 8;
                  const istDran = si === 1;
                  const anzahl = sichtbar.filter(
                    (n) => n.id !== pfad?.id && n.status === sp.status
                  ).length;
                  const top = board.padTop - 30;
                  const kx = x + 14, ky = board.padTop - 15;
                  const badgeB = 15 + String(anzahl).length * 8;
                  return (
                    <g key={sp.status} className="netz-zone" aria-hidden="true">
                      <rect
                        x={x}
                        y={top}
                        width={w}
                        height={H - board.padTop - board.padBot + 30}
                        rx="14"
                        fill={
                          istDran
                            ? "color-mix(in srgb, var(--text) 4%, var(--card-2))"
                            : "var(--card-2)"
                        }
                        stroke={istDran ? "var(--line-strong)" : "var(--line)"}
                        strokeWidth="1"
                      />
                      <circle cx={kx + 4} cy={ky - 4} r="4.5" fill={sp.punkt} />
                      <text
                        className={"netz-zone-titel" + (istDran ? " dran" : "")}
                        x={kx + 15}
                        y={ky}
                        textAnchor="start"
                      >
                        {sp.titel}
                      </text>
                      <rect
                        x={x + w - 14 - badgeB}
                        y={ky - 13}
                        width={badgeB}
                        height="17"
                        rx="8.5"
                        fill="var(--card)"
                        stroke="var(--line)"
                        strokeWidth="1"
                      />
                      <text
                        className="netz-zone-zahl"
                        x={x + w - 14 - badgeB / 2}
                        y={ky - 1}
                        textAnchor="middle"
                      >
                        {anzahl}
                      </text>
                      {anzahl === 0 && (
                        <text
                          className="netz-zone-leer"
                          x={x + w / 2}
                          y={(top + H - board.padBot) / 2}
                          textAnchor="middle"
                        >
                          {sp.leer}
                        </text>
                      )}
                    </g>
                  );
                })}
              {sichtbar.map((n) => {
                const p = pos[n.id];
                if (!p) return null;
                const istAktiv = aktiv === n.id;
                const nachbar = aktiv && nachbarn[aktiv]?.has(n.id);
                const op = aktiv && !istAktiv && !nachbar ? 0.4 : 1;
                const istAnchor = pfad && n.id === pfad.id;
                const fuell =
                  n.status === "erledigt"
                    ? n.color
                    : n.status === "aktuell"
                      ? `color-mix(in srgb, ${n.color} 58%, var(--card))`
                      : `color-mix(in srgb, ${n.color} 24%, var(--card))`;
                return (
                  <g
                    key={n.id}
                    className="netz-knoten"
                    transform={`translate(${p.x},${p.y})`}
                    opacity={op}
                    role="button"
                    tabIndex={0}
                    aria-label={
                      (istAnchor ? "Zurück: " : "") +
                      `${n.label}, ${EBENE_LABEL[n.ebene]}, Status ${STATUS_LABEL[n.status]}`
                    }
                    onMouseEnter={() => setHover(n.id)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => klick(n)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        klick(n);
                      }
                    }}
                  >
                    {istAnchor && (
                      <circle
                        r={n.r + 8}
                        fill="none"
                        stroke={n.color}
                        strokeWidth="1.5"
                        strokeDasharray="3 4"
                        opacity="0.7"
                      />
                    )}
                    {n.status === "aktuell" && (
                      <circle
                        className="netz-knoten-ring"
                        r={n.r + 5}
                        fill="none"
                        stroke="var(--text)"
                        strokeWidth="2.5"
                      />
                    )}
                    <circle r={n.r} fill={fuell} stroke={n.color} strokeWidth="2" />
                    {n.status === "erledigt" && (
                      <path
                        d="M -5 0 L -1.5 3.5 L 5 -4"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    <text
                      className={"netz-label" + (n.ebene <= 1 ? " gross" : "")}
                      y={n.r + 14}
                      textAnchor="middle"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
        {!board && (
          <div className="netz-legende" aria-hidden="true">
            <span>
              <span
                className="netz-punkt"
                style={{ background: `color-mix(in srgb, ${NEUTRAL} 24%, var(--card))` }}
              />
              offen
            </span>
            <span>
              <span
                className="netz-punkt"
                style={{
                  background: `color-mix(in srgb, ${NEUTRAL} 58%, var(--card))`,
                  border: "2px solid var(--text)",
                }}
              />
              aktuell
            </span>
            <span>
              <span className="netz-punkt" style={{ background: NEUTRAL }} />
              erledigt
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
