import { useMemo, useState } from "react";
import { kbFarbe } from "../data/koennensbeweise";
import {
  aktiveKbsDieserWoche,
  speichereWochenplan,
  wochentage,
  isoKW,
} from "../lib/wochenplan";
import Icon from "./Icon";

// Wochenstart: zeigt die KBs, die diese Woche dran sind (aus dem Etappenplan),
// plus alle nicht-fertigen KBs aus früheren Wochen ("Aus letzter Woche
// übernommen"). Pro KB tippt der Schüler einen Tag (Mo-Fr) an. Carry-overs
// machen sichtbar, wenn man hinter dem Etappenplan zurückliegt.
export default function WochenstartModal({ jetzt, onFertig }) {
  const { dieseWoche, carryOver } = useMemo(() => aktiveKbsDieserWoche(jetzt), [jetzt]);
  const alleKbs = useMemo(
    () => [...carryOver.map((c) => c.kb), ...dieseWoche],
    [carryOver, dieseWoche]
  );
  const [plan, setPlan] = useState({});

  function setze(kbId, tag) {
    setPlan((p) => {
      const n = { ...p };
      if (n[kbId] === tag) delete n[kbId];
      else n[kbId] = tag;
      return n;
    });
  }
  function vorschlagHolen() {
    const p = {};
    alleKbs.forEach((k, i) => {
      p[k.id] = i % 5;
    });
    setPlan(p);
  }
  function speichern() {
    speichereWochenplan(jetzt, plan, false);
    onFertig();
  }
  function unstrukturiert() {
    speichereWochenplan(jetzt, {}, true);
    onFertig();
  }

  const totalGeplant = Object.keys(plan).length;
  const ungeplant = alleKbs.length - totalGeplant;
  const datumText = jetzt.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
  const kw = isoKW(jetzt);

  return (
    <div className="modal-overlay block">
      <div className="modal modal-gross" role="dialog" aria-modal="true" aria-label="Wochenplan">
        <div className="modal-kopf">
          <Icon name="kalender" size={20} />
          <div className="modal-kopf-text">
            <h3 className="modal-titel">Was machst du wann?</h3>
            <p className="modal-sub">Woche {kw} · ab {datumText}</p>
          </div>
        </div>

        {alleKbs.length === 0 ? (
          <div className="ws-leer">
            <p>Diese Woche steht aus deinem Etappenplan nichts an. Du kannst direkt loslegen.</p>
            <button
              className="ws-haupt"
              onClick={() => {
                speichereWochenplan(jetzt, {}, false);
                onFertig();
              }}
            >
              Alles klar
            </button>
          </div>
        ) : (
          <>
            <p className="ws-intro">
              Tippe pro Aufgabe einen Tag an, an dem du sie machen möchtest.
            </p>

            {carryOver.length > 0 && (
              <div className="ws-lag">
                <Icon name="glocke" size={16} />
                <span>
                  <strong>
                    {carryOver.length} {carryOver.length === 1 ? "Aufgabe" : "Aufgaben"} aus
                    früheren Wochen
                  </strong>{" "}
                  ist noch offen. Wenn du nicht aufholst, gerätst du hinter den Etappenplan.
                </span>
              </div>
            )}

            <ul className="ws-liste">
              {alleKbs.map((k) => {
                const istCarry = carryOver.some((c) => c.kb.id === k.id);
                return (
                  <li key={k.id} className={"ws-item" + (istCarry ? " ws-item-carry" : "")}>
                    <div className="ws-item-kopf">
                      <span
                        className="fach-chip"
                        style={{ "--c": kbFarbe[k.fach] || "#868e96" }}
                      >
                        {k.fach}
                      </span>
                      <span className="ws-item-titel">{k.titel}</span>
                      <span className="ws-item-uhren" title={k.cluster + " Lernzeit-Einheiten"}>
                        {Array.from({ length: k.cluster }).map((_, i) => (
                          <Icon key={i} name="uhr" size={11} />
                        ))}
                      </span>
                    </div>
                    {istCarry && (
                      <p className="ws-item-carry-hinweis">Aus früherer Woche übernommen</p>
                    )}
                    <div className="ws-tage" role="radiogroup" aria-label={"Tag für: " + k.titel}>
                      {wochentage.map((t, i) => {
                        const aktiv = plan[k.id] === i;
                        return (
                          <button
                            key={i}
                            className={"ws-tag" + (aktiv ? " aktiv" : "")}
                            onClick={() => setze(k.id, i)}
                            aria-pressed={aktiv}
                            title={t.lang}
                          >
                            {t.kurz}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="ws-fussbar">
              {ungeplant === 0 ? (
                <span className="ws-fertig">✓ Alle Aufgaben haben einen Tag</span>
              ) : (
                <span className="ws-rest">
                  {ungeplant} {ungeplant === 1 ? "Aufgabe" : "Aufgaben"} noch ohne Tag
                </span>
              )}
            </div>

            <div className="ws-aktionen">
              <button className="ws-haupt" onClick={speichern}>
                Fertig
              </button>
              <button className="ws-vorschlag" onClick={vorschlagHolen}>
                💡 Verteilung vorschlagen
              </button>
              <button className="ws-zweit" onClick={unstrukturiert}>
                Ohne Plan starten
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
