import { useEffect, useState } from "react";
import { tafelDemos, tafelMockSvg, QUELLE_LABEL } from "../data/tafelDemos";
import ZahlenstrahlInteraktiv from "./ZahlenstrahlInteraktiv";
import UebungenAufgaben from "./UebungenAufgaben";

function quelleLabel(quelle) {
  return QUELLE_LABEL[quelle] || "Foto";
}

// Tafel-Snap: Foto → aufbereitete digitale Notiz.
// Drei Phasen: Auswahl (Demo-Foto), Analyse (Loading), Ergebnis (Vorher/Nachher).
// In der echten App käme das Foto aus der Kamera; für die Demo werden vorbereitete
// Tafelbild-SVGs gezeigt, damit der Vorher-Nachher-Sprung greifbar ist.
export default function TafelSnap({ onClose, onSpeichern }) {
  const [phase, setPhase] = useState("auswahl");
  const [gewaehlt, setGewaehlt] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (phase !== "analyse") return;
    const t = setTimeout(() => setPhase("ergebnis"), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  function waehleDemo(demo) {
    setGewaehlt(demo);
    setPhase("analyse");
  }

  function speichern() {
    if (!gewaehlt) return;
    onSpeichern(gewaehlt);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal tafel-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Foto-Snap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-kopf">
          <h3 className="modal-titel">Foto-Snap</h3>
          <button className="modal-x" onClick={onClose} aria-label="Schließen">×</button>
        </div>

        {phase === "auswahl" && (
          <div className="tafel-auswahl">
            <p className="tafel-intro">
              Mach ein Foto von dem, was du digital haben willst: Tafelbild,
              Arbeitsblatt, Buchseite oder deine eigene Heft-Mitschrift. Die App
              erkennt die Quelle und macht daraus eine saubere Notiz im richtigen
              Lernweg.
            </p>
            <p className="tafel-intro-klein">
              Demo-Beispiele:
            </p>
            <div className="tafel-demo-grid">
              {tafelDemos.map((d) => (
                <button
                  key={d.id}
                  className="tafel-demo-card"
                  onClick={() => waehleDemo(d)}
                >
                  <div
                    className="tafel-vorher"
                    dangerouslySetInnerHTML={{ __html: tafelMockSvg(d.fach, d.thema, d.quelle) }}
                  />
                  <div className="tafel-demo-label">
                    <span className="tafel-demo-quelle">{quelleLabel(d.quelle)}</span>
                    <span className="tafel-demo-fach">{d.fach}</span>
                    <span className="tafel-demo-thema">{d.thema}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "analyse" && (
          <div className="tafel-analyse">
            <div
              className="tafel-vorher gross"
              dangerouslySetInnerHTML={{ __html: tafelMockSvg(gewaehlt.fach, gewaehlt.thema, gewaehlt.quelle) }}
            />
            <div className="tafel-analyse-text">
              <div className="tafel-spinner" aria-hidden="true" />
              <p className="tafel-analyse-titel">App analysiert das {quelleLabel(gewaehlt.quelle)}</p>
              <ul className="tafel-analyse-schritte">
                <li>Schrift entziffern</li>
                <li>Struktur erkennen</li>
                <li>Lernweg zuordnen</li>
              </ul>
            </div>
          </div>
        )}

        {phase === "ergebnis" && gewaehlt && (
          <div className="tafel-ergebnis">
            <div className="tafel-ergebnis-body">
              <aside className="tafel-spalte tafel-spalte-foto">
                <p className="tafel-spalte-label">Vorher · {quelleLabel(gewaehlt.quelle)}</p>
                <div
                  className="tafel-vorher"
                  dangerouslySetInnerHTML={{ __html: tafelMockSvg(gewaehlt.fach, gewaehlt.thema, gewaehlt.quelle) }}
                />
                <p className="tafel-vorher-hint">
                  Aus diesem Foto wurde die Notiz rechts aufbereitet.
                </p>
              </aside>
              <main className="tafel-spalte tafel-spalte-notiz">
                <p className="tafel-spalte-label">Nachher · digital aufbereitet</p>
                <NotizVorschau
                  inhalt={gewaehlt.inhalt}
                  fach={gewaehlt.fach}
                  thema={gewaehlt.thema}
                />
              </main>
            </div>
            <footer className="tafel-ergebnis-footer">
              <p className="tafel-ziel">
                Speicherort: <strong>{gewaehlt.fach}</strong> · Lernweg „
                {gewaehlt.thema}"
              </p>
              <div className="tafel-aktionen">
                <button className="ghost-btn" onClick={onClose}>
                  Verwerfen
                </button>
                <button className="primary-btn" onClick={speichern}>
                  Im Lernweg speichern
                </button>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

// Hilfsprüfung: ein Abschnitt ist "aktiv" (gehört in Üben-Tab), wenn er
// Übungs-Aufgaben enthält. Alles andere (inkl. interaktiver Vorstellungs-
// Hilfen wie der Zahlenstrahl) bleibt in der Erklärung. So bleibt der
// Üben-Tab fokussiert auf den aktiven Strategie+Quiz-Flow.
function istAktiv(a) {
  return a.typ === "uebungen";
}

function NotizVorschau({ inhalt, fach, thema }) {
  const erklaerung = inhalt.abschnitte.filter((a) => !istAktiv(a));
  const ueben = inhalt.abschnitte.filter(istAktiv);
  const hatUeben = ueben.length > 0;
  const anzahlAufgaben = ueben.reduce(
    (s, a) => s + (a.aufgaben?.length || 0),
    0,
  );
  const [tab, setTab] = useState("erklaerung");

  const sichtbar = hatUeben
    ? tab === "ueben"
      ? ueben
      : erklaerung
    : inhalt.abschnitte;

  return (
    <article className="tafelnotiz">
      <header className="tafelnotiz-kopf">
        <h4 className="tafelnotiz-titel">{inhalt.ueberschrift}</h4>
        {hatUeben && (
          <div
            className="segment tafelnotiz-tabs"
            role="tablist"
            aria-label="Notiz-Bereich"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "erklaerung"}
              className={"segment-btn" + (tab === "erklaerung" ? " aktiv" : "")}
              onClick={() => setTab("erklaerung")}
            >
              Erklärung
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "ueben"}
              className={"segment-btn" + (tab === "ueben" ? " aktiv" : "")}
              onClick={() => setTab("ueben")}
            >
              Üben
              {anzahlAufgaben > 0 && (
                <span className="tafelnotiz-tab-badge">{anzahlAufgaben}</span>
              )}
            </button>
          </div>
        )}
      </header>
      {sichtbar.map((a, i) => (
        <section key={i} className={"tafelnotiz-abschnitt typ-" + a.typ}>
          {a.ueberschrift && (
            <h5 className="tafelnotiz-abschnitt-titel">{a.ueberschrift}</h5>
          )}
          {a.text && <p className="tafelnotiz-text">{a.text}</p>}
          {a.eintraege && (
            <ul className="tafelnotiz-eintraege">
              {a.eintraege.map((e, j) => (
                <li key={j}>{e}</li>
              ))}
            </ul>
          )}
          {a.lateinisch && (
            <div className="tafelnotiz-bilingual">
              <p className="tafelnotiz-lat">{a.lateinisch}</p>
              <p className="tafelnotiz-deu">{a.deutsch}</p>
            </div>
          )}
          {a.rechnungen && (
            <ul className="tafelnotiz-rechnungen">
              {a.rechnungen.map((r, j) => (
                <li key={j}>
                  <code>{r.ausdruck}</code>
                  <span className="tafelnotiz-pfeil">→</span>
                  <code>{r.schritt}</code>
                  <code className="tafelnotiz-ergebnis">{r.ergebnis}</code>
                </li>
              ))}
            </ul>
          )}
          {a.interaktiv === "zahlenstrahl" && <ZahlenstrahlInteraktiv />}
          {a.typ === "uebungen" && a.aufgaben && (
            <UebungenAufgaben
              aufgaben={a.aufgaben}
              einleitung={a.einleitung}
              generator={a.generator}
              fach={fach}
              thema={thema}
              inhalt={inhalt}
            />
          )}
        </section>
      ))}
    </article>
  );
}

export { NotizVorschau };
