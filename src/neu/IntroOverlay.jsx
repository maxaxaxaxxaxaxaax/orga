import { useEffect } from "react";
import "./IntroOverlay.css";

// Einmaliger Erststart-Hinweis: führt ruhig durch die drei Schritte des Wegs,
// damit von Anfang an klar ist, wo es langgeht. Danach trägt die "Mein Weg"-
// Leiste die Orientierung weiter. Wird nur gezeigt, bis er einmal weggeklickt ist.
const SCHRITTE = [
  {
    nr: 1,
    titel: "Etappe planen",
    text: 'Verteile deine Könnensbeweise auf die Wochen. Ein Klick auf „Für mich vorschlagen" macht den Anfang.',
  },
  {
    nr: 2,
    titel: "Woche planen",
    text: "Leg die Ziele dieser Woche auf die Tage. So weißt du, was wann dran ist.",
  },
  {
    nr: 3,
    titel: "Heute",
    text: 'Tippe ein Ziel an: es öffnet sich im Fokus, und du machst es Schritt für Schritt. Mit „Jetzt" oben geht es direkt ins nächste.',
  },
];

export default function IntroOverlay({ onLos }) {
  // Esc überspringt das Intro (= "Los geht's").
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
        <p className="intro-eyebrow">Willkommen, Max</p>
        <h2 className="intro-titel" id="intro-titel">
          So läuft dein Weg
        </h2>
        <p className="intro-sub">
          In drei Schritten von der Planung bis zum erledigten Tag. Oben in der
          Leiste siehst du immer, wo du gerade stehst und was als Nächstes dran ist.
        </p>
        <ol className="intro-schritte">
          {SCHRITTE.map((s) => (
            <li key={s.nr} className="intro-schritt">
              <span className="intro-marke" aria-hidden="true">
                {s.nr}
              </span>
              <span className="intro-text">
                <span className="intro-schritt-titel">{s.titel}</span>
                <span className="intro-schritt-text">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className="intro-los" onClick={onLos}>
          Los geht's →
        </button>
      </div>
    </div>
  );
}
