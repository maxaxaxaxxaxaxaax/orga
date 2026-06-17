import { useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Bildzuordnung.css";

// Plan-Uebung (raeumliche Zuordnung): eine englische Frage ("Where are the
// toilets?") wird beantwortet, indem man den richtigen Raum auf einem Plan
// antippt. Eine andere Interaktions-Modalitaet als die Text-Zuordnung: Vokabel
// im raeumlichen Kontext statt Paar-Matching. Falsch = der Raum blinkt rot, neu
// versuchen; richtig = gruen, weiter. Pro Frage muss es sitzen (Mastery), mit
// Serie und Abschluss-Bilanz.

// Raster-Position (3 Spalten) eines Raums aus seinem Index.
function platz(i) {
  const spalte = i % 3;
  const reihe = Math.floor(i / 3);
  return { x: 16 + spalte * 116, y: 38 + reihe * 100 };
}
const RAUM_W = 104;
const RAUM_H = 84;

export default function Bildzuordnung({ daten }) {
  const raeume = daten?.raeume || [];
  const fragen = daten?.fragen || [];
  const gesamt = fragen.length;

  const [index, setIndex] = useState(0);
  const [geloest, setGeloest] = useState(false);
  const [falschId, setFalschId] = useState(null);
  const [fehlerHier, setFehlerHier] = useState(false);
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (gesamt === 0 || raeume.length === 0)
    return <p className="bz-leer">Für diese Übung gibt es noch keinen Plan.</p>;

  function neuStarten() {
    setIndex(0);
    setGeloest(false);
    setFalschId(null);
    setFehlerHier(false);
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === gesamt;
    return (
      <div className="bz">
        <Fertig
          text={`Alle ${gesamt} Orte gefunden.`}
          bilanz={
            (allesAufAnhieb
              ? "Alles auf Anhieb richtig. Stark."
              : "Die kniffligen hast du beim zweiten Blick gefunden.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Nochmal"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const frage = fragen[index];

  function klick(raumId) {
    if (geloest) return;
    if (raumId === frage.raum) {
      setGeloest(true);
      setFalschId(null);
      const n = serie + 1;
      setSerie(n);
      if (n > besteSerie) setBesteSerie(n);
      if (!fehlerHier) setAufAnhieb((a) => a + 1);
    } else {
      setFalschId(raumId);
      setFehlerHier(true);
      setSerie(0);
    }
  }
  function weiter() {
    if (index + 1 >= gesamt) {
      setFertig(true);
      return;
    }
    setIndex((i) => i + 1);
    setGeloest(false);
    setFalschId(null);
    setFehlerHier(false);
  }

  return (
    <div className="bz">
      <div className="bz-kopf">
        <span className="bz-label">Plan {index + 1} / {gesamt}</span>
        {serie >= 2 && (
          <span className="bz-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="bz-fortschritt" aria-hidden="true">
        <div
          className="bz-fortschritt-fuell"
          style={{ width: (index / gesamt) * 100 + "%" }}
        />
      </div>

      <UebungHinweis id="bildzuordnung">
        Lies die englische Frage und tippe den passenden Raum auf dem Plan an.
      </UebungHinweis>

      <p className="bz-frage">{frage.frage}</p>

      <svg
        className="bz-plan"
        viewBox="0 0 380 240"
        role="group"
        aria-label="Plan"
      >
        <rect
          className="bz-rahmen"
          x="6"
          y="6"
          width="368"
          height="228"
          rx="10"
        />
        {raeume.map((r, i) => {
          const p = platz(i);
          const istLoesung = geloest && r.id === frage.raum;
          const istFalsch = falschId === r.id;
          return (
            <g
              key={r.id}
              className={
                "bz-raum" +
                (istLoesung ? " ok" : "") +
                (istFalsch ? " no" : "")
              }
              onClick={() => klick(r.id)}
              role="button"
              aria-label={r.label}
            >
              <rect x={p.x} y={p.y} width={RAUM_W} height={RAUM_H} rx="8" />
              <text
                x={p.x + RAUM_W / 2}
                y={p.y + RAUM_H / 2}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {r.label}
              </text>
            </g>
          );
        })}
      </svg>

      {geloest ? (
        <div className="bz-feedback ok">
          <p className="bz-feedback-text">Richtig. ✓</p>
          <button type="button" className="bz-weiter" onClick={weiter}>
            {index + 1 >= gesamt ? "Fertig" : "Weiter"}
          </button>
        </div>
      ) : falschId ? (
        <p className="bz-hinweis" role="status">
          Nicht ganz, versuch einen anderen Raum.
        </p>
      ) : null}
    </div>
  );
}
