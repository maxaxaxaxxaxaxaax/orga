import { useState } from "react";
import Fertig from "./Fertig";
import "./Zuordnung.css";

// Zuordnungs-Übung (Matching): links ein Begriff antippen, dann den passenden
// Partner rechts. Falsch = kurzer Hinweis, richtig = Paar rastet ein und wird
// ausgegraut. Die rechte Spalte wird genau einmal gemischt (im useState-
// Initialisierer), damit beim Laden nichts bricht und sich die Reihenfolge
// nicht bei jedem Render neu würfelt.

function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

export default function Zuordnung({ daten }) {
  const paare = (daten && daten.paare) || [];

  // Rechte Spalte: einmalig gemischte Reihenfolge der Indizes der Paare.
  const [rechtsReihenfolge] = useState(() => mischen(paare.map((_, i) => i)));
  const [geloest, setGeloest] = useState([]); // Indizes bereits gefundener Paare
  const [aktivLinks, setAktivLinks] = useState(null); // angetippter linker Index
  const [fehler, setFehler] = useState(null); // rechter Index, der eben falsch war

  if (paare.length === 0) {
    return <p className="zu-leer">Für diese Übung gibt es noch keine Paare.</p>;
  }

  const fertig = geloest.length === paare.length;

  function waehleLinks(i) {
    if (geloest.includes(i)) return;
    setFehler(null);
    setAktivLinks(i === aktivLinks ? null : i);
  }

  function waehleRechts(i) {
    if (geloest.includes(i) || aktivLinks === null) return;
    if (i === aktivLinks) {
      // Richtiges Paar: einrasten.
      setGeloest((g) => [...g, i]);
      setAktivLinks(null);
      setFehler(null);
    } else {
      // Falsch: kurzer Hinweis, Auswahl bleibt für neuen Versuch.
      setFehler(i);
    }
  }

  function nochmal() {
    setGeloest([]);
    setAktivLinks(null);
    setFehler(null);
  }

  if (fertig) {
    return (
      <div className="zu">
        <Fertig text="Alle Paare richtig zugeordnet." onNochmal={nochmal} />
      </div>
    );
  }

  return (
    <div className="zu">
      <div className="zu-kopf">
        <span className="zu-label">Zuordnen</span>
        <span className="zu-fortschritt">
          {geloest.length} / {paare.length}
        </span>
      </div>

      {daten.aufgabe && <p className="zu-aufgabe">{daten.aufgabe}</p>}

      <div className="zu-spalten">
        <div className="zu-spalte">
          {paare.map((paar, i) => {
            const geloestPaar = geloest.includes(i);
            const aktiv = aktivLinks === i;
            return (
              <button
                key={i}
                type="button"
                className={
                  "zu-karte" +
                  (geloestPaar ? " geloest" : "") +
                  (aktiv ? " aktiv" : "")
                }
                onClick={() => waehleLinks(i)}
                disabled={geloestPaar}
                aria-pressed={aktiv}
              >
                {paar.links}
              </button>
            );
          })}
        </div>

        <div className="zu-spalte">
          {rechtsReihenfolge.map((i) => {
            const geloestPaar = geloest.includes(i);
            const warFalsch = fehler === i;
            return (
              <button
                key={i}
                type="button"
                className={
                  "zu-karte" +
                  (geloestPaar ? " geloest" : "") +
                  (warFalsch ? " falsch" : "") +
                  (aktivLinks !== null && !geloestPaar ? " waehlbar" : "")
                }
                onClick={() => waehleRechts(i)}
                disabled={geloestPaar}
              >
                {paare[i].rechts}
              </button>
            );
          })}
        </div>
      </div>

      <p className="zu-hinweis" role="status">
        {fehler !== null
          ? "Passt nicht. Versuch eine andere Karte."
          : aktivLinks !== null
          ? "Jetzt rechts das passende Gegenstück antippen."
          : "Links eine Karte antippen, dann rechts zuordnen."}
      </p>
    </div>
  );
}
