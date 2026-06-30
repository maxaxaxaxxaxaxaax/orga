import { useState } from "react";
import OrcaLogo from "./OrcaLogo";
import tischBild from "../assets/tisch.png";
import "./WegLeiste.css";
import "./Login.css";

// Login als editoriale Hero-Section: links die große Fraunces-Headline mit Deck,
// rechts das Produktbild (der höhenverstellbare Lerntisch aus dem hybriden
// Ökosystem) mit dem Logo darüber. Die Aktion sitzt in der schwebenden Glas-Pille
// unten, wie im App-Shell. Schritt 2 verknüpft den Schulaccount (VISION: Datenhoheit).
export default function Login({ onLogin }) {
  const [schritt, setSchritt] = useState("willkommen"); // willkommen | konto
  const willkommen = schritt === "willkommen";

  return (
    <div className="login">
      <div className="login-inhalt">
        {willkommen ? (
          <div className="login-hero login-hero-start">
            <div className="login-hero-text">
              <p className="login-kicker">Lernen. Planen. Verstehen.</p>
              <h1 className="login-display">
                Den Kopf <em>frei</em>
                <br />
                fürs Lernen.
              </h1>
              <p className="login-deck">
                Stundenplan, Aufgaben, Material und Lernwege an einem ruhigen Ort.
                Erkannt statt abgetippt, und du entscheidest selbst, was sichtbar
                wird.
              </p>
            </div>

            <figure className="login-bild">
              <OrcaLogo className="login-bild-logo" />
              <img
                src={tischBild}
                alt="Höhenverstellbarer Lerntisch mit Laptop und Stuhl"
              />
            </figure>
          </div>
        ) : (
          <>
            <header className="login-masthead">
              <OrcaLogo className="login-wortmarke" />
            </header>
            <div className="login-hero login-hero-konto">
              <div className="login-karte">
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
              </div>
            </div>
          </>
        )}
      </div>

      {/* Schwebende Glas-Pille unten wie im App-Shell: hier sitzt die Aktion. */}
      <nav className="weg login-weg" aria-label="Anmeldung">
        <div className="weg-inner">
          <span className="weg-abruf">
            <span className="weg-abruf-text">
              <span className="weg-abruf-titel">
                {willkommen ? "Dein Schulaccount" : "Bleibt auf deinem Gerät"}
              </span>
              <span className="weg-abruf-sub">
                {willkommen
                  ? "Theresianum Mainz"
                  : "Deine Lernstände und Notizen"}
              </span>
            </span>
          </span>
          <button
            type="button"
            className="weg-planen-knopf"
            onClick={willkommen ? () => setSchritt("konto") : onLogin}
          >
            {willkommen ? "Anmelden" : "Zustimmen und starten"}
            <span className="weg-aufgabe-pfeil" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
