import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Icon from "./components/Icon";
import Dashboard from "./views/Dashboard";
import Heute from "./views/Heute";
import Kalender from "./views/Kalender";
import Aufgaben from "./views/Aufgaben";
import Wissen from "./views/Wissen";
import Nachrichten from "./views/Nachrichten";
import Fortschritt from "./views/Fortschritt";
import Einstellungen from "./components/Einstellungen";
import { dokumentAusDatei, notizDokument } from "./lib/einsortieren";
import { startUploads } from "./data/uploads";
import { faecher } from "./data/wissen";
import { aufgaben as seedAufgaben } from "./data/aufgaben";
import { student } from "./data/schule";
import { tageBis } from "./lib/zeit";
import "./App.css";

// localStorage-Helfer (Stand übersteht einen Reload).
function laden(key, fallback) {
  try {
    const roh = localStorage.getItem(key);
    return roh ? JSON.parse(roh) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [active, setActive] = useState(() => laden("orga.active", "heute"));
  const [kacheln, setKacheln] = useState(() => laden("orga.kacheln", true));
  const [jetzt, setJetzt] = useState(new Date());
  const [aufgabenModus, setAufgabenModus] = useState("liste");

  // Gemeinsamer Zustand (Schnellaktionen + Seiten + Show), reload-fest.
  const [erledigt, setErledigt] = useState(() => laden("orga.erledigt", {}));
  const [gelesen, setGelesen] = useState(() => laden("orga.gelesen", {}));
  const [hochgeladen, setHochgeladen] = useState(() => laden("orga.hochgeladen", startUploads));
  // Manuell abgehakte Lernweg-Schritte (Override über die Vorgabe in wissen.js).
  const [lernschritte, setLernschritte] = useState(() => laden("orga.lernschritte", {}));
  // Aufgabenliste = Seed + selbst hinzugefügte (Schnell-Eingabe), reload-fest.
  const [aufgabenListe, setAufgabenListe] = useState(() => laden("orga.aufgaben", seedAufgaben));
  // Personalisierung.
  const [name, setName] = useState(() => laden("orga.name", student.name));
  const [theme, setTheme] = useState(() => laden("orga.theme", "hell"));
  const [einstellungenOffen, setEinstellungenOffen] = useState(false);
  const [willkommen, setWillkommen] = useState(() => !laden("orga.tourGesehen", false));

  // Show Mode (geführte Vorführung).
  const [show, setShow] = useState({ aktiv: false, schritt: 0 });

  useEffect(() => {
    const id = setInterval(() => setJetzt(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Persistenz
  useEffect(() => localStorage.setItem("orga.erledigt", JSON.stringify(erledigt)), [erledigt]);
  useEffect(() => localStorage.setItem("orga.gelesen", JSON.stringify(gelesen)), [gelesen]);
  useEffect(() => localStorage.setItem("orga.hochgeladen", JSON.stringify(hochgeladen)), [hochgeladen]);
  useEffect(() => localStorage.setItem("orga.lernschritte", JSON.stringify(lernschritte)), [lernschritte]);
  useEffect(() => localStorage.setItem("orga.aufgaben", JSON.stringify(aufgabenListe)), [aufgabenListe]);
  useEffect(() => localStorage.setItem("orga.active", JSON.stringify(active)), [active]);
  useEffect(() => localStorage.setItem("orga.kacheln", JSON.stringify(kacheln)), [kacheln]);
  useEffect(() => localStorage.setItem("orga.name", JSON.stringify(name)), [name]);
  useEffect(() => {
    localStorage.setItem("orga.theme", JSON.stringify(theme));
    document.documentElement.classList.toggle("dark", theme === "dunkel");
  }, [theme]);

  // Schritt 3 → 4: erkennen, wenn alle heute fälligen Aufgaben abgehakt sind.
  const offenHeute = aufgabenListe.filter(
    (a) => tageBis(a.faellig, jetzt) <= 0 && !erledigt[a.id]
  ).length;

  function addAufgabe(neu) {
    if (neu) setAufgabenListe((l) => [neu, ...l]);
  }

  function tourSchliessen(starten) {
    localStorage.setItem("orga.tourGesehen", "true");
    setWillkommen(false);
    if (starten) startShow();
  }
  useEffect(() => {
    // Bewusster geführter Übergang im Show Mode (seltenes Ereignis).
    if (show.schritt === 3 && offenHeute === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow((s) => ({ ...s, schritt: 4 }));
      setKacheln(false);
      setActive("entwicklung");
    }
  }, [show.schritt, offenHeute]);

  function addDokumente(files, zielFach) {
    const neu = files.map((f) =>
      dokumentAusDatei(f, { zielFach, fallbackFach: faecher[0].fach })
    );
    setHochgeladen((g) => [...neu, ...g]);
    return neu;
  }
  function addNotiz(text, zielFach) {
    const doc = notizDokument(text, zielFach);
    setHochgeladen((g) => [doc, ...g]);
    return doc;
  }

  function oeffnen(id) {
    setActive(id);
    setKacheln(false);
  }

  // --- Show-Steuerung ---
  function startShow() {
    setErledigt({});
    setKacheln(true);
    setActive("heute");
    setAufgabenModus("liste");
    setShow({ aktiv: true, schritt: 1 });
  }
  function toastKlick() {
    setAufgabenModus("plan");
    setActive("aufgaben");
    setKacheln(false);
    setShow((s) => ({ ...s, schritt: 2 }));
  }
  function weiter() {
    setKacheln(true);
    setActive("heute");
    setShow((s) => ({ ...s, schritt: 3 }));
  }
  function endShow() {
    setShow({ aktiv: false, schritt: 0 });
    setAufgabenModus("liste");
  }

  const guide = {
    2: { text: "Schritt 2 von 4 · Plane deine Woche im Etappenplan.", weiter: true },
    3: { text: "Schritt 3 von 4 · Hake auf der Startseite deine heutigen Aufgaben ab.", weiter: false },
    4: { text: "Geschafft! Dein Fortschritt ist gewachsen. 🎉", weiter: false },
  }[show.schritt];

  return (
    <div className="shell">
      <Topbar
        jetzt={jetzt}
        kacheln={kacheln}
        onToggle={() => setKacheln((k) => !k)}
        onStartShow={startShow}
        onOpen={oeffnen}
        onSettings={() => setEinstellungenOffen(true)}
        showSchritt={show.schritt}
      />
      <Sidebar
        active={kacheln ? null : active}
        onSelect={(id) => {
          setActive(id);
          setKacheln(false);
        }}
      />
      <main className="content">
        {kacheln ? (
          <Dashboard
            jetzt={jetzt}
            onOpen={oeffnen}
            erledigt={erledigt}
            setErledigt={setErledigt}
            gelesen={gelesen}
            setGelesen={setGelesen}
            addDokumente={addDokumente}
            addNotiz={addNotiz}
            lernschritte={lernschritte}
            aufgaben={aufgabenListe}
            name={name}
            showSchritt={show.schritt}
          />
        ) : (
          <>
            {active === "heute" && (
              <Heute
                jetzt={jetzt}
                erledigt={erledigt}
                setErledigt={setErledigt}
                aufgaben={aufgabenListe}
                name={name}
              />
            )}
            {active === "kalender" && (
              <Kalender
                jetzt={jetzt}
                aufgaben={aufgabenListe}
                erledigt={erledigt}
                lernschritte={lernschritte}
                onOpen={oeffnen}
              />
            )}
            {active === "aufgaben" && (
              <Aufgaben
                jetzt={jetzt}
                erledigt={erledigt}
                setErledigt={setErledigt}
                initialModus={aufgabenModus}
                aufgaben={aufgabenListe}
                onAdd={addAufgabe}
              />
            )}
            {active === "wissen" && (
              <Wissen
                hochgeladen={hochgeladen}
                setHochgeladen={setHochgeladen}
                addDokumente={addDokumente}
                erledigt={erledigt}
                lernschritte={lernschritte}
                setLernschritte={setLernschritte}
              />
            )}
            {active === "kommunikation" && (
              <Nachrichten gelesen={gelesen} setGelesen={setGelesen} />
            )}
            {active === "entwicklung" && (
              <Fortschritt
                erledigt={erledigt}
                lernschritte={lernschritte}
                aufgaben={aufgabenListe}
              />
            )}
          </>
        )}
      </main>

      {/* Show: Benachrichtigungs-Toast (Schritt 1) */}
      {show.schritt === 1 && (
        <button className="show-toast" onClick={toastKlick}>
          <span className="show-toast-icon"><Icon name="glocke" size={18} /></span>
          <span className="show-toast-text">
            <strong>Neuer Etappenplan ist da!</strong>
            <span>Jetzt deine Woche planen →</span>
          </span>
        </button>
      )}

      {/* Show: Guide-Leiste (Schritt 2–4) */}
      {show.aktiv && guide && (
        <div className="show-guide">
          <span className="show-guide-text">{guide.text}</span>
          <span className="show-guide-btns">
            {guide.weiter && (
              <button className="show-guide-weiter" onClick={weiter}>Weiter</button>
            )}
            <button className="show-guide-ende" onClick={endShow}>Show beenden</button>
          </span>
        </div>
      )}

      {willkommen && !show.aktiv && (
        <div className="willkommen">
          <div className="willkommen-text">
            <strong>Willkommen im Orgatool!</strong>
            <span>Möchtest du eine kurze Vorführung sehen, wie alles zusammenspielt?</span>
          </div>
          <div className="willkommen-btns">
            <button className="willkommen-start" onClick={() => tourSchliessen(true)}>Tour starten</button>
            <button className="willkommen-spaeter" onClick={() => tourSchliessen(false)}>Später</button>
          </div>
        </div>
      )}

      {einstellungenOffen && (
        <Einstellungen
          name={name}
          setName={setName}
          theme={theme}
          setTheme={setTheme}
          onClose={() => setEinstellungenOffen(false)}
        />
      )}
    </div>
  );
}
