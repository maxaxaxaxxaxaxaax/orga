import { useEffect, useMemo, useState } from "react";
import {
  macheOptionen,
  neueAufgaben,
  hatGenerator,
} from "../lib/aufgabenGeneratoren";
import {
  strategieWahlSpeichern,
  strategieErgebnisSpeichern,
  strategieLabel,
} from "../lib/strategien";
import StrategieWahl from "./StrategieWahl";
import StrategieIntro from "./StrategieIntro";

// Quiz-Modus für die Übungen: eine Aufgabe groß, vier Antwort-Karten, sofortige
// Animation, Auto-Advance. Am Ende: Ergebnis-Screen mit Frische Runde /
// Dieselben nochmal. "Aufhören" mittendrin springt zum Ergebnis mit dem
// aktuellen Stand.
//
// Vor jedem Quiz-Start wählt der Schüler eine Lern-Strategie. Die Wahl
// + das Ergebnis werden für das Lerntagebuch persistiert (lib/strategien).
export default function UebungenQuiz({
  aufgaben,
  generator,
  fach,
  thema,
  inhalt,
}) {
  const [pool, setPool] = useState(aufgaben);
  const [aktuell, setAktuell] = useState(0);
  const [auswahl, setAuswahl] = useState(null);
  const [richtige, setRichtige] = useState(0);
  const [falsche, setFalsche] = useState(0);
  const [fertig, setFertig] = useState(false);
  const [strategie, setStrategie] = useState(null);
  const [strategieEintragId, setStrategieEintragId] = useState(null);
  const [introFertig, setIntroFertig] = useState(false);

  const aufgabe = pool[aktuell];

  const optionen = useMemo(() => {
    if (!aufgabe) return [];
    const opts = macheOptionen(aufgabe, generator);
    if (opts && opts.length >= 2) return opts;
    // Fallback: nur die richtige Antwort plus drei Platzhalter
    const richtige = Array.isArray(aufgabe.loesung)
      ? aufgabe.loesung[0]
      : aufgabe.loesung;
    return [String(richtige)];
  }, [aufgabe, generator]);

  const richtigeAntwort = aufgabe
    ? String(
        Array.isArray(aufgabe.loesung)
          ? aufgabe.loesung[0]
          : aufgabe.loesung,
      )
    : null;

  function istRichtig(option) {
    if (!aufgabe) return false;
    const erlaubt = Array.isArray(aufgabe.loesung)
      ? aufgabe.loesung
      : [aufgabe.loesung];
    return erlaubt.some(
      (l) => String(l).trim().toLowerCase() === String(option).trim().toLowerCase(),
    );
  }

  useEffect(() => {
    if (auswahl == null) return;
    const wartezeit = istRichtig(auswahl) ? 700 : 1500;
    const t = setTimeout(() => {
      if (aktuell + 1 >= pool.length) {
        setFertig(true);
      } else {
        setAktuell((i) => i + 1);
      }
      setAuswahl(null);
    }, wartezeit);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auswahl]);

  // Sobald das Quiz fertig wird, das Ergebnis zum Strategie-Eintrag nachtragen.
  // Läuft beim Übergang von fertig=false zu fertig=true.
  useEffect(() => {
    if (!fertig || !strategieEintragId) return;
    strategieErgebnisSpeichern(strategieEintragId, {
      richtig: richtige,
      gesamt: richtige + falsche,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fertig]);

  function waehleAntwort(option) {
    if (auswahl != null) return;
    setAuswahl(option);
    if (istRichtig(option)) setRichtige((n) => n + 1);
    else setFalsche((n) => n + 1);
  }

  function waehleStrategie(strategieId) {
    const id = strategieWahlSpeichern({
      fach,
      thema,
      strategie: strategieId,
    });
    setStrategie(strategieId);
    setStrategieEintragId(id);
    // "Selbst probieren" hat kein Intro, alle anderen schon.
    setIntroFertig(strategieId === "selbst");
  }

  function nochmal() {
    setAktuell(0);
    setAuswahl(null);
    setRichtige(0);
    setFalsche(0);
    setFertig(false);
    setStrategie(null);
    setStrategieEintragId(null);
    setIntroFertig(false);
  }

  function frischeRunde() {
    if (!generator || !hatGenerator(generator)) {
      nochmal();
      return;
    }
    const neu = neueAufgaben(generator, [], pool.length || 5);
    if (neu.length === 0) {
      nochmal();
      return;
    }
    setPool(neu);
    setAktuell(0);
    setAuswahl(null);
    setRichtige(0);
    setFalsche(0);
    setFertig(false);
    setStrategie(null);
    setStrategieEintragId(null);
    setIntroFertig(false);
  }

  // Strategie-Wahl zuerst: bevor das Quiz startet
  if (!strategie) {
    return <StrategieWahl onWaehlen={waehleStrategie} themaLabel={thema} />;
  }

  // Strategie-Intro: für alle Strategien außer "selbst"
  if (!introFertig) {
    return (
      <StrategieIntro
        strategie={strategie}
        inhalt={inhalt}
        themaLabel={thema}
        onFertig={() => setIntroFertig(true)}
      />
    );
  }

  if (fertig) {
    const summe = richtige + falsche;
    const prozent = summe > 0 ? Math.round((richtige / summe) * 100) : 0;
    return (
      <div className="quiz-ergebnis">
        <div className="quiz-ergebnis-zahl">
          {richtige}
          <span className="quiz-ergebnis-aus">/{summe}</span>
        </div>
        <p className="quiz-ergebnis-prozent">{prozent}% richtig</p>
        {strategie && (
          <p className="quiz-ergebnis-strategie">
            mit Strategie <strong>{strategieLabel(strategie)}</strong>
          </p>
        )}
        <p className="quiz-ergebnis-text">
          {prozent === 100
            ? "Perfekt. Du hast es drauf."
            : prozent >= 80
            ? "Stark. Eine Runde noch und es sitzt."
            : prozent >= 50
            ? "Nicht schlecht. Probier eine frische Runde."
            : "Noch wackelig. Schau die Erklärung nochmal an, dann nochmal."}
        </p>
        <div className="quiz-ergebnis-aktionen">
          {generator && hatGenerator(generator) && (
            <button className="primary-btn" onClick={frischeRunde}>
              Frische Runde
            </button>
          )}
          <button
            className={
              generator && hatGenerator(generator) ? "ghost-btn" : "primary-btn"
            }
            onClick={nochmal}
          >
            Dieselben nochmal
          </button>
        </div>
      </div>
    );
  }

  const fortschritt = ((aktuell + (auswahl ? 1 : 0)) / pool.length) * 100;

  return (
    <div className="quiz">
      <div className="quiz-kopf">
        <div className="quiz-fortschritt" aria-hidden="true">
          <div
            className="quiz-fortschritt-fuell"
            style={{ width: fortschritt + "%" }}
          />
        </div>
        <div className="quiz-meta">
          <span className="quiz-zaehler">
            Frage {aktuell + 1} <span className="quiz-zaehler-aus">von {pool.length}</span>
          </span>
          <button
            type="button"
            className="quiz-abbrechen"
            onClick={() => setFertig(true)}
            aria-label="Quiz beenden und Ergebnis anschauen"
          >
            Aufhören
          </button>
        </div>
      </div>

      <div className="quiz-frage" role="status" aria-live="polite">
        {aufgabe.frage}
      </div>

      <div className="quiz-optionen">
        {optionen.map((opt) => {
          let cls = "quiz-option";
          if (auswahl != null) {
            const ausgewaehlt = opt === auswahl;
            const richtigeOption = istRichtig(opt);
            if (ausgewaehlt && richtigeOption) cls += " gewaehlt-richtig";
            else if (ausgewaehlt && !richtigeOption) cls += " gewaehlt-falsch";
            else if (!ausgewaehlt && richtigeOption) cls += " richtig-zeigen";
          }
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              onClick={() => waehleAntwort(opt)}
              disabled={auswahl != null}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {auswahl != null && !istRichtig(auswahl) && aufgabe.hint && (
        <p className="quiz-hint">
          💡 {aufgabe.hint} Richtig wäre <strong>{richtigeAntwort}</strong>.
        </p>
      )}
    </div>
  );
}
