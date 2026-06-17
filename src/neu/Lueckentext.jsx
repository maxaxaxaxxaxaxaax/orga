import { useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Lueckentext.css";

// Lückentext (Cloze) als Lern-Session: Satz mit einer Lücke zwischen "vor" und
// "nach". Der Schüler tippt die Lösung, sofortige Prüfung (case-insensitive,
// getrimmt, mehrere erlaubte Lösungen über ein Array). Falsch beantwortete Sätze
// kommen am Ende erneut dran, bis sie sitzen (Mastery, wie bei Duolingo). Eine
// Serie zeigt den eigenen Schwung. Reiner Übungsmodus, kein Tracking nach außen.

function istRichtig(loesung, eingabe) {
  const a = eingabe.trim().toLowerCase();
  if (!a) return false;
  const moeglich = Array.isArray(loesung) ? loesung : [loesung];
  return moeglich.some((l) => String(l).trim().toLowerCase() === a);
}

function loesungText(loesung) {
  return Array.isArray(loesung) ? loesung[0] : String(loesung);
}

export default function Lueckentext({ daten }) {
  const saetze = daten?.saetze || [];

  // Sessions-Maschine: aktueller Durchgang, Warteschlange, Position, falsche zum
  // Nacharbeiten. So kommen knifflige Sätze am Ende erneut dran.
  const [s, setS] = useState(() => ({
    durchgang: 1,
    queue: saetze,
    pos: 0,
    falsche: [],
    startAnzahl: saetze.length,
  }));
  const [eingabe, setEingabe] = useState("");
  const [geprueft, setGeprueft] = useState(false);
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (s.startAnzahl === 0)
    return <p className="lt-leer">Keine Sätze vorhanden.</p>;

  function neuStarten() {
    setS({ durchgang: 1, queue: saetze, pos: 0, falsche: [], startAnzahl: saetze.length });
    setEingabe("");
    setGeprueft(false);
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === s.startAnzahl;
    return (
      <div className="lt">
        <Fertig
          text={`Alle ${s.startAnzahl} Sätze geschafft.`}
          bilanz={
            (allesAufAnhieb
              ? "Alles auf Anhieb richtig. Stark."
              : "Die kniffligen hast du nachgearbeitet, jetzt sitzen sie.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Nochmal von vorn"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const satz = s.queue[s.pos];
  const warRichtig = geprueft && istRichtig(satz.loesung, eingabe);
  const istNacharbeit = s.durchgang > 1;
  const proz = Math.round((s.pos / s.queue.length) * 100);

  function pruefen() {
    if (geprueft || !eingabe.trim()) return;
    setGeprueft(true);
    if (istRichtig(satz.loesung, eingabe)) {
      const n = serie + 1;
      setSerie(n);
      if (n > besteSerie) setBesteSerie(n);
      if (s.durchgang === 1) setAufAnhieb((v) => v + 1);
    } else {
      setSerie(0);
    }
  }

  function weiter() {
    const ok = istRichtig(satz.loesung, eingabe);
    const neueFalsche =
      ok || s.falsche.includes(satz) ? s.falsche : [...s.falsche, satz];
    const naechste = s.pos + 1;
    if (naechste < s.queue.length) {
      setS({ ...s, pos: naechste, falsche: neueFalsche });
    } else if (neueFalsche.length > 0) {
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
    setEingabe("");
    setGeprueft(false);
  }

  return (
    <div className="lt">
      <div className="lt-kopf">
        <span className="lt-label">
          {istNacharbeit ? "Nochmal" : "Lückentext"} {s.pos + 1} / {s.queue.length}
        </span>
        {serie >= 2 && (
          <span className="lt-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="lt-fortschritt" aria-hidden="true">
        <div className="lt-fortschritt-fuell" style={{ width: proz + "%" }} />
      </div>

      {istNacharbeit && s.pos === 0 && (
        <p className="lt-nacharbeit">Diese noch einmal, dann sitzen sie.</p>
      )}

      <UebungHinweis id="lueckentext">
        Tippe die fehlende Lösung in die Lücke und drücke Enter oder Prüfen.
      </UebungHinweis>

      <p className="lt-satz">
        {satz.vor}
        {geprueft ? (
          <span className={"lt-luecke-fest " + (warRichtig ? "ok" : "no")}>
            {eingabe.trim() || loesungText(satz.loesung)}
          </span>
        ) : (
          <input
            className="lt-luecke"
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pruefen();
            }}
            placeholder="…"
            aria-label="Lücke ausfüllen"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        )}
        {satz.nach}
      </p>

      {!geprueft && eingabe.trim() && (
        <p className="lt-enter-hinweis">Drücke Enter, um zu prüfen.</p>
      )}

      {/* Gestaffelter Tipp: erste Runde ohne Tipp (selbst probieren), in der
          Nacharbeit proaktiv (man hat ihn schon einmal verfehlt). */}
      {satz.tipp && !geprueft && istNacharbeit && (
        <p className="lt-tipp">Tipp: {satz.tipp}</p>
      )}

      {geprueft && (
        <div className={"lt-feedback " + (warRichtig ? "ok" : "no")}>
          {warRichtig ? (
            <p className="lt-feedback-text">Richtig.</p>
          ) : (
            <>
              <p className="lt-feedback-text">
                Nicht ganz. Richtig:{" "}
                <strong>{loesungText(satz.loesung)}</strong>
              </p>
              {satz.tipp && <p className="lt-tipp">Tipp: {satz.tipp}</p>}
            </>
          )}
        </div>
      )}

      <div className="lt-aktionen">
        {!geprueft ? (
          <button
            type="button"
            className="lt-pruefen"
            onClick={pruefen}
            disabled={!eingabe.trim()}
          >
            Prüfen
          </button>
        ) : (
          <button type="button" className="lt-weiter" onClick={weiter}>
            {s.pos + 1 < s.queue.length
              ? "Weiter"
              : s.falsche.length > 0 || !warRichtig
                ? "Zur Nacharbeit"
                : "Fertig"}
          </button>
        )}
      </div>
    </div>
  );
}
