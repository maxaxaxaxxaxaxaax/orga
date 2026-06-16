import { useState } from "react";
import {
  koennensbeweise,
  kbFarbe,
  etappeWochen,
  wochenZielCluster,
} from "../data/koennensbeweise";
import { etappen } from "../data/etappen";
import "./Etappenziele.css";

// Fortschritt der Etappe als Prozent-Leiste mit Wochen-Meilensteinen.
// Klick auf eine Wochen-Marke zeigt darunter, was in der Woche ansteht.
const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];

function wochenBereich(wIdx) {
  const von = new Date(ETAPPE.von + "T00:00:00");
  von.setDate(von.getDate() + wIdx * 7);
  const bis = new Date(von);
  bis.setDate(von.getDate() + 6);
  const m = (d) => d.toLocaleDateString("de-DE", { month: "short" });
  const t = (d) => d.getDate();
  return m(von) === m(bis)
    ? `${t(von)}.–${t(bis)}. ${m(von)}`
    : `${t(von)}. ${m(von)} – ${t(bis)}. ${m(bis)}`;
}

export default function Etappenziele({
  erledigt,
  onToggle,
  wochenZuordnung = {},
  aktuelleWoche = 0,
}) {
  const [gewaehlteWoche, setGewaehlteWoche] = useState(aktuelleWoche);

  const gesamt = koennensbeweise.length;
  const fertig = koennensbeweise.filter((k) => erledigt[k.id]).length;
  const pct = gesamt ? Math.round((fertig / gesamt) * 100) : 0;

  // Zeitbudget der Etappe: noch offene Clusterstunden gegen die verbleibende
  // Kapazitaet (Rest-Wochen x Wochenziel). Ruhige Orientierung, kein Druck.
  const offeneCluster = koennensbeweise
    .filter((k) => !erledigt[k.id])
    .reduce((s, k) => s + k.cluster, 0);
  const restWochen = Math.max(1, etappeWochen - aktuelleWoche);
  const kapazitaet = restWochen * wochenZielCluster;
  const budgetStand =
    offeneCluster > kapazitaet
      ? "viel"
      : offeneCluster > kapazitaet * 0.85
        ? "knapp"
        : "ok";

  // Meilensteine: kumulative Ziel-Anzahl bis Ende jeder Woche, als % der Gesamtzahl.
  let kum = 0;
  const meilensteine = [];
  for (let w = 0; w < etappeWochen; w++) {
    const anzahl = koennensbeweise.filter(
      (k) => wochenZuordnung[k.id] === w
    ).length;
    kum += anzahl;
    meilensteine.push({
      idx: w,
      woche: w + 1,
      anzahl,
      pos: gesamt ? Math.round((kum / gesamt) * 100) : 0,
    });
  }

  const wocheKbs = koennensbeweise.filter(
    (k) => wochenZuordnung[k.id] === gewaehlteWoche
  );
  const wocheFertig = wocheKbs.filter((k) => erledigt[k.id]).length;

  return (
    <div className="ez">
      <div className="ez-fortschritt">
        <div className="ez-fortschritt-zeile">
          <span className="ez-fortschritt-text">
            <strong>{fertig}</strong> von {gesamt} Zielen erbracht
          </span>
          <span className="ez-pct">{pct}%</span>
        </div>
        <div className="ez-balken-wrap">
          <div className="ez-balken" aria-label={`${pct}% erbracht`}>
            <div className="ez-balken-fuell" style={{ width: pct + "%" }} />
          </div>
          <div className="ez-meilensteine">
            {meilensteine.map((m) =>
              m.anzahl > 0 ? (
                <button
                  key={m.woche}
                  type="button"
                  className={
                    "ez-meilenstein" +
                    (pct >= m.pos ? " erreicht" : "") +
                    (gewaehlteWoche === m.idx ? " aktiv" : "")
                  }
                  style={{ left: m.pos + "%" }}
                  onClick={() => setGewaehlteWoche(m.idx)}
                  title={`Woche ${m.woche}: ${m.anzahl} Ziele anzeigen`}
                  aria-pressed={gewaehlteWoche === m.idx}
                >
                  <span className="ez-meilenstein-tick" />
                  <span className="ez-meilenstein-label">W{m.woche}</span>
                </button>
              ) : null
            )}
          </div>
        </div>
        <p className="ez-hinweis">
          Tippe eine Wochen-Marke an, um ihre Ziele zu sehen.
        </p>
        {offeneCluster > 0 && (
          <p className="ez-budget" data-stand={budgetStand}>
            Noch {offeneCluster} Clusterstunden offen ·{" "}
            {restWochen} {restWochen === 1 ? "Woche" : "Wochen"} Zeit
            {budgetStand === "viel"
              ? " · wird knapp, plane bewusst"
              : budgetStand === "knapp"
                ? " · gut im Blick behalten"
                : " · gut in der Zeit"}
          </p>
        )}
      </div>

      <div className="ez-woche-panel">
        <header className="ez-woche-panel-kopf">
          <div className="ez-woche-panel-box">
            <span className="ez-woche-panel-titel">Woche {gewaehlteWoche + 1}</span>
            <span className="ez-woche-panel-datum">
              {wochenBereich(gewaehlteWoche)}
              {gewaehlteWoche === aktuelleWoche ? " · diese Woche" : ""}
            </span>
          </div>
          <span className="ez-woche-panel-zahl">
            {wocheFertig}/{wocheKbs.length} erledigt
          </span>
        </header>
        {wocheKbs.length === 0 ? (
          <p className="ez-leer">Für diese Woche sind keine Ziele eingeplant.</p>
        ) : (
          <ul className="ez-woche-liste">
            {wocheKbs.map((k) => {
              const done = !!erledigt[k.id];
              return (
                <li key={k.id}>
                  <button
                    type="button"
                    className={"ez-wkb" + (done ? " done" : "")}
                    onClick={() => onToggle(k.id)}
                    style={{ "--c": kbFarbe[k.fach] || "#868e96" }}
                    aria-pressed={done}
                  >
                    <span className="ez-check" aria-hidden="true">
                      {done ? "✓" : ""}
                    </span>
                    <span className="ez-wkb-fach">{k.fach}</span>
                    <span className="ez-wkb-titel">{k.titel}</span>
                    <span className="ez-wkb-cluster">{k.cluster}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
