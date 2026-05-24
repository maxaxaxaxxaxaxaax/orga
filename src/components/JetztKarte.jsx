import { useState } from "react";
import { tagesEmpfehlung } from "../lib/empfehlung";
import Icon from "./Icon";

// Großer Aufmerksamkeits-Magnet auf "Heute": eine Aktion, ein Klick.
// Risiken bleiben im Schüler-Modus dezent (Warn-Icon mit Aufklappen);
// im Coach-Modus stehen sie als Liste.
export default function JetztKarte({ jetzt, erledigt, lernschritte, aufgaben, coach, onLoslegen }) {
  const { jetztText, top, risiken } = tagesEmpfehlung({ jetzt, erledigt, lernschritte, aufgaben });
  const [warnOffen, setWarnOffen] = useState(false);

  return (
    <section className="jetzt-karte">
      <div className="jk-haupt">
        <span className="jk-icon"><Icon name="funke" size={20} /></span>
        <div className="jk-text">
          <span className="jk-label">Dein Fokus jetzt</span>
          <p className="jk-empf">{jetztText}</p>
        </div>
        {top && (
          <button className="jk-btn" onClick={() => onLoslegen?.(top)}>
            Loslegen
          </button>
        )}
        {risiken.length > 0 && !coach && (
          <button
            className="jk-warn"
            onClick={() => setWarnOffen((o) => !o)}
            aria-label={`${risiken.length} Hinweis${risiken.length > 1 ? "e" : ""}`}
            title="Hinweise anzeigen"
          >
            <Icon name="glocke" size={14} />
            {risiken.length}
          </button>
        )}
      </div>

      {warnOffen && !coach && risiken.length > 0 && (
        <ul className="jk-risiken">
          {risiken.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      {coach && risiken.length > 0 && (
        <ul className="jk-risiken">
          {risiken.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
