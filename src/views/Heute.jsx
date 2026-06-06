import { useState } from "react";
import { student, naechsterKnb } from "../data/schule";
import { stundenHeute, fachFarbe, artLabel } from "../data/stundenplanWoche";
import { typLabel } from "../data/aufgaben";
import { tageBis, formatTage, stundenStatus } from "../lib/zeit";
import {
  heuteGeplanteKbs,
  geplantFuerTag,
  wochenplanFortschritt,
  etappenLag,
  setzeKbFertig,
  wochentage,
  wochentagIndex,
} from "../lib/wochenplan";
import { kbFarbe } from "../data/koennensbeweise";
import { lernwegFuerKb } from "../data/wissen";
import Begriff from "../components/Begriff";
import JetztKarte from "../components/JetztKarte";
import KlassenPuls from "../components/KlassenPuls";
import Kalender from "./Kalender";

const begriffeArt = { anker: "anker", studierzeit: "studierzeit" };

function dringlichkeit(tage) {
  if (tage < 0) return "danger";
  if (tage === 0) return "warn";
  return "later";
}

export default function Heute({
  jetzt,
  erledigt,
  setErledigt,
  aufgaben = [],
  lernschritte = {},
  name,
  coach,
  onOpen,
  onOpenLernweg,
}) {
  const [planTab, setPlanTab] = useState("tag");
  // Top-Level Heute-Tab: "mein" zeigt die persönliche Tages-/Wochensicht,
  // "wir" zeigt den Klassen-Puls (aggregierter Verband, kein Personenvergleich).
  const [heuteTab, setHeuteTab] = useState("mein");
  // Bump zwingt Heute zu re-rendern, wenn ein KB-Fertig-Status geändert wird
  // (localStorage allein triggert kein React-Re-Render).
  const [kbVersion, setKbVersion] = useState(0);
  void kbVersion;

  const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();
  const heuteStunden = stundenHeute(jetzt);
  const { aktuell, naechste } = stundenStatus(heuteStunden, jetztMin);

  const stunde = jetzt.getHours();
  const gruss = stunde < 11 ? "Guten Morgen" : stunde < 17 ? "Hallo" : "Guten Abend";
  const datumText = jetzt.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const heuteFaellig = aufgaben
    .map((a) => ({ ...a, tage: tageBis(a.faellig, jetzt), ist: !!erledigt[a.id] }))
    .filter((a) => !a.ist && a.tage <= 0)
    .sort((a, b) => a.tage - b.tage)
    .slice(0, 5);

  function toggle(id) {
    setErledigt((e) => ({ ...e, [id]: !e[id] }));
  }
  function loslegen(top) {
    if (top?.lernweg && onOpenLernweg) {
      onOpenLernweg(top.lernweg.fachId, top.lernweg.themaId);
    } else {
      onOpen?.("aufgaben");
    }
  }

  const knbTage = tageBis(naechsterKnb.datum, jetzt);

  // Wochenplan-Integration: heute geplante KBs + Lag + (Fr/Sa/So) Rückblick.
  const geplantHeute = heuteGeplanteKbs(jetzt);
  const lag = etappenLag(jetzt);
  const wochenTag = jetzt.getDay(); // 0=So, 5=Fr, 6=Sa
  const zeigeRueckblick = wochenTag === 5 || wochenTag === 6 || wochenTag === 0;
  const rueckblick = zeigeRueckblick ? wochenplanFortschritt(jetzt) : null;

  // Wenn heute alles erledigt ist, zeige Vorschau auf morgen (nur Mo-Do).
  const heuteIdx = wochentagIndex(jetzt);
  const heuteOffen = geplantHeute.filter((g) => !g.fertig).length;
  const heuteDurch = geplantHeute.length > 0 && heuteOffen === 0;
  const morgenIdx = heuteIdx + 1;
  const morgenGeplant =
    heuteDurch && morgenIdx <= 4 ? geplantFuerTag(jetzt, morgenIdx) : [];

  function toggleKb(id, war) {
    setzeKbFertig(id, !war);
    setKbVersion((v) => v + 1);
  }

  return (
    <div className="view heute-view">
      <header className="view-kopf">
        <p className="view-datum">{datumText}</p>
        <h1 className="view-titel">{gruss}, {name || student.name}.</h1>
        <p className="view-sub">
          Klasse {student.klasse} · Lerncoach: {student.tutor}
        </p>
      </header>

      <div className="segment heute-toptab" role="tablist" aria-label="Heute-Ansicht">
        <button
          className={"segment-btn" + (heuteTab === "mein" ? " aktiv" : "")}
          onClick={() => setHeuteTab("mein")}
          role="tab"
          aria-selected={heuteTab === "mein"}
        >
          Mein Tag
        </button>
        <button
          className={"segment-btn" + (heuteTab === "wir" ? " aktiv" : "")}
          onClick={() => setHeuteTab("wir")}
          role="tab"
          aria-selected={heuteTab === "wir"}
        >
          Wir
        </button>
      </div>

      {heuteTab === "wir" ? (
        <KlassenPuls jetzt={jetzt} />
      ) : (
      <>
      <JetztKarte
        jetzt={jetzt}
        erledigt={erledigt}
        lernschritte={lernschritte}
        aufgaben={aufgaben}
        coach={coach}
        onLoslegen={loslegen}
      />

      <section className="heute-block">
        <div className="heute-block-kopf">
          <h2 className="heute-block-titel">Heute fällig</h2>
          {aufgaben.length > heuteFaellig.length && (
            <button className="heute-link" onClick={() => onOpen?.("aufgaben")}>
              Alle Aufgaben →
            </button>
          )}
        </div>
        {heuteFaellig.length === 0 ? (
          <p className="heute-leer">Nichts heute fällig. Stark!</p>
        ) : (
          <ul className="heute-liste">
            {heuteFaellig.map((a) => {
              const farbe = fachFarbe[a.fach] || "#868e96";
              const dr = dringlichkeit(a.tage);
              return (
                <li key={a.id} className={"heute-card dringlich-" + dr}>
                  <button
                    className="check klein"
                    onClick={() => toggle(a.id)}
                    aria-label={"Erledigen: " + a.titel}
                  />
                  <div className="heute-card-mitte">
                    <span className="heute-card-titel">{a.titel}</span>
                    <span className="heute-card-meta">
                      <span className="fach-chip" style={{ "--c": farbe }}>{a.fach}</span>
                      {typLabel[a.typ]}
                    </span>
                  </div>
                  <span className={"frist " + dr}>{formatTage(a.tage)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {lag > 0 && (
        <div className="heute-lag">
          <span className="heute-lag-zahl">{lag}</span>
          <span>
            {lag === 1 ? "Aufgabe" : "Aufgaben"} aus früheren Wochen ist noch offen.
            Wenn du nicht aufholst, gerätst du hinter den Etappenplan.
          </span>
        </div>
      )}

      {geplantHeute.length > 0 && (
        <section className="heute-block">
          <div className="heute-block-kopf">
            <h2 className="heute-block-titel">Heute geplant</h2>
            <span className="heute-block-hint">aus deinem Wochenplan</span>
          </div>
          <ul className="geplant-liste">
            {geplantHeute.map((g) => {
              const verkn = lernwegFuerKb(g.kb.id);
              return (
                <li
                  key={g.kb.id}
                  className={
                    "geplant-card" +
                    (g.fertig ? " fertig" : "") +
                    (g.istUebernommen ? " uebernommen" : "")
                  }
                >
                  <button
                    className="geplant-mark"
                    onClick={() => toggleKb(g.kb.id, g.fertig)}
                    aria-label={(g.fertig ? "Wieder offen: " : "Erledigt: ") + g.kb.titel}
                    aria-pressed={g.fertig}
                  >
                    {g.fertig ? "✓" : "○"}
                  </button>
                  <div className="geplant-mitte">
                    <span className="geplant-titel">{g.kb.titel}</span>
                    <span className="geplant-meta">
                      <span
                        className="fach-chip"
                        style={{ "--c": kbFarbe[g.kb.fach] || "#868e96" }}
                      >
                        {g.kb.fach}
                      </span>
                      <span className="geplant-code">{g.kb.code}</span>
                      {g.istUebernommen && (
                        <span className="geplant-uebernommen">
                          vom {wochentage[g.ursprungsTag]?.lang || "früheren Tag"}
                        </span>
                      )}
                    </span>
                  </div>
                  {verkn && (
                    <button
                      className="mini-btn"
                      onClick={() => onOpenLernweg?.(verkn.fachId, verkn.themaId)}
                      title="Material und Schritte im Wissen-Tab"
                    >
                      Im Wissen
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {morgenGeplant.length > 0 && (
        <section className="heute-block">
          <div className="heute-block-kopf">
            <h2 className="heute-block-titel">Du bist heute durch ✨</h2>
            <span className="heute-block-hint">So geht's morgen weiter</span>
          </div>
          <ul className="geplant-liste vorgreif">
            {morgenGeplant.map((g) => (
              <li key={g.kb.id} className={"geplant-card" + (g.fertig ? " fertig" : "")}>
                <button
                  className="geplant-mark"
                  onClick={() => toggleKb(g.kb.id, g.fertig)}
                  aria-label={(g.fertig ? "Wieder offen: " : "Schon vorab erledigt: ") + g.kb.titel}
                  aria-pressed={g.fertig}
                >
                  {g.fertig ? "✓" : "○"}
                </button>
                <div className="geplant-mitte">
                  <span className="geplant-titel">{g.kb.titel}</span>
                  <span className="geplant-meta">
                    <span
                      className="fach-chip"
                      style={{ "--c": kbFarbe[g.kb.fach] || "#868e96" }}
                    >
                      {g.kb.fach}
                    </span>
                    <span className="geplant-code">{g.kb.code}</span>
                    <span className="geplant-morgen">
                      für {wochentage[morgenIdx]?.lang || "morgen"}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rueckblick && (
        <section className="heute-block">
          <div className="rueckblick-card">
            <div className="rueckblick-zahl">
              <strong>{rueckblick.fertig}</strong>
              <span>von {rueckblick.gesamt} Schritten</span>
            </div>
            <div className="rueckblick-text">
              <h2 className="rueckblick-titel">Deine Woche im Blick</h2>
              <p className="rueckblick-sub">
                {rueckblick.fertig === rueckblick.gesamt
                  ? "Alles geschafft. Stark!"
                  : rueckblick.fertig > 0
                  ? "Du bist auf dem Weg. Weiter so!"
                  : "Noch nichts abgehakt diese Woche."}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="heute-block">
        <div className="heute-block-kopf">
          <h2 className="heute-block-titel">Stundenplan</h2>
          <div className="segment kleiner">
            <button
              className={"segment-btn" + (planTab === "tag" ? " aktiv" : "")}
              onClick={() => setPlanTab("tag")}
            >
              Tag
            </button>
            <button
              className={"segment-btn" + (planTab === "woche" ? " aktiv" : "")}
              onClick={() => setPlanTab("woche")}
            >
              Woche
            </button>
          </div>
        </div>

        {planTab === "tag" ? (
          <>
            {heuteStunden.length > 0 && (
              aktuell ? (
                <p className="heute-jetzt">
                  Jetzt: <strong>{aktuell.fach}</strong> · Raum {aktuell.raum} · bis {aktuell.bis} Uhr
                </p>
              ) : naechste ? (
                <p className="heute-jetzt">
                  Als Nächstes: <strong>{naechste.fach}</strong> um {naechste.von} Uhr · Raum {naechste.raum}
                </p>
              ) : (
                <p className="heute-jetzt">Heute kein Unterricht mehr.</p>
              )
            )}
            {heuteStunden.length > 0 ? (
              <ul className="agenda">
                {heuteStunden.map((s, i) => {
                  const ist = aktuell && s.von === aktuell.von && s.fach === aktuell.fach;
                  const farbe = fachFarbe[s.fach] || "#868e96";
                  const begriff = begriffeArt[s.art];
                  return (
                    <li key={i} className={"agenda-item" + (ist ? " jetzt" : "")}>
                      <span className="agenda-zeit">{s.von}</span>
                      <span className="agenda-strich" style={{ background: farbe }} />
                      <span className="agenda-fach">
                        {s.fach}
                        {s.art && s.art !== "angeleitet" && (
                          <span className="agenda-tag">
                            {begriff ? <Begriff name={begriff}>{artLabel[s.art]}</Begriff> : artLabel[s.art]}
                          </span>
                        )}
                      </span>
                      <span className="agenda-raum">{s.raum}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="heute-leer">Wochenende. Pause genießen.</p>
            )}
          </>
        ) : (
          <Kalender
            jetzt={jetzt}
            aufgaben={aufgaben}
            erledigt={erledigt}
            lernschritte={lernschritte}
            onOpen={onOpen}
          />
        )}
      </section>

      <p className="heute-knb">
        Nächster <Begriff name="koennensbeweis">Könnensbeweis</Begriff>:{" "}
        <strong>{naechsterKnb.fach}</strong> · {formatTage(knbTage)}
      </p>
      </>
      )}
    </div>
  );
}
