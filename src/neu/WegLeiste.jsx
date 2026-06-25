import { useEffect, useState } from "react";
import { wegStatus } from "./weg";
import "./WegLeiste.css";

// Schwebende "Mein Weg"-Leiste unten mittig: reine Standanzeige, kein Aktions-
// knopf. In der Planung die drei Schritte mit Status (der aktuelle hervorgehoben,
// Klick springt dorthin), in der Mach-Phase das aktuelle Ziel mit Schritt-
// Fortschritt. Aktualisiert sich live über das "neu:planung"-Event, sobald sich
// der Planungs- oder Erledigt-Stand ändert (z.B. ein Ziel abgehakt wird).
export default function WegLeiste({ onGo }) {
  const [stand, setStand] = useState(wegStatus);

  useEffect(() => {
    const aktualisiere = () => setStand(wegStatus());
    window.addEventListener("neu:planung", aktualisiere);
    return () => window.removeEventListener("neu:planung", aktualisiere);
  }, []);

  const { phase, schritte, jetzt, aufgabe } = stand;

  return (
    <nav className="weg" aria-label="Mein Weg">
      <div className="weg-inner">
        {phase === "planung" ? (
          // Planungsphase: nur die Schritt-Anzeige (wo stehe ich gerade).
          <ol className="weg-schritte">
              {schritte.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={"weg-schritt " + s.status}
                    onClick={() => onGo(s.id)}
                    aria-current={s.status === "aktuell" ? "step" : undefined}
                    title={`Schritt ${s.nr}: ${s.label}`}
                  >
                    <span className="weg-marke" aria-hidden="true">
                      {s.status === "fertig" ? "✓" : s.nr}
                    </span>
                    <span className="weg-text">
                      <span className="weg-label">{s.label}</span>
                      {s.info && <span className="weg-info">{s.info}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
        ) : aufgabe ? (
          // Mach-Phase: das aktuelle Ziel mit Schritt-Fortschritt, nur als
          // Anzeige (wo stehe ich gerade), kein Knopf.
          <div
            className="weg-aufgabe"
            title={`${aufgabe.fach}: ${aufgabe.titel}, ${aufgabe.fertigeAnzahl} von ${aufgabe.gesamt} Schritten`}
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
          </div>
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
