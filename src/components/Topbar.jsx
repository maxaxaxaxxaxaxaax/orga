import { student } from "../data/schule";
import Icon from "./Icon";
import GlobalSuche from "./GlobalSuche";

export default function Topbar({ jetzt, kacheln, onToggle, onStartShow, onOpen, onSettings, showSchritt = 0 }) {
  const datum = jetzt.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  const befehle = [
    { titel: "Gehe zu Heute", run: () => onOpen?.("heute") },
    { titel: "Gehe zu Stundenplan", run: () => onOpen?.("kalender") },
    { titel: "Gehe zu Aufgaben", run: () => onOpen?.("aufgaben") },
    { titel: "Gehe zu Wissen", run: () => onOpen?.("wissen") },
    { titel: "Gehe zu Nachrichten", run: () => onOpen?.("kommunikation") },
    { titel: "Gehe zu Fortschritt", run: () => onOpen?.("entwicklung") },
    { titel: "Einstellungen öffnen", run: () => onSettings?.() },
    { titel: "Vorführung starten", run: () => onStartShow?.() },
  ];

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <span className="topbar-marke">Orgatool</span>
        <span className="topbar-schule">{student.schule}</span>
      </div>

      <GlobalSuche onOpen={onOpen} aktionen={befehle} />

      <div className="topbar-rechts">
        <button className="show-btn" onClick={onStartShow} title="Ablauf vorführen">
          <Icon name="play" size={14} />
          Vorführen
        </button>
        <div className="ansicht-toggle" role="group" aria-label="Ansicht wechseln">
          <button
            className={"ansicht-btn" + (kacheln ? " aktiv" : "")}
            onClick={() => kacheln || onToggle()}
            title="Kachelansicht"
            aria-label="Kachelansicht"
          >
            <Icon name="kacheln" size={17} />
          </button>
          <button
            className={"ansicht-btn" + (!kacheln ? " aktiv" : "")}
            onClick={() => kacheln && onToggle()}
            title="Fokusansicht"
            aria-label="Fokusansicht"
          >
            <Icon name="fokus" size={17} />
          </button>
        </div>
        <span className="topbar-datum">{datum}</span>
        <button
          className={"topbar-icon-btn" + (showSchritt === 1 ? " pulse" : "")}
          onClick={() => onOpen?.("kommunikation")}
          aria-label="Benachrichtigungen öffnen"
          title="Nachrichten"
        >
          <Icon name="glocke" size={19} />
          <span className="topbar-punkt" />
        </button>
        <button className="topbar-icon-btn" onClick={onSettings} aria-label="Einstellungen" title="Einstellungen">
          <Icon name="einstellungen" size={19} />
        </button>
        <div className="topbar-avatar">{student.kuerzel}</div>
      </div>
    </header>
  );
}
