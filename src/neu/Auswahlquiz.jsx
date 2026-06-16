import { useState } from "react";
import "./Auswahlquiz.css";

// Auswahlquiz (Single-Choice) für Materialien: eine Frage nach der anderen, je
// 2-4 Antwortmöglichkeiten. Antippen wählt direkt aus und rastet ein: die
// richtige Option wird grün, eine falsche Wahl rot (richtige bleibt markiert).
// Optional eine kurze Erklärung. "Weiter" geht zur nächsten Frage, am Ende ein
// ruhiges Ergebnis mit "nochmal". Selbsttest mit fester Lösung im Material,
// kein Antwort-Generator (anders als das generatorbasierte Quiz beim Üben).

export default function Auswahlquiz({ daten }) {
  const fragen = (daten && daten.fragen) || [];
  const [index, setIndex] = useState(0);
  const [gewaehlt, setGewaehlt] = useState(null); // gewählter Options-Index
  const [punkte, setPunkte] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (fragen.length === 0)
    return <p className="aq-leer">Für dieses Quiz gibt es noch keine Fragen.</p>;

  function waehle(i) {
    if (gewaehlt !== null) return; // schon beantwortet
    setGewaehlt(i);
    if (i === fragen[index].richtig) setPunkte((p) => p + 1);
  }

  function weiter() {
    if (index + 1 >= fragen.length) {
      setFertig(true);
      return;
    }
    setIndex((i) => i + 1);
    setGewaehlt(null);
  }

  function nochmal() {
    setIndex(0);
    setGewaehlt(null);
    setPunkte(0);
    setFertig(false);
  }

  if (fertig) {
    const alle = fragen.length;
    return (
      <div className="aq">
        <div className="aq-fertig">
          <span className="aq-haken" aria-hidden="true">
            ✓
          </span>
          <p className="aq-fertig-text">
            {punkte} von {alle} richtig
          </p>
          <p className="aq-fertig-bilanz">
            {punkte === alle
              ? "Alles sitzt. Stark."
              : "Schau dir die offenen Fragen noch einmal an."}
          </p>
          <button type="button" className="aq-neu" onClick={nochmal}>
            Nochmal
          </button>
        </div>
      </div>
    );
  }

  const frage = fragen[index];
  const beantwortet = gewaehlt !== null;

  return (
    <div className="aq">
      <div className="aq-kopf">
        <span className="aq-label">Quiz</span>
        <span className="aq-fortschritt">
          {index + 1} / {fragen.length}
        </span>
      </div>

      <p className="aq-frage">{frage.frage}</p>

      <div className="aq-optionen">
        {frage.optionen.map((opt, i) => {
          let status = "";
          if (beantwortet) {
            if (i === frage.richtig) status = "ok";
            else if (i === gewaehlt) status = "no";
          }
          return (
            <button
              key={i}
              type="button"
              className={"aq-option" + (status ? " " + status : "")}
              onClick={() => waehle(i)}
              disabled={beantwortet}
            >
              <span className="aq-marke" aria-hidden="true">
                {status === "ok" ? "✓" : status === "no" ? "✕" : ""}
              </span>
              <span className="aq-option-text">{opt}</span>
            </button>
          );
        })}
      </div>

      {beantwortet && frage.erklaerung && (
        <p className="aq-erklaerung">{frage.erklaerung}</p>
      )}

      {beantwortet && (
        <button type="button" className="aq-weiter" onClick={weiter}>
          {index + 1 >= fragen.length ? "Ergebnis" : "Weiter"}
        </button>
      )}
    </div>
  );
}
