import { useEffect, useState } from "react";
import Etappenplan from "./Etappenplan";
import Wochenplan from "./Wochenplan";
import Heute from "./Heute";
import Ablage from "./Ablage";
import NavLeiste from "./NavLeiste";
import WegLeiste from "./WegLeiste";
import IntroOverlay from "./IntroOverlay";
import Fokus from "./Fokus";
import { koennensbeweise } from "../data/koennensbeweise";
import {
  startScreen,
  planungsScreen,
  planungFertig,
  lade,
  ERLEDIGT_KEY,
  meldeAenderung,
} from "./planung";
import { heuteOffeneZiele, nachzuegler } from "./weg";

const INTRO_KEY = "neu.intro.gesehen";

// Funktioniert der lokale Speicher ueberhaupt? Im privaten Modus oder bei
// gesperrtem Speicher (Schulnetz) schlagen Schreibvorgaenge still fehl, und die
// Planung waere beim Neuladen weg. Einmal kurz testen, damit wir ehrlich warnen
// koennen (Datenhoheit: der Schueler soll wissen, wenn nichts gesichert wird).
function speicherGeht() {
  try {
    const k = "neu.speichertest";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

// Drei Räume, je ein Job: Heute (der Tag), Plan (die Etappe), Ablage (das
// Material). Die schwebende Nav-Leiste ist die einzige Navigation. Solange die
// Planung offen ist, führt "Plan" in den Wizard (Etappenplan -> Wochenplanung),
// danach zeigt er die Etappe mit Fortschritt. Smart-Start: wer fertig geplant
// hat, landet direkt auf Heute.
export default function App() {
  const [screen, setScreen] = useState(startScreen);
  const [fokusKbId, setFokusKbId] = useState(null); // Ziel im Fokus-Modus (Vollbild)
  const [speicherOk] = useState(speicherGeht); // einmal beim Start pruefen
  // Erststart-Intro: einmal zeigen, bis es weggeklickt ist.
  const [introOffen, setIntroOffen] = useState(() => {
    try {
      return !localStorage.getItem(INTRO_KEY);
    } catch {
      return false;
    }
  });
  function introFertig() {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* localStorage blockiert: dann eben nur diese Sitzung */
    }
    setIntroOffen(false);
  }

  // Die Oberfläche bleibt bewusst im hellen Cremepapier-Schema, auch wenn das
  // System auf dunkel steht. Die dunkle Palette (an .dark auf <html>) wird daher
  // nicht aktiviert; falls die Klasse irgendwo gesetzt wurde, hier entfernen.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const bereich =
    screen === "heute" ? "heute" : screen === "ablage" ? "ablage" : "plan";

  function wechsle(ziel) {
    if (ziel === "plan") {
      setScreen(planungFertig() ? "plan" : planungsScreen());
    } else {
      setScreen(ziel);
    }
  }

  // "Mein Weg": ein Schritt-Klick springt zum passenden Screen. Die "Jetzt"-Aktion
  // auf ein Tagesziel öffnet es direkt auf Heute (kbId).
  function wegGo(ziel, kbId) {
    if (ziel === "etappe") setScreen("etappenplan");
    else if (ziel === "woche") setScreen("wochenplan");
    else {
      setScreen("heute");
      if (kbId) setFokusKbId(kbId);
    }
  }

  // Fokus-Abschluss: das Ziel als heute geschafft abhaken (eine Quelle für
  // Heute-Haken, Weg-Fortschritt und Fokus). KEIN automatischer Sprung mehr:
  // der Fokus zeigt danach eine Auswahl (weitermachen oder zurück zur Übersicht),
  // damit der Schüler die Orientierung behält.
  function fokusFertig(kbId) {
    try {
      const e = lade(ERLEDIGT_KEY);
      e[kbId] = true;
      localStorage.setItem(ERLEDIGT_KEY, JSON.stringify(e));
    } catch {
      /* localStorage blockiert: dann nur diese Sitzung */
    }
    meldeAenderung();
  }
  // Der Weg begleitet die Reihenfolge (Planung + Heute + Plan), nicht das
  // Nachschlage-Werkzeug Ablage. In den Planungs-Wizards (Etappe, Woche) blendet
  // er sich aus: dort führt die eigene Planungs-Leiste unten durch den Schritt.
  const zeigeWeg =
    screen !== "ablage" &&
    screen !== "etappenplan" &&
    screen !== "wochenplan" &&
    screen !== "plan";
  // Während des Planens (Etappe, Woche, Neu-Planen) bleibt die obere Navbar weg:
  // voller Fokus auf den Planungsschritt. Neu planen sieht so aus wie das erste
  // Planen, die Planungs-Leiste unten führt heraus ("Weiter" / "‹ Etappe").
  const zeigeNav =
    screen !== "etappenplan" &&
    screen !== "wochenplan" &&
    screen !== "plan";

  let inhalt;
  if (screen === "wochenplan") {
    inhalt = (
      <Wochenplan
        onZurueck={() => setScreen("etappenplan")}
        onWeiter={() => setScreen("heute")}
      />
    );
  } else if (screen === "heute") {
    inhalt = <Heute onFokus={setFokusKbId} />;
  } else if (screen === "plan") {
    // Neu planen sieht aus wie das erste Planen: dieselbe Planungs-Leiste unten
    // (Wizard-Stil). Da die Woche schon gefüllt ist, bietet die Leiste "Umplanen".
    inhalt = (
      <Wochenplan
        onZurueck={() => setScreen("etappenplan")}
        onWeiter={() => setScreen("heute")}
      />
    );
  } else if (screen === "ablage") {
    inhalt = <Ablage />;
  } else {
    inhalt = <Etappenplan onWeiter={() => setScreen("wochenplan")} />;
  }

  const fokusKb = fokusKbId
    ? koennensbeweise.find((k) => k.id === fokusKbId)
    : null;
  const fokusNaechste = fokusKb
    ? [...heuteOffeneZiele(), ...nachzuegler()].find((k) => k.id !== fokusKbId) ||
      null
    : null;

  return (
    <>
      {!speicherOk && (
        <div
          className="speicher-warnung"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          Änderungen werden gerade nicht gespeichert. Prüfe den Browser-Speicher
          (privater Modus?).
        </div>
      )}
      {zeigeWeg && <WegLeiste onGo={wegGo} />}
      {inhalt}
      {zeigeNav && <NavLeiste aktiv={bereich} onWechsel={wechsle} />}
      {introOffen && <IntroOverlay onLos={introFertig} />}
      {fokusKb && (
        <Fokus
          key={fokusKb.id}
          kb={fokusKb}
          naechste={fokusNaechste}
          onFertig={fokusFertig}
          onWeiter={(id) => setFokusKbId(id)}
          onClose={() => setFokusKbId(null)}
        />
      )}
    </>
  );
}
