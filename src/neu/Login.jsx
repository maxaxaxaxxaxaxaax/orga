import { useState } from "react";
import "./Login.css";

// Anmeldung (Demo, kein echtes Backend): ein ruhiger Einstieg, der den
// Schulaccount des Theresianum verknüpft. Schritt 1 begrüßt, Schritt 2 zeigt
// transparent, welche Daten die App sieht und welche auf dem Gerät bleiben
// (VISION: Datenhoheit). "Als Gast" überspringt die Verknüpfung.

const HutIcon = () => (
  <svg viewBox="0 0 24 24" className="login-logo-svg" aria-hidden="true">
    <path d="M22 10 12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" />
  </svg>
);

export default function Login({ onLogin }) {
  const [schritt, setSchritt] = useState("willkommen"); // willkommen | konto

  return (
    <div className="login">
      <div className="login-karte">
        {schritt === "willkommen" ? (
          <>
            <div className="login-marke">
              <span className="login-logo" aria-hidden="true">
                <HutIcon />
              </span>
              <span className="login-schule">Theresianum Mainz</span>
            </div>
            <h1 className="login-titel">Orgatool</h1>
            <p className="login-text">
              Dein ruhiger Begleiter für Lernwege, Etappen und den Schultag.
            </p>
            <button
              type="button"
              className="login-haupt"
              onClick={() => setSchritt("konto")}
            >
              Mit Schulaccount anmelden
            </button>
            <button type="button" className="login-gast" onClick={onLogin}>
              Erst mal als Gast ansehen
            </button>
            <p className="login-fuss">
              Datenhoheit: Deine Lernstände bleiben auf deinem Gerät.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              className="login-zurueck"
              onClick={() => setSchritt("willkommen")}
              aria-label="Zurück"
            >
              ‹
            </button>
            <p className="login-eyebrow">Schulaccount verknüpfen</p>
            <div className="login-konto">
              <span className="login-konto-avatar" aria-hidden="true">
                M
              </span>
              <span className="login-konto-text">
                <span className="login-konto-name">Max</span>
                <span className="login-konto-meta">
                  Klasse 7a · Theresianum Mainz
                </span>
              </span>
            </div>
            <ul className="login-rechte">
              <li>Die App sieht deinen Namen und deine Klasse.</li>
              <li>Sie liest deinen Stundenplan, um deinen Tag zu zeigen.</li>
              <li>Deine Lernstände und Notizen bleiben auf diesem Gerät.</li>
            </ul>
            <button type="button" className="login-haupt" onClick={onLogin}>
              Verknüpfen und starten
            </button>
            <button
              type="button"
              className="login-gast"
              onClick={() => setSchritt("willkommen")}
            >
              Abbrechen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
