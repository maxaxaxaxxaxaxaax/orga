import { useState } from "react";
import OrcaLogo from "./OrcaLogo";
import "./WegLeiste.css";
import "./Login.css";

// Schulportale und Apps, die Orca anbinden kann (Demo). Farbe = Marken-Ton, das
// Kürzel sitzt als heller Buchstabe auf dem farbigen Kachel-Logo.
const SCHULPORTALE = [
  { id: "moodle", name: "Moodle", kuerzel: "m", farbe: "#F98012" },
  { id: "iserv", name: "IServ", kuerzel: "iS", farbe: "#2F6CB0" },
  { id: "untis", name: "WebUntis", kuerzel: "U", farbe: "#E5006D" },
  { id: "canvas", name: "Canvas", kuerzel: "C", farbe: "#E13F29" },
];
const PLATTFORMEN = [
  { id: "youtube", name: "YouTube", kuerzel: "▶", farbe: "#FF0000" },
  { id: "excel", name: "Excel", kuerzel: "X", farbe: "#217346" },
  { id: "slack", name: "Slack", kuerzel: "#", farbe: "#4A154B" },
  { id: "whatsapp", name: "WhatsApp", kuerzel: "W", farbe: "#25D366" },
  { id: "drive", name: "Drive", kuerzel: "D", farbe: "#1FA463" },
  { id: "teams", name: "Teams", kuerzel: "T", farbe: "#5059C9" },
];

// Login als editoriale Hero-Section. Drei Schritte:
//  1. willkommen – die große Fraunces-Headline mit Produktbild (Lerntisch + Logo).
//  2. dienste    – Schulportale und Apps anbinden ("ein Ort statt fünf Apps").
//  3. konto      – Schulaccount verknüpfen (VISION: Datenhoheit).
// Die Aktion sitzt unten in der schwebenden Glas-Pille, wie im App-Shell.
export default function Login({ onLogin }) {
  const [schritt, setSchritt] = useState("willkommen"); // willkommen | dienste | konto
  // Vorab verbundene Dienste (Demo-Mix aus Portalen und Apps).
  const [verbunden, setVerbunden] = useState(
    () => new Set(["moodle", "iserv", "youtube", "whatsapp"])
  );

  function toggleDienst(id) {
    setVerbunden((alt) => {
      const neu = new Set(alt);
      if (neu.has(id)) neu.delete(id);
      else neu.add(id);
      return neu;
    });
  }

  function dienstKachel(d) {
    const an = verbunden.has(d.id);
    return (
      <button
        type="button"
        key={d.id}
        className={"login-dienst" + (an ? " an" : "")}
        onClick={() => toggleDienst(d.id)}
        aria-pressed={an}
      >
        <span
          className="login-dienst-logo"
          style={{ background: d.farbe }}
          aria-hidden="true"
        >
          {d.kuerzel}
        </span>
        <span className="login-dienst-text">
          <span className="login-dienst-name">{d.name}</span>
          <span className="login-dienst-status">
            {an ? "Verbunden" : "Verbinden"}
          </span>
        </span>
        <span className="login-dienst-haken" aria-hidden="true">
          {an ? "✓" : "+"}
        </span>
      </button>
    );
  }

  // Inhalt + untere Pille je Schritt.
  let inhalt;
  let pilleTitel;
  let pilleSub;
  let pilleKnopf;
  let pilleAktion;

  if (schritt === "willkommen") {
    inhalt = (
      <div className="login-hero login-hero-start">
        {/* Nur die drei getrackten Wörter oben. */}
        <div className="login-start-labels">
          <span>Lernen</span>
          <span>Planen</span>
          <span>Verstehen</span>
        </div>

        {/* Riesiges orca-Wortmark als Zentrum: am Start sitzt ein Punkt, den man an
            den Kreisformen entlangzieht und so das Logo mit den Fach-Farben füllt. */}
        <div className="login-start-mitte">
          <OrcaLogo interaktiv className="login-start-orca" />
        </div>
      </div>
    );
    pilleTitel = "Dein Schulaccount";
    pilleSub = "Theresianum Mainz";
    pilleKnopf = "Anmelden";
    pilleAktion = () => setSchritt("dienste");
  } else if (schritt === "dienste") {
    inhalt = (
      <>
        <header className="login-masthead">
          <OrcaLogo className="login-wortmarke" />
        </header>
        <div className="login-hero login-hero-dienste">
          <div className="login-dienste-kopf">
            <h2 className="login-dienste-titel">
              Ein Ort statt <em>fünf Apps</em>.
            </h2>
            <p className="login-dienste-deck">
              Orca holt Aufgaben, Material und Termine aus deinen Diensten,
              damit du nicht mehr zwischen Portalen und Apps springst. Du
              entscheidest, was verbunden wird.
            </p>
          </div>

          <section className="login-dienste-gruppe">
            <h3 className="login-dienste-label">Schulportale</h3>
            <div className="login-dienste-grid">
              {SCHULPORTALE.map(dienstKachel)}
            </div>
          </section>

          <section className="login-dienste-gruppe">
            <h3 className="login-dienste-label">Apps und Plattformen</h3>
            <div className="login-dienste-grid">
              {PLATTFORMEN.map(dienstKachel)}
            </div>
          </section>
        </div>
      </>
    );
    pilleTitel = `${verbunden.size} ${
      verbunden.size === 1 ? "Dienst" : "Dienste"
    } verbunden`;
    pilleSub = "Du kannst das jederzeit ändern";
    pilleKnopf = "Weiter";
    pilleAktion = () => setSchritt("funktion");
  } else if (schritt === "funktion") {
    inhalt = (
      <>
        <header className="login-masthead">
          <OrcaLogo className="login-wortmarke" />
        </header>
        <div className="login-hero login-hero-funktion">
          <div className="login-funktion-demo">
            <div className="lf-karte lf-quelle">
              <span className="lf-cap">Du schickst</span>
              <div className="lf-body">
                <div className="lf-link">
                  <span className="lf-link-thumb lf-yt" aria-hidden="true">
                    ▶
                  </span>
                  <span className="lf-link-text">
                    <span className="lf-link-titel">
                      Bruchrechnen in 5 Minuten
                    </span>
                    <span className="lf-link-quelle">youtube.com</span>
                  </span>
                </div>
                <div className="lf-auch">
                  <span>Foto</span>
                  <span>PDF</span>
                  <span>Sprachnotiz</span>
                  <span>Link</span>
                </div>
              </div>
            </div>

            <span className="lf-pfeil" aria-hidden="true">
              →
            </span>

            <div className="lf-karte lf-denk">
              <span className="lf-cap">orca liest und erkennt</span>
              <div className="lf-body">
                <span className="lf-scan" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <div className="lf-tags">
                  <span className="lf-tag lf-tag-fach">Mathe</span>
                  <span className="lf-tag lf-tag-thema">Brüche addieren</span>
                </div>
              </div>
            </div>

            <span className="lf-pfeil" aria-hidden="true">
              →
            </span>

            <div className="lf-karte lf-ziel">
              <span className="lf-cap">Landet bei der Aufgabe</span>
              <div className="lf-body">
                <span className="lf-tag lf-tag-fach">Mathe</span>
                <span className="lf-ziel-titel">
                  Brüche addieren und subtrahieren
                </span>
                <span className="lf-anhang">
                  <span
                    className="lf-link-thumb lf-yt lf-anhang-thumb"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                  <span className="lf-anhang-text">
                    Bruchrechnen in 5 Minuten
                  </span>
                  <span className="lf-anhang-haken" aria-hidden="true">
                    ✓
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="login-funktion-kopf">
            <h2 className="login-funktion-titel">
              Alles landet an der <em>richtigen</em> Aufgabe.
            </h2>
            <p className="login-funktion-deck">
              Schick orca einen Link, ein Foto oder eine Datei. orca schaut sich
              den Inhalt an, erkennt Fach und Thema und heftet ihn an die
              passende Aufgabe. So sammelt sich dein Stoff von selbst am
              richtigen Ort.
            </p>
          </div>
        </div>
      </>
    );
    pilleTitel = "Das nimmt dir orca ab";
    pilleSub = "Anhängen, der Rest passiert von selbst";
    pilleKnopf = "Weiter";
    pilleAktion = () => setSchritt("konto");
  } else {
    inhalt = (
      <>
        <header className="login-masthead">
          <OrcaLogo className="login-wortmarke" />
        </header>
        <div className="login-hero login-hero-konto">
          <div className="login-karte">
            <button
              type="button"
              className="login-zurueck"
              onClick={() => setSchritt("funktion")}
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
    );
    pilleTitel = "Bleibt auf deinem Gerät";
    pilleSub = "Deine Lernstände und Notizen";
    pilleKnopf = "Zustimmen und starten";
    pilleAktion = onLogin;
  }

  // Zurück-Ziel der Pille je Schritt (willkommen hat keins).
  const pilleZurueck =
    schritt === "dienste"
      ? "willkommen"
      : schritt === "funktion"
        ? "dienste"
        : null;

  return (
    <div className="login">
      <div className="login-inhalt">{inhalt}</div>

      {/* Schwebende Glas-Pille unten wie im App-Shell: hier sitzt die Aktion. */}
      <nav className="weg login-weg" aria-label="Anmeldung">
        <div className="weg-inner">
          {pilleZurueck && (
            <>
              <button
                type="button"
                className="login-weg-zurueck"
                onClick={() => setSchritt(pilleZurueck)}
                aria-label="Zurück"
              >
                ‹
              </button>
              <span className="login-weg-sep" aria-hidden="true" />
            </>
          )}
          <span className="weg-abruf">
            <span className="weg-abruf-text">
              <span className="weg-abruf-titel">{pilleTitel}</span>
              <span className="weg-abruf-sub">{pilleSub}</span>
            </span>
          </span>
          <button type="button" className="weg-planen-knopf" onClick={pilleAktion}>
            {pilleKnopf}
            <span className="weg-aufgabe-pfeil" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
