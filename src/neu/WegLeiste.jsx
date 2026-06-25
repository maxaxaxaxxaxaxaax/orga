import { useEffect, useState } from "react";
import { wegStatus } from "./weg";
import "./WegLeiste.css";

// Schwebende "Mein Weg"-Leiste unten mittig. In der Planung die drei Schritte
// mit Status (der aktuelle hervorgehoben, Klick springt dorthin); in der
// Mach-Phase das aktuelle Ziel mit Schritt-Fortschritt als Knopf, der direkt in
// die Aufgabe (Fokus) springt. Aktualisiert sich live über das "neu:planung"-
// Event, sobald sich der Planungs- oder Erledigt-Stand ändert.
export default function WegLeiste({ onGo }) {
  const [stand, setStand] = useState(wegStatus);

  useEffect(() => {
    const aktualisiere = () => setStand(wegStatus());
    window.addEventListener("neu:planung", aktualisiere);
    return () => window.removeEventListener("neu:planung", aktualisiere);
  }, []);

  const { phase, schritte, jetzt, aufgabe } = stand;

  return (
    <nav
      className={"weg" + (phase === "planung" ? " weg-oben" : "")}
      aria-label="Mein Weg"
    >
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
