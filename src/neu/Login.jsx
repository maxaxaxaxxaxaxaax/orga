import { useState } from "react";
import Icon from "./Icon";
import OrcaLogo from "./OrcaLogo";
import { DIENST_ICONS } from "./dienstIcons";
import "./WegLeiste.css";
import "./Login.css";

// Schulportale und Apps, die Orca anbinden kann (Demo). Farbe = Marken-Ton, darauf
// sitzt das Original-Markenzeichen in Weiß (dienstIcons.jsx). hell = das Zeichen ist
// ein farbiges Original-Bild (PNG) und braucht weißen Kachelgrund.
const SCHULPORTALE = [
  { id: "moodle", name: "Moodle", kuerzel: "m", farbe: "#F98012" },
  { id: "iserv", name: "IServ", kuerzel: "iS", farbe: "#2F6CB0", hell: true },
  { id: "untis", name: "WebUntis", kuerzel: "U", farbe: "#E5006D", hell: true },
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
const DIENST_INFO = Object.fromEntries(
  [...SCHULPORTALE, ...PLATTFORMEN].map((d) => [d.id, d])
);

// Sog-Animation auf der Startseite (wie die eingesaugten Zeichen am Verzauberungs-
// tisch): die Dienst-Icons kommen vom Bildschirmrand (vw/vh, relativ zur Logo-Mitte)
// und verlöschen VOR dem Wortmark (kein Flug durchs Logo). Nur oben/seitlich, damit
// nichts über den Pitch-Text fliegt. Negative Startzeiten: der Loop ist beim Laden
// schon mittendrin.
// Der Sog zielt immer auf die NÄCHSTE Logo-Kante (ziel = x-Position in % der Logo-
// Breite): linke Icons ins o (13.8, linke Kante), rechte ins a (86, rechte Kante),
// obere senkrecht herab auf r (38.9) und c (60): so fliegt nie eines quer durchs
// Wortmark. Alle Starts liegen knapp AUSSERHALB des Bildschirms: jedes Icon kommt
// mit Schwung ins Bild geflogen (wie die von oben), gleitet dann sichtbar langsam
// (nie ganz stehend) und wird zuletzt in seinen Buchstaben beschleunigt: das
// Kometen-Profil steckt in EINER S-Kurve (Keyframes). Starts/Dauern bewusst
// ungleich (nie im Gleichtakt), der Loop läuft beim Laden schon.
const SOG_FLUEGE = [
  { id: "youtube", ziel: "13.8%", sx: "calc(-50vw + 95px)", sy: "-4vh", dauer: 21, start: -1 },
  { id: "iserv", ziel: "13.8%", sx: "calc(-50vw + 112px)", sy: "6vh", dauer: 21.5, start: -8.4 },
  { id: "drive", ziel: "13.8%", sx: "calc(-50vw + 102px)", sy: "-14vh", dauer: 20, start: -15.6 },
  { id: "whatsapp", ziel: "86%", sx: "calc(50vw - 95px)", sy: "-8vh", dauer: 22, start: -3.3 },
  { id: "excel", ziel: "86%", sx: "calc(50vw - 114px)", sy: "-18vh", dauer: 23, start: -10.5 },
  { id: "teams", ziel: "86%", sx: "calc(50vw - 104px)", sy: "5vh", dauer: 23.5, start: -17.8 },
  { id: "moodle", ziel: "38.9%", sx: "-6vw", sy: "-40vh", dauer: 20.5, start: -5.8 },
  { id: "canvas", ziel: "60%", sx: "7vw", sy: "-42vh", dauer: 22.5, start: -12.9 },
  { id: "slack", ziel: "38.9%", sx: "-11vw", sy: "-38vh", dauer: 21, start: -20.2 },
  { id: "untis", ziel: "60%", sx: "12vw", sy: "-41vh", dauer: 22, start: -22.7 },
];

// Login als editoriale Hero-Section. Drei Schritte:
//  1. willkommen – buntes Wortmark + Pitch ("Alles landet an der richtigen Aufgabe").
//  2. dienste    – Schulportale und Apps anbinden ("ein Ort statt fünf Apps"),
//                  darunter die 3-Stationen-Demo (So funktioniert's). "Zustimmen
//                  und starten" führt in den Lade-Schritt.
//  3. laden      – das Wortmark zeichnet sich als Sync-Animation (Inhalte kommen an),
//                  danach geht es direkt in die App.
// Die Aktion sitzt unten in der schwebenden Glas-Pille, wie im App-Shell.
export default function Login({ onLogin, startSchritt = "willkommen" }) {
  // Login-Schritt. Normal "willkommen"; kommt man aus der Onboarding-Planung zurück,
  // öffnet er direkt bei den Diensten (letzter Schritt mit Aktion).
  const [schritt, setSchritt] = useState(startSchritt); // willkommen | dienste | laden
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
          className={"login-dienst-logo" + (d.hell ? " hell" : "")}
          style={{ background: d.hell ? "#fff" : d.farbe }}
          aria-hidden="true"
        >
          {DIENST_ICONS[d.id] || d.kuerzel}
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
        {/* Das orca-Wortmark ist das Zentrum: es zeichnet sich selbst und füllt sich
            mit den Fach-Farben (Auto-Modus). Darunter die drei Wörter als Tagline,
            die nacheinander sanft erscheinen (getaktet zur Zeichen-Animation). */}
        {/* Logo + Pitch als EINE Einheit (wie der Kopf auf der Dienste-Seite:
            Titel + Deck dicht beieinander). Das Logo steht hier statisch in den
            Fachfarben; drumherum der Sog: Dienst-Icons schweben heran und
            verschwinden im Wortmark (alles landet bei orca). */}
        <div className="login-start-mitte">
          <div className="login-start-buehne">
            <div className="login-sog" aria-hidden="true">
              {SOG_FLUEGE.map((f) => {
                const d = DIENST_INFO[f.id];
                return (
                  <span
                    key={f.id}
                    className="login-sog-icon"
                    style={{
                      "--ziel": f.ziel,
                      "--sx": f.sx,
                      "--sy": f.sy,
                      "--dauer": f.dauer + "s",
                      "--start": f.start + "s",
                      color: d.farbe,
                    }}
                  >
                    {DIENST_ICONS[f.id]}
                  </span>
                );
              })}
            </div>
            <OrcaLogo bunt className="login-start-orca" />
          </div>
          <div className="login-start-pitch">
            <h2 className="login-start-pitch-titel">
              Alles landet an der <em>richtigen</em> Aufgabe.
            </h2>
            <p className="login-start-pitch-deck">
              Schick orca einen Link, ein Foto oder eine Datei. orca erkennt Fach
              und Thema und heftet alles an die passende Aufgabe, ganz von selbst.
            </p>
          </div>
        </div>
      </div>
    );
    pilleTitel = "Das nimmt dir orca ab";
    pilleSub = "Anhängen, der Rest passiert von selbst";
    pilleKnopf = "Anmelden";
    pilleAktion = () => setSchritt("dienste");
  } else if (schritt === "dienste") {
    inhalt = (
      <>
        <div className="login-hero login-hero-dienste">
          <div className="login-dienste-kopf">
            <h2 className="login-dienste-titel">
              Ein Ort statt <em>fünf Apps</em>.
            </h2>
            <p className="login-dienste-deck">
              orca sammelt Aufgaben, Material und Termine aus deinen Apps an einem
              Ort. Du entscheidest, was mitkommt.
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
    pilleKnopf = "Zustimmen und starten";
    pilleAktion = () => setSchritt("laden");
  } else {
    // Lade-Schritt (letzter Schritt): das Wortmark zeichnet sich mit den Fachfarben
    // auf leeren Grund, während orca die Inhalte aus den eben verbundenen Diensten
    // zieht. Danach geht es direkt in die App (onFertig -> onLogin), keine Pille.
    inhalt = (
      <div className="login-hero login-hero-laden">
        <OrcaLogo
          auto
          starten
          ruheFarbe={null}
          onFertig={onLogin}
          className="login-laden-orca"
        />
        <p className="login-laden-text" role="status">
          orca holt deine Aufgaben, Material und Termine …
        </p>
      </div>
    );
  }

  // Zurück-Ziel der Pille je Schritt (willkommen hat keins).
  const pilleZurueck = schritt === "dienste" ? "willkommen" : null;

  return (
    <div className="login">
      <div className="login-inhalt">{inhalt}</div>

      {/* Schwebende Glas-Pille unten wie im App-Shell: hier sitzt die Aktion.
          Beim Lade-Schritt gibt es nichts zu tun, die Pille bleibt weg. */}
      {schritt !== "laden" && (
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
                <Icon name="chevron-left" size={18} />
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
      )}
    </div>
  );
}
