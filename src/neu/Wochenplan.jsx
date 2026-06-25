import { useEffect, useState } from "react";
import {
  koennensbeweise,
  wochenZielCluster,
  kbFaecher,
  kbFarbe,
} from "../data/koennensbeweise";
import { lernwegFuerKb } from "../data/wissen";
import { ladeSchritte } from "./lernschritte";
import {
  stundenWoche,
  fachFarbe,
  istBelegbar,
  stundenId,
  tagStart,
  tagEnde,
} from "../data/stundenplanWoche";
import { etappen } from "../data/etappen";
import KbChip from "./KbChip";
import { meldeAenderung, ladeStunden } from "./planung";
import "./Wochenplan.css";

// Woche planen als Kalender-Raster: links die Lernwege je Fach (zum Platzieren),
// rechts die Woche als Zeitachse. Stundenplan-Stunden, die nicht belegbar sind
// (Nebenfächer, Projekte, Pause), liegen ausgegraut als Kontext; die belegbaren
// Stunden (Hauptfächer + Studierzeit) sind die "Freiarbeit"-Slots, auf die man
// die Uhren der Etappenziele legt. Eine Uhr = eine Stunde. Drag-and-drop (Laptop)
// und Tippen (Touch) funktionieren beide. Die Planungs-Logik ist unverändert,
// nur die Darstellung ist neu.

const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];
const WOCHEN_KEY = "neu.etappenplan.zuordnung"; // kbId -> Wochen-Index (read-only)
const STUNDEN_KEY = "neu.wochenplan.stunden"; // kbId -> [Stunden-ID, ...] (je 1 Uhr)
const TAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const TAGE_KURZ = ["Mo", "Di", "Mi", "Do", "Fr"];

// Zeitachse des Kalenders.
const MIN = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + (m || 0);
};
const T_VON = MIN(tagStart); // 08:00
const T_BIS = MIN(tagEnde); // 15:30
const SPANNE = T_BIS - T_VON;
const PPM = 1.25; // Pixel pro Minute
const STUNDEN_LINIEN = [];
for (let h = Math.ceil(T_VON / 60); h * 60 <= T_BIS; h++) STUNDEN_LINIEN.push(h);

function lade(key) {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}

function wochenStart(e, wIdx) {
  const start = new Date(e.von + "T00:00:00");
  start.setDate(start.getDate() + wIdx * 7);
  return start;
}
function tagDatum(montag, tagIdx) {
  const d = new Date(montag);
  d.setDate(montag.getDate() + tagIdx);
  return d.getDate() + "." + (d.getMonth() + 1);
}
function langDatum(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
  });
}

// Alle belegbaren Stunden-IDs der Woche (Mo-Fr), für die Auto-Verteilung.
function alleBelegbarenSlots() {
  const slots = [];
  for (let i = 0; i < TAGE.length; i++) {
    stundenWoche
      .filter((s) => s.tag === i && istBelegbar(s))
      .forEach((s) => slots.push(stundenId(s)));
  }
  return slots;
}

export default function Wochenplan({ onZurueck, onWeiter, onEtappeAnpassen, woche = 0 }) {
  const wochenZuordnung = lade(WOCHEN_KEY); // kbId -> Woche
  const [stunden, setStunden] = useState(ladeStunden); // kbId -> [Slot-IDs]
  const [ueber, setUeber] = useState(null); // aktuelles Drop-Ziel (Hover)
  const [gewaehltId, setGewaehltId] = useState(null); // angetippter Chip (Touch)
  const [hinweis, setHinweis] = useState(null); // kurze Rueckmeldung (Toast)
  const [resetConfirm, setResetConfirm] = useState(false);
  const [aktiveWoche, setAktiveWoche] = useState(woche);
  const [zuFaecher, setZuFaecher] = useState(() => new Set()); // eingeklappte Fächer
  const [suche, setSuche] = useState("");

  useEffect(() => {
    localStorage.setItem(STUNDEN_KEY, JSON.stringify(stunden));
    meldeAenderung();
  }, [stunden]);

  useEffect(() => {
    if (!hinweis) return undefined;
    const t = setTimeout(() => setHinweis(null), 2600);
    return () => clearTimeout(t);
  }, [hinweis]);

  // Sicherheitsnetz fürs Ziehen: egal wie ein Drag endet, die Hover-Markierung
  // zurücksetzen (Escape räumt zusätzlich eine getippte Auswahl ab). Zusammen mit
  // dem verzögerten Ablegen unten verhindert das ein hängendes Vorschaubild.
  useEffect(() => {
    const aufDragEnde = () => setUeber(null);
    const aufEsc = (e) => {
      if (e.key !== "Escape") return;
      setUeber(null);
      setGewaehltId(null);
    };
    window.addEventListener("dragend", aufDragEnde);
    window.addEventListener("keydown", aufEsc);
    return () => {
      window.removeEventListener("dragend", aufDragEnde);
      window.removeEventListener("keydown", aufEsc);
    };
  }, []);

  const wocheKbs = koennensbeweise.filter(
    (k) => wochenZuordnung[k.id] === aktiveWoche
  );
  const restVon = (k) => k.cluster - (stunden[k.id]?.length || 0);
  const wochenMitKbs = [
    ...new Set(
      koennensbeweise.map((k) => wochenZuordnung[k.id]).filter((w) => w != null)
    ),
  ].sort((a, b) => a - b);
  const wocheVollstaendig = (w) => {
    const kbs = koennensbeweise.filter((k) => wochenZuordnung[k.id] === w);
    return (
      kbs.length > 0 &&
      kbs.every((k) => k.cluster - (stunden[k.id]?.length || 0) <= 0)
    );
  };
  const schrittFortschritt = (kbId) => {
    const lw = lernwegFuerKb(kbId);
    const schritte = lw?.thema?.schritte || [];
    if (!schritte.length) return null;
    const stand = ladeSchritte(kbId);
    const fertig = schritte.filter((st, i) =>
      stand[i] != null ? stand[i] : !!st.fertig
    ).length;
    return { fertig, gesamt: schritte.length };
  };
  const vorrat = wocheKbs.filter((k) => restVon(k) > 0);
  const wocheFertig = wocheKbs.length > 0 && vorrat.length === 0;
  const wocheHatPlatziert = wocheKbs.some((k) => (stunden[k.id] || []).length > 0);
  const aktuelleWocheFertig = wocheVollstaendig(woche);
  const wochenLast = wocheKbs.reduce((s, k) => s + k.cluster, 0);
  const lastStand =
    wochenLast > wochenZielCluster + 4
      ? "viel"
      : wochenLast > wochenZielCluster
        ? "knapp"
        : "ok";
  const montag = wochenStart(ETAPPE, aktiveWoche);
  const monatLabel = montag.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  // Vorrat nach Fach gruppieren (stabile Fach-Reihenfolge), optional per Suche gefiltert.
  const q = suche.trim().toLowerCase();
  const vorratNachFach = kbFaecher
    .map((fach) => ({
      fach,
      kbs: vorrat.filter(
        (k) => k.fach === fach && (!q || k.titel.toLowerCase().includes(q))
      ),
    }))
    .filter((g) => g.kbs.length > 0);

  function dragStart(e, id, quelleSlot) {
    e.dataTransfer.setData("text/plain", id + "|" + (quelleSlot || ""));
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setDragImage(e.currentTarget, 12, 12);
    } catch {
      /* manche Browser ohne Drag-Image */
    }
  }
  function dragEnde() {
    setUeber(null);
  }

  function platziereUhr(id, zielSlot, quelleSlot) {
    const kb = koennensbeweise.find((k) => k.id === id);
    if (!kb) return;
    setStunden((prev) => {
      const arr = new Set(prev[id] || []);
      const istMove = !!quelleSlot && quelleSlot !== zielSlot;
      if (istMove) arr.delete(quelleSlot);
      if (arr.has(zielSlot)) return { ...prev, [id]: [...arr] };
      if (!istMove && arr.size >= kb.cluster) return prev;
      arr.add(zielSlot);
      return { ...prev, [id]: [...arr] };
    });
  }
  function entferneUhr(id, slotId) {
    setStunden((prev) => {
      const arr = (prev[id] || []).filter((s) => s !== slotId);
      const n = { ...prev };
      if (arr.length) n[id] = arr;
      else delete n[id];
      return n;
    });
  }

  function waehle(id) {
    setGewaehltId((g) => (g === id ? null : id));
  }
  function tippZuSlot(slotId) {
    if (gewaehltId == null) return;
    const kb = koennensbeweise.find((k) => k.id === gewaehltId);
    const schon = new Set(stunden[gewaehltId] || []);
    platziereUhr(gewaehltId, slotId, null);
    const nachher = schon.has(slotId) ? schon.size : schon.size + 1;
    if (!kb || nachher >= kb.cluster) setGewaehltId(null);
  }

  function vorschlagVerteilen() {
    const slots = alleBelegbarenSlots();
    if (slots.length === 0) return;
    setStunden((prev) => {
      const next = { ...prev };
      const last = {};
      slots.forEach((sid) => (last[sid] = 0));
      for (const k of wocheKbs) {
        for (const sid of next[k.id] || []) if (last[sid] != null) last[sid]++;
      }
      for (const kb of wocheKbs) {
        const have = new Set(next[kb.id] || []);
        let fehlend = kb.cluster - have.size;
        while (fehlend > 0) {
          let best = null;
          for (const sid of slots) {
            if (have.has(sid)) continue;
            if (best === null || last[sid] < last[best]) best = sid;
          }
          if (best === null) break;
          have.add(best);
          last[best]++;
          fehlend--;
        }
        next[kb.id] = [...have];
      }
      return next;
    });
    setHinweis("Ausgewogen auf die Stunden verteilt. Du kannst frei anpassen.");
  }

  function planZuruecksetzen() {
    setStunden((prev) => {
      const next = { ...prev };
      for (const k of wocheKbs) delete next[k.id];
      return next;
    });
    setGewaehltId(null);
    setResetConfirm(false);
    setHinweis("Stunden dieser Woche zurückgesetzt. Dein Lernstand bleibt.");
  }

  function toggleFach(fach) {
    setZuFaecher((s) => {
      const n = new Set(s);
      if (n.has(fach)) n.delete(fach);
      else n.add(fach);
      return n;
    });
  }

  // Drop zurück in den Vorrat (Sidebar): eine platzierte Uhr entfernen.
  function dropInVorrat(e) {
    e.preventDefault();
    const [id, quelle] = (e.dataTransfer.getData("text/plain") || "").split("|");
    setUeber(null);
    // Erst nach Abschluss des nativen Drags entfernen, sonst kann ein Geisterbild
    // des gezogenen Chips hängen bleiben (dragend wird nicht mehr zugestellt).
    if (id && quelle) setTimeout(() => entferneUhr(id, quelle), 0);
  }

  // Ein Block im Kalender (eine Stunde des Tages).
  function block(s) {
    const sid = stundenId(s);
    const stil = {
      top: (MIN(s.von) - T_VON) * PPM + "px",
      height: (MIN(s.bis) - MIN(s.von)) * PPM - 4 + "px",
    };
    if (s.art === "pause") {
      return (
        <div className="wp-blk wp-blk-pause" key={sid} style={stil}>
          <span>{s.fach}</span>
        </div>
      );
    }
    if (!istBelegbar(s)) {
      return (
        <div className="wp-blk wp-blk-fix" key={sid} style={stil}>
          <span className="wp-blk-fach">{s.fach}</span>
          <span className="wp-blk-zeit">
            {s.von} bis {s.bis}
          </span>
          <span className="wp-blk-raum">{s.raum}</span>
          <span
            className="wp-blk-strich"
            style={{ background: fachFarbe[s.fach] || "#868e96" }}
          />
        </div>
      );
    }
    const slotKbs = wocheKbs.filter((k) => (stunden[k.id] || []).includes(sid));
    const leer = slotKbs.length === 0;
    const aktiv = ueber === sid;
    return (
      <div
        key={sid}
        className={
          "wp-blk wp-blk-frei" +
          (leer ? " leer" : " belegt") +
          (aktiv ? " ueber" : "") +
          (leer && gewaehltId != null ? " tippbar" : "")
        }
        style={stil}
        onDragOver={(e) => {
          e.preventDefault();
          setUeber(sid);
        }}
        onDragLeave={() => setUeber((u) => (u === sid ? null : u))}
        onDrop={(e) => {
          e.preventDefault();
          const [id, quelle] = (
            e.dataTransfer.getData("text/plain") || ""
          ).split("|");
          setUeber(null);
          // Siehe dropInVorrat: Platzieren erst nach dem nativen Drag.
          if (id) setTimeout(() => platziereUhr(id, sid, quelle || null), 0);
        }}
        onClick={(e) => {
          e.stopPropagation();
          tippZuSlot(sid);
        }}
      >
        {leer ? (
          <>
            <span className="wp-frei-label">
              {aktiv || gewaehltId != null ? "hier ablegen" : "Freiarbeit"}
            </span>
            <span className="wp-frei-zeit">
              {s.von} bis {s.bis}
            </span>
          </>
        ) : (
          slotKbs.map((k) => (
            <div
              key={k.id}
              className="wp-kb"
              style={{ "--c": kbFarbe[k.fach] || "#868e96" }}
              draggable
              onDragStart={(e) => dragStart(e, k.id, sid)}
              onDragEnd={dragEnde}
              onClick={(e) => {
                e.stopPropagation();
                entferneUhr(k.id, sid);
              }}
              title={`${k.code} · antippen, um zurückzulegen`}
            >
              <span className="wp-kb-titel">{k.titel}</span>
              <span className="wp-kb-meta">
                <span className="wp-kb-uhr" aria-hidden="true">
                  ◷
                </span>
                {k.cluster} · {k.fach}
              </span>
            </div>
          ))
        )}
      </div>
    );
  }

  const aktiverIdx = wochenMitKbs.indexOf(aktiveWoche);
  const gehWoche = (delta) => {
    const ni = aktiverIdx + delta;
    if (ni < 0 || ni >= wochenMitKbs.length) return;
    setAktiveWoche(wochenMitKbs[ni]);
    setGewaehltId(null);
  };

  return (
    <div className="wp-screen" onClick={() => gewaehltId != null && setGewaehltId(null)}>
      {/* Werkzeugzeile wie im Etappenplan: Suche links, Vorschlag rechts */}
      <div className="wp-top">
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
            aria-label="Ziele durchsuchen"
          />
        </div>
        <button
          type="button"
          className="ep-vorschlag-knopf"
          onClick={vorschlagVerteilen}
          disabled={vorrat.length === 0}
          title="Die offenen Uhren ausgewogen auf die Stunden verteilen"
        >
          <span aria-hidden="true">✦</span> Für mich vorschlagen
        </button>
      </div>
      <div className="wp-layout">
        {/* Linke Spalte: Lernwege je Fach, zum Platzieren */}
        <aside
          className={"wp-seite" + (ueber === "pool" ? " ueber" : "")}
          onDragOver={(e) => {
            e.preventDefault();
            setUeber("pool");
          }}
          onDragLeave={() => setUeber((u) => (u === "pool" ? null : u))}
          onDrop={dropInVorrat}
        >
          {/* Feste Kopf-Box: bleibt stehen, während die Fächer darunter scrollen */}
          <div className="wp-seite-fest">
            <div className="wp-seite-kopf">
              <span className="wp-seite-icon" aria-hidden="true">
                🗓
              </span>
              <div>
                <h1 className="wp-seite-titel">Plane deine Woche</h1>
                <p className="wp-seite-sub">
                  {langDatum(ETAPPE.von)} bis {langDatum(ETAPPE.bis)}
                </p>
              </div>
            </div>
            <p className="wp-seite-erklaer">
              Zieh die Ziele der Woche in deine freien Stunden.
            </p>

            <div className="wp-seite-status">
              <span className={"wp-status-rest" + (wocheFertig ? " fertig" : "")}>
                {wocheFertig
                  ? "Alle Uhren verteilt ✓"
                  : `noch ${vorrat.length} offen`}
              </span>
              {wochenLast > 0 && (
                <span className="wp-status-last" data-stand={lastStand}>
                  {wochenLast} von {wochenZielCluster} Uhren
                </span>
              )}
            </div>

            <div className="wp-seite-aktionen">
              {resetConfirm ? (
                <span className="wp-reset-confirm">
                  <button
                    type="button"
                    className="wp-akt warn"
                    onClick={planZuruecksetzen}
                  >
                    Wirklich neu
                  </button>
                  <button
                    type="button"
                    className="wp-akt"
                    onClick={() => setResetConfirm(false)}
                  >
                    Abbrechen
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="wp-akt"
                  onClick={() => setResetConfirm(true)}
                  disabled={!wocheHatPlatziert}
                  title="Die Stunden dieser Woche löschen (Lernstand bleibt)"
                >
                  Zurücksetzen
                </button>
              )}
              {onWeiter && (
                <button
                  type="button"
                  className="wp-weiter"
                  onClick={onWeiter}
                  disabled={!aktuelleWocheFertig}
                  title={
                    aktuelleWocheFertig
                      ? "Weiter zur Übersicht"
                      : "Erst alle Uhren der laufenden Woche verteilen"
                  }
                >
                  Weiter →
                </button>
              )}
            </div>
          </div>

          <div className="wp-seite-liste">
            {vorratNachFach.length === 0 ? (
              <p className="wp-seite-leer">
                {wocheKbs.length === 0
                  ? "Keine Ziele in dieser Woche."
                  : "Alle Uhren dieser Woche sind verteilt."}
              </p>
            ) : (
              vorratNachFach.map((g) => {
                const zu = zuFaecher.has(g.fach);
                return (
                  <section
                    className="wp-fachgruppe"
                    key={g.fach}
                    style={{ "--c": kbFarbe[g.fach] || "#868e96" }}
                  >
                    <button
                      type="button"
                      className="wp-fachgruppe-kopf"
                      onClick={() => toggleFach(g.fach)}
                      aria-expanded={!zu}
                    >
                      <span className="wp-fachgruppe-name">{g.fach}</span>
                      <span className="wp-fachgruppe-zahl">{g.kbs.length}</span>
                      <span className="wp-fachgruppe-pfeil" aria-hidden="true">
                        {zu ? "▸" : "▾"}
                      </span>
                    </button>
                    {!zu && (
                      <div className="wp-fachgruppe-chips">
                        {g.kbs.map((k) => (
                          <KbChip
                            k={k}
                            key={k.id}
                            zahl={restVon(k)}
                            fortschritt={schrittFortschritt(k.id)}
                            gewaehlt={gewaehltId === k.id}
                            onTippen={waehle}
                            onDragStart={(e, id) => dragStart(e, id, null)}
                            onDragEnd={dragEnde}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>
        </aside>

        {/* Rechte Spalte: die Woche als Kalender */}
        <section className="wp-kal">
          <header className="wp-kal-kopf">
            <div className="wp-kal-nav">
              <button
                type="button"
                className="wp-kal-pfeil"
                onClick={() => gehWoche(-1)}
                disabled={aktiverIdx <= 0}
                aria-label="Woche zurück"
              >
                ‹
              </button>
              <h2 className="wp-kal-monat">{monatLabel}</h2>
              <button
                type="button"
                className="wp-kal-pfeil"
                onClick={() => gehWoche(1)}
                disabled={aktiverIdx < 0 || aktiverIdx >= wochenMitKbs.length - 1}
                aria-label="Woche vor"
              >
                ›
              </button>
              {aktiveWoche === woche && wochenMitKbs.length > 1 && (
                <span className="wp-kal-jetzt">diese Woche</span>
              )}
            </div>
            <div className="wp-kal-kopf-buttons">
              {onEtappeAnpassen && (
                <button type="button" className="wp-akt" onClick={onEtappeAnpassen}>
                  Etappe anpassen
                </button>
              )}
              {onZurueck && (
                <button type="button" className="wp-akt" onClick={onZurueck}>
                  ← Etappenplan
                </button>
              )}
            </div>
          </header>

          <div className="wp-kal-grid">
            <div className="wp-kal-head">
              <div className="wp-kal-gutter-head" />
              {TAGE.map((name, i) => (
                <div className="wp-kal-tag-head" key={i}>
                  <span className="wp-kal-tag-datum">{tagDatum(montag, i)}</span>
                  <span className="wp-kal-tag-name">{TAGE_KURZ[i]}</span>
                </div>
              ))}
            </div>
            <div className="wp-kal-body" style={{ height: SPANNE * PPM + "px" }}>
              <div className="wp-kal-gutter">
                {STUNDEN_LINIEN.map((h) => (
                  <span
                    className="wp-kal-zeit"
                    key={h}
                    style={{ top: (h * 60 - T_VON) * PPM + "px" }}
                  >
                    {h}:00
                  </span>
                ))}
              </div>
              {TAGE.map((name, i) => (
                <div className="wp-kal-col" key={i}>
                  {STUNDEN_LINIEN.map((h) => (
                    <span
                      className="wp-kal-linie"
                      key={h}
                      style={{ top: (h * 60 - T_VON) * PPM + "px" }}
                    />
                  ))}
                  {stundenWoche.filter((s) => s.tag === i).map((s) => block(s))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {hinweis && (
        <div className="ep-hinweis" role="status" aria-live="polite" aria-atomic="true">
          {hinweis}
        </div>
      )}
    </div>
  );
}
