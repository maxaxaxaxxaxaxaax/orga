import { tagesEmpfehlung } from "../lib/empfehlung";
import Icon from "./Icon";

// Smarter Tagesüberblick: eine Empfehlung fürs "Jetzt" plus Risiko-Hinweise.
export default function Tagesfokus({ jetzt, erledigt, lernschritte, aufgaben, onOpen }) {
  const { jetztText, top, risiken } = tagesEmpfehlung({ jetzt, erledigt, lernschritte, aufgaben });

  return (
    <section className="tagesfokus">
      <div className="tagesfokus-haupt">
        <span className="tagesfokus-icon"><Icon name="funke" size={18} /></span>
        <div className="tagesfokus-text">
          <span className="tagesfokus-label">Dein Fokus jetzt</span>
          <p className="tagesfokus-empf">{jetztText}</p>
        </div>
        {top && (
          <button className="tagesfokus-btn" onClick={() => onOpen?.("aufgaben")}>
            Zu den Aufgaben
          </button>
        )}
      </div>
      {risiken.length > 0 && (
        <ul className="tagesfokus-risiken">
          {risiken.map((r, i) => (
            <li key={i}>
              <Icon name="glocke" size={14} /> {r}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
