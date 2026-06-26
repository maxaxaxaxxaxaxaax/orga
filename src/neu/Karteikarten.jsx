import { useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Karteikarten.css";

// Vokabel-Karteikarten: Vorderseite zeigt das Wort, Tippen dreht zur Lösung.
// "Kann ich" legt die Karte weg, "Nochmal" hängt sie hinten an. Fertig, wenn
// der Stapel leer ist. Mit "Richtung umkehren" fragt man von der Rückseite ab
// (z.B. Deutsch -> Latein, das aktive Abrufen ist schwerer und lehrreicher).
// Mit "Selbst abfragen" gibt man die Lösung erst selbst ein (free recall, das
// wirksamste Vokabel-Lernen) und deckt dann auf, statt nur passiv umzudrehen.
// Bewusst ohne strenges Auto-Grading: der Schüler vergleicht selbst und
// entscheidet "Kann ich" oder "Nochmal" (Selbstregulation, siehe VISION).
// Reiner Übungsmodus, kein Tracking nach außen.
export default function Karteikarten({ daten }) {
  const karten = daten?.karten || [];
  const [rest, setRest] = useState(karten);
  const [gedreht, setGedreht] = useState(false); // Lösung sichtbar (umgedreht / aufgedeckt)
  const [umgekehrt, setUmgekehrt] = useState(false); // Rückseite als Frage
  const [abfrage, setAbfrage] = useState(false); // Aktiv-Abruf: erst selbst eingeben
  const [eingabe, setEingabe] = useState(""); // getippte Lösung im Abfrage-Modus
  const [gekonnt, setGekonnt] = useState(0);
  const [wiederholt, setWiederholt] = useState(0); // wie oft "Nochmal" gedrueckt

  const gesamt = karten.length;
  if (gesamt === 0) return <p className="kk-leer">Keine Karten vorhanden.</p>;

  if (rest.length === 0) {
    return (
      <div className="kk">
        <Fertig
          text={`Alle ${gesamt} Karten geschafft.`}
          bilanz={
            wiederholt === 0
              ? "Alles direkt gekonnt. Stark."
              : `${wiederholt}-mal wiederholt: die merkst du dir beim nächsten Mal.`
          }
          nochmalLabel="Nochmal von vorn"
          onNochmal={() => {
            setRest(karten);
            setGekonnt(0);
            setWiederholt(0);
            setGedreht(false);
            setEingabe("");
          }}
        />
      </div>
    );
  }

  const karte = rest[0];
  // Welche Seite ist gerade die Frage (oben) und welche die Lösung.
  const vorderseite = umgekehrt ? karte.hinten : karte.vorne;
  const rueckseite = umgekehrt ? karte.vorne : karte.hinten;
  function kannIch() {
    setRest(rest.slice(1));
    setGekonnt((g) => g + 1);
    setGedreht(false);
    setEingabe("");
  }
  function nochmal() {
    setRest([...rest.slice(1), karte]);
    setWiederholt((w) => w + 1);
    setGedreht(false);
    setEingabe("");
  }
  function aufdecken(e) {
    if (e) e.preventDefault();
    setGedreht(true);
  }
  // Richtung wechseln: laufende Karte wieder auf die Frageseite drehen.
  function richtungWechseln() {
    setUmgekehrt((u) => !u);
    setGedreht(false);
    setEingabe("");
  }
  // Abfrage-Modus an/aus: zurück auf die Frageseite.
  function abfrageWechseln() {
    setAbfrage((a) => !a);
    setGedreht(false);
    setEingabe("");
  }
  // Reststapel mischen: gegen das Auswendiglernen der Reihenfolge. Der schon
  // gezählte Fortschritt bleibt, nur die noch offenen Karten werden gemischt.
  function mischen() {
    const arr = [...rest];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setRest(arr);
    setGedreht(false);
    setEingabe("");
  }

  // Im Abfrage-Modus kommt die Selbsteinschätzung erst nach dem Aufdecken.
  const zeigeAktionen = !abfrage || gedreht;

  return (
    <div className="kk">
      <div className="kk-kopf">
        {daten.hinweis && <span className="kk-hinweis">{daten.hinweis}</span>}
        <span className="kk-zaehler">
          {gekonnt} / {gesamt} gekonnt
        </span>
      </div>
      <div className="kk-werkzeuge">
        <button
          type="button"
          className={"kk-werkzeug" + (abfrage ? " aktiv" : "")}
          onClick={abfrageWechseln}
          aria-pressed={abfrage}
          title="Erst selbst die Lösung eingeben, dann aufdecken"
        >
          ✎ Selbst abfragen
        </button>
        <button
          type="button"
          className={"kk-werkzeug" + (umgekehrt ? " aktiv" : "")}
          onClick={richtungWechseln}
          aria-pressed={umgekehrt}
          title="Von der anderen Seite abfragen"
        >
          ⇄ Richtung umkehren
        </button>
        {rest.length > 1 && (
          <button
            type="button"
            className="kk-werkzeug"
            onClick={mischen}
            title="Reihenfolge der offenen Karten mischen"
          >
            ⤮ Mischen
          </button>
        )}
      </div>
      <div className="kk-balken" aria-hidden="true">
        <div
          className="kk-balken-fuell"
          style={{ width: (gekonnt / gesamt) * 100 + "%" }}
        />
      </div>

      <UebungHinweis id="karteikarten">
        {abfrage
          ? "Gib die Lösung erst selbst ein, dann deck auf und vergleiche. Danach sag, ob du es konntest."
          : "Tippe auf die Karte, um die Lösung zu sehen. Dann sag, ob du es konntest oder es nochmal üben willst."}
      </UebungHinweis>

      {abfrage ? (
        // Aktiv-Abruf: Frage steht, Lösung wird erst selbst produziert.
        <div className="kk-abfrage">
          <div className="kk-frageseite">{vorderseite}</div>
          {!gedreht ? (
            <form className="kk-abfrage-eingabe" onSubmit={aufdecken}>
              <input
                className="kk-abfrage-feld"
                value={eingabe}
                onChange={(e) => setEingabe(e.target.value)}
                placeholder="Deine Lösung (sagen oder tippen)"
                aria-label="Deine Lösung"
                autoComplete="off"
              />
              <button type="submit" className="kk-aufdecken">
                Aufdecken
              </button>
            </form>
          ) : (
            <div className="kk-aufgedeckt">
              {eingabe.trim() && (
                <p className="kk-deine">
                  <span className="kk-deine-label">Du:</span> {eingabe.trim()}
                </p>
              )}
              <p className="kk-loesung">{rueckseite}</p>
              {karte.beispiel && (
                <p className="kk-beispiel">{karte.beispiel}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="kk-karte"
          onClick={() => setGedreht((g) => !g)}
          aria-label={gedreht ? "Karte zurückdrehen" : "Karte umdrehen"}
        >
          <span className={"kk-karte-inner" + (gedreht ? " gedreht" : "")}>
            <span className="kk-face kk-vorne">{vorderseite}</span>
            <span className="kk-face kk-hinten">
              <span className="kk-loesung">{rueckseite}</span>
              {karte.beispiel && (
                <span className="kk-beispiel">{karte.beispiel}</span>
              )}
            </span>
          </span>
        </button>
      )}

      <p className="kk-tipp">
        {abfrage
          ? gedreht
            ? "Konntest du es?"
            : "Erst selbst die Lösung sagen, dann aufdecken"
          : gedreht
            ? "Wusstest du es?"
            : "Tippen zum Umdrehen"}
      </p>

      {zeigeAktionen && (
        <div className="kk-aktionen">
          <button type="button" className="kk-nochmal" onClick={nochmal}>
            Nochmal ↻
          </button>
          <button type="button" className="kk-kann" onClick={kannIch}>
            Kann ich ✓
          </button>
        </div>
      )}
    </div>
  );
}
