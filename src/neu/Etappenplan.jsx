import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  koennensbeweise,
  kbFaecher,
  kbFarbe,
  etappeWochen,
  startZuordnung,
} from "../data/koennensbeweise";
import { etappen } from "../data/etappen";
import { meldeAenderung } from "./planung";
import { textAuf, NEUTRAL_FARBE } from "./farbe";
import Icon from "./Icon";
import "./Etappenplan.css";

// Etappe planen: links der Vorrat (Könnensbeweise je Fach als bunte Chips) plus
// die "Plane deine Etappe"-Karte, rechts die sechs Wochen als Drop-Ziele.
// Per Drag and Drop oder Tippen wandert ein KB aus seinem Fach in eine Woche.

const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];
const SPEICHER = "neu.etappenplan.zuordnung";
const ZIEL_SLOTS = 3; // gestrichelte Leer-Slots je Woche (nur Optik)

function zeitraum(e) {
  // Langes Format wie im Wochenplan-Kopf (langDatum), damit beide Planer den
  // Etappen-Zeitraum gleich schreiben. Wochen-Karten bleiben kompakt (bereichText).
  const opt = { day: "numeric", month: "long" };
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

function lade() {
  try {
    const r = localStorage.getItem(SPEICHER);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}

export default function Etappenplan({ onWeiter, onZurueck, untenSlot, vorn }) {
  const [zuordnung, setZuordnung] = useState(lade); // kbId -> Wochen-Index
  const [ueber, setUeber] = useState(null); // Drop-Ziel ("w0".."w5" | "pool")
  const [gewaehltId, setGewaehltId] = useState(null); // angetippter Chip (Touch)
  const [hinweis, setHinweis] = useState(null);
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

  // Alle Fächer bleiben als Überschriften stehen (auch wenn alles verteilt ist),
  // wie im Mockup. Leere Fächer zeigen nur den Kopf.
  const proFach = kbFaecher.map((fach) => ({
    fach,
    farbe: kbFarbe[fach] || NEUTRAL_FARBE,
    kbs: koennensbeweise.filter(
      (k) => k.fach === fach && zuordnung[k.id] == null
    ),
  }));

  const proWoche = wochen.map((w, i) => ({
    ...w,
    idx: i,
    kbs: koennensbeweise.filter((k) => zuordnung[k.id] === i),
  }));

  const offen = koennensbeweise.filter((k) => zuordnung[k.id] == null).length;
  const alleZugeordnet = offen === 0;
  // Ist schon etwas verteilt? Dann bietet die Leiste "Neu planen" an (neu und
  // ausgewogen verteilen), wie beim ersten Planen, sobald etwas steht.
  const hatPlan = offen < koennensbeweise.length;

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

  // Neu planen: alles verwerfen und frisch ausgewogen verteilen (Pflicht-/
  // Startzuordnung bleibt). Wie beim ersten Planen, nur eben noch einmal.
  function umplanen() {
    const summen = Array(etappeWochen).fill(0);
    const z = {};
    for (const [id, w] of Object.entries(startZuordnung)) {
      z[id] = w;
      summen[w] += koennensbeweise.find((k) => k.id === id)?.cluster || 0;
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
    setHinweis("Etappe neu verteilt: leichteste Woche zuerst. Du kannst frei anpassen.");
  }

  // Ein bunter KB-Chip (Vollton in Fachfarbe), ziehbar und antippbar.
  function chip(k, platziert) {
    const farbe = kbFarbe[k.fach] || NEUTRAL_FARBE;
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
        </span>
      </button>
    );
  }

  // Untere Leiste: führt durch den Schritt. Ist alles verteilt, fällt der Hinweis
  // weg und es erscheint "Weiter" (wie im Mockup).
  const untenLeiste = (
    <div className="ep-bar">
      {onZurueck && (
        <button
          type="button"
          className="ep-bar-zurueck"
          onClick={onZurueck}
          aria-label="Zurück"
          title="Zurück"
        >
          <Icon name="chevron-left" width={20} height={20} />
        </button>
      )}
      {onZurueck && <span className="ep-bar-sep" aria-hidden="true" />}
      <span className="ep-bar-label">
        <Icon name="etappe" size={16} /> Etappenplanung
      </span>
      {!hatPlan ? (
        <>
          <span className="ep-bar-text">
            Ziehe die Lernwege in die jeweiligen Wochen
          </span>
          <button
            type="button"
            className="ep-bar-aktion"
            onClick={vorschlagVerteilung}
            title="Die noch offenen Ziele ausgewogen auf die Wochen verteilen"
          >
            <span aria-hidden="true">✦</span> Automatisch einsortieren
          </button>
        </>
      ) : (
        <>
          {alleZugeordnet ? (
            <button type="button" className="ep-bar-weiter" onClick={onWeiter}>
              Weiter
            </button>
          ) : (
            <button
              type="button"
              className="ep-bar-aktion"
              onClick={vorschlagVerteilung}
              title="Die noch offenen Ziele ausgewogen auf die Wochen verteilen"
            >
              <span aria-hidden="true">✦</span> Automatisch einsortieren
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <div
      className="ep-screen"
      onClick={() => gewaehltId != null && setGewaehltId(null)}
    >
      <div className={"ep-layout" + (alleZugeordnet ? " ep-fertig" : "")}>
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
            <div className="ep-kopf-text">
              <h1 className="ep-kopf-titel">
                <Icon name="etappe" className="ep-kopf-icon" size={19} />
                Plane deine Etappe
              </h1>
              <p className="ep-kopf-meta">
                {zeitraum(ETAPPE)} · {koennensbeweise.length} Könnensbeweise
              </p>
            </div>
            {hatPlan && (
              <button
                type="button"
                className="ep-kopf-neu"
                onClick={umplanen}
                title="Neu planen: alles neu und ausgewogen verteilen"
                aria-label="Neu planen"
              >
                <Icon name="marker" />
              </button>
            )}
          </div>

          <div className="ep-vorrat-liste">
            {proFach.map((sp) => {
              const leer = sp.kbs.length === 0;
              const zu = leer || zuFaecher.has(sp.fach);
              return (
                <section
                  className={"ep-fachgruppe" + (leer ? " leer" : "")}
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
                    <span className="ep-fachgruppe-pfeil" aria-hidden="true">
                      <Icon name="chevron-down" className="klapp-chevron" size={16} />
                    </span>
                  </button>
                  {!zu && (
                    <div className="ep-fachgruppe-chips">
                      {sp.kbs.map((k) => chip(k, false))}
                    </div>
                  )}
                </section>
              );
            })}
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

      {vorn !== false &&
        (untenSlot ? createPortal(untenLeiste, untenSlot) : untenLeiste)}

      {hinweis && (
        <div className="ep-hinweis" role="status" aria-live="polite" aria-atomic="true">
          {hinweis}
        </div>
      )}
    </div>
  );
}
