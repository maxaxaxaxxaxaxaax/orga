import { useEffect } from "react";
import "./IntroOverlay.css";

// Erststart-Hinweis auf dem Etappenplan: ein ruhiger, kurzer Anstupser, der den
// Rhythmus der App nennt (erst planen, dann lernen). Liegt als kleine Karte über
// dem leicht abgeblendeten Etappenplan und verschwindet, sobald "Starten"
// gedrückt (oder Esc) ist. Danach trägt die Planungs-Leiste die Orientierung.
export default function IntroOverlay({ onLos }) {
  // Esc überspringt das Intro (= "Starten").
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onLos();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onLos]);

  return (
    <div
      className="intro"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-titel"
    >
      <div className="intro-karte">
        <h2 className="intro-titel" id="intro-titel">
          Starte mit der Planung der neuen Etappe
        </h2>
        <p className="intro-sub">
          Eine neue Etappe hat begonnen, jetzt heißt es erstmal Planen und dann
          Lernen.
        </p>
        <button type="button" className="intro-los" onClick={onLos}>
          Starten
        </button>
      </div>
    </div>
  );
}
