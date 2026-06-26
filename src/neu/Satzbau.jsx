import { useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Satzbau.css";

// Satzbau (Wort-Bausteine, wie bei Duolingo): aus gemischten Wort-Kacheln den
// richtigen Satz bauen. Die deutsche Bedeutung ist der Anlass. Tippen legt ein
// Wort an die Satzzeile, nochmal tippen legt es zurueck. Geprueft wird der
// fertige Satz; falsch = umstellen und erneut, oder Loesung zeigen. Pro Satz
// muss es sitzen, bevor es weitergeht (Mastery). Eine Serie zeigt den Schwung.

function mischen(liste) {
  const k = [...liste];
  for (let i = k.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [k[i], k[j]] = [k[j], k[i]];
  }
  return k;
}

export default function Satzbau({ daten }) {
  const saetze = daten?.saetze || [];
  const gesamt = saetze.length;

  const [index, setIndex] = useState(0);
  // Kacheln tragen einen festen Schluessel (Original-Position), damit gleiche
  // Woerter unterscheidbar bleiben. Vorrat = noch nicht gelegt, gelegt = Satzzeile.
  const [vorrat, setVorrat] = useState(() =>
    mischen((saetze[0]?.woerter || []).map((w, i) => ({ w, k: i })))
  );
  const [gelegt, setGelegt] = useState([]);
  const [geprueft, setGeprueft] = useState(false);
  const [loesungGezeigt, setLoesungGezeigt] = useState(false);
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [fertig, setFertig] = useState(false);

  if (gesamt === 0)
    return <p className="sb-leer">Für diese Übung gibt es noch keine Sätze.</p>;

  function ladeSatz(i) {
    setVorrat(mischen((saetze[i].woerter || []).map((w, k) => ({ w, k }))));
    setGelegt([]);
    setGeprueft(false);
    setLoesungGezeigt(false);
  }
  function neuStarten() {
    setIndex(0);
    ladeSatz(0);
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === gesamt;
    return (
      <div className="sb">
        <Fertig
          text={`Alle ${gesamt} Sätze gebaut.`}
          bilanz={
            (allesAufAnhieb
              ? "Alles auf Anhieb richtig. Stark."
              : "Die kniffligen hast du umgestellt, bis sie saßen.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Nochmal von vorn"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const satz = saetze[index];
  const ziel = (satz.woerter || []).join(" ");
  const gebaut = gelegt.map((t) => t.w).join(" ");
  const warRichtig = geprueft && gebaut === ziel;

  function lege(tile) {
    if (geprueft) return;
    setVorrat((v) => v.filter((t) => t.k !== tile.k));
    setGelegt((g) => [...g, tile]);
  }
  function zurueck(tile) {
    if (geprueft) return;
    setGelegt((g) => g.filter((t) => t.k !== tile.k));
    setVorrat((v) => [...v, tile]);
  }
  function pruefen() {
    if (gelegt.length === 0) return;
    setGeprueft(true);
    if (gebaut === ziel) {
      const n = serie + 1;
      setSerie(n);
      if (n > besteSerie) setBesteSerie(n);
      setAufAnhieb((a) => a + 1);
    } else {
      setSerie(0);
    }
  }
  function nochmalSatz() {
    // Falsch: Kacheln zurueck in den Vorrat, neu legen.
    setVorrat(mischen((satz.woerter || []).map((w, k) => ({ w, k }))));
    setGelegt([]);
    setGeprueft(false);
  }
  function weiter() {
    if (index + 1 >= gesamt) {
      setFertig(true);
      return;
    }
    const next = index + 1;
    setIndex(next);
    ladeSatz(next);
  }

  return (
    <div className="sb">
      <div className="sb-kopf">
        <span className="sb-label">Satz {index + 1} / {gesamt}</span>
        {serie >= 2 && (
          <span className="sb-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="sb-fortschritt" aria-hidden="true">
        <div
          className="sb-fortschritt-fuell"
          style={{ width: (index / gesamt) * 100 + "%" }}
        />
      </div>

      <UebungHinweis id="satzbau">
        Tippe die Wörter der Reihe nach an, bis der Satz steht. Ein Wort wieder
        antippen legt es zurück.
      </UebungHinweis>

      <p className="sb-aufgabe">
        Bau den englischen Satz: <strong>{satz.uebersetzung}</strong>
      </p>

      <div
        className={
          "sb-satzzeile" +
          (geprueft ? (warRichtig ? " ok" : " no") : "")
        }
        aria-label="Dein Satz"
      >
        {gelegt.length === 0 ? (
          <span className="sb-platzhalter">Tippe unten die Wörter an.</span>
        ) : (
          gelegt.map((t) => (
            <button
              type="button"
              key={t.k}
              className="sb-wort sb-wort-gelegt"
              onClick={() => zurueck(t)}
              disabled={geprueft}
            >
              {t.w}
            </button>
          ))
        )}
      </div>

      <div className="sb-vorrat">
        {vorrat.map((t) => (
          <button
            type="button"
            key={t.k}
            className="sb-wort"
            onClick={() => lege(t)}
            disabled={geprueft}
          >
            {t.w}
          </button>
        ))}
      </div>

      {geprueft && (
        <div className={"sb-feedback " + (warRichtig ? "ok" : "no")}>
          {warRichtig ? (
            <>
              <p className="sb-feedback-text">Richtig gebaut. ✓</p>
              {satz.erklaerung && (
                <p className="sb-erklaerung">{satz.erklaerung}</p>
              )}
            </>
          ) : (
            <>
              <p className="sb-feedback-text">Noch nicht ganz.</p>
              {loesungGezeigt && (
                <>
                  <p className="sb-loesung">
                    Richtig: <strong>{ziel}</strong>
                  </p>
                  {satz.erklaerung && (
                    <p className="sb-erklaerung">{satz.erklaerung}</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="sb-aktionen">
        {!geprueft ? (
          <button
            type="button"
            className="sb-pruefen"
            onClick={pruefen}
            disabled={gelegt.length === 0}
          >
            Prüfen
          </button>
        ) : warRichtig ? (
          <button type="button" className="sb-weiter" onClick={weiter}>
            {index + 1 >= gesamt ? "Fertig" : "Weiter"}
          </button>
        ) : (
          <>
            <button type="button" className="sb-nochmal" onClick={nochmalSatz}>
              Nochmal versuchen
            </button>
            {!loesungGezeigt && (
              <button
                type="button"
                className="sb-loesung-btn"
                onClick={() => setLoesungGezeigt(true)}
              >
                Lösung zeigen
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
