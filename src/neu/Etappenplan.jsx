import { useEffect, useState } from "react";
import {
  koennensbeweise,
  kbFaecher,
  kbFarbe,
  kbThemen,
  etappeWochen,
  wochenZielCluster,
  startZuordnung,
} from "../data/koennensbeweise";
import { etappen } from "../data/etappen";
import KbChip from "./KbChip";
import Begriff from "./Begriff";
import { meldeAenderung } from "./planung";
import "./Etappenplan.css";

// Sauberer Neuanfang: der Einstieg ist der Etappenplan. Die GANZE Etappe ist auf
// einen Blick sichtbar, ohne Scrollen. Oben pro Fach eine Spalte mit ihren
// Könnensbeweisen (der Vorrat), darunter die Wochen. Per Drag and Drop zieht man
// einen KB aus seiner Fach-Spalte in eine Woche. Ziehen auf eine Fach-Spalte
// legt ihn zurück in den Vorrat.

// Die KB-Daten gehören zum Planungsblatt der Etappe "Pfingsten" (Ostern -> Pfingsten).
const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];
const SPEICHER = "neu.etappenplan.zuordnung";

function zeitraum(e) {
  const opt = { day: "numeric", month: "long" };
  const von = new Date(e.von + "T00:00:00").toLocaleDateString("de-DE", opt);
  const bis = new Date(e.bis + "T00:00:00").toLocaleDateString("de-DE", opt);
  return `${von} bis ${bis}`;
}

// Wochen der Etappe: ab dem Startdatum je 7 Tage (Mo bis So).
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
  const monat = (d) => d.toLocaleDateString("de-DE", { month: "short" });
  const tag = (d) => d.getDate();
  if (monat(von) === monat(bis)) return `${tag(von)}.–${tag(bis)}. ${monat(von)}`;
  return `${tag(von)}. ${monat(von)} – ${tag(bis)}. ${monat(bis)}`;
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
  // zuordnung: kbId -> Wochen-Index (0-basiert). Fehlt = noch im Vorrat.
  const [zuordnung, setZuordnung] = useState(lade);
  const [ueber, setUeber] = useState(null); // Drop-Ziel beim Ziehen ("w0".."w5" | "pool")
  const [gezogenId, setGezogenId] = useState(null); // welcher KB wird gerade gezogen
  const [gewaehltId, setGewaehltId] = useState(null); // angetippter Vorrat-Chip (Touch)
  const [hinweis, setHinweis] = useState(null); // kurze Rueckmeldung (Toast)
  const [resetConfirm, setResetConfirm] = useState(false); // Reset-Sicherheitsfrage

  useEffect(() => {
    localStorage.setItem(SPEICHER, JSON.stringify(zuordnung));
    meldeAenderung();
  }, [zuordnung]);

  // Toast nach kurzer Zeit wieder ausblenden.
  useEffect(() => {
    if (!hinweis) return undefined;
    const t = setTimeout(() => setHinweis(null), 2600);
    return () => clearTimeout(t);
  }, [hinweis]);

  const wochen = wochenBereiche(ETAPPE, etappeWochen);

  const proFach = kbFaecher.map((fach) => ({
    fach,
    farbe: kbFarbe[fach] || "#868e96",
    thema: kbThemen[fach],
    kbs: koennensbeweise.filter(
      (k) => k.fach === fach && zuordnung[k.id] == null
    ),
  }));

  const proWoche = wochen.map((w, i) => {
    const kbs = koennensbeweise.filter((k) => zuordnung[k.id] === i);
    const summe = kbs.reduce((s, k) => s + k.cluster, 0);
    return { ...w, idx: i, kbs, summe };
  });

  // Weiter ist erst möglich, wenn jedes Etappenziel in einer Woche liegt.
  const offen = koennensbeweise.filter((k) => zuordnung[k.id] == null).length;
  const alleZugeordnet = offen === 0;

  function onDragStart(e, id) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    // Drag-Bild fest auf den Chip pinnen, sonst greift der Browser manchmal die
    // ganze Fach-Spalte als Ghost.
    e.dataTransfer.setDragImage(e.currentTarget, 12, 12);
    // gezogenId ERST nach dem Start setzen: ein synchrones Re-Render mitten im
    // dragstart bricht den nativen Drag ab (Symptom: man muss zweimal ziehen).
    setTimeout(() => setGezogenId(id), 0);
  }
  function dragEnde() {
    setUeber(null);
    setGezogenId(null);
  }

  // Welcher KB wird gerade gezogen (für die Über-10-Sperre der Wochen)?
  const gezogen = gezogenId
    ? koennensbeweise.find((k) => k.id === gezogenId)
    : null;
  function setzeWoche(id, idx) {
    setZuordnung((z) => ({ ...z, [id]: idx }));
  }
  // Tippen-zum-Zuordnen (Touch): Chip antippen wählt aus, Woche antippen legt ab.
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

  // Erster Halt gegen die Leere-Tafel-Lähmung: die noch offenen Ziele ausgewogen
  // verteilen (größte zuerst auf die leichteste Woche), Pflicht-KB in Woche 1.
  // Schon selbst platzierte Ziele bleiben unberührt, vorgeschlagenes passt der
  // Schüler frei an. Struktur wird gereicht, die Hoheit bleibt beim Schüler.
  function vorschlagVerteilung() {
    const summen = Array(etappeWochen).fill(0);
    const z = { ...zuordnung };
    // Pflicht-KB vorbelegen, falls noch nicht selbst platziert.
    for (const [id, w] of Object.entries(startZuordnung)) {
      if (z[id] == null) z[id] = w;
    }
    // Last der bereits platzierten Ziele zählt mit, damit es ausgewogen bleibt.
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

  // Planung verwerfen: alle Wochen-Zuordnungen loeschen, zurueck in den Vorrat.
  // Der Lernstand (erledigt) bleibt unangetastet.
  function planZuruecksetzen() {
    setZuordnung({});
    setGewaehltId(null);
    setResetConfirm(false);
    setHinweis("Plan zurückgesetzt. Verteile deine Ziele neu.");
  }

  return (
    <div className="ep-screen">
      <header className="ep-kopf">
        <div className="ep-kopf-text">
          <p className="ep-kopf-eyebrow">Etappe planen</p>
          <h1 className="ep-kopf-titel">{ETAPPE.kurz}</h1>
          <p className="ep-kopf-sub">
            {zeitraum(ETAPPE)} · verteile deine {koennensbeweise.length}{" "}
            <Begriff name="koennensbeweis">Könnensbeweise</Begriff> von oben auf
            die Wochen darunter (tippen oder ziehen)
          </p>
        </div>
        <div className="ep-kopf-aktion">
          <span className={"ep-fortschritt" + (alleZugeordnet ? " fertig" : "")}>
            {alleZugeordnet ? "Alle verteilt ✓" : `noch ${offen} offen`}
          </span>
          <div className="ep-kopf-buttons">
            {resetConfirm ? (
              <span className="ep-reset-confirm" role="group">
                <span className="ep-reset-frage">Plan neu starten?</span>
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
                title="Alle Wochen-Zuordnungen löschen und neu verteilen (dein Lernstand bleibt)"
              >
                Zurücksetzen
              </button>
            )}
            <button
              type="button"
              className="ep-vorschlag"
              onClick={vorschlagVerteilung}
              title="Die noch offenen Ziele ausgewogen auf die Wochen verteilen, danach frei anpassen"
            >
              Für mich vorschlagen
            </button>
            <button
              type="button"
              className="ep-weiter"
              onClick={onWeiter}
              disabled={!alleZugeordnet}
              title={
                alleZugeordnet
                  ? "Weiter zur Übersicht"
                  : "Erst alle Könnensbeweise in Wochen ziehen"
              }
            >
              Weiter →
            </button>
          </div>
        </div>
      </header>

      {/* Vorrat: pro Fach eine Spalte mit den noch nicht verteilten KBs */}
      <div className="ep-grid" style={{ "--spalten": proFach.length }}>
        {proFach.map((sp) => (
          <section
            className={"ep-fach" + (ueber === "pool" ? " ueber" : "")}
            key={sp.fach}
            style={{ "--c": sp.farbe }}
            onDragOver={(e) => {
              e.preventDefault();
              setUeber("pool");
            }}
            onDragLeave={() => setUeber((u) => (u === "pool" ? null : u))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) zurueckInVorrat(id);
              setUeber(null);
            }}
            onClick={() => gewaehltId != null && setGewaehltId(null)}
          >
            <header className="ep-fach-kopf">
              <span className="ep-fach-name">{sp.fach}</span>
              <span className="ep-fach-thema">{sp.thema}</span>
            </header>
            {sp.kbs.length === 0 ? (
              <span className="ep-fach-fertig">✓ verteilt</span>
            ) : (
              <div className="ep-kb-liste">
                {sp.kbs.map((k) => (
                  <KbChip
                    k={k}
                    key={k.id}
                    gewaehlt={gewaehltId === k.id}
                    onTippen={waehle}
                    onDragStart={onDragStart}
                    onDragEnd={dragEnde}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Wochen: Drop-Ziele */}
      <div className="ep-wochen">
        {proWoche.map((w) => {
          const voll = w.summe === wochenZielCluster; // genau am Ziel (10)
          const ueberZiel = w.summe > wochenZielCluster; // über dem Ziel
          // Würde der gerade gezogene KB diese Woche über 10 heben? Dann orange
          // warnen, aber NICHT blocken: die 10 ist ein Ziel, keine Wand.
          const schonHier = gezogen && zuordnung[gezogen.id] === w.idx;
          const dragWarn =
            !!gezogen &&
            !schonHier &&
            w.summe + gezogen.cluster > wochenZielCluster;
          return (
            <section
              className={
                "ep-woche" +
                (ueber === "w" + w.idx ? " ueber" : "") +
                (voll ? " voll" : "") +
                (ueberZiel ? " ueber-ziel" : "") +
                (dragWarn ? " drag-warn" : "") +
                (gewaehltId != null ? " tippbar" : "")
              }
              key={w.nr}
              onDragOver={(e) => {
                e.preventDefault();
                setUeber("w" + w.idx);
              }}
              onDragLeave={() =>
                setUeber((u) => (u === "w" + w.idx ? null : u))
              }
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) setzeWoche(id, w.idx);
                setUeber(null);
              }}
              onClick={() => tippZuWoche(w.idx)}
            >
              <header className="ep-woche-kopf">
                <div className="ep-woche-titel">
                  <span className="ep-woche-nr">Woche {w.nr}</span>
                  <span className="ep-woche-datum">
                    {bereichText(w.von, w.bis)}
                  </span>
                </div>
                <span
                  className={
                    "ep-woche-summe" +
                    (voll ? " voll" : "") +
                    (ueberZiel ? " drueber" : "")
                  }
                >
                  {voll ? "✓ Voll" : `${w.summe}/${wochenZielCluster}`}
                </span>
              </header>
              <div className="ep-woche-kbs">
                {w.kbs.length === 0 ? (
                  <span className="ep-woche-leer">
                    {gewaehltId != null ? "hier ablegen" : "hierher ziehen"}
                  </span>
                ) : (
                  w.kbs.map((k) => (
                    <KbChip
                      k={k}
                      key={k.id}
                      platziert
                      onDragStart={onDragStart}
                      onDragEnd={dragEnde}
                      onZurueck={zurueckInVorrat}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {hinweis && (
        <div className="ep-hinweis" role="status" aria-live="polite" aria-atomic="true">
          {hinweis}
        </div>
      )}
    </div>
  );
}
