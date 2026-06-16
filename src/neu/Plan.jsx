import { useEffect, useState } from "react";
import { etappen } from "../data/etappen";
import {
  lade,
  WOCHEN_KEY,
  ERLEDIGT_KEY,
  AKTUELLE_WOCHE,
  meldeAenderung,
} from "./planung";
import Etappenziele from "./Etappenziele";
import CoachFragen from "./CoachFragen";
import Begriff from "./Begriff";
import "./Plan.css";

// Plan: die Etappe als Ganzes. Zeigt den Fortschritt (Etappenziele mit
// Wochen-Meilensteinen); das Planen selbst ist eine Aktion von hier aus
// (Wizard: Etappenplan -> Wochenplanung).

const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];

function zeitraum(e) {
  const opt = { day: "numeric", month: "long" };
  const von = new Date(e.von + "T00:00:00").toLocaleDateString("de-DE", opt);
  const bis = new Date(e.bis + "T00:00:00").toLocaleDateString("de-DE", opt);
  return `${von} bis ${bis}`;
}

export default function Plan({ onWochePlanen, onEtappeAnpassen }) {
  const wochenZuordnung = lade(WOCHEN_KEY);
  const [erledigt, setErledigt] = useState(() => lade(ERLEDIGT_KEY));

  useEffect(() => {
    localStorage.setItem(ERLEDIGT_KEY, JSON.stringify(erledigt));
    meldeAenderung();
  }, [erledigt]);

  function toggleErledigt(id) {
    setErledigt((e) => {
      const n = { ...e };
      if (n[id]) delete n[id];
      else n[id] = true;
      return n;
    });
  }

  return (
    <div className="pl-screen">
      <header className="pl-kopf">
        <div className="pl-kopf-text">
          <p className="pl-eyebrow">Plan</p>
          <h1 className="pl-titel">
            <Begriff name="etappe">Etappe</Begriff> {ETAPPE.kurz}
          </h1>
          <p className="pl-sub">{zeitraum(ETAPPE)}</p>
        </div>
        <div className="pl-kopf-aktion">
          <div className="pl-kopf-buttons">
            <button
              type="button"
              className="pl-knopf"
              onClick={onEtappeAnpassen}
              title="Ziele neu auf die Wochen verteilen"
            >
              Etappe anpassen
            </button>
            <button
              type="button"
              className="pl-knopf"
              onClick={onWochePlanen}
              title="Ziele dieser Woche auf die Tage verteilen"
            >
              Woche neu planen
            </button>
          </div>
        </div>
      </header>

      <Etappenziele
        erledigt={erledigt}
        onToggle={toggleErledigt}
        wochenZuordnung={wochenZuordnung}
        aktuelleWoche={AKTUELLE_WOCHE}
      />

      <CoachFragen />
    </div>
  );
}
