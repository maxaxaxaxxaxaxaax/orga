import { useEffect, useState } from "react";
import {
  koennensbeweise,
  kbFaecher,
  kbFarbe,
  etappeWochen,
  startZuordnung,
} from "../data/koennensbeweise";
import { etappen } from "../data/etappen";
import { meldeAenderung } from "./planung";
import "./Etappenplan.css";

// Etappe planen: links der Vorrat (Könnensbeweise je Fach als bunte Chips) plus
// die "Plane deine Etappe"-Karte, rechts die sechs Wochen als Drop-Ziele.
// Per Drag and Drop oder Tippen wandert ein KB aus seinem Fach in eine Woche.

const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];
const SPEICHER = "neu.etappenplan.zuordnung";
const ZIEL_SLOTS = 4; // gestrichelte Leer-Slots je Woche (nur Optik)

function zeitraum(e) {
  const opt = { day: "2-digit", month: "2-digit" };
  const von = new Date(e.von + "T00:00:00").toLocaleDateString("de-DE", opt);
  const bis = new Date(e.bis + "T00:00:00").toLocaleDateString("de-DE", opt);
  return `${von} - ${bis}`;
}

function wochenBereiche(e, anzahl) {
  const start = new Date(e.von + "T00:00:00");
  const out = [];
  for (let i = 0; i < anzahl; i++) {
    const von = new Date(start);
    von.setDate(start.getDate() + i * 7);
    const bis = new Date(von);
    bis.setDate(von.getDate() + 6);
    out.push({ nr: i + 1, von, bis });
  }
  return out;
}

function bereichText(von, bis) {
  const f = (d) =>
    d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  return `${f(von)} - ${f(bis)}`;
}

// Lesbare Textfarbe auf einer Vollton-Fachfarbe (hell -> dunkle Schrift).
function textAuf(hex) {
  const h = String(hex).replace("#", "");
  if (h.length < 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#23201a" : "#ffffff";
}

function lade() {
  try {
    const r = localStorage.getItem(SPEICHER);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}

export default function Etappenplan({ onWeiter }) {
  const [zuordnung, setZuordnung] = useState(lade); // kbId -> Wochen-Index
  const [ueber, setUeber] = useState(null); // Drop-Ziel ("w0".."w5" | "pool")
  const [gewaehltId, setGewaehltId] = useState(null); // angetippter Chip (Touch)
  const [hinweis, setHinweis] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [suche, setSuche] = useState("");
  const [zuFaecher, setZuFaecher] = useState(() => new Set()); // eingeklappte Fächer

  useEffect(() => {
    localStorage.setItem(SPEICHER, JSON.stringify(zuordnung));
    meldeAenderung();
  }, [zuordnung]);

  useEffect(() => {
    if (!hinweis) return undefined;
    const t = setTimeout(() => setHinweis(null), 2600);
    return () => clearTimeout(t);
  }, [hinweis]);

  // Sicherheitsnetz fürs Ziehen: Drag-Zustand immer zurücksetzen.
  useEffect(() => {
    const aufraeumen = () => setUeber(null);
    const aufEsc = (e) => e.key === "Escape" && aufraeumen();
    window.addEventListener("dragend", aufraeumen);
    window.addEventListener("keydown", aufEsc);
    return () => {
      window.removeEventListener("dragend", aufraeumen);
      window.removeEventListener("keydown", aufEsc);
    };
  }, []);

  const wochen = wochenBereiche(ETAPPE, etappeWochen);
  const q = suche.trim().toLowerCase();

  const proFach = kbFaecher
    .map((fach) => ({
      fach,
      farbe: kbFarbe[fach] || "#868e96",
      kbs: koennensbeweise.filter(
        (k) =>
          k.fach === fach &&
          zuordnung[k.id] == null &&
          (!q || k.titel.toLowerCase().includes(q))
      ),
    }))
    .filter((sp) => sp.kbs.length > 0);

  const proWoche = wochen.map((w, i) => ({
    ...w,
    idx: i,
    kbs: koennensbeweise.filter((k) => zuordnung[k.id] === i),
  }));

  const offen = koennensbeweise.filter((k) => zuordnung[k.id] == null).length;
  const alleZugeordnet = offen === 0;

  function onDragStart(e, id) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(e.currentTarget, 12, 12);
  }
  function dragEnde() {
    setUeber(null);
  }
  function setzeWoche(id, idx) {
    setZuordnung((z) => ({ ...z, [id]: idx }));
  }
  function waehle(id) {
    setGewaehltId((g) => (g === id ? null : id));
  }
  function tippZuWoche(idx) {
    if (gewaehltId == null) return;
    setzeWoche(gewaehltId, idx);
    setGewaehltId(null);
  }
  function zurueckInVorrat(id) {
    setZuordnung((z) => {
      const n = { ...z };
      delete n[id];
      return n;
    });
  }
  function toggleFach(fach) {
    setZuFaecher((s) => {
      const n = new Set(s);
      if (n.has(fach)) n.delete(fach);
      else n.add(fach);
      return n;
    });
  }

  function vorschlagVerteilung() {
    const summen = Array(etappeWochen).fill(0);
    const z = { ...zuordnung };
    for (const [id, w] of Object.entries(startZuordnung)) {
      if (z[id] == null) z[id] = w;
    }
    for (const k of koennensbeweise) {
      if (z[k.id] != null) summen[z[k.id]] += k.cluster;
    }
    const rest = koennensbeweise
      .filter((k) => z[k.id] == null)
      .slice()
      .sort((a, b) => b.cluster - a.cluster);
    for (const kb of rest) {
      let best = 0;
      for (let i = 1; i < etappeWochen; i++) {
        if (summen[i] < summen[best]) best = i;
      }
      z[kb.id] = best;
      summen[best] += kb.cluster;
    }
    setZuordnung(z);
    setHinweis("Ausgewogen verteilt: leichteste Woche zuerst. Du kannst frei anpassen.");
  }

  function planZuruecksetzen() {
    setZuordnung({});
    setGewaehltId(null);
    setResetConfirm(false);
    setHinweis("Plan zurückgesetzt. Verteile deine Ziele neu.");
  }

  // Ein bunter KB-Chip (Vollton in Fachfarbe), ziehbar und antippbar.
  function chip(k, platziert) {
    const farbe = kbFarbe[k.fach] || "#868e96";
    return (
      <button
        key={k.id}
        type="button"
        className={"ep-kb" + (gewaehltId === k.id ? " gewaehlt" : "")}
        style={{ "--c": farbe, "--kbt": textAuf(farbe) }}
        draggable
        onDragStart={(e) => onDragStart(e, k.id)}
        onDragEnd={dragEnde}
        onClick={(e) => {
          e.stopPropagation();
          if (platziert) zurueckInVorrat(k.id);
          else waehle(k.id);
        }}
        title={
          platziert
            ? `${k.titel} · antippen, um zurückzulegen`
            : `${k.titel} · antippen, dann eine Woche wählen`
        }
      >
        <span className="ep-kb-titel">{k.titel}</span>
        <span className="ep-kb-meta">
          <span className="ep-kb-uhr" aria-hidden="true">
            ◷
          </span>
          {k.cluster}
          {k.code && <span className="ep-kb-code">{k.code}</span>}
        </span>
      </button>
    );
  }

  return (
    <div
      className="ep-screen"
      onClick={() => gewaehltId != null && setGewaehltId(null)}
    >
      {/* Werkzeugzeile: Suche (Vorrat-Breite) + Für mich vorschlagen */}
      <div className="ep-top">
        <div className="ep-suche">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Suche"
            aria-label="Könnensbeweise durchsuchen"
          />
        </div>
        <button
          type="button"
          className="ep-vorschlag-knopf"
          onClick={vorschlagVerteilung}
          title="Die noch offenen Ziele ausgewogen auf die Wochen verteilen"
        >
          <span aria-hidden="true">✦</span> Für mich vorschlagen
        </button>
      </div>

      <div className="ep-layout">
        {/* Linke Spalte: Vorrat */}
        <aside
          className={"ep-vorrat" + (ueber === "pool" ? " ueber" : "")}
          onDragOver={(e) => {
            e.preventDefault();
            setUeber("pool");
          }}
          onDragLeave={() => setUeber((u) => (u === "pool" ? null : u))}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            setUeber(null);
            if (id) setTimeout(() => zurueckInVorrat(id), 0);
          }}
        >
          <div className="ep-kopf-karte">
            <h1 className="ep-kopf-titel">
              <span className="ep-kopf-icon" aria-hidden="true">
                🗓
              </span>
              Plane deine Etappe
            </h1>
            <p className="ep-kopf-meta">
              {zeitraum(ETAPPE)} · {koennensbeweise.length} Könnensbeweise
            </p>
            <p className="ep-kopf-text">
              Ziehe die Könnensbeweise in die jeweiligen Wochen.
            </p>
            <div className="ep-kopf-aktionen">
              <span
                className={"ep-fortschritt" + (alleZugeordnet ? " fertig" : "")}
              >
                {alleZugeordnet ? "Alle verteilt ✓" : `noch ${offen} offen`}
              </span>
              {resetConfirm ? (
                <span className="ep-reset-confirm">
                  <button
                    type="button"
                    className="ep-reset-ja"
                    onClick={planZuruecksetzen}
                  >
                    Ja, neu
                  </button>
                  <button
                    type="button"
                    className="ep-reset-nein"
                    onClick={() => setResetConfirm(false)}
                  >
                    Abbrechen
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="ep-reset"
                  onClick={() => setResetConfirm(true)}
                  disabled={offen === koennensbeweise.length}
                >
                  Zurücksetzen
                </button>
              )}
              <button
                type="button"
                className="ep-weiter"
                onClick={onWeiter}
                disabled={!alleZugeordnet}
                title={
                  alleZugeordnet
                    ? "Weiter zur Wochenplanung"
                    : "Erst alle Könnensbeweise in Wochen ziehen"
                }
              >
                Weiter →
              </button>
            </div>
          </div>

          <div className="ep-vorrat-liste">
            {proFach.length === 0 ? (
              <p className="ep-vorrat-leer">
                {q ? "Nichts gefunden." : "Alle Könnensbeweise verteilt."}
              </p>
            ) : (
              proFach.map((sp) => {
                const zu = zuFaecher.has(sp.fach);
                return (
                  <section
                    className="ep-fachgruppe"
                    key={sp.fach}
                    style={{ "--c": sp.farbe }}
                  >
                    <button
                      type="button"
                      className="ep-fachgruppe-kopf"
                      onClick={() => toggleFach(sp.fach)}
                      aria-expanded={!zu}
                    >
                      <span className="ep-fachgruppe-name">{sp.fach}</span>
                      <span className="ep-fachgruppe-zahl">{sp.kbs.length}</span>
                      <span className="ep-fachgruppe-pfeil" aria-hidden="true">
                        {zu ? "▸" : "▾"}
                      </span>
                    </button>
                    {!zu && (
                      <div className="ep-fachgruppe-chips">
                        {sp.kbs.map((k) => chip(k, false))}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>
        </aside>

        {/* Rechte Spalte: sechs Wochen-Karten */}
        <div className="ep-wochen-grid">
          {proWoche.map((w) => {
            const leer = Math.max(0, ZIEL_SLOTS - w.kbs.length);
            return (
              <section
                className={
                  "ep-woche" +
                  (ueber === "w" + w.idx ? " ueber" : "") +
                  (gewaehltId != null ? " tippbar" : "")
                }
                key={w.nr}
                onDragOver={(e) => {
                  e.preventDefault();
                  setUeber("w" + w.idx);
                }}
                onDragLeave={() => setUeber((u) => (u === "w" + w.idx ? null : u))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  setUeber(null);
                  if (id) setTimeout(() => setzeWoche(id, w.idx), 0);
                }}
                onClick={() => tippZuWoche(w.idx)}
              >
                <header className="ep-woche-kopf">
                  <span className="ep-woche-nr">Woche {w.nr}</span>
                  <span className="ep-woche-datum">
                    {bereichText(w.von, w.bis)}
                  </span>
                </header>
                <div className="ep-woche-slots">
                  {w.kbs.map((k) => chip(k, true))}
                  {Array.from({ length: leer }).map((_, i) => (
                    <span className="ep-slot-leer" key={"l" + i} aria-hidden="true" />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {hinweis && (
        <div className="ep-hinweis" role="status" aria-live="polite" aria-atomic="true">
          {hinweis}
        </div>
      )}
    </div>
  );
}
