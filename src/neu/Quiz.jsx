import { useState } from "react";
import { neueAufgaben, macheOptionen } from "../lib/aufgabenGeneratoren";
import Fertig from "./Fertig";
import "./Quiz.css";

// Interaktives Üben zu einem Etappenziel als echte Lern-Session: eine feste
// Runde Aufgaben, sofortiges Feedback mit Hinweis, und falsch beantwortete
// Aufgaben kommen am Ende erneut dran, bis sie sitzen (Mastery, wie bei
// Duolingo). Eine Serie zeigt den eigenen Schwung (rein selbstbezogen, kein
// Vergleich). Am Ende eine ruhige Bilanz. Kein Tracking nach außen.

const SESSION = 6;

function baueSession(key) {
  const aufgaben = neueAufgaben(key, [], SESSION);
  return aufgaben.map((a) => ({ aufgabe: a, optionen: macheOptionen(a, key) }));
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
  // Die ganze Sessions-Mechanik in einem State, damit eine Runde konsistent
  // weiterläuft (Durchgang, Warteschlange, Position, falsche zum Nacharbeiten).
  const [s, setS] = useState(() => {
    const q = baueSession(generatorKey);
    return { durchgang: 1, queue: q, pos: 0, falsche: [], startAnzahl: q.length };
  });
  const [gewaehlt, setGewaehlt] = useState(null);
  const [eingabe, setEingabe] = useState("");
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (s.startAnzahl === 0)
    return <p className="qz-leer">Für dieses Ziel gibt es noch keine Übung.</p>;

  function neuStarten() {
    const q = baueSession(generatorKey);
    setS({ durchgang: 1, queue: q, pos: 0, falsche: [], startAnzahl: q.length });
    setGewaehlt(null);
    setEingabe("");
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === s.startAnzahl;
    return (
      <div className="qz">
        <Fertig
          text={`Alle ${s.startAnzahl} gemeistert.`}
          bilanz={
            (allesAufAnhieb
              ? "Alles auf Anhieb richtig. Stark."
              : "Die kniffligen hast du nachgearbeitet, jetzt sitzen sie.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Neue Runde"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const item = s.queue[s.pos];
  const { aufgabe, optionen } = item;
  const hatOptionen = optionen && optionen.length >= 2;
  const beantwortet = gewaehlt !== null;
  const warRichtig = beantwortet && istRichtig(aufgabe, gewaehlt);
  const istNacharbeit = s.durchgang > 1;
  const proz = Math.round((s.pos / s.queue.length) * 100);

  function antworten(antwort) {
    if (beantwortet || !String(antwort).trim()) return;
    setGewaehlt(antwort);
    if (istRichtig(aufgabe, antwort)) {
      const n = serie + 1;
      setSerie(n);
      if (n > besteSerie) setBesteSerie(n);
      if (s.durchgang === 1) setAufAnhieb((v) => v + 1);
    } else {
      setSerie(0);
    }
  }

  function weiter() {
    const ok = istRichtig(aufgabe, gewaehlt);
    // Falsche Aufgabe für die Nacharbeit vormerken (keine Doppelten).
    const neueFalsche =
      ok || s.falsche.includes(item) ? s.falsche : [...s.falsche, item];
    const naechstePos = s.pos + 1;
    if (naechstePos < s.queue.length) {
      setS({ ...s, pos: naechstePos, falsche: neueFalsche });
    } else if (neueFalsche.length > 0) {
      // Durchgang zu Ende, aber es gibt noch Falsche: Nacharbeits-Runde.
      setS({
        durchgang: s.durchgang + 1,
        queue: neueFalsche,
        pos: 0,
        falsche: [],
        startAnzahl: s.startAnzahl,
      });
    } else {
      setFertig(true);
    }
    setGewaehlt(null);
    setEingabe("");
  }

  return (
    <div className="qz">
      <div className="qz-kopf">
        <span className="qz-label">
          {istNacharbeit ? "Nochmal" : "Aufgabe"} {s.pos + 1} / {s.queue.length}
        </span>
        {serie >= 2 && (
          <span className="qz-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="qz-fortschritt" aria-hidden="true">
        <div className="qz-fortschritt-fuell" style={{ width: proz + "%" }} />
      </div>

      {istNacharbeit && s.pos === 0 && (
        <p className="qz-nacharbeit">Diese noch einmal, dann sitzen sie.</p>
      )}

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
            autoComplete="off"
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
            {s.pos + 1 < s.queue.length
              ? "Weiter →"
              : s.falsche.length > 0 || !warRichtig
                ? "Zur Nacharbeit →"
                : "Fertig →"}
          </button>
        </div>
      )}
    </div>
  );
}
