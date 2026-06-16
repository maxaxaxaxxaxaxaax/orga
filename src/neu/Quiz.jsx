import { useState } from "react";
import { neueAufgabe, macheOptionen } from "../lib/aufgabenGeneratoren";
import "./Quiz.css";

// Interaktives Üben zu einem Etappenziel: Frage -> antworten -> sofortige
// Prüfung mit Hinweis -> nächste Aufgabe. Nutzt die Aufgaben-Generatoren.

function macheRunde(gen, history) {
  const aufgabe = neueAufgabe(gen, history);
  if (!aufgabe) return null;
  return { aufgabe, optionen: macheOptionen(aufgabe, gen) };
}

function istRichtig(aufgabe, antwort) {
  const a = String(antwort).trim().toLowerCase();
  if (Array.isArray(aufgabe.loesung)) {
    return aufgabe.loesung.some((l) => String(l).trim().toLowerCase() === a);
  }
  return String(aufgabe.loesung).trim().toLowerCase() === a;
}

function loesungText(aufgabe) {
  return Array.isArray(aufgabe.loesung)
    ? aufgabe.loesung[0]
    : String(aufgabe.loesung);
}

export default function Quiz({ generatorKey }) {
  const [runde, setRunde] = useState(() => macheRunde(generatorKey, []));
  const [history, setHistory] = useState(() => (runde ? [runde.aufgabe] : []));
  const [gewaehlt, setGewaehlt] = useState(null);
  const [eingabe, setEingabe] = useState("");
  const [richtig, setRichtig] = useState(0);
  const [gesamt, setGesamt] = useState(0);

  if (!runde) return <p className="qz-leer">Für dieses Ziel gibt es noch keine Übung.</p>;

  const { aufgabe, optionen } = runde;
  const hatOptionen = optionen && optionen.length >= 2;
  const beantwortet = gewaehlt !== null;
  const warRichtig = beantwortet && istRichtig(aufgabe, gewaehlt);

  function antworten(antwort) {
    if (beantwortet || !String(antwort).trim()) return;
    setGewaehlt(antwort);
    setGesamt((g) => g + 1);
    if (istRichtig(aufgabe, antwort)) setRichtig((r) => r + 1);
  }
  function weiter() {
    const naechste = macheRunde(generatorKey, history);
    setRunde(naechste);
    if (naechste) setHistory((h) => [...h, naechste.aufgabe]);
    setGewaehlt(null);
    setEingabe("");
  }

  return (
    <div className="qz">
      <div className="qz-kopf">
        <span className="qz-label">Aufgabe</span>
        <span className="qz-score">
          {richtig} / {gesamt} richtig
        </span>
      </div>
      <p className="qz-frage">{aufgabe.frage}</p>

      {hatOptionen ? (
        <div className="qz-optionen">
          {optionen.map((opt, i) => {
            let cls = "qz-option";
            if (beantwortet) {
              if (istRichtig(aufgabe, opt)) cls += " richtig";
              else if (opt === gewaehlt) cls += " falsch";
            }
            return (
              <button
                key={i}
                type="button"
                className={cls}
                onClick={() => antworten(opt)}
                disabled={beantwortet}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          className="qz-eingabe"
          onSubmit={(e) => {
            e.preventDefault();
            antworten(eingabe);
          }}
        >
          <input
            className="qz-input"
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            placeholder="Deine Antwort"
            disabled={beantwortet}
            aria-label="Antwort"
          />
          <button
            className="qz-pruefen"
            type="submit"
            disabled={beantwortet || !eingabe.trim()}
          >
            Prüfen
          </button>
        </form>
      )}

      {beantwortet && (
        <div className={"qz-feedback " + (warRichtig ? "ok" : "no")}>
          {warRichtig ? (
            <p className="qz-feedback-text">Richtig! ✓</p>
          ) : (
            <>
              <p className="qz-feedback-text">
                Nicht ganz. Richtig: <strong>{loesungText(aufgabe)}</strong>
              </p>
              {aufgabe.hint && <p className="qz-hint">{aufgabe.hint}</p>}
            </>
          )}
          <button type="button" className="qz-weiter" onClick={weiter}>
            Nächste Aufgabe →
          </button>
        </div>
      )}
    </div>
  );
}
