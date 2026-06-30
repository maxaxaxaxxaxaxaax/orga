import { useEffect, useState } from "react";
import { wegStatus } from "./weg";
import { fachTextFarbe } from "./farbe";
import "./WegLeiste.css";

// Schwebende "Mein Weg"-Leiste unten mittig. In der Planungsphase (noch nichts
// geplant) meldet sie "Materialien abgerufen" und bietet den Einstieg ins Planen;
// in der Mach-Phase das aktuelle Ziel mit Schritt-Fortschritt als Knopf, der
// direkt in die Aufgabe (Fokus) springt. Aktualisiert sich live über das
// "neu:planung"-Event, sobald sich der Planungs- oder Erledigt-Stand ändert.
export default function WegLeiste({ onGo }) {
  const [stand, setStand] = useState(wegStatus);

  useEffect(() => {
    const aktualisiere = () => setStand(wegStatus());
    window.addEventListener("neu:planung", aktualisiere);
    return () => window.removeEventListener("neu:planung", aktualisiere);
  }, []);

  const { phase, jetzt, aufgabe } = stand;

  // Planungsphase (noch nichts geplant): keine Schritt-Anzeige mehr. Stattdessen
  // meldet die Leiste, dass die Materialien abgerufen wurden, und bietet mit einem
  // "Planen"-Knopf den Einstieg in die Planung (Etappenplan, dann wie gewohnt).
  if (phase === "planung") {
    return (
      <nav className="weg" aria-label="Mein Weg">
        <div className="weg-inner">
          <span className="weg-abruf">
            <span className="weg-abruf-haken" aria-hidden="true">
              ✓
            </span>
            <span className="weg-abruf-sep" aria-hidden="true" />
            <span className="weg-abruf-text">
              <span className="weg-abruf-titel">
                Materialien erfolgreich abgerufen
              </span>
              <span className="weg-abruf-sub">Plane jetzt deine Etappe</span>
            </span>
          </span>
          <button
            type="button"
            className="weg-planen-knopf"
            onClick={() => onGo("etappe")}
          >
            Planen
            <span className="weg-aufgabe-pfeil" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="weg" aria-label="Mein Weg">
      <div className="weg-inner">
        {aufgabe ? (
          // Mach-Phase: das aktuelle Ziel mit Schritt-Fortschritt. Ein Klick
          // springt direkt in die Aufgabe (Fokus).
          <button
            type="button"
            className="weg-aufgabe"
            onClick={() => onGo(jetzt.ziel, jetzt.kbId)}
            title={`${aufgabe.fach}: ${aufgabe.titel} öffnen`}
          >
            <span className="weg-aufgabe-text">
              <span
                className="weg-aufgabe-fach"
                style={{ color: fachTextFarbe(aufgabe.fach) }}
              >
                {aufgabe.fach}
              </span>
              <span className="weg-aufgabe-sep" aria-hidden="true" />
              <span className="weg-aufgabe-titel">{aufgabe.titel}</span>
            </span>
            <span className="weg-aufgabe-cta">
              {jetzt.text || "Öffnen"}
              <span className="weg-aufgabe-pfeil" aria-hidden="true">
                →
              </span>
            </span>
          </button>
        ) : (
          // Endzustand: alles geschafft oder nichts geplant.
          <span className={"weg-leer" + (jetzt.fertig ? " fertig" : "")}>
            {jetzt.fertig && (
              <span className="weg-leer-haken" aria-hidden="true">
                ✓
              </span>
            )}
            {jetzt.text}
          </span>
        )}
      </div>
    </nav>
  );
}
