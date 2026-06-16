import { useState } from "react";
import Fertig from "./Fertig";
import "./Auswahlquiz.css";

// Auswahlquiz (Single-Choice) für Materialien: eine Frage nach der anderen, je
// 2-4 Antwortmöglichkeiten. Antippen wählt direkt aus und rastet ein: die
// richtige Option wird grün, eine falsche Wahl rot (richtige bleibt markiert).
// Optional eine kurze Erklärung. "Weiter" geht zur nächsten Frage, am Ende ein
// ruhiges Ergebnis mit "nochmal". Selbsttest mit fester Lösung im Material,
// kein Antwort-Generator (anders als das generatorbasierte Quiz beim Üben).

// Mischt die Optionen einer Frage, ohne die Lösung zu verraten: liefert eine
// Permutation der Original-Indizes, die Richtig-Markierung bleibt über den
// Original-Index erhalten. Verhindert, dass man die Position statt des Inhalts lernt.
function mischeIndizes(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Auswahlquiz({ daten }) {
  const fragen = (daten && daten.fragen) || [];
  const [index, setIndex] = useState(0);
  const [gewaehlt, setGewaehlt] = useState(null); // gewählter Options-Index (Original)
  const [punkte, setPunkte] = useState(0);
  const [fertig, setFertig] = useState(false);
  const [reihenfolgen, setReihenfolgen] = useState(() =>
    fragen.map((f) => mischeIndizes((f.optionen || []).length))
  );

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
    // Neu mischen, damit die zweite Runde nicht identisch ist.
    setReihenfolgen(fragen.map((f) => mischeIndizes((f.optionen || []).length)));
  }

  if (fertig) {
    const alle = fragen.length;
    return (
      <div className="aq">
        <Fertig
          text={`${punkte} von ${alle} richtig`}
          bilanz={
            punkte === alle
              ? "Alles sitzt. Stark."
              : "Schau dir die offenen Fragen noch einmal an."
          }
          onNochmal={nochmal}
        />
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
        {(reihenfolgen[index] || frage.optionen.map((_, i) => i)).map((i) => {
          // i ist der Original-Index der Option (Reihenfolge gemischt).
          const opt = frage.optionen[i];
          // Option ist entweder ein String oder { text, erklaerung }.
          const text = typeof opt === "string" ? opt : opt.text;
          const erkl = typeof opt === "string" ? null : opt.erklaerung;
          let status = "";
          if (beantwortet) {
            if (i === frage.richtig) status = "ok";
            else if (i === gewaehlt) status = "no";
          }
          // Erklaerung der richtigen Option immer zeigen, der eben falsch
          // gewaehlten auch (damit man versteht, warum nicht).
          const zeigeErkl =
            beantwortet && erkl && (i === frage.richtig || i === gewaehlt);
          return (
            <div className="aq-option-zeile" key={i}>
              <button
                type="button"
                className={"aq-option" + (status ? " " + status : "")}
                onClick={() => waehle(i)}
                disabled={beantwortet}
              >
                <span className="aq-marke" aria-hidden="true">
                  {status === "ok" ? "✓" : status === "no" ? "✕" : ""}
                </span>
                <span className="aq-option-text">{text}</span>
              </button>
              {zeigeErkl && (
                <p
                  className={
                    "aq-option-erkl" + (status === "ok" ? " ok" : " no")
                  }
                >
                  {erkl}
                </p>
              )}
            </div>
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
