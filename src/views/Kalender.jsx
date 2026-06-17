import { useState } from "react";
import {
  stundenWoche,
  fachFarbe,
  artLabel,
  tageKurz,
  tageLang,
  heuteIndex,
} from "../data/stundenplanWoche";
import { faecher } from "../data/wissen";
import { effektiveSchritte, themaStatus, lernwegStand } from "../lib/lernstand";
import { toMinutes, tageBis } from "../lib/zeit";

const TAG_START = 8 * 60; // 08:00
const TAG_ENDE = 16 * 60; // 16:00 (Ganztag mit Nachmittagsblöcken)
const PPM = 1.0; // Pixel pro Minute

// Kurzbeschreibung für Blöcke, die kein Fach sind.
const blockInfo = {
  Studierzeit: "Betreute Lernzeit: hier arbeitest du an deinen Lernwegen und Aufgaben.",
  Mittagessen: "Mittagspause in der Mensa.",
  ZEuS: "Zusammen Entdecken und Schaffen: Projektarbeit im Team (eduScrum).",
  "FREI DAY": "Selbstgewähltes Projekt zu einer Zukunftsfrage.",
  Neigungsgruppe: "Neigungsgruppe: ein Angebot nach deinem Interesse.",
};

export default function Kalender({ jetzt, aufgaben = [], erledigt = {}, lernschritte = {}, onOpen }) {
  const heuteIdx = heuteIndex(jetzt);
  const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();
  const [detail, setDetail] = useState(null);

  // Infos zum angeklickten Block: aktiver Lernweg + heute fällige Aufgaben.
  const ctx = { lernschritte, erledigt, aufgaben };
  const fachObj = detail && faecher.find((f) => f.fach === detail.fach);
  let aktiverLernweg = null;
  if (fachObj) {
    const akt = fachObj.themen
      .filter((t) => !t.landkarte)
      .map((t) => {
        const schritte = effektiveSchritte(fachObj.id, t, ctx);
        return { t, schritte, status: themaStatus({ schritte }) };
      })
      .find((x) => x.status === "current");
    if (akt) aktiverLernweg = { label: akt.t.label, ...lernwegStand(akt.schritte) };
  }
  const faelligHeute = detail
    ? aufgaben.filter(
        (a) => a.fach === detail.fach && tageBis(a.faellig, jetzt) <= 0 && !erledigt[a.id]
      )
    : [];

  const stunden = [];
  for (let h = 8; h <= 16; h++) stunden.push(h);

  const hoehe = (TAG_ENDE - TAG_START) * PPM;

  return (
    <div className="kal-wrap">
      <header className="view-kopf kal-kopf-text">
        <h1 className="view-titel">Stundenplan</h1>
        <p className="view-sub">Ganztag · {tageLang[heuteIdx] || "Wochenende"} · Mittwoch ist ein kurzer Tag</p>
        <div className="kal-legende">
          <span className="kal-leg" title="Normaler Fachunterricht mit der Lehrkraft">
            <span className="kal-leg-box" /> angeleitet
          </span>
          <span className="kal-leg" title="Angeleitete Stunde, die deinen Lernweg startet">
            <span className="kal-leg-box anker" /> Ankerstunde
          </span>
          <span className="kal-leg" title="Du arbeitest selbst in der Clusterstunde, im eigenen Tempo">
            <span className="kal-leg-box selbst" /> selbstreguliert
          </span>
          <span className="kal-leg" title="Betreute Lernzeit – hier holst du auf oder vertiefst">
            <span className="kal-leg-box studier" /> Studierzeit
          </span>
        </div>
      </header>

      <div className="kal">
        {/* Kopfzeile mit Wochentagen */}
        <div className="kal-head">
          <div className="kal-eck" />
          {tageKurz.map((t, i) => (
            <div key={i} className={"kal-tag-kopf" + (i === heuteIdx ? " heute" : "")}>
              <span className="kal-tag-kurz">{t}</span>
            </div>
          ))}
        </div>

        {/* Raster mit Zeitspalte + Tagesspalten */}
        <div className="kal-body" style={{ height: hoehe + "px" }}>
          <div className="kal-zeitspalte">
            {stunden.map((h) => (
              <div
                key={h}
                className="kal-zeit"
                style={{ top: (h * 60 - TAG_START) * PPM + "px" }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {tageKurz.map((_, tagIdx) => {
            const tagesStunden = stundenWoche.filter((s) => s.tag === tagIdx);
            const istHeute = tagIdx === heuteIdx;
            return (
              <div key={tagIdx} className={"kal-spalte" + (istHeute ? " heute" : "")}>
                {/* Stundenlinien */}
                {stunden.map((h) => (
                  <div
                    key={h}
                    className="kal-linie"
                    style={{ top: (h * 60 - TAG_START) * PPM + "px" }}
                  />
                ))}

                {/* Aktuelle-Zeit-Linie nur heute */}
                {istHeute && jetztMin >= TAG_START && jetztMin <= TAG_ENDE && (
                  <div
                    className="kal-jetzt"
                    style={{ top: (jetztMin - TAG_START) * PPM + "px" }}
                  />
                )}

                {/* Stunden als Blöcke */}
                {tagesStunden.map((s, i) => {
                  const von = toMinutes(s.von);
                  const bis = toMinutes(s.bis);
                  const farbe = fachFarbe[s.fach] || "#868e96";
                  const selbst = s.art === "selbst" || s.art === "studierzeit";
                  return (
                    <button
                      key={i}
                      className={"kal-event" + (selbst ? " selbst" : "")}
                      onClick={() => setDetail(s)}
                      style={{
                        top: (von - TAG_START) * PPM + "px",
                        height: (bis - von) * PPM - 3 + "px",
                        background: selbst
                          ? `color-mix(in srgb, ${farbe} 7%, white)`
                          : `color-mix(in srgb, ${farbe} 14%, white)`,
                        borderColor: farbe,
                        color: `color-mix(in srgb, ${farbe} 78%, black)`,
                      }}
                    >
                      <span className="kal-event-fach">{s.fach}</span>
                      {s.art && s.art !== "angeleitet" && (
                        <span className="kal-event-tag">{artLabel[s.art]}</span>
                      )}
                      <span className="kal-event-meta">
                        {s.von} · {s.raum}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {detail && (
        <div className="kal-detail">
          <div className="kal-detail-kopf">
            <span
              className="kal-detail-punkt"
              style={{ background: fachFarbe[detail.fach] || "#868e96" }}
            />
            <h3 className="kal-detail-titel">{detail.fach}</h3>
            <span className="kal-detail-zeit">{detail.von}–{detail.bis} · Raum {detail.raum}</span>
            <button className="modal-x" onClick={() => setDetail(null)} aria-label="Schließen">×</button>
          </div>

          {fachObj ? (
            <>
              {aktiverLernweg ? (
                <p className="kal-detail-zeile">
                  Aktueller Lernweg: <strong>{aktiverLernweg.label}</strong> ({aktiverLernweg.fertig}/{aktiverLernweg.gesamt} Schritten)
                </p>
              ) : (
                <p className="kal-detail-zeile">Kein aktiver Lernweg in diesem Fach.</p>
              )}
              {faelligHeute.length > 0 ? (
                <p className="kal-detail-zeile">
                  Heute fällig: {faelligHeute.map((a) => a.titel).join(", ")}
                </p>
              ) : (
                <p className="kal-detail-zeile kal-detail-ok">Heute nichts fällig in diesem Fach.</p>
              )}
              <button className="mini-btn" onClick={() => onOpen?.("wissen")}>
                Lernwege im Wissen öffnen
              </button>
            </>
          ) : (
            <p className="kal-detail-zeile">{blockInfo[detail.fach] || "Block im Ganztag."}</p>
          )}
        </div>
      )}
    </div>
  );
}
