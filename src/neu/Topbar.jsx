import { useState } from "react";
import Icon from "./Icon";
import "./Topbar.css";

// Topbar oben rechts: ruhiger Anker für die Einstellungen (Dropdown). Die
// Nachrichten/Mitteilungen sind jetzt eine eigene Box auf der Übersicht und nicht
// mehr hier in einer Glocke. Ein Klick daneben schließt das Dropdown.
export default function Topbar({ onResetDemo, onAbmelden }) {
  const [offen, setOffen] = useState(false);

  return (
    <>
      {offen && (
        <button
          type="button"
          className="topbar-backdrop"
          aria-label="Schließen"
          onClick={() => setOffen(false)}
        />
      )}
      <div className="topbar-rechts">
        <button
          type="button"
          className={"topbar-knopf" + (offen ? " an" : "")}
          onClick={() => setOffen((o) => !o)}
          aria-label="Einstellungen"
        >
          <Icon name="settings" className="topbar-svg" />
        </button>

        {offen && (
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
              Demo-Profil des Theresianum Mainz. Dein Stand bleibt nur auf diesem
              Gerät.
            </p>
            <button type="button" className="topbar-reset" onClick={onResetDemo}>
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
