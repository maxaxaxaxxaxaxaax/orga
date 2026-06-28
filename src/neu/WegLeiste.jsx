import { useEffect, useState } from "react";
import { wegStatus } from "./weg";
import "./WegLeiste.css";

// Schwebende "Mein Weg"-Leiste unten mittig. In der Mach-Phase das aktuelle Ziel
// mit Schritt-Fortschritt als Knopf, der direkt in die Aufgabe (Fokus) springt.
// In der Planungsphase bleibt sie bewusst leer (die Schritt-Anzeige Etappe/Woche/
// Übersicht entfällt). Aktualisiert sich live über das "neu:planung"-Event,
// sobald sich der Planungs- oder Erledigt-Stand ändert.
export default function WegLeiste({ onGo }) {
  const [stand, setStand] = useState(wegStatus);

  useEffect(() => {
    const aktualisiere = () => setStand(wegStatus());
    window.addEventListener("neu:planung", aktualisiere);
    return () => window.removeEventListener("neu:planung", aktualisiere);
  }, []);

  const { phase, jetzt, aufgabe } = stand;

  // Die Planungs-Schritte (Etappe planen / Woche planen / Übersicht) werden
  // bewusst nicht mehr angezeigt: in der Planungsphase bleibt die Leiste leer,
  // die Wizards führen über ihre eigene Leiste unten durch den Schritt.
  if (phase === "planung") return null;

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
              <span className="weg-aufgabe-fach">{aufgabe.fach}</span>
              <span className="weg-aufgabe-titel">{aufgabe.titel}</span>
            </span>
            {aufgabe.gesamt > 0 && (
              <>
                <span className="weg-segmente" aria-hidden="true">
                  {aufgabe.schritte.map((st, i) => (
                    <span
                      key={i}
                      className={
                        "weg-seg" +
                        (st.fertig ? " fertig" : "") +
                        (i === aufgabe.aktuellerSchritt ? " aktuell" : "")
                      }
                    />
                  ))}
                </span>
                <span className="weg-aufgabe-zahl">
                  {aufgabe.fertigeAnzahl}/{aufgabe.gesamt}
                </span>
              </>
            )}
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
