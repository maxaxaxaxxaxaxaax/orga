import { useRef, useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Zahlenstrahl.css";

// Interaktiver Zahlenstrahl als Lern-Session: eine Aufgabe nennt eine Zahl, der
// Schüler klickt die Stelle auf der Linie. Der Klick rastet auf die nächste
// Ganzzahl ein, sofort Feedback (die richtige Stelle wird mitgezeigt). Falsch
// getroffene Aufgaben kommen am Ende erneut dran, bis sie sitzen (Mastery). Eine
// Serie zeigt den eigenen Schwung.
export default function Zahlenstrahl({ daten }) {
  const von = daten?.von ?? -10;
  const bis = daten?.bis ?? 10;
  const aufgaben = daten?.aufgaben || [];

  const [s, setS] = useState(() => ({
    durchgang: 1,
    queue: aufgaben,
    pos: 0,
    falsche: [],
    startAnzahl: aufgaben.length,
  }));
  const [klick, setKlick] = useState(null);
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [fertig, setFertig] = useState(false);
  const lineRef = useRef(null);

  if (s.startAnzahl === 0) return <p className="zs-leer">Keine Aufgaben.</p>;

  const pct = (w) => ((w - von) / (bis - von)) * 100;
  const ticks = [];
  for (let w = von; w <= bis; w++) ticks.push(w);

  function neuStarten() {
    setS({ durchgang: 1, queue: aufgaben, pos: 0, falsche: [], startAnzahl: aufgaben.length });
    setKlick(null);
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === s.startAnzahl;
    return (
      <div className="zs">
        <Fertig
          text="Zahlenstrahl geschafft."
          bilanz={
            (allesAufAnhieb
              ? "Alles auf Anhieb getroffen. Stark."
              : "Die kniffligen hast du nachgearbeitet, jetzt sitzen sie.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Nochmal üben"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const aufgabe = s.queue[s.pos];
  const beantwortet = klick !== null;
  const warRichtig = beantwortet && klick === aufgabe.ziel;
  const istNacharbeit = s.durchgang > 1;
  const proz = Math.round((s.pos / s.queue.length) * 100);

  function aufLinie(e) {
    if (beantwortet) return;
    const rect = lineRef.current.getBoundingClientRect();
    const anteil = (e.clientX - rect.left) / rect.width;
    const wert = Math.round(von + anteil * (bis - von));
    const geklemmt = Math.max(von, Math.min(bis, wert));
    setKlick(geklemmt);
    if (geklemmt === aufgabe.ziel) {
      const n = serie + 1;
      setSerie(n);
      if (n > besteSerie) setBesteSerie(n);
      if (s.durchgang === 1) setAufAnhieb((v) => v + 1);
    } else {
      setSerie(0);
    }
  }

  function weiter() {
    const ok = klick === aufgabe.ziel;
    const neueFalsche =
      ok || s.falsche.includes(aufgabe) ? s.falsche : [...s.falsche, aufgabe];
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
    setKlick(null);
  }

  return (
    <div className="zs">
      <div className="zs-kopf">
        <span className="zs-label">
          {istNacharbeit ? "Nochmal" : "Aufgabe"} {s.pos + 1} / {s.queue.length}
        </span>
        {serie >= 2 && (
          <span className="zs-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="zs-fortschritt" aria-hidden="true">
        <div className="zs-fortschritt-fuell" style={{ width: proz + "%" }} />
      </div>

      {istNacharbeit && s.pos === 0 && (
        <p className="zs-nacharbeit">Diese noch einmal, dann sitzen sie.</p>
      )}

      <UebungHinweis id="zahlenstrahl">
        Klicke auf die Stelle auf der Linie, die zur gesuchten Zahl passt.
      </UebungHinweis>

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
        {/* Bezugszahl (z.B. bei Gegenzahl): zeigt die Ausgangszahl, damit die
            Spiegelung an der Null sichtbar wird. */}
        {aufgabe.quelle != null && (
          <span
            className="zs-marke zs-quelle"
            style={{ left: pct(aufgabe.quelle) + "%" }}
          >
            <span className="zs-marke-punkt" />
            <span className="zs-marke-text">{aufgabe.quelle}</span>
          </span>
        )}
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
          {aufgabe.warum && <p className="zs-warum">{aufgabe.warum}</p>}
          <button type="button" className="zs-weiter" onClick={weiter}>
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
