import { useEffect, useState } from "react";
import { koennensbeweise, kbFarbe } from "../data/koennensbeweise";
import { stundenWoche, fachFarbe, stundenId } from "../data/stundenplanWoche";
import { etappen } from "../data/etappen";
import { lernwegFuerKb } from "../data/wissen";
import { generatorFuerKb } from "./uebungen";
import {
  lade,
  WOCHEN_KEY,
  ERLEDIGT_KEY,
  AKTUELLE_WOCHE,
  heuteTag,
  slotTag,
  ladeStunden,
  setzeHeuteTag,
  meldeAenderung,
} from "./planung";
import Begriff from "./Begriff";
import KlassenPuls from "./KlassenPuls";
import { ladeNotizen, entferneNotiz } from "./notizen";
import { ladeSchritte } from "./lernschritte";
import "./Heute.css";

// Sammelt die Zusatzinfos zu einem Etappenziel für die Tageskarte: Lernweg,
// Schritt-Fortschritt (für die KB-Bereitschaft, SCHULE.md Cluster 4), Materialien
// und ob eine Übung bereitsteht.
function kbInfo(kbId) {
  const lw = lernwegFuerKb(kbId);
  const schritteArr = lw?.thema?.schritte || [];
  const stand = ladeSchritte(kbId);
  const fertige = schritteArr.filter((st, i) =>
    stand[i] != null ? stand[i] : !!st.fertig
  ).length;
  const materialien = lw
    ? (lw.fach.materialien || []).filter((m) => m.thema === lw.thema.label).length
    : 0;
  return {
    lernweg: lw?.thema?.label || null,
    schritte: schritteArr.length,
    fertigeSchritte: fertige,
    // Bereit für die Abnahme, wenn alle Lernweg-Schritte abgehakt sind.
    bereit: schritteArr.length > 0 && fertige === schritteArr.length,
    materialien,
    hatUebung: !!generatorFuerKb(kbId),
  };
}

// Heute-Seite: zeigt den Plan des heutigen Tages, abgeleitet aus der
// Wochenplanung (kbId -> Wochentag) plus dem Stundenplan des Tages.

const ETAPPE = etappen.find((e) => e.id === 4) || etappen[0];

export default function Heute({ onFokus }) {
  const wochenZuordnung = lade(WOCHEN_KEY);
  const stundenZuord = ladeStunden(); // kbId -> Liste der geplanten Stunden-IDs
  const [erledigt, setErledigt] = useState(() => lade(ERLEDIGT_KEY));
  // Ist alles geschafft, kommt zuerst der grüne Abschluss-Screen. Dieser Schalter
  // blendet ihn weg, falls man den fertigen Tag doch noch ansehen will.
  const [tagAnsehen, setTagAnsehen] = useState(false);
  // Simulierter "heutiger" Tag (0=Mo .. 4=Fr) als Demo-/Test-Steuerung: die
  // Pfeiltasten oder die Kopf-Pfeile verschieben den echten App-Tag, damit man
  // sieht, wie sich die App an dem Tag verhält. Global gespeichert, damit die
  // Weg-Leiste und der Rest mitziehen.
  const [tag, setTag] = useState(heuteTag);
  // Geparkte Gedanken (Brain-Dump aus dem Fokus), hier zum Wegräumen.
  const [notizen, setNotizen] = useState(ladeNotizen);
  // Lange Nachzügler-Liste ruhig eingeklappt halten (nicht überladen).
  const [nachzueglerAlle, setNachzueglerAlle] = useState(false);

  useEffect(() => {
    localStorage.setItem(ERLEDIGT_KEY, JSON.stringify(erledigt));
    meldeAenderung();
  }, [erledigt]);

  // Der Erledigt-Stand kann auch von außen kommen (der Fokus-Modus hakt ein Ziel
  // ab). Auf den Planungs-Melder hören und neu einlesen, aber nur bei echter
  // Änderung, damit der Schreib-Effekt oben keine Schleife auslöst.
  useEffect(() => {
    const sync = () => {
      const fresh = lade(ERLEDIGT_KEY);
      setErledigt((cur) =>
        JSON.stringify(cur) === JSON.stringify(fresh) ? cur : fresh
      );
      setTag(heuteTag());
      const frischeNotizen = ladeNotizen();
      setNotizen((cur) =>
        JSON.stringify(cur) === JSON.stringify(frischeNotizen)
          ? cur
          : frischeNotizen
      );
    };
    window.addEventListener("neu:planung", sync);
    return () => window.removeEventListener("neu:planung", sync);
  }, []);

  // Pfeiltasten links/rechts simulieren einen Tag zurück/vor (Mo..Fr) für den
  // ganzen App-Tag. Nicht eingreifen, wenn der Fokus offen ist oder gerade in
  // einem Feld getippt wird.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (document.querySelector(".fokus")) return;
      const t = document.activeElement?.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
      const c = Math.max(
        0,
        Math.min(4, heuteTag() + (e.key === "ArrowLeft" ? -1 : 1))
      );
      setzeHeuteTag(c);
      setTag(c);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Den simulierten Tag global setzen (Weg-Leiste & Co. hängen daran, via
  // meldeAenderung in setzeHeuteTag) und lokal spiegeln.
  function springeZuTag(n) {
    const c = Math.max(0, Math.min(4, n));
    setzeHeuteTag(c);
    setTag(c);
  }

  function toggleErledigt(id) {
    setErledigt((e) => {
      const n = { ...e };
      if (n[id]) delete n[id];
      else n[id] = true;
      return n;
    });
  }

  function notizWeg(i) {
    setNotizen(entferneNotiz(i));
  }

  // Eine Tageskarte, geteilt von "Heute geplant" und "Noch offen von früher".
  function karte(k, istStart) {
    const done = !!erledigt[k.id];
    const info = kbInfo(k.id);
    const std = k.cluster === 1 ? "Clusterstunde" : "Clusterstunden";
    // In welchen Schulstunden dieses Ziel HEUTE eingeplant ist (aus der
    // Wochenplanung). Ein KB kann über mehrere Stunden verteilt sein.
    const heuteSlots = (stundenZuord[k.id] || [])
      .filter((sid) => slotTag(sid) === tag)
      .map((sid) => stundenWoche.find((s) => stundenId(s) === sid))
      .filter(Boolean)
      .sort((a, b) => a.von.localeCompare(b.von));
    const heuteFaecher = [...new Set(heuteSlots.map((s) => s.fach))];
    const stundenLabel =
      heuteSlots.length === 0
        ? null
        : heuteFaecher.length === 1
          ? `${heuteSlots.map((s) => s.von).join(", ")} · ${heuteFaecher[0]}`
          : heuteSlots.map((s) => s.von).join(", ");
    return (
      <div
        className={"hu-kb" + (done ? " done" : "")}
        key={k.id}
        style={{ "--c": kbFarbe[k.fach] || "#868e96" }}
      >
        <div className="hu-kb-zeile">
          <button
            type="button"
            className="hu-kb-check"
            onClick={() => toggleErledigt(k.id)}
            aria-pressed={done}
            aria-label={done ? "Wieder offen" : "Als erledigt markieren"}
          >
            {done ? "✓" : ""}
          </button>
          <button
            type="button"
            className="hu-kb-open"
            onClick={() => onFokus(k.id)}
            title="Im Fokus öffnen und Schritt für Schritt machen"
          >
            <span className="hu-kb-text">
              <span className="hu-kb-haupt">
                {istStart && !info.bereit && (
                  <span className="hu-kb-start">
                    {offeneAnzahl >= 2 ? "Start hier" : "Dein Ziel jetzt"}
                  </span>
                )}
                <span className="hu-kb-fach">{k.fach}</span>
                <span className="hu-kb-titel">{k.titel}</span>
                {info.hatUebung && !info.bereit && (
                  <span className="hu-kb-uebung">Üben</span>
                )}
                {info.bereit && !done && (
                  <span className="hu-kb-bereit">bereit</span>
                )}
              </span>
              <span className="hu-kb-meta">
                {stundenLabel && (
                  <span className="hu-kb-meta-item hu-kb-stunde">
                    {stundenLabel}
                  </span>
                )}
                <span className="hu-kb-meta-item">{k.code}</span>
                <span className="hu-kb-meta-item">
                  {k.cluster} <Begriff name="cluster">{std}</Begriff>
                </span>
                {info.materialien > 0 && (
                  <span className="hu-kb-meta-item">
                    {info.materialien}{" "}
                    {info.materialien === 1 ? "Material" : "Materialien"}
                  </span>
                )}
                {info.schritte > 0 && !info.bereit && (
                  <span className="hu-kb-meta-item">
                    {info.fertigeSchritte > 0
                      ? `${info.fertigeSchritte} von ${info.schritte} Schritten`
                      : `→ Schritt 1 von ${info.schritte}`}
                  </span>
                )}
              </span>
              {info.schritte > 0 && !info.bereit && info.fertigeSchritte > 0 && (
                <span className="hu-kb-balken" aria-hidden="true">
                  <span
                    className="hu-kb-balken-fuell"
                    style={{
                      width:
                        (info.fertigeSchritte / info.schritte) * 100 + "%",
                    }}
                  />
                </span>
              )}
            </span>
            <span className="hu-kb-fokus-cue" aria-hidden="true">
              Fokus →
            </span>
          </button>
        </div>
      </div>
    );
  }

  const tagDatum = new Date(ETAPPE.von + "T00:00:00");
  tagDatum.setDate(tagDatum.getDate() + AKTUELLE_WOCHE * 7 + tag);
  const datumText = tagDatum.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const kurzTag = tagDatum.toLocaleDateString("de-DE", { weekday: "short" });

  const stunde = new Date().getHours();
  const gruss =
    stunde < 11 ? "Guten Morgen" : stunde < 17 ? "Hallo" : "Guten Abend";

  // Heute geplant: Ziele mit mindestens einer Stunde an diesem Tag, sortiert
  // nach der fruehesten Stunde des Tages (folgt dem zeitlichen Tagesrhythmus).
  const minutenAusZeit = (hhmm) => {
    const [h, m] = (hhmm || "0:0").split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const fruehesteStundeHeute = (k) => {
    const zeiten = (stundenZuord[k.id] || [])
      .filter((sid) => slotTag(sid) === tag)
      .map((sid) => {
        const s = stundenWoche.find((st) => stundenId(st) === sid);
        return s ? minutenAusZeit(s.von) : 9999;
      });
    return zeiten.length ? Math.min(...zeiten) : 9999;
  };
  const tagKbs = koennensbeweise
    .filter(
      (k) =>
        wochenZuordnung[k.id] === AKTUELLE_WOCHE &&
        (stundenZuord[k.id] || []).some((sid) => slotTag(sid) === tag)
    )
    .sort((a, b) => fruehesteStundeHeute(a) - fruehesteStundeHeute(b));
  const tagStunden = stundenWoche.filter((s) => s.tag === tag);
  // Nachzügler: noch offene Ziele, deren geplante Stunden alle in der
  // Vergangenheit liegen (stilles Carry-over, ohne Schuld-Ton, SCHULE.md 2 + 8).
  const fruehesterTag = (k) =>
    Math.min(...(stundenZuord[k.id] || []).map(slotTag));
  const nachzueglerList = koennensbeweise
    .filter((k) => {
      if (wochenZuordnung[k.id] !== AKTUELLE_WOCHE || erledigt[k.id]) return false;
      const sids = stundenZuord[k.id] || [];
      return sids.length > 0 && sids.every((sid) => slotTag(sid) < tag);
    })
    // Aelteste zuerst: was am laengsten liegt, gehoert zuerst wieder angepackt.
    .sort((a, b) => fruehesterTag(a) - fruehesterTag(b));
  // "Alles geschafft" nur, wenn der Tag wirklich leer ist: die heutigen Ziele
  // erledigt UND kein Nachzügler mehr offen.
  const allesGeschafft =
    tagKbs.length > 0 &&
    tagKbs.every((k) => erledigt[k.id]) &&
    nachzueglerList.length === 0;
  // Gegen die "was jetzt?"-Blockade: den ersten offenen Punkt markieren, aber
  // nur wenn es eine Wahl gibt (2+ offen). Bei genau einem offenen Ziel ist die
  // Karte selbst schon der Start, ein extra Hinweis wäre bloß Dopplung.
  const offeneAnzahl = tagKbs.filter((k) => !erledigt[k.id]).length;
  const ersterOffen = tagKbs.find((k) => !erledigt[k.id]) || null;
  const morgenAnzahl =
    tag < 4
      ? koennensbeweise.filter(
          (k) =>
            wochenZuordnung[k.id] === AKTUELLE_WOCHE &&
            (stundenZuord[k.id] || []).some((sid) => slotTag(sid) === tag + 1)
        ).length
      : 0;

  // Tag geschafft: ruhiger grüner Abschluss als kleine Belohnung, bevor der Tag
  // wieder zur Liste wird.
  if (allesGeschafft && !tagAnsehen) {
    return (
      <div className="hu-screen hu-fertig">
        <div className="hu-fertig-karte">
          <div className="hu-fertig-haken" aria-hidden="true">
            ✓
          </div>
          <p className="hu-fertig-eyebrow">{datumText}</p>
          <h1 className="hu-fertig-titel">Alles geschafft!</h1>
          <p className="hu-fertig-text">
            {tagKbs.length === 1
              ? "Du hast heute dein Ziel erreicht. Stark gemacht, Max."
              : `Du hast heute alle ${tagKbs.length} Ziele erreicht. Stark gemacht, Max.`}
          </p>
          <p className="hu-fertig-morgen">
            {morgenAnzahl > 0
              ? `Morgen warten ${morgenAnzahl} ${
                  morgenAnzahl === 1 ? "neues Ziel" : "neue Ziele"
                } auf dich.`
              : "Genieß deinen Feierabend."}
          </p>
          <div className="hu-fertig-aktionen">
            {tag < 4 && (
              <button
                type="button"
                className="hu-fertig-weiter"
                onClick={() => springeZuTag(tag + 1)}
              >
                Nächster Tag →
              </button>
            )}
            <button
              type="button"
              className="hu-fertig-ansehen"
              onClick={() => setTagAnsehen(true)}
            >
              Tag ansehen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hu-screen">
      <header className="hu-kopf">
        <div className="hu-kopf-text">
          <p className="hu-eyebrow">Heute</p>
          <h1 className="hu-titel">{gruss}, Max.</h1>
          <p className="hu-sub">{datumText}</p>
        </div>
        <div
          className="hu-tag-nav"
          title="Anderen Tag simulieren, um zu testen, was an dem Tag passiert"
        >
          <button
            type="button"
            className="hu-tag-pfeil"
            onClick={() => springeZuTag(tag - 1)}
            disabled={tag === 0}
            aria-label="Einen Tag früher simulieren"
          >
            ‹
          </button>
          <span className="hu-tag-label" aria-hidden="true">
            {kurzTag}
          </span>
          <button
            type="button"
            className="hu-tag-pfeil"
            onClick={() => springeZuTag(tag + 1)}
            disabled={tag === 4}
            aria-label="Einen Tag später simulieren"
          >
            ›
          </button>
        </div>
      </header>

      <div className="hu-spalten">
        <section className="hu-block">
          <h2 className="hu-block-titel">Heute geplant</h2>
          {allesGeschafft && (
            <p className="hu-geschafft">
              Alles geschafft! Du hast alle Ziele für heute erledigt.
            </p>
          )}
          {tagKbs.length === 0 ? (
            <p className="hu-leer">
              {nachzueglerList.length > 0
                ? "Für heute ist nichts Neues geplant."
                : "Für heute hast du nichts eingeplant."}
            </p>
          ) : (
            <div className="hu-kbs">
              {tagKbs.map((k) =>
                karte(k, !erledigt[k.id] && ersterOffen?.id === k.id)
              )}
            </div>
          )}
          {morgenAnzahl > 0 && (
            <p className="hu-morgen">
              Morgen geplant: {morgenAnzahl}{" "}
              {morgenAnzahl === 1 ? "Ziel" : "Ziele"}
            </p>
          )}

          {nachzueglerList.length > 0 && (
            <div className="hu-nachzuegler">
              <h3 className="hu-nachzuegler-titel">Noch offen von früher</h3>
              <div className="hu-kbs">
                {(nachzueglerAlle
                  ? nachzueglerList
                  : nachzueglerList.slice(0, 3)
                ).map((k) => karte(k, false))}
              </div>
              {nachzueglerList.length > 3 && (
                <button
                  type="button"
                  className="hu-nachzuegler-mehr"
                  onClick={() => setNachzueglerAlle((v) => !v)}
                >
                  {nachzueglerAlle
                    ? "Weniger anzeigen"
                    : `+ ${nachzueglerList.length - 3} weitere anzeigen`}
                </button>
              )}
            </div>
          )}
        </section>

        <div className="hu-rechts">
          <section className="hu-block">
            <h2 className="hu-block-titel">Stundenplan</h2>
          <ul className="hu-plan">
            {tagStunden.map((s, i) => {
              const lernzeit = s.art === "studierzeit" || s.art === "selbst";
              return (
                <li
                  className={"hu-stunde" + (lernzeit ? " lernzeit" : "")}
                  key={i}
                >
                  <span className="hu-stunde-zeit">{s.von}</span>
                  <span
                    className="hu-stunde-strich"
                    style={{ background: fachFarbe[s.fach] || "#868e96" }}
                  />
                  <span className="hu-stunde-fach">{s.fach}</span>
                  {lernzeit && (
                    <span className="hu-stunde-hinweis">
                      Zeit für deine Ziele
                    </span>
                  )}
                  <span className="hu-stunde-raum">{s.raum}</span>
                </li>
              );
            })}
          </ul>
          </section>
          <KlassenPuls />
        </div>
      </div>

      {notizen.length > 0 && (
        <section className="hu-notizen">
          <h2 className="hu-block-titel">Notizzettel</h2>
          <p className="hu-notizen-hinweis">
            Geparkte Gedanken aus dem Fokus. Hak einen ab, wenn er erledigt ist.
          </p>
          <ul className="hu-notiz-liste">
            {notizen.map((t, i) => (
              <li className="hu-notiz" key={i}>
                <button
                  type="button"
                  className="hu-notiz-weg"
                  onClick={() => notizWeg(i)}
                  aria-label="Notiz wegräumen"
                >
                  ✓
                </button>
                <span className="hu-notiz-text">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
