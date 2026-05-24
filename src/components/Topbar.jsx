import { student } from "../data/schule";
import Icon from "./Icon";
import GlobalSuche from "./GlobalSuche";

export default function Topbar({ jetzt, onStartShow, onOpen, onSettings, onNachrichten, ungelesen = 0, showSchritt = 0, coach = false }) {
  const datum = jetzt.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  // Befehle (Command-Palette) gibt es nur im Coach-Modus. Schüler sehen nur die
  // Suche. Ziele zeigen auf die drei echten Sektionen + Glocke; Stundenplan und
  // Fortschritt sind Sub-Reiter, kein eigener Befehl.
  const befehle = coach
    ? [
        { titel: "Gehe zu Heute", run: () => onOpen?.("heute") },
        { titel: "Gehe zu Aufgaben", run: () => onOpen?.("aufgaben") },
        { titel: "Gehe zu Wissen", run: () => onOpen?.("wissen") },
        { titel: "Nachrichten öffnen", run: () => onNachrichten?.() },
        { titel: "Einstellungen öffnen", run: () => onSettings?.() },
        { titel: "Vorführung starten", run: () => onStartShow?.() },
      ]
    : [];

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
        <span className="topbar-datum">{datum}</span>
        <button
          className={"topbar-icon-btn" + (showSchritt === 1 ? " pulse" : "")}
          onClick={() => onNachrichten?.()}
          aria-label={`Nachrichten öffnen${ungelesen ? ` (${ungelesen} ungelesen)` : ""}`}
          title="Nachrichten"
        >
          <Icon name="glocke" size={19} />
          {ungelesen > 0 && <span className="topbar-punkt" />}
        </button>
        <button className="topbar-icon-btn" onClick={onSettings} aria-label="Einstellungen" title="Einstellungen">
          <Icon name="einstellungen" size={19} />
        </button>
        <div className="topbar-avatar">{student.kuerzel}</div>
      </div>
    </header>
  );
}
