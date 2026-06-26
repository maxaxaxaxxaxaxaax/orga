import { useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Auswahlquiz.css";

// Auswahlquiz (Single-Choice) als Lern-Session: eine Frage nach der anderen, je
// 2-4 Antwortmöglichkeiten (gemischt, damit man den Inhalt lernt statt der
// Position). Antippen wählt direkt aus und rastet ein: die richtige Option wird
// grün, eine falsche Wahl rot. Falsch beantwortete Fragen kommen am Ende erneut
// dran, bis sie sitzen (Mastery, wie bei Duolingo). Eine Serie zeigt den eigenen
// Schwung. Optional kurze Erklärungen. Selbsttest mit fester Lösung im Material.

function mischeIndizes(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Eine Frage plus die (einmalig gemischte) Reihenfolge ihrer Optionen.
function baueQueue(fragen) {
  return fragen.map((f) => ({
    frage: f,
    ord: mischeIndizes((f.optionen || []).length),
  }));
}

export default function Auswahlquiz({ daten, onAbgeschlossen }) {
  const fragen = (daten && daten.fragen) || [];

  const [s, setS] = useState(() => ({
    durchgang: 1,
    queue: baueQueue(fragen),
    pos: 0,
    falsche: [],
    startAnzahl: fragen.length,
  }));
  const [gewaehlt, setGewaehlt] = useState(null); // gewählter Options-Index (Original)
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (s.startAnzahl === 0)
    return <p className="aq-leer">Für dieses Quiz gibt es noch keine Fragen.</p>;

  function neuStarten() {
    setS({ durchgang: 1, queue: baueQueue(fragen), pos: 0, falsche: [], startAnzahl: fragen.length });
    setGewaehlt(null);
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === s.startAnzahl;
    return (
      <div className="aq">
        <Fertig
          text={`Alle ${s.startAnzahl} Fragen gemeistert.`}
          bilanz={
            (allesAufAnhieb
              ? "Alles auf Anhieb richtig. Stark."
              : "Die kniffligen hast du nachgearbeitet, jetzt sitzen sie.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Nochmal"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const item = s.queue[s.pos];
  const frage = item.frage;
  const beantwortet = gewaehlt !== null;
  const istNacharbeit = s.durchgang > 1;
  const proz = Math.round((s.pos / s.queue.length) * 100);

  function waehle(i) {
    if (beantwortet) return;
    setGewaehlt(i);
    if (i === frage.richtig) {
      const n = serie + 1;
      setSerie(n);
      if (n > besteSerie) setBesteSerie(n);
      if (s.durchgang === 1) setAufAnhieb((v) => v + 1);
    } else {
      setSerie(0);
    }
  }

  function weiter() {
    const ok = gewaehlt === frage.richtig;
    const neueFalsche =
      ok || s.falsche.includes(item) ? s.falsche : [...s.falsche, item];
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
      onAbgeschlossen?.();
    }
    setGewaehlt(null);
  }

  return (
    <div className="aq">
      <div className="aq-kopf">
        <span className="aq-label">
          {istNacharbeit ? "Nochmal" : "Quiz"} {s.pos + 1} / {s.queue.length}
        </span>
        {serie >= 2 && (
          <span className="aq-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="aq-fortschritt" aria-hidden="true">
        <div className="aq-fortschritt-fuell" style={{ width: proz + "%" }} />
      </div>

      {istNacharbeit && s.pos === 0 && (
        <p className="aq-nacharbeit">Diese noch einmal, dann sitzen sie.</p>
      )}

      <UebungHinweis id="auswahlquiz">
        Tippe die Antwort an, die du für richtig hältst.
      </UebungHinweis>

      <p className="aq-frage">{frage.frage}</p>

      <div className="aq-optionen">
        {(item.ord || frage.optionen.map((_, i) => i)).map((i) => {
          // i ist der Original-Index der Option (Reihenfolge gemischt).
          const opt = frage.optionen[i];
          const text = typeof opt === "string" ? opt : opt.text;
          const erkl = typeof opt === "string" ? null : opt.erklaerung;
          let status = "";
          if (beantwortet) {
            if (i === frage.richtig) status = "ok";
            else if (i === gewaehlt) status = "no";
          }
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
          {s.pos + 1 < s.queue.length
            ? "Weiter"
            : s.falsche.length > 0 || gewaehlt !== frage.richtig
              ? "Zur Nacharbeit"
              : "Ergebnis"}
        </button>
      )}
    </div>
  );
}
