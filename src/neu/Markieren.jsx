import { useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Markieren.css";

// Im Satz markieren: ein Wort im echten Satz anklicken (z.B. den Akkusativ oder
// den Infinitiv im ACI). Authentische Satzanalyse statt Auswahl aus abstrakten
// Optionen, das ist die eigentliche Pruefungs-Faehigkeit. Falsch = Wort blinkt
// rot, neu versuchen; richtig = gruen, weiter. Pro Satz muss es sitzen
// (Mastery), mit Serie und Abschluss-Bilanz.
export default function Markieren({ daten, onAbgeschlossen }) {
  const saetze = daten?.saetze || [];
  const gesamt = saetze.length;

  const [index, setIndex] = useState(0);
  const [geloest, setGeloest] = useState(false);
  const [falschIdx, setFalschIdx] = useState(null);
  const [fehlerHier, setFehlerHier] = useState(false);
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (gesamt === 0)
    return <p className="mk-leer">Für diese Übung gibt es noch keine Sätze.</p>;

  function neuStarten() {
    setIndex(0);
    setGeloest(false);
    setFalschIdx(null);
    setFehlerHier(false);
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === gesamt;
    return (
      <div className="mk">
        <Fertig
          text={`Alle ${gesamt} Sätze analysiert.`}
          bilanz={
            (allesAufAnhieb
              ? "Alles auf Anhieb richtig. Stark."
              : "Die kniffligen hast du beim zweiten Blick erkannt.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Nochmal"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const satz = saetze[index];

  function klick(i) {
    if (geloest) return;
    if (i === satz.ziel) {
      setGeloest(true);
      setFalschIdx(null);
      const n = serie + 1;
      setSerie(n);
      if (n > besteSerie) setBesteSerie(n);
      if (!fehlerHier) setAufAnhieb((a) => a + 1);
    } else {
      setFalschIdx(i);
      setFehlerHier(true);
      setSerie(0);
    }
  }
  function weiter() {
    if (index + 1 >= gesamt) {
      setFertig(true);
      onAbgeschlossen?.();
      return;
    }
    setIndex((i) => i + 1);
    setGeloest(false);
    setFalschIdx(null);
    setFehlerHier(false);
  }

  return (
    <div className="mk">
      <div className="mk-kopf">
        <span className="mk-label">Satz {index + 1} / {gesamt}</span>
        {serie >= 2 && (
          <span className="mk-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="mk-fortschritt" aria-hidden="true">
        <div
          className="mk-fortschritt-fuell"
          style={{ width: (index / gesamt) * 100 + "%" }}
        />
      </div>

      <UebungHinweis id="markieren">
        Lies die Aufgabe und tippe das passende Wort direkt im Satz an.
      </UebungHinweis>

      <p className="mk-frage">{satz.frage}</p>

      <p className="mk-satz">
        {satz.woerter.map((w, i) => {
          const istLoesung = geloest && i === satz.ziel;
          const istFalsch = falschIdx === i;
          return (
            <button
              type="button"
              key={i}
              className={
                "mk-wort" +
                (istLoesung ? " ok" : "") +
                (istFalsch ? " no" : "")
              }
              onClick={() => klick(i)}
              disabled={geloest}
            >
              {w}
            </button>
          );
        })}
      </p>

      {satz.uebersetzung && (
        <p className="mk-uebersetzung">{satz.uebersetzung}</p>
      )}

      {geloest ? (
        <div className="mk-feedback ok">
          {satz.erklaerung && (
            <p className="mk-feedback-text">{satz.erklaerung}</p>
          )}
          <button type="button" className="mk-weiter" onClick={weiter}>
            {index + 1 >= gesamt ? "Fertig" : "Weiter"}
          </button>
        </div>
      ) : falschIdx !== null ? (
        <p className="mk-hinweis" role="status">
          {satz.tipp || "Noch nicht das richtige Wort, versuch es nochmal."}
        </p>
      ) : null}
    </div>
  );
}
