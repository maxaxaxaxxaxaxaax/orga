import { Fragment, useEffect, useState } from "react";
import { koennensbeweise, kbFarbe, kbFaecher } from "../data/koennensbeweise";
import {
  stundenWoche,
  fachFarbe,
  stundenId,
  lehrkraefte,
  artLabel,
} from "../data/stundenplanWoche";
import { etappen } from "../data/etappen";
import { lernwegFuerKb } from "../data/wissen";
import { generatorFuerKb } from "./uebungen";
import Etappenring from "./Etappenring";
import { useRasterZiehen } from "./rasterZiehen";
import { RasterGriff, RasterOverlay } from "./raster";
import {
  lade,
  WOCHEN_KEY,
  ERLEDIGT_KEY,
  ladeErledigt,
  AKTUELLE_WOCHE,
  heuteTag,
  slotTag,
  ladeStunden,
  setzeHeuteTag,
  meldeAenderung,
} from "./planung";
import { ladeNotizen, addNotiz, entferneNotiz, toggleNotiz } from "./notizen";
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
  const [erledigt, setErledigt] = useState(ladeErledigt);
  // Ist alles geschafft, kommt zuerst der grüne Abschluss-Screen. Dieser Schalter
  // blendet ihn weg, falls man den fertigen Tag doch noch ansehen will.
  const [tagAnsehen, setTagAnsehen] = useState(false);
  // Simulierter "heutiger" Tag (0=Mo .. 4=Fr) als Demo-/Test-Steuerung: die
  // Pfeiltasten oder die Kopf-Pfeile verschieben den echten App-Tag, damit man
  // sieht, wie sich die App an dem Tag verhält. Global gespeichert, damit die
  // Weg-Leiste und der Rest mitziehen.
  const [tag, setTag] = useState(heuteTag);
  // Erinnerungen (Brain-Dump aus dem Fokus), hier zum Abhaken/Löschen.
  const [notizen, setNotizen] = useState(ladeNotizen);
  const [wisch, setWisch] = useState(null); // { i, x0, dx } für Swipe-zum-Löschen
  const [neueErinnerung, setNeueErinnerung] = useState("");
  // Lange Nachzügler-Liste ruhig eingeklappt halten (nicht überladen).
  const [nachzueglerAlle, setNachzueglerAlle] = useState(false);
  // Prototyp: die zwei senkrechten Raster-Grenzen der Übersicht per Ziehen
  // verschieben (geteilt mit Ablage/Fokus, siehe ./raster). B1 = Fortschritt|
  // Notizen, B2 = Notizen/Aufgaben|Stundenplan.
  const [b1, setB1] = useState(4);
  const [b2, setB2] = useState(8);
  const { ref: gridRef, zieht, griff } = useRasterZiehen();
  // Inhaltsdichte hängt an der Breite der jeweiligen Box: mehr Spalten -> mehr
  // Details, weniger Spalten -> nur das Wichtigste.
  const fSpan = b1; // Etappenfortschritt
  const nSpan = b2 - b1; // Notizen
  const aSpan = b2; // Aufgaben
  const pSpan = 12 - b2; // Stundenplan

  useEffect(() => {
    localStorage.setItem(ERLEDIGT_KEY, JSON.stringify(erledigt));
    meldeAenderung();
  }, [erledigt]);

  // Der Erledigt-Stand kann auch von außen kommen (der Fokus-Modus hakt ein Ziel
  // ab). Auf den Planungs-Melder hören und neu einlesen, aber nur bei echter
  // Änderung, damit der Schreib-Effekt oben keine Schleife auslöst.
  useEffect(() => {
    const sync = () => {
      const fresh = ladeErledigt();
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

  function notizWeg(i) {
    setNotizen(entferneNotiz(i));
  }
  function notizUmschalten(i) {
    setNotizen(toggleNotiz(i));
  }
  function erinnerungHinzufuegen(e) {
    e.preventDefault();
    const t = neueErinnerung.trim();
    if (!t) return;
    setNotizen(addNotiz(t));
    setNeueErinnerung("");
  }
  // Nach links wischen löscht die Erinnerung (Tippen auf die Checkbox bleibt
  // Abhaken: dort startet kein Wisch).
  function wischDown(e, i) {
    if (e.target.closest(".hu-notiz-box")) return;
    setWisch({ i, x0: e.clientX, dx: 0 });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* kein echter Zeiger */
    }
  }
  function wischMove(e, i) {
    setWisch((w) =>
      w && w.i === i ? { ...w, dx: Math.min(0, e.clientX - w.x0) } : w
    );
  }
  function wischUp(e, i) {
    if (wisch && wisch.i === i && wisch.dx < -80) notizWeg(i);
    setWisch(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* schon freigegeben */
    }
  }

  // Die frueheste fuer dieses Ziel heute eingeplante Stunde (fuer Zeit + Raum auf
  // der Aufgaben-Karte). Nachzuegler aus frueheren Tagen liefern hier null.
  function tagesStunde(k) {
    const stunden = (stundenZuord[k.id] || [])
      .filter((sid) => slotTag(sid) === tag)
      .map((sid) => stundenWoche.find((s) => stundenId(s) === sid))
      .filter(Boolean)
      .sort((a, b) => minutenAusZeit(a.von) - minutenAusZeit(b.von));
    return stunden[0] || null;
  }

  // Eine Aufgaben-Karte (Lernweg-Stil), geteilt von "Meine Aufgaben" und "Noch
  // offen von früher": Fach in Fachfarbe, der konkrete Lernweg darunter, Zeit- und
  // Raum-Chip und unten ein ruhiger Fortschrittsbalken (schon gemachte Schritte).
  function karte(k) {
    const done = !!erledigt[k.id];
    const info = kbInfo(k.id);
    const st = tagesStunde(k);
    const anzahlStunden = (stundenZuord[k.id] || []).filter(
      (sid) => slotTag(sid) === tag
    ).length;
    const prog =
      info.schritte > 0
        ? Math.round((info.fertigeSchritte / info.schritte) * 100)
        : 0;
    const bereit = !done && prog >= 100;
    return (
      <button
        type="button"
        className={"hu-auf" + (done ? " done" : "")}
        key={k.id}
        style={{ "--c": kbFarbe[k.fach] || "#868e96" }}
        onClick={() => onFokus(k.id)}
        title="Im Fokus öffnen und Schritt für Schritt machen"
      >
        <span className="hu-auf-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="2.3" />
            <circle cx="18" cy="18" r="2.3" />
            <path d="M6 8.3v3.4a4 4 0 0 0 4 4h5.4" />
          </svg>
        </span>
        <span className="hu-auf-titel">{k.titel}</span>
        <span className="hu-auf-fach">{k.fach}</span>
        <span className="hu-auf-chips">
          {aSpan >= 5 && (
            <span className="hu-auf-chip">
              <svg
                className="hu-auf-chip-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="4" y="5" width="16" height="15" rx="2.5" />
                <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
              </svg>
              {st ? `${st.von} - ${st.bis}` : "frei einteilbar"}
            </span>
          )}
          {anzahlStunden > 0 && aSpan >= 8 && (
            <span className="hu-auf-chip">
              <svg
                className="hu-auf-chip-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7.5v5l3 2" />
              </svg>
              {anzahlStunden} {anzahlStunden === 1 ? "Stunde" : "Stunden"}
            </span>
          )}
          {st && aSpan >= 6 && (
            <span className="hu-auf-chip">
              <svg
                className="hu-auf-chip-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              {st.raum}
            </span>
          )}
        </span>
        {aSpan >= 9 &&
          (info.schritte > 0 ||
            (aSpan >= 10 && (info.materialien > 0 || info.hatUebung))) && (
            <span className="hu-auf-meta">
              {info.schritte > 0 && (
                <span className="hu-auf-meta-teil">
                  {info.fertigeSchritte}/{info.schritte} Schritte
                </span>
              )}
              {aSpan >= 10 && info.materialien > 0 && (
                <span className="hu-auf-meta-teil">
                  {info.materialien} Materialien
                </span>
              )}
              {aSpan >= 10 && info.hatUebung && (
                <span className="hu-auf-meta-teil">Übung dabei</span>
              )}
            </span>
          )}
        {done ? (
          <span className="hu-auf-status done">✓ Erledigt</span>
        ) : prog > 0 ? (
          <span className="hu-auf-prog">
            <span className="hu-auf-prog-label">
              {bereit ? "Bereit zur Abnahme" : "Von gestern"}
            </span>
            <span className="hu-auf-prog-bar">
              <span style={{ width: prog + "%" }} />
            </span>
            <span className="hu-auf-prog-pct">{prog}%</span>
          </span>
        ) : null}
      </button>
    );
  }

  const tagDatum = new Date(ETAPPE.von + "T00:00:00");
  tagDatum.setDate(tagDatum.getDate() + AKTUELLE_WOCHE * 7 + tag);
  const datumText = tagDatum.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Heute geplant: Ziele mit mindestens einer Stunde an diesem Tag, sortiert
  // nach der fruehesten Stunde des Tages (folgt dem zeitlichen Tagesrhythmus).
  const minutenAusZeit = (hhmm) => {
    const [h, m] = (hhmm || "0:0").split(":").map(Number);
    return h * 60 + (m || 0);
  };
  // Uhrzeit ohne führende Null (Figma-Stil: "8:00" statt "08:00"), spart Platz.
  const kurzeZeit = (t) => (t || "").replace(/^0/, "");
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
  const morgenAnzahl =
    tag < 4
      ? koennensbeweise.filter(
          (k) =>
            wochenZuordnung[k.id] === AKTUELLE_WOCHE &&
            (stundenZuord[k.id] || []).some((sid) => slotTag(sid) === tag + 1)
        ).length
      : 0;

  // Etappenfortschritt: pro Fach Anteil erledigter Ziele (Ring) plus drei
  // sachliche Kennzahlen. Spiegelt den Stand, wertet nicht (VISION).
  const proFach = kbFaecher.map((f) => {
    const ziele = koennensbeweise.filter((k) => k.fach === f);
    const done = ziele.filter((k) => erledigt[k.id]).length;
    return {
      fach: f,
      color: kbFarbe[f] || "#868e96",
      total: ziele.length,
      done,
      fraction: ziele.length ? done / ziele.length : 0,
    };
  });
  const zieleGesamt = koennensbeweise.length;
  const zieleDone = koennensbeweise.filter((k) => erledigt[k.id]).length;

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
      <div
        className={"hu-grid" + (zieht ? " raster-zieht" : "")}
        ref={gridRef}
        style={{ "--n-start": b1 + 1, "--p-start": b2 + 1 }}
      >
        {/* Beim Ziehen: das 12-Spalten-Raster als Hilfslinien einblenden. */}
        {zieht && <RasterOverlay />}
        {/* Links oben: Etappenfortschritt */}
        <section className="hu-karte hu-fortschritt">
          <h2 className="hu-karte-titel">
            <svg className="hu-karte-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19V5M4 19h16M7.5 15l3.5-4 3 2 4.5-6" />
            </svg>
            Etappenfortschritt
          </h2>
          {fSpan >= 3 && (
            <p className="hu-karte-sub">
              Alle deine Könnensbeweise auf einen Blick
            </p>
          )}
          <Etappenring
            ringe={proFach}
            gesamtDone={zieleDone}
            gesamtTotal={zieleGesamt}
          />
          {fSpan >= 4 && zieleGesamt - zieleDone > 0 && (
            <p className="hu-fort-rest">
              Noch {zieleGesamt - zieleDone}{" "}
              {zieleGesamt - zieleDone === 1 ? "Ziel" : "Ziele"} bis zur vollen
              Etappe
            </p>
          )}
          {/* Breit gezogen: zusätzlich die Fächer einzeln auflisten. */}
          {fSpan >= 5 && (
            <ul className="hu-fort-legende">
              {proFach.map((r) => (
                <li className="hu-fort-legende-zeile" key={r.fach}>
                  <span
                    className="hu-fort-legende-punkt"
                    style={{ background: r.color }}
                    aria-hidden="true"
                  />
                  <span className="hu-fort-legende-fach">{r.fach}</span>
                  <span className="hu-fort-legende-bar" aria-hidden="true">
                    <span
                      style={{
                        width: Math.round(r.fraction * 100) + "%",
                        background: r.color,
                      }}
                    />
                  </span>
                  <span className="hu-fort-legende-wert">
                    {r.done}/{r.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <RasterGriff
            {...griff("b1", (s) => setB1(Math.max(2, Math.min(b2 - 2, s))))}
          />
        </section>

        {/* Mitte oben: Erinnerungen (Abhaken, Hinzufügen, Wischen zum Löschen) */}
        <section className="hu-karte hu-notizen">
          <h2 className="hu-karte-titel">
            <svg className="hu-karte-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
              <path d="M9 8.5h6M9 12h6M9 15.5h4" />
            </svg>
            Erinnerungen
          </h2>
          {nSpan >= 4 && (
            <p className="hu-karte-sub">Was du nicht vergessen willst</p>
          )}
          {notizen.length === 0 ? (
            <p className="hu-notizen-leer">
              Noch keine Erinnerung. Schreib unten deine erste rein.
            </p>
          ) : (
            <ul className="hu-notiz-liste">
              {notizen.map((n, i) => (
                <li
                  className={
                    "hu-notiz" +
                    (n.erledigt ? " erledigt" : "") +
                    (wisch && wisch.i === i ? " wischt" : "")
                  }
                  key={i}
                  style={
                    wisch && wisch.i === i
                      ? {
                          transform: `translateX(${wisch.dx}px)`,
                          opacity: Math.max(0, 1 + wisch.dx / 200),
                        }
                      : undefined
                  }
                  onPointerDown={(e) => wischDown(e, i)}
                  onPointerMove={(e) => wischMove(e, i)}
                  onPointerUp={(e) => wischUp(e, i)}
                  onPointerCancel={() => setWisch(null)}
                >
                  <button
                    type="button"
                    className="hu-notiz-box"
                    onClick={() => notizUmschalten(i)}
                    role="checkbox"
                    aria-checked={!!n.erledigt}
                    aria-label={n.text}
                  >
                    {n.erledigt && <span aria-hidden="true">✓</span>}
                  </button>
                  <span className="hu-notiz-text">
                    {n.text}
                    {n.kontext && nSpan >= 3 && (
                      <span className="hu-notiz-kontext">{n.kontext}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="hu-notiz-weg"
                    onClick={() => notizWeg(i)}
                    aria-label="Erinnerung entfernen"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="hu-notiz-add" onSubmit={erinnerungHinzufuegen}>
            <input
              className="hu-notiz-add-feld"
              type="text"
              value={neueErinnerung}
              onChange={(e) => setNeueErinnerung(e.target.value)}
              placeholder="Erinnerung hinzufügen"
              aria-label="Neue Erinnerung"
            />
            <button
              type="submit"
              className="hu-notiz-add-knopf"
              aria-label="Erinnerung hinzufügen"
            >
              +
            </button>
          </form>
          <RasterGriff
            {...griff("b2", (s) => setB2(Math.max(b1 + 2, Math.min(10, s))))}
          />
        </section>

        {/* Links/Mitte unten: Aufgaben (über zwei Spalten) */}
        <section className="hu-karte hu-aufgaben">
          <h2 className="hu-karte-titel hu-aufgaben-titel">
            <svg className="hu-karte-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 7l1.5 1.5L7.5 5M3.5 15.5l1.5 1.5 3-3.5M11 7h9.5M11 16h9.5" />
            </svg>
            Aufgaben
            <span className="hu-aufgaben-datum">
              {tagDatum.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </span>
          </h2>
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
            <div className="hu-auf-grid">{tagKbs.map((k) => karte(k))}</div>
          )}

          {nachzueglerList.length > 0 && (
            <div className="hu-nachzuegler">
              <h3 className="hu-nachzuegler-titel">Noch offen von früher</h3>
              <div className="hu-auf-grid">
                {(nachzueglerAlle
                  ? nachzueglerList
                  : nachzueglerList.slice(0, 3)
                ).map((k) => karte(k))}
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
          <RasterGriff
            {...griff("b2", (s) => setB2(Math.max(b1 + 2, Math.min(10, s))))}
          />
        </section>

        {/* Rechte Spalte (volle Höhe): Stundenplan als Tages-Timeline */}
        <aside className="hu-karte hu-plan-karte">
          <h2 className="hu-karte-titel">
            <svg className="hu-karte-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2.5" />
              <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
            </svg>
            Stundenplan
          </h2>
          <ul className="hu-plan">
            {tagStunden.map((s, i) => {
              const prev = tagStunden[i - 1];
              const pause = prev
                ? minutenAusZeit(s.von) - minutenAusZeit(prev.bis)
                : 0;
              const lernzeit = s.art === "studierzeit" || s.art === "selbst";
              const istPause = s.art === "pause";
              // Welche heutigen Ziele sind in dieser Stunde eingeplant?
              const geplant = tagKbs.filter((k) =>
                (stundenZuord[k.id] || []).includes(stundenId(s))
              );
              return (
                <Fragment key={i}>
                  {pause > 0 && (
                    <li className="hu-plan-pause">
                      <span>{pause} min</span>
                    </li>
                  )}
                  <li
                    className={
                      "hu-stunde" +
                      (lernzeit ? " lernzeit" : "") +
                      (istPause ? " neutral" : "")
                    }
                  >
                    <span
                      className="hu-stunde-strich"
                      style={{ background: fachFarbe[s.fach] || "#cbd5d1" }}
                    />
                    <span className="hu-stunde-info">
                      <span className="hu-stunde-fach">{s.fach}</span>
                      {lehrkraefte[s.fach] && pSpan >= 4 && (
                        <span className="hu-stunde-lehrer">
                          {lehrkraefte[s.fach]}
                        </span>
                      )}
                      {pSpan >= 3 && (
                        <span className="hu-stunde-raum">{s.raum}</span>
                      )}
                      {pSpan >= 5 && artLabel[s.art] && (
                        <span className="hu-stunde-art">{artLabel[s.art]}</span>
                      )}
                      {pSpan >= 6 && geplant.length > 0 && (
                        <span className="hu-stunde-geplant">
                          {geplant.map((k) => k.titel).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="hu-stunde-zeit">
                      {kurzeZeit(s.von)} - {kurzeZeit(s.bis)}
                    </span>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
