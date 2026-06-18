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
  // pfad bestimmt die sichtbare Ebene: {kategorie:null} = Kategorien,
  // {kategorie} = deren Subkategorien, {kategorie, sub} = deren Lernwege.
  const [pfad, setPfad] = useState({ kategorie: null, sub: null });
  const [view, setView] = useState({ tx: 0, ty: 0, k: 1 });
  const [hover, setHover] = useState(null);
  const panRef = useRef(null);
  const [greift, setGreift] = useState(false);

  // Eine Ebene wechseln und dabei Pan/Zoom zuruecksetzen, damit jede Ebene
  // zentriert startet.
  function gehe(naechster) {
    setPfad(naechster);
    setView({ tx: 0, ty: 0, k: 1 });
    setHover(null);
  }

  const { nodes, links } = useMemo(
    () => baueNetz(fach, struktur, erledigt, VORAUSSETZUNGEN[fach.id], pfad),
    [fach, struktur, erledigt, pfad]
  );
  const sig = nodes.map((n) => n.id).join("|");
  const zentrumId = nodes.find((n) => n.zentrum)?.id;
  // Layout nur neu rechnen, wenn sich die Knotenmenge aendert (eingefroren =
  // keine Dauer-Animation). sig kapselt die relevante Abhaengigkeit; zentrumId
  // ist aus nodes abgeleitet und damit ueber sig miterfasst.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pos = useMemo(() => layoutNetz(nodes, links, { width: W, height: H, zentrumId }), [sig]);

  const nachbarn = useMemo(() => {
    const map = {};
    nodes.forEach((n) => (map[n.id] = new Set()));
    links.forEach((l) => {
      map[l.from]?.add(l.to);
      map[l.to]?.add(l.from);
    });
    return map;
  }, [nodes, links]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  function klick(n) {
    if (n.aktion === "drillKat") gehe({ kategorie: n.kategorie, sub: null });
    else if (n.aktion === "drillSub") gehe({ kategorie: n.kategorie, sub: n.sub });
    else if (n.aktion === "hoch")
      gehe(n.ebene === 2 ? { kategorie: n.kategorie, sub: null } : { kategorie: null, sub: null });
    else if (n.aktion === "lernweg" && n.themaId) onSelect?.(n.themaId);
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
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onMove(e) {
    const pan = panRef.current;
    if (!pan) return;
    // Werte jetzt festhalten: der Updater laeuft spaeter, dann kann panRef
    // (nach pointerup) schon null sein.
    const dx = e.clientX - pan.x;
    const dy = e.clientY - pan.y;
    setView((v) => ({ ...v, tx: pan.tx + dx, ty: pan.ty + dy }));
  }
  function onUp() {
    panRef.current = null;
    setGreift(false);
  }

  const aktiv = hover;
  return (
    <div>
      <nav className="netz-brotkrumen" aria-label="Ebene">
        <button
          type="button"
          className="netz-krume"
          onClick={() => gehe({ kategorie: null, sub: null })}
          disabled={!pfad.kategorie}
        >
          {fach.fach}
        </button>
        {pfad.kategorie && (
          <>
            <span className="netz-krume-sep" aria-hidden="true">›</span>
            <button
              type="button"
              className="netz-krume"
              onClick={() => gehe({ kategorie: pfad.kategorie, sub: null })}
              disabled={!pfad.sub}
            >
              {pfad.kategorie}
            </button>
          </>
        )}
        {pfad.sub && (
          <>
            <span className="netz-krume-sep" aria-hidden="true">›</span>
            <span className="netz-krume aktuell">{pfad.sub}</span>
          </>
        )}
      </nav>
      <div className="netz-legende" aria-hidden="true">
        <span>Farbe = Bereich</span>
        <span>
          <span className="netz-punkt" style={{ background: "#888780", opacity: 0.4 }} />
          offen
        </span>
        <span>
          <span className="netz-punkt" style={{ background: "#888780" }} />
          erledigt
        </span>
        <span>
          <span
            className="netz-punkt"
            style={{ background: "#888780", border: "2px solid var(--text,#1d1d1f)" }}
          />
          aktuell
        </span>
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
            {links.map((l) => {
              const a = pos[l.from],
                b = pos[l.to];
              if (!a || !b) return null;
              const na = nodeById.get(l.from);
              const nb = nodeById.get(l.to);
              const dx = b.x - a.x,
                dy = b.y - a.y;
              const d = Math.hypot(dx, dy) || 1;
              const ux = dx / d,
                uy = dy / d;
              const x1 = a.x + ux * ((na?.r || 10) + 2);
              const y1 = a.y + uy * ((na?.r || 10) + 2);
              const x2 = b.x - ux * ((nb?.r || 10) + (l.art === "baut" ? 8 : 2));
              const y2 = b.y - uy * ((nb?.r || 10) + (l.art === "baut" ? 8 : 2));
              const hervor = aktiv && (l.from === aktiv || l.to === aktiv);
              return (
                <line
                  key={l.art + ":" + l.from + "->" + l.to}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={l.art === "baut" ? "var(--text-2,#888780)" : na?.color}
                  strokeWidth={l.art === "baut" ? 2.4 : 1.3}
                  strokeOpacity={hervor ? 0.9 : l.art === "baut" ? 0.6 : 0.3}
                  markerEnd={l.art === "baut" ? "url(#netz-pfeil)" : undefined}
                />
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
                <g
                  key={n.id}
                  className="netz-knoten"
                  transform={`translate(${p.x},${p.y})`}
                  opacity={gedimmt ? 0.35 : 1}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.label}, ${EBENE_LABEL[n.ebene]}, Status ${STATUS_LABEL[n.status]}`}
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
                  <circle
                    className="netz-knoten-fokus"
                    r={n.r + 5}
                    fill="none"
                    stroke="var(--text,#1d1d1f)"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    opacity="0"
                  />
                  {n.status === "aktuell" && (
                    <circle
                      className="netz-knoten-ring"
                      r={n.r + 5}
                      fill="none"
                      stroke="var(--text,#1d1d1f)"
                      strokeWidth="2.5"
                    />
                  )}
                  <circle
                    r={n.r}
                    fill={n.color}
                    fillOpacity={voll ? 1 : 0.4}
                    stroke={n.color}
                    strokeWidth="2"
                  />
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
                    className={"netz-label" + (n.ebene === 1 ? " gross" : "")}
                    y={n.r + 14}
                    textAnchor="middle"
                  >
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
