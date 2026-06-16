import { useState } from "react";
import Fertig from "./Fertig";
import "./Karteikarten.css";

// Vokabel-Karteikarten: Vorderseite zeigt das Wort, Tippen dreht zur Lösung.
// "Kann ich" legt die Karte weg, "Nochmal" hängt sie hinten an. Fertig, wenn
// der Stapel leer ist. Reiner Übungsmodus, kein Tracking nach außen.
export default function Karteikarten({ daten }) {
  const karten = daten?.karten || [];
  const [rest, setRest] = useState(karten);
  const [gedreht, setGedreht] = useState(false);
  const [gekonnt, setGekonnt] = useState(0);

  const gesamt = karten.length;
  if (gesamt === 0) return <p className="kk-leer">Keine Karten vorhanden.</p>;

  if (rest.length === 0) {
    return (
      <div className="kk">
        <Fertig
          text={`Alle ${gesamt} Karten geschafft.`}
          nochmalLabel="Nochmal von vorn"
          onNochmal={() => {
            setRest(karten);
            setGekonnt(0);
            setGedreht(false);
          }}
        />
      </div>
    );
  }

  const karte = rest[0];
  function kannIch() {
    setRest(rest.slice(1));
    setGekonnt((g) => g + 1);
    setGedreht(false);
  }
  function nochmal() {
    setRest([...rest.slice(1), karte]);
    setGedreht(false);
  }

  return (
    <div className="kk">
      <div className="kk-kopf">
        {daten.hinweis && <span className="kk-hinweis">{daten.hinweis}</span>}
        <span className="kk-zaehler">
          {gekonnt} / {gesamt} gekonnt
        </span>
      </div>
      <div className="kk-balken" aria-hidden="true">
        <div
          className="kk-balken-fuell"
          style={{ width: (gekonnt / gesamt) * 100 + "%" }}
        />
      </div>

      <button
        type="button"
        className="kk-karte"
        onClick={() => setGedreht((g) => !g)}
        aria-label={gedreht ? "Karte zurückdrehen" : "Karte umdrehen"}
      >
        <span className={"kk-karte-inner" + (gedreht ? " gedreht" : "")}>
          <span className="kk-face kk-vorne">{karte.vorne}</span>
          <span className="kk-face kk-hinten">{karte.hinten}</span>
        </span>
      </button>
      <p className="kk-tipp">{gedreht ? "Wusstest du es?" : "Tippen zum Umdrehen"}</p>

      <div className="kk-aktionen">
        <button type="button" className="kk-nochmal" onClick={nochmal}>
          Nochmal ↻
        </button>
        <button type="button" className="kk-kann" onClick={kannIch}>
          Kann ich ✓
        </button>
      </div>
    </div>
  );
}
