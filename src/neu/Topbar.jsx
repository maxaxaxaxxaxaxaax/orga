import { useEffect, useState } from "react";
import {
  ladeMitteilungen,
  markiereAlleGelesen,
  MITTEILUNG_EVENT,
} from "./benachrichtigungen";
import "./Topbar.css";

// Topbar oben rechts: das feste Gegenstück zur Navigation (oben mittig). Zwei
// ruhige Anker: das Postfach (Chat-Icon, dahinter alle Mitteilungen und
// Benachrichtigungen) und die Einstellungen. Beide öffnen ein schlichtes
// Dropdown; ein Klick daneben schließt es wieder.

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" className="topbar-svg" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
  </svg>
);

const ZahnradIcon = () => (
  <svg viewBox="0 0 24 24" className="topbar-svg" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" className="topbar-svg-klein" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BlattIcon = () => (
  <svg viewBox="0 0 24 24" className="topbar-svg-klein" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export default function Topbar({ onResetDemo, onAbmelden }) {
  const [offen, setOffen] = useState(null); // null | "mitteilungen" | "einstellungen"
  const [liste, setListe] = useState(ladeMitteilungen);

  useEffect(() => {
    const f = () => setListe(ladeMitteilungen());
    window.addEventListener(MITTEILUNG_EVENT, f);
    return () => window.removeEventListener(MITTEILUNG_EVENT, f);
  }, []);

  // Beim Öffnen des Postfachs kurz den frischen Stand zeigen, dann als gelesen
  // markieren (der Punkt verschwindet ruhig, nicht ruckartig).
  useEffect(() => {
    if (offen !== "mitteilungen") return;
    const id = setTimeout(() => markiereAlleGelesen(), 1100);
    return () => clearTimeout(id);
  }, [offen]);

  const ungelesen = liste.filter((m) => !m.gelesen).length;

  function umschalten(panel) {
    setOffen((o) => (o === panel ? null : panel));
  }

  return (
    <>
      {offen && (
        <button
          type="button"
          className="topbar-backdrop"
          aria-label="Schließen"
          onClick={() => setOffen(null)}
        />
      )}
      <div className="topbar-rechts">
        <button
          type="button"
          className={"topbar-knopf" + (offen === "mitteilungen" ? " an" : "")}
          onClick={() => umschalten("mitteilungen")}
          aria-label={
            "Mitteilungen" + (ungelesen ? ", " + ungelesen + " neu" : "")
          }
        >
          <ChatIcon />
          {ungelesen > 0 && <span className="topbar-badge">{ungelesen}</span>}
        </button>
        <button
          type="button"
          className={"topbar-knopf" + (offen === "einstellungen" ? " an" : "")}
          onClick={() => umschalten("einstellungen")}
          aria-label="Einstellungen"
        >
          <ZahnradIcon />
        </button>

        {offen === "mitteilungen" && (
          <div className="topbar-panel" role="dialog" aria-label="Mitteilungen">
            <div className="topbar-panel-kopf">
              <span>Mitteilungen</span>
              {ungelesen > 0 && (
                <span className="topbar-panel-zahl">{ungelesen} neu</span>
              )}
            </div>
            {liste.length === 0 ? (
              <p className="topbar-leer">Noch nichts Neues.</p>
            ) : (
              <ul className="topbar-liste">
                {liste.map((m) => (
                  <li
                    key={m.id}
                    className={"topbar-eintrag" + (m.gelesen ? "" : " neu")}
                  >
                    <span className={"topbar-eintrag-icon art-" + m.art}>
                      {m.art === "coach" ? <PersonIcon /> : <BlattIcon />}
                    </span>
                    <span className="topbar-eintrag-text">
                      <span className="topbar-eintrag-kopf">
                        <span className="topbar-eintrag-titel">{m.titel}</span>
                        <span className="topbar-eintrag-zeit">{m.zeit}</span>
                      </span>
                      <span className="topbar-eintrag-body">{m.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {offen === "einstellungen" && (
          <div className="topbar-panel" role="dialog" aria-label="Einstellungen">
            <div className="topbar-panel-kopf">
              <span>Einstellungen</span>
            </div>
            <div className="topbar-konto">
              <span className="topbar-konto-avatar" aria-hidden="true">
                M
              </span>
              <span className="topbar-konto-text">
                <span className="topbar-konto-name">Max</span>
                <span className="topbar-konto-klasse">
                  Klasse 7a · altsprachlich
                </span>
              </span>
            </div>
            <p className="topbar-konto-hinweis">
              Demo-Profil des Theresianum Mainz. Dein Stand bleibt nur auf
              diesem Gerät.
            </p>
            <button
              type="button"
              className="topbar-reset"
              onClick={onResetDemo}
            >
              Demo neu starten
            </button>
            {onAbmelden && (
              <button
                type="button"
                className="topbar-abmelden"
                onClick={onAbmelden}
              >
                Abmelden
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
