import { useState } from "react";
import "./Lueckentext.css";

// Lückentext (Cloze): Satz mit einer Lücke zwischen "vor" und "nach". Der Schüler
// tippt die Lösung, sofortige Prüfung (case-insensitive, getrimmt, mehrere erlaubte
// Lösungen über ein Array). Fortschritt im Kopf, ruhiger Fertig-Zustand mit "nochmal".
// Reiner Übungsmodus, kein Tracking nach außen.

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
  const gesamt = saetze.length;

  const [index, setIndex] = useState(0);
  const [eingabe, setEingabe] = useState("");
  const [geprueft, setGeprueft] = useState(false);
  const [richtig, setRichtig] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (gesamt === 0) return <p className="lt-leer">Keine Sätze vorhanden.</p>;

  function neuStarten() {
    setIndex(0);
    setEingabe("");
    setGeprueft(false);
    setRichtig(0);
    setFertig(false);
  }

  if (fertig) {
    return (
      <div className="lt lt-fertig">
        <div className="lt-fertig-haken" aria-hidden="true">
          ✓
        </div>
        <p className="lt-fertig-text">Alle {gesamt} Sätze geschafft.</p>
        <p className="lt-fertig-bilanz">
          {richtig} von {gesamt} auf Anhieb richtig.
        </p>
        <button type="button" className="lt-neu" onClick={neuStarten}>
          Nochmal von vorn
        </button>
      </div>
    );
  }

  const satz = saetze[index];
  const warRichtig = geprueft && istRichtig(satz.loesung, eingabe);

  function pruefen() {
    if (geprueft || !eingabe.trim()) return;
    setGeprueft(true);
    if (istRichtig(satz.loesung, eingabe)) setRichtig((r) => r + 1);
  }

  function weiter() {
    if (index + 1 >= gesamt) {
      setFertig(true);
      return;
    }
    setIndex((i) => i + 1);
    setEingabe("");
    setGeprueft(false);
  }

  return (
    <div className="lt">
      <div className="lt-kopf">
        <span className="lt-label">Lückentext</span>
        <span className="lt-fortschritt">
          {index + 1} / {gesamt}
        </span>
      </div>

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

      {satz.tipp && !geprueft && <p className="lt-tipp">Tipp: {satz.tipp}</p>}

      {geprueft && (
        <div className={"lt-feedback " + (warRichtig ? "ok" : "no")}>
          {warRichtig ? (
            <p className="lt-feedback-text">Richtig.</p>
          ) : (
            <p className="lt-feedback-text">
              Nicht ganz. Richtig: <strong>{loesungText(satz.loesung)}</strong>
            </p>
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
            {index + 1 >= gesamt ? "Fertig" : "Weiter"}
          </button>
        )}
      </div>
    </div>
  );
}
