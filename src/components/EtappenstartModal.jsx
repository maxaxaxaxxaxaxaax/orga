import { useMemo, useState } from "react";
import {
  koennensbeweise,
  kbFaecher,
  kbThemen,
  kbFarbe,
  etappeWochen,
  wochenZielCluster,
  systemHinweis,
} from "../data/koennensbeweise";
import { autoEtappenverteilung, speichereEtappenplan } from "../lib/wochenplan";
import Icon from "./Icon";

// Etappenstart-Planung: für jeden Könnensbeweis legt der Schüler fest, in
// welcher Woche der Etappe er ihn machen will. Pro KB-Zelle gibt es eine
// kleine Reihe W1-W6 Chips. Oben zeigt eine Live-Bilanz, wie voll jede Woche
// schon ist (Cluster-Summe). Hilfsbutton "Vorschlag holen" füllt automatisch.
export default function EtappenstartModal({ etappe, onFertig }) {
  const proFach = useMemo(() => {
    const map = {};
    for (const f of kbFaecher) {
      map[f] = koennensbeweise.filter((k) => k.fach === f);
    }
    return map;
  }, []);

  // Initial: Pflicht-KB sitzt fix in Woche 1. Alles andere ist offen.
  const [plan, setPlan] = useState(() =>
    systemHinweis.pflichtId ? { [systemHinweis.pflichtId]: 0 } : {}
  );
  const [vorschlagAktiv, setVorschlagAktiv] = useState(false);

  function setze(kbId, woche) {
    if (kbId === systemHinweis.pflichtId) return; // Pflicht ist fix
    setPlan((p) => {
      const n = { ...p };
      if (n[kbId] === woche) delete n[kbId];
      else n[kbId] = woche;
      return n;
    });
  }
  function vorschlagHolen() {
    setPlan(
      autoEtappenverteilung(
        koennensbeweise,
        etappeWochen,
        systemHinweis.pflichtId,
        systemHinweis.gesperrtesFach
      )
    );
    setVorschlagAktiv(true);
  }
  function speichern() {
    speichereEtappenplan(etappe.id, plan);
    onFertig();
  }

  // Live: wie viele Cluster sind jeder Woche zugewiesen?
  const proWoche = useMemo(() => {
    const w = Array.from({ length: etappeWochen }, () => 0);
    for (const k of koennensbeweise) {
      if (plan[k.id] != null) w[plan[k.id]] += k.cluster;
    }
    return w;
  }, [plan]);
  const totalKbs = koennensbeweise.filter(
    (k) => k.fach !== systemHinweis.gesperrtesFach
  ).length;
  const totalGeplant = Object.keys(plan).length;
  const ungeplant = totalKbs - totalGeplant;

  const endText = new Date(etappe.bis).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="modal-overlay block">
      <div
        className="modal modal-gross modal-breit"
        role="dialog"
        aria-modal="true"
        aria-label="Etappenplan"
      >
        <div className="modal-kopf">
          <Icon name="funke" size={20} />
          <div className="modal-kopf-text">
            <h3 className="modal-titel">Plane deine Etappe: {etappe.kurz}</h3>
            <p className="modal-sub">bis {endText} · {totalKbs} Aufgaben</p>
          </div>
        </div>

        <p className="ws-intro">
          Lege für jeden Könnensbeweis fest, in welcher Woche du ihn machen willst.
          Das ist dein grober Plan. Tippe ihn pro Aufgabe an. Ziel: pro Woche etwa{" "}
          {wochenZielCluster}{" "}
          <Icon name="uhr" size={11} className="ep-fuss-uhr" />.
        </p>

        <div className="ep-bilanz">
          <div className="ep-bilanz-zeile">
            <strong>{totalGeplant}</strong>
            <span>von {totalKbs} verteilt</span>
            {ungeplant > 0 && (
              <span className="ws-bilanz-rest">· {ungeplant} offen</span>
            )}
          </div>
          <div className="ep-bilanz-wochen">
            {proWoche.map((sum, i) => {
              const voll = sum > wochenZielCluster;
              const leer = sum === 0;
              return (
                <span
                  key={i}
                  className={
                    "ep-bilanz-w" + (voll ? " voll" : leer ? " leer" : "")
                  }
                  title={`Woche ${i + 1}: ${sum} von ${wochenZielCluster}`}
                >
                  W{i + 1} <strong>{sum}</strong>
                </span>
              );
            })}
          </div>
        </div>

        <div className="ep-tabelle">
          {kbFaecher.map((fach) => {
            const istGesperrt = fach === systemHinweis.gesperrtesFach;
            return (
              <div
                key={fach}
                className={"ep-spalte" + (istGesperrt ? " gesperrt" : "")}
                style={{ "--c": kbFarbe[fach] || "#868e96" }}
              >
                <div className="ep-spalte-kopf">
                  <span className="ep-fach">{fach}</span>
                  <span className="ep-thema">{kbThemen[fach]}</span>
                </div>
                {istGesperrt ? (
                  <div className="ep-sperre">
                    Aktuell gesperrt: erst der Pflicht-KB in Mathe ist dran.
                  </div>
                ) : (
                  <ul className="ep-zellen">
                    {proFach[fach].map((k) => {
                      const istPflicht = k.id === systemHinweis.pflichtId;
                      const wocheGesetzt = plan[k.id];
                      return (
                        <li
                          key={k.id}
                          className={"ep-zelle" + (wocheGesetzt != null ? " geplant" : "")}
                        >
                          <div className="ep-zelle-info">
                            <span className="ep-zelle-code">{k.code}</span>
                            <span className="ep-zelle-titel">{k.titel}</span>
                            <span
                              className="ep-zelle-uhren"
                              title={k.cluster + " Lernzeit-Einheiten"}
                            >
                              {Array.from({ length: k.cluster }).map((_, i) => (
                                <Icon key={i} name="uhr" size={11} />
                              ))}
                            </span>
                          </div>
                          <div
                            className="ep-wochen-picker"
                            role="radiogroup"
                            aria-label={"Woche für: " + k.titel}
                          >
                            {Array.from({ length: etappeWochen }).map((_, w) => {
                              const aktiv = wocheGesetzt === w;
                              const wuerdeUeberlaufen =
                                !aktiv && proWoche[w] + k.cluster > wochenZielCluster;
                              return (
                                <button
                                  key={w}
                                  className={
                                    "ep-wochen-chip" +
                                    (aktiv ? " aktiv" : "") +
                                    (wuerdeUeberlaufen ? " warnung" : "")
                                  }
                                  onClick={() => setze(k.id, w)}
                                  disabled={istPflicht && !aktiv}
                                  aria-pressed={aktiv}
                                  title={
                                    wuerdeUeberlaufen
                                      ? `Woche ${w + 1} wäre dann ziemlich voll`
                                      : `Woche ${w + 1}`
                                  }
                                >
                                  W{w + 1}
                                </button>
                              );
                            })}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="ws-aktionen">
          <button
            className="ws-haupt"
            onClick={speichern}
            disabled={totalGeplant === 0}
          >
            Plan speichern
          </button>
          <button className="ws-vorschlag" onClick={vorschlagHolen}>
            💡 {vorschlagAktiv ? "Vorschlag aktualisieren" : "Vorschlag holen"}
          </button>
          {ungeplant > 0 && (
            <p className="ws-warn">
              {ungeplant} {ungeplant === 1 ? "Aufgabe" : "Aufgaben"} ohne Woche. Du kannst
              sie auch später ergänzen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
