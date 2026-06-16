import { useRef, useState } from "react";
import Fertig from "./Fertig";
import "./Zahlenstrahl.css";

// Interaktiver Zahlenstrahl: eine Aufgabe nennt eine Zahl, der Schüler klickt
// die Stelle auf der Linie. Der Klick rastet auf die nächste Ganzzahl ein,
// sofort Feedback (richtige Stelle wird mitgezeigt), dann die nächste Aufgabe.
export default function Zahlenstrahl({ daten }) {
  const von = daten?.von ?? -10;
  const bis = daten?.bis ?? 10;
  const aufgaben = daten?.aufgaben || [];
  const [i, setI] = useState(0);
  const [klick, setKlick] = useState(null);
  const [richtig, setRichtig] = useState(0);
  const lineRef = useRef(null);

  if (aufgaben.length === 0) return <p className="zs-leer">Keine Aufgaben.</p>;

  const pct = (w) => ((w - von) / (bis - von)) * 100;
  const ticks = [];
  for (let w = von; w <= bis; w++) ticks.push(w);

  if (i >= aufgaben.length) {
    return (
      <div className="zs">
        <Fertig
          text={`${richtig} von ${aufgaben.length} auf Anhieb getroffen.`}
          nochmalLabel="Nochmal üben"
          onNochmal={() => {
            setI(0);
            setKlick(null);
            setRichtig(0);
          }}
        />
      </div>
    );
  }

  const aufgabe = aufgaben[i];
  const beantwortet = klick !== null;
  const warRichtig = beantwortet && klick === aufgabe.ziel;

  function aufLinie(e) {
    if (beantwortet) return;
    const rect = lineRef.current.getBoundingClientRect();
    const anteil = (e.clientX - rect.left) / rect.width;
    const wert = Math.round(von + anteil * (bis - von));
    const geklemmt = Math.max(von, Math.min(bis, wert));
    setKlick(geklemmt);
    if (geklemmt === aufgabe.ziel) setRichtig((r) => r + 1);
  }
  function weiter() {
    setI((n) => n + 1);
    setKlick(null);
  }

  return (
    <div className="zs">
      <div className="zs-kopf">
        <span className="zs-label">
          Aufgabe {i + 1} von {aufgaben.length}
        </span>
        <span className="zs-score">{richtig} richtig</span>
      </div>
      <p className="zs-frage">{aufgabe.frage}</p>

      <button
        type="button"
        className="zs-linie"
        ref={lineRef}
        onClick={aufLinie}
        disabled={beantwortet}
        aria-label="Zahlenstrahl, klicke auf die gesuchte Zahl"
      >
        <span className="zs-achse" aria-hidden="true" />
        {ticks.map((w) => (
          <span key={w} className="zs-tick" style={{ left: pct(w) + "%" }}>
            <span
              className={"zs-strich" + (w === 0 ? " null" : "")}
              aria-hidden="true"
            />
            <span className={"zs-zahl" + (w === 0 ? " null" : "")}>{w}</span>
          </span>
        ))}
        {beantwortet && !warRichtig && (
          <span
            className="zs-marke zs-ziel"
            style={{ left: pct(aufgabe.ziel) + "%" }}
          >
            <span className="zs-marke-punkt" />
            <span className="zs-marke-text">richtig</span>
          </span>
        )}
        {beantwortet && (
          <span
            className={"zs-marke zs-klick" + (warRichtig ? " ok" : " no")}
            style={{ left: pct(klick) + "%" }}
          >
            <span className="zs-marke-punkt" />
            <span className="zs-marke-text">{klick}</span>
          </span>
        )}
      </button>

      {beantwortet && (
        <div className={"zs-feedback " + (warRichtig ? "ok" : "no")}>
          <p className="zs-feedback-text">
            {warRichtig
              ? "Genau getroffen! ✓"
              : `Nicht ganz: du warst bei ${klick}, gesucht war ${aufgabe.ziel}.`}
          </p>
          <button type="button" className="zs-weiter" onClick={weiter}>
            {i + 1 < aufgaben.length ? "Nächste Aufgabe →" : "Fertig →"}
          </button>
        </div>
      )}
    </div>
  );
}
