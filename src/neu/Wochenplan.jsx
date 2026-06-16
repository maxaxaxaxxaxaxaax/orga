import { useEffect, useState } from "react";
import { koennensbeweise } from "../data/koennensbeweise";
import {
  stundenWoche,
  fachFarbe,
  istBelegbar,
  stundenId,
  artLabel,
} from "../data/stundenplanWoche";
import { etappen } from "../data/etappen";
import KbChip from "./KbChip";
import { meldeAenderung, slotTag, ladeStunden } from "./planung";
import "./Wochenplan.css";

// Wochenstart: der Schüler verteilt die Uhren (Clusterstunden) der KBs dieser
// Woche auf konkrete Schulstunden. Eine Uhr = eine Unterrichtsstunde, also eine
// Stunde pro Slot. Ein Ziel mit mehreren Uhren wird über mehrere Stunden
// verteilt (auch über Tage). Belegbar sind Hauptfach-Stunden plus Studierzeit;
// Nebenfächer und Projekte nicht. Immer nur eine Woche.

const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];
const WOCHEN_KEY = "neu.etappenplan.zuordnung"; // kbId -> Wochen-Index (read-only)
const STUNDEN_KEY = "neu.wochenplan.stunden"; // kbId -> [Stunden-ID, ...] (je 1 Uhr)
const TAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

function lade(key) {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}

function wochenStart(e, wIdx) {
  const start = new Date(e.von + "T00:00:00");
  start.setDate(start.getDate() + wIdx * 7);
  return start;
}
function tagDatum(montag, tagIdx) {
  const d = new Date(montag);
  d.setDate(montag.getDate() + tagIdx);
  return d.getDate() + "." + (d.getMonth() + 1) + ".";
}
function bereichText(montag) {
  const bis = new Date(montag);
  bis.setDate(montag.getDate() + 4); // Mo bis Fr
  const m = (d) => d.toLocaleDateString("de-DE", { month: "short" });
  const t = (d) => d.getDate();
  if (m(montag) === m(bis)) return `${t(montag)}.–${t(bis)}. ${m(montag)}`;
  return `${t(montag)}. ${m(montag)} – ${t(bis)}. ${m(bis)}`;
}

// Alle belegbaren Stunden-IDs der Woche (Mo-Fr), für die Auto-Verteilung.
function alleBelegbarenSlots() {
  const slots = [];
  for (let i = 0; i < TAGE.length; i++) {
    stundenWoche
      .filter((s) => s.tag === i && istBelegbar(s))
      .forEach((s) => slots.push(stundenId(s)));
  }
  return slots;
}

// woche = Index der aktuellen Woche (0-basiert). Vorerst fest Woche 1; sobald die
// Heute-/Datums-Ebene steht, folgt sie der echten laufenden Woche.
export default function Wochenplan({ onZurueck, onWeiter, woche = 0 }) {
  const wochenZuordnung = lade(WOCHEN_KEY); // kbId -> Woche
  const [stunden, setStunden] = useState(ladeStunden); // kbId -> [Slot-IDs]
  const [ueber, setUeber] = useState(null); // aktuelles Drop-Ziel (Hover)
  const [gewaehltId, setGewaehltId] = useState(null); // angetippter Chip (Touch)

  useEffect(() => {
    localStorage.setItem(STUNDEN_KEY, JSON.stringify(stunden));
    meldeAenderung();
  }, [stunden]);

  const wocheKbs = koennensbeweise.filter(
    (k) => wochenZuordnung[k.id] === woche
  );
  // Wie viele Uhren eines Ziels sind noch nicht auf eine Stunde gelegt?
  const restVon = (k) => k.cluster - (stunden[k.id]?.length || 0);
  const vorrat = wocheKbs.filter((k) => restVon(k) > 0);
  const wocheFertig = wocheKbs.length > 0 && vorrat.length === 0;
  const montag = wochenStart(ETAPPE, woche);

  const proTag = TAGE.map((name, i) => {
    const stundenDesTages = stundenWoche
      .filter((s) => s.tag === i && s.art !== "pause")
      .map((s) => ({ ...s, sid: stundenId(s), belegbar: istBelegbar(s) }));
    const uhrenAmTag = wocheKbs.reduce(
      (n, k) =>
        n + (stunden[k.id] || []).filter((sid) => slotTag(sid) === i).length,
      0
    );
    return { name, idx: i, datum: tagDatum(montag, i), stundenDesTages, uhrenAmTag };
  });

  function dragStart(e, id, quelleSlot) {
    e.dataTransfer.setData("text/plain", id + "|" + (quelleSlot || ""));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(e.currentTarget, 12, 12);
  }
  function dragEnde() {
    setUeber(null);
  }

  // Eine Uhr auf eine Stunde legen (oder von einer Stunde auf eine andere ziehen).
  function platziereUhr(id, zielSlot, quelleSlot) {
    const kb = koennensbeweise.find((k) => k.id === id);
    if (!kb) return;
    setStunden((prev) => {
      const arr = new Set(prev[id] || []);
      const istMove = !!quelleSlot && quelleSlot !== zielSlot;
      if (istMove) arr.delete(quelleSlot);
      if (arr.has(zielSlot)) return { ...prev, [id]: [...arr] };
      // Mehr Uhren als das Ziel hat, gibt es nicht (außer beim Verschieben).
      if (!istMove && arr.size >= kb.cluster) return prev;
      arr.add(zielSlot);
      return { ...prev, [id]: [...arr] };
    });
  }
  // Eine einzelne Uhr von einer Stunde zurück in den Vorrat.
  function entferneUhr(id, slotId) {
    setStunden((prev) => {
      const arr = (prev[id] || []).filter((s) => s !== slotId);
      const n = { ...prev };
      if (arr.length) n[id] = arr;
      else delete n[id];
      return n;
    });
  }

  // Tippen-zum-Zuordnen (Touch): Ziel antippen, dann eine Stunde antippen.
  function waehle(id) {
    setGewaehltId((g) => (g === id ? null : id));
  }
  function tippZuSlot(slotId) {
    if (gewaehltId == null) return;
    const kb = koennensbeweise.find((k) => k.id === gewaehltId);
    const schon = new Set(stunden[gewaehltId] || []);
    platziereUhr(gewaehltId, slotId, null);
    // Liegen danach alle Uhren? Dann Auswahl lösen, sonst für die nächste Uhr halten.
    const nachher = schon.has(slotId) ? schon.size : schon.size + 1;
    if (!kb || nachher >= kb.cluster) setGewaehltId(null);
  }

  // Offene Uhren ausgewogen auf die belegbaren Stunden verteilen (least-loaded
  // zuerst, je Ziel höchstens eine Uhr pro Stunde). Danach frei anpassbar.
  function vorschlagVerteilen() {
    const slots = alleBelegbarenSlots();
    if (slots.length === 0) return;
    setStunden((prev) => {
      const next = { ...prev };
      const last = {};
      slots.forEach((sid) => (last[sid] = 0));
      for (const k of wocheKbs) {
        for (const sid of next[k.id] || []) {
          if (last[sid] != null) last[sid]++;
        }
      }
      for (const kb of wocheKbs) {
        const have = new Set(next[kb.id] || []);
        let fehlend = kb.cluster - have.size;
        while (fehlend > 0) {
          let best = null;
          for (const sid of slots) {
            if (have.has(sid)) continue;
            if (best === null || last[sid] < last[best]) best = sid;
          }
          if (best === null) break; // keine freie Stunde mehr
          have.add(best);
          last[best]++;
          fehlend--;
        }
        next[kb.id] = [...have];
      }
      return next;
    });
  }

  // KB-Chip einer einzelnen Uhr in einer Stunde (zurücklegbar per Tippen/Ziehen).
  function uhrChip(k, sid) {
    return (
      <KbChip
        k={k}
        key={k.id}
        platziert
        mitFach
        zahl={null}
        onDragStart={(e, id) => dragStart(e, id, sid)}
        onDragEnd={dragEnde}
        onZurueck={() => entferneUhr(k.id, sid)}
      />
    );
  }

  return (
    <div className="wp-screen">
      <header className="wp-kopf">
        <div className="wp-kopf-text">
          <p className="wp-eyebrow">Woche planen</p>
          <h1 className="wp-titel">Plane deine Woche</h1>
          <p className="wp-sub">
            Woche {woche + 1} · {bereichText(montag)} · leg jede Uhr auf eine
            Hauptfach-Stunde. Größere Ziele gehen über mehrere Stunden.
          </p>
        </div>
        <div className="wp-kopf-aktion">
          <span className={"wp-fortschritt" + (wocheFertig ? " fertig" : "")}>
            {wocheFertig ? "Alle Uhren verteilt ✓" : `noch ${vorrat.length} offen`}
          </span>
          <div className="wp-kopf-buttons">
            <button type="button" className="wp-zurueck" onClick={onZurueck}>
              ← Etappenplan
            </button>
            <button
              type="button"
              className="wp-vorschlag"
              onClick={vorschlagVerteilen}
              disabled={vorrat.length === 0}
              title="Die offenen Uhren ausgewogen auf die Stunden verteilen, danach frei anpassen"
            >
              Für mich vorschlagen
            </button>
            <button
              type="button"
              className="wp-weiter"
              onClick={onWeiter}
              disabled={!wocheFertig}
              title={
                wocheFertig
                  ? "Weiter zur Heute-Seite"
                  : "Erst alle Uhren dieser Woche auf Stunden verteilen"
              }
            >
              Weiter →
            </button>
          </div>
        </div>
      </header>

      {/* Vorrat: Ziele dieser Woche mit noch offenen Uhren */}
      <div
        className={"wp-vorrat" + (ueber === "pool" ? " ueber" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          setUeber("pool");
        }}
        onDragLeave={() => setUeber((u) => (u === "pool" ? null : u))}
        onDrop={(e) => {
          e.preventDefault();
          const [id, quelle] = (e.dataTransfer.getData("text/plain") || "").split("|");
          if (id && quelle) entferneUhr(id, quelle);
          setUeber(null);
        }}
        onClick={() => gewaehltId != null && setGewaehltId(null)}
      >
        <span className="wp-vorrat-label">Diese Woche</span>
        {vorrat.length === 0 ? (
          <span className="wp-vorrat-leer">
            {wocheKbs.length === 0
              ? "Keine Ziele in dieser Woche."
              : "Alle Uhren verteilt."}
          </span>
        ) : (
          vorrat.map((k) => (
            <KbChip
              k={k}
              key={k.id}
              mitFach
              zahl={restVon(k)}
              gewaehlt={gewaehltId === k.id}
              onTippen={waehle}
              onDragStart={(e, id) => dragStart(e, id, null)}
              onDragEnd={dragEnde}
            />
          ))
        )}
      </div>

      {/* Wochentage mit ihren Stunden als Drop-Ziele */}
      <div className="wp-tage">
        {proTag.map((tg) => (
          <section key={tg.idx} className="wp-tag">
            <header className="wp-tag-kopf">
              <div className="wp-tag-titel">
                <span className="wp-tag-name">{tg.name}</span>
                <span className="wp-tag-datum">{tg.datum}</span>
              </div>
              {tg.uhrenAmTag > 0 && (
                <span className="wp-tag-summe">{tg.uhrenAmTag}</span>
              )}
            </header>

            <div className="wp-tag-stunden">
              {tg.stundenDesTages.map((s) => {
                if (!s.belegbar) {
                  return (
                    <div className="wp-stunde-zu" key={s.sid} title="Nicht belegbar">
                      <span className="wp-stunde-zeit">{s.von}</span>
                      <span
                        className="wp-stunde-dot"
                        style={{ background: fachFarbe[s.fach] || "#868e96" }}
                      />
                      <span className="wp-stunde-fach">{s.fach}</span>
                    </div>
                  );
                }
                const slotKbs = wocheKbs.filter((k) =>
                  (stunden[k.id] || []).includes(s.sid)
                );
                const aktiv = ueber === s.sid;
                return (
                  <div
                    key={s.sid}
                    className={
                      "wp-slot" +
                      (aktiv ? " ueber" : "") +
                      (gewaehltId != null ? " tippbar" : "")
                    }
                    onDragOver={(e) => {
                      e.preventDefault();
                      setUeber(s.sid);
                    }}
                    onDragLeave={() => setUeber((u) => (u === s.sid ? null : u))}
                    onDrop={(e) => {
                      e.preventDefault();
                      const [id, quelle] = (
                        e.dataTransfer.getData("text/plain") || ""
                      ).split("|");
                      if (id) platziereUhr(id, s.sid, quelle || null);
                      setUeber(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      tippZuSlot(s.sid);
                    }}
                  >
                    <div className="wp-slot-kopf">
                      <span className="wp-stunde-zeit">{s.von}</span>
                      <span className="wp-slot-fach">{s.fach}</span>
                      <span className={"wp-slot-art wp-art-" + s.art}>
                        {artLabel[s.art] || s.art}
                      </span>
                    </div>
                    <div className="wp-slot-kbs">
                      {slotKbs.length === 0 ? (
                        <span className="wp-slot-leer">
                          {aktiv || gewaehltId != null ? "hier ablegen" : "frei"}
                        </span>
                      ) : (
                        slotKbs.map((k) => uhrChip(k, s.sid))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
