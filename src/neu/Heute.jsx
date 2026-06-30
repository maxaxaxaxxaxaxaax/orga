import { Fragment, useEffect, useRef, useState } from "react";
import { koennensbeweise, kbFarbe } from "../data/koennensbeweise";
import {
  stundenWoche,
  fachFarbe,
  istBelegbar,
  stundenId,
  lehrkraefte,
  artLabel,
} from "../data/stundenplanWoche";
import { etappen } from "../data/etappen";
import { lernwegFuerKb } from "../data/wissen";
import { generatorFuerKb } from "./uebungen";
import Etappenring from "./Etappenring";
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
  fachWochenFortschritt,
} from "./planung";
import { ladeNotizen, addNotiz, entferneNotiz, toggleNotiz } from "./notizen";
import { ladeSchritte } from "./lernschritte";
import {
  ladeMitteilungen,
  markiereAlleGelesen,
  MITTEILUNG_EVENT,
} from "./benachrichtigungen";
import Icon from "./Icon";
import NachrichtenChat from "./NachrichtenChat";
import { fachTextFarbe } from "./farbe";
import "./Heute.css";

// Coach-Mitteilung: kleines Personen-Symbol (kein eigenes Set-Icon dafür).
const PersonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="hu-nachr-svg"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Linke Position eines Reglers GENAU in der Mitte der Grid-Lücke. Bei `left: pct%`
// allein säße er nur bei 50/50 mittig; sonst ist er um gap*(pct/100 - 0.5) versetzt,
// weil die Spalten sich die Breite ohne die Lücke teilen. Diese Korrektur gleicht das
// aus (der Regler hat translateX(-50%), `left` ist also seine Mitte).
function teilerLinks(pct) {
  const k = 0.5 - pct / 100;
  const vz = k >= 0 ? "+" : "-";
  return `calc(${pct}% ${vz} ${Math.abs(k).toFixed(4)} * var(--grid-gap, 18px))`;
}

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
  // Aktuelle Uhrzeit in Minuten (einmal beim Öffnen erfasst): markiert im
  // Stundenplan die Stunde, in der man gerade ist (nur am Demo-"heute").
  const [jetztMin] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  // Erinnerungen (Brain-Dump aus dem Fokus), hier zum Abhaken/Löschen.
  const [notizen, setNotizen] = useState(ladeNotizen);
  const [wisch, setWisch] = useState(null); // { i, x0, dx } für Swipe-zum-Löschen
  const [neueErinnerung, setNeueErinnerung] = useState("");
  // Nachrichten/Mitteilungen (früher in der Topbar-Glocke), jetzt als eigene Box.
  const [mitteilungen, setMitteilungen] = useState(ladeMitteilungen);
  // Chat-Fenster mit der Lerncoach (öffnet beim Tippen auf eine Nachricht).
  const [chatOffen, setChatOffen] = useState(false);
  useEffect(() => {
    const f = () => setMitteilungen(ladeMitteilungen());
    window.addEventListener(MITTEILUNG_EVENT, f);
    return () => window.removeEventListener(MITTEILUNG_EVENT, f);
  }, []);
  // Box ist dauerhaft sichtbar: kurz den frischen Stand zeigen, dann als gelesen
  // markieren (der "neu"-Punkt verschwindet ruhig).
  useEffect(() => {
    const id = setTimeout(() => markiereAlleGelesen(), 1500);
    return () => clearTimeout(id);
  }, []);
  // Lange Nachzügler-Liste ruhig eingeklappt halten (nicht überladen).
  const [nachzueglerAlle, setNachzueglerAlle] = useState(false);
  // Vier Boxen im 2x2, je Reihe ein eigener Breiten-Regler (oben Etappe|Nachrichten,
  // unten Aufgaben|Erinnerungen). Beide rasten identisch: die linke Box auf 3, 4 oder
  // 5 der 8 linken Spalten (drei Größen), die rechte behält so immer mindestens 3
  // Spalten. Lebt nur im Speicher (Reload setzt zurück). Stundenplan rechts bleibt fest.
  const gridRef = useRef(null);
  // Start immer in der kleinsten Etappen-Stufe (2 Spalten, nur Ring); von dort zieht
  // man auf. o = 25 entspricht 2 von 8 Spalten. p = Anteil der linken Fläche am
  // Gesamtraster (Default 2/3, also Stundenplan rechts = 1/3). Lebt nur im Speicher.
  const [splits, setSplits] = useState({ o: 25, u: 50, p: 200 / 3 });
  const [zieh, setZieh] = useState(null); // { key, rect } beim seitlichen Ziehen
  // Klick auf eine Box maximiert sie (größte Stufe); erneuter Klick stellt die
  // vorherige Größe wieder her. splitsVorher merkt sich die manuelle Größe davor.
  const [maximiert, setMaximiert] = useState(null);
  const [splitsVorher, setSplitsVorher] = useState(null);
  function ziehStart(e, key) {
    e.preventDefault();
    // Manuelles Ziehen hebt einen per Klick maximierten Zustand auf.
    setMaximiert(null);
    setSplitsVorher(null);
    // Container (.hu-row) über das Eltern-Element des Reglers.
    const cont = e.currentTarget.parentElement;
    if (!cont) return;
    setZieh({ key, rect: cont.getBoundingClientRect() });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* kein echter Zeiger */
    }
  }
  function ziehBewegen(e) {
    if (!zieh) return;
    const { rect, key } = zieh;
    const roh = ((e.clientX - rect.left) / rect.width) * 100;
    let pct;
    if (key === "p") {
      // Stundenplan-Regler: linke Fläche auf 7, 8 oder 9 von 12 Spalten rasten, der
      // Stundenplan rechts also auf 5, 4 oder 3 Spalten. Jede Stufe blendet eine Info
      // ein/aus: 3=Fach+Raum+Zeit, 4=+Lehrer, 5=+Typ. Noch schmaler (2 Spalten) macht
      // die linke Fläche zu breit und erzeugt komische Abstände, daher bei 3 gedeckelt.
      const cols = Math.max(7, Math.min(9, Math.round((roh / 100) * 12)));
      pct = (cols / 12) * 100;
    } else {
      // o/u: drei Stufen der linken Spalte (2, 4 oder 5 von 8). Die linke Spalte bleibt
      // absolut gleich breit, egal wo der Stundenplan-Regler steht, daher wird die
      // Cursor-Position über den aktuellen p-Stand auf die Referenz zurückgerechnet:
      // Spalten-Anteil = roh / 100 * (Reihenbreite / Referenz) = roh/100 * (p / (2/3)).
      const ziel = (roh / 100) * 8 * (splits.p / 100 / (2 / 3));
      const spalten = ziel < 3 ? 2 : ziel < 4.5 ? 4 : 5;
      pct = (spalten / 8) * 100;
    }
    setSplits((s) => (s[key] === pct ? s : { ...s, [key]: pct }));
  }
  function ziehEnde(e) {
    setZieh(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* schon freigegeben */
    }
  }
  function reglerProps(key) {
    return {
      onPointerDown: (e) => ziehStart(e, key),
      onPointerMove: ziehBewegen,
      onPointerUp: ziehEnde,
      onPointerCancel: ziehEnde,
    };
  }
  // Zielwerte für "maximal" je Box. WICHTIG: jede Box rastet nur entlang IHRES eigenen
  // Reglers (obere Reihe o, untere Reihe u, Stundenplan p) auf den größten Wert. Die
  // Plan-Fläche (p) wird von den linken Boxen NICHT verstellt, sonst würde ein Klick auf
  // z.B. Nachrichten die ganze linke Fläche verbreitern und die Nachbarbox (Etappe) in
  // eine beim Ziehen unerreichbare Größe schieben.
  const O_MAX = (5 / 8) * 100; // linke Spalte am breitesten (5 von 8)
  const O_MIN = (2 / 8) * 100; // linke Spalte am schmalsten (2 von 8) -> rechte am breitesten
  const PLAN_MAX = (7 / 12) * 100; // linke Fläche am schmalsten -> Stundenplan am breitesten
  const BOX_MAX = {
    fortschritt: { o: O_MAX },
    nachrichten: { o: O_MIN },
    aufgaben: { u: O_MAX },
    notizen: { u: O_MIN },
    plan: { p: PLAN_MAX },
  };
  // Klick auf eine Box: auf größte Größe schalten (Regler entsprechend setzen).
  // Erneuter Klick auf dieselbe Box stellt die vorherige Größe wieder her. Klicks auf
  // interaktive Elemente (Buttons, Eingaben) lösen das NICHT aus.
  function maximiereBox(e, id) {
    if (e.target.closest('button, a, input, textarea, select, [role="button"]'))
      return;
    if (maximiert === id) {
      if (splitsVorher) setSplits(splitsVorher);
      setSplitsVorher(null);
      setMaximiert(null);
      return;
    }
    // Ziel immer auf die ursprüngliche (manuelle) Größe anwenden, nicht auf einen
    // schon maximierten Zwischenstand, damit kein Rest-Versatz übrig bleibt.
    const basis = maximiert === null ? splits : splitsVorher || splits;
    if (maximiert === null) setSplitsVorher(splits);
    setSplits({ ...basis, ...BOX_MAX[id] });
    setMaximiert(id);
  }
  // Inhaltsdichte je Box aus den Reglern (12tel-Äquivalent; links = 2/3 des Rasters,
  // Stundenplan fest 1/3). So bleibt die bestehende Stufen-Logik gültig.
  const LINKS = 2 / 3;
  const fSpan = LINKS * (splits.o / 100) * 12; // Etappenfortschritt
  const aSpan = LINKS * (splits.u / 100) * 12; // Aufgaben
  const eSpan = LINKS * ((100 - splits.u) / 100) * 12; // Erinnerungen
  const pSpan = ((100 - splits.p) / 100) * 12; // Stundenplan (rechte Spalte, regelbar)
  // Stufe 1 (2 Spalten): nur der glatte Ring ohne Segmente, keine Legende.
  // Ab 3 Spalten kommt die Fächer-Legende dazu (Stufe 3), ab 5 Spalten die Balken
  // (Stufe 4). Schwellen auf den Mitten (2.5 / 4.5), damit Rundungs-/Float-Werte an
  // den Spaltengrenzen (fSpan ≈ 2, 3, 4, 5) sicher auf der richtigen Seite landen.
  const fortStufe = fSpan < 2.5 ? 1 : fSpan < 4.5 ? 3 : 4;
  // Untertitel beschreibt knapp, was zu sehen ist (ohne Zieh-Hinweis). Ab der
  // Balken-Stufe kommt die Wochen-Ebene dazu, der Untertitel wird also genauer.
  const fortSub =
    fortStufe < 4
      ? "Dein Fortschritt je Fach."
      : "Dein Fortschritt je Fach und Woche.";

  useEffect(() => {
    localStorage.setItem(ERLEDIGT_KEY, JSON.stringify(erledigt));
    meldeAenderung();
  }, [erledigt]);

  // Ring-Größe = Innenbreite der kleinsten Fortschritt-Box (2 von 12 Spalten),
  // abhängig nur von der Gesamtbreite (nicht vom Regler). So bleibt der Ring konstant
  // groß und links verankert und springt beim Resize nicht (wie früher).
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === "undefined") return undefined;
    const messen = () => {
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 18;
      // Referenz-Fläche = linke Fläche bei Standard-Stundenplan (2/3 der Breite). Die
      // linke Spalte (Etappe/Aufgaben) wird IMMER auf diese feste Referenz bezogen, NICHT
      // auf die aktuelle, vom p-Regler veränderte Flächenbreite. Dadurch bleibt der Ring
      // unter jedem Regler-Stand gleich groß (kein Skalieren) und die Box gleich breit.
      const refLeftW = (grid.clientWidth - gap) * (2 / 3);
      // Breite einer "vollen" linken Reihe (Inhalt ohne Gap) als feste Referenz. Die
      // linke Spalte (Etappe/Aufgaben) bekommt davon einen exakten px-Anteil (o bzw. u),
      // p-unabhängig. So bleibt sie beim Ziehen des Stundenplans EXAKT gleich breit und
      // wackelt nicht (kein Sub-Pixel-Drift durch Gap-Verteilung).
      grid.style.setProperty("--ref-spalte", refLeftW - gap + "px");
      // Ring = Innenbreite der kleinsten Fortschritt-Box (linke Spalte am schmalsten,
      // 2 von 8). Nie breiter als die Box -> konstant.
      const boxMin = (refLeftW - gap) * (2 / 8);
      const ringW = Math.max(0, boxMin - 44);
      grid.style.setProperty("--ring-groesse", ringW + "px");
      // Feste, in der Namens-Stufe (4 Spalten) zentrierte Startposition der Legende.
      // Sie gilt auch in der Balken-Stufe (5 Spalten), damit die Namen beim Vergrößern
      // NICHT verrutschen: nur der Balken füllt den Platz rechts davon. Über die feste
      // Referenz-Fläche berechnet (unabhängig vom aktuellen Regler).
      const karte = grid.querySelector(".hu-fortschritt");
      if (karte) {
        const box4 = (refLeftW - gap) / 2; // 4 von 8 Spalten der Referenz = halbe Fläche
        const pad = parseFloat(getComputedStyle(karte).paddingLeft) || 0;
        const inhalt = box4 - 2 * pad;
        const namenBreite = 18 + 6.8 * 0.86 * 16; // Punkt + Lücke + Fach-Spalte (6.8em)
        const ml = Math.max(0, (inhalt - ringW - gap - namenBreite) / 2);
        grid.style.setProperty("--legende-links", ml + "px");
      }
    };
    messen();
    const ro = new ResizeObserver(messen);
    ro.observe(grid);
    // Auch die linke Fläche beobachten: ändert sich ihre Breite durch den
    // Stundenplan-Regler (p), muss --legende-links neu berechnet werden.
    const links = grid.querySelector(".hu-left");
    if (links) ro.observe(links);
    return () => ro.disconnect();
  }, []);


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
        <span className="hu-auf-kopf">
          <span className="hu-auf-fachzeile">
            <span className="hu-auf-fach">{k.fach}</span>
            <span className="hu-auf-icon" aria-hidden="true">
              <Icon name="lernweg" width={20} height={20} />
            </span>
          </span>
          <span className="hu-auf-titel">{k.titel}</span>
        </span>
        <span className="hu-auf-chips">
          {aSpan >= 5 && (
            <span className="hu-auf-chip">
              <Icon name="week" className="hu-auf-chip-icon" />
              {st ? `${st.von} - ${st.bis}` : "frei einteilbar"}
            </span>
          )}
          {anzahlStunden > 0 && aSpan >= 8 && (
            <span className="hu-auf-chip">
              <Icon name="clock" className="hu-auf-chip-icon" />
              {anzahlStunden} {anzahlStunden === 1 ? "Stunde" : "Stunden"}
            </span>
          )}
          {st && aSpan >= 6 && (
            <span className="hu-auf-chip">
              <Icon name="location" className="hu-auf-chip-icon" />
              {st.raum}
            </span>
          )}
        </span>
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
  // "Wo man gerade ist": am Demo-"heute" die laufende bzw. nächste Stunde (die erste,
  // die noch nicht vorbei ist; nach Schulschluss die letzte), sonst keine.
  const jetztStunde =
    tag === heuteTag()
      ? tagStunden.find((s) => minutenAusZeit(s.bis) > jetztMin) ||
        tagStunden[tagStunden.length - 1] ||
        null
      : null;
  const jetztId = jetztStunde ? stundenId(jetztStunde) : null;
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

  // Etappenfortschritt: ein Ring je Fach, in gemeinsame Wochen-Stücke geteilt.
  const fachWochen = fachWochenFortschritt(erledigt);
  // Stufe 3-4: je Fach Gesamtzahl, abgenommene KBs und anteiliger Stand (Balken).
  const fachListe = fachWochen.map((f) => {
    const total = f.wochen.reduce((s, w) => s + w.total, 0);
    const fertig = f.wochen.reduce((s, w) => s + w.fertig, 0);
    const done = f.wochen.reduce((s, w) => s + w.done, 0);
    // Wochen-Segmente für den Balken: Breite ∝ Wochen-Größe (total), durchgehend
    // von vorne gefüllt mit dem erledigten Anteil (done) – genau wie der Ring, nur
    // linear ausgerollt. So zeigt der Balken vollständig, was der Kreis anzeigt.
    let restDone = done;
    const segmente = f.wochen.map((w) => {
      const fuell = Math.max(0, Math.min(w.total, restDone));
      restDone -= fuell;
      return {
        woche: w.woche,
        total: w.total,
        fuellFrac: w.total > 0 ? fuell / w.total : 0,
        istAktuell: w.istAktuell,
      };
    });
    return {
      fach: f.fach,
      color: f.color,
      total,
      fertig,
      frac: total > 0 ? done / total : 0,
      segmente,
    };
  });

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
        className="hu-grid"
        ref={gridRef}
        style={{
          gridTemplateColumns: `minmax(0, ${splits.p}fr) minmax(0, ${
            100 - splits.p
          }fr)`,
        }}
      >
        <div className="hu-left">
          <div
            className="hu-row hu-row-1"
            style={{
              gridTemplateColumns: `calc(var(--ref-spalte, 0px) * ${
                splits.o / 100
              }) minmax(0, 1fr)`,
            }}
          >
            {/* Links oben: Etappenfortschritt */}
            <section
              className="hu-karte hu-fortschritt"
              onClick={(e) => maximiereBox(e, "fortschritt")}
            >
          <h2 className="hu-karte-titel">
            <Icon name="graph" className="hu-karte-icon" />
            Etappenfortschritt
          </h2>
          <p className="hu-karte-sub">{fortSub}</p>
          {/* Ring und (ab Stufe 3) die Fächer-Legende nebeneinander, damit die
              Legende seitlich aufgeht statt unter dem Ring zu stapeln. */}
          <div className="hu-fort-mitte">
            <Etappenring
              faecher={fachWochen}
              animiert
              gapFaktor={Math.max(0, Math.min(1, fSpan - 2))}
            />
            {/* Stufe 3: Farb-Legende (welche Farbe ist welches Fach). Stufe 4:
                zusätzlich ein Balken je Fach mit der Zahl. */}
            {fortStufe >= 3 && fachListe.length > 0 && (
              <ul
                className={
                  "hu-fort-legende" + (fortStufe >= 4 ? " mit-balken" : "")
                }
              >
                {fachListe.map((f) => (
                  <li className="hu-fort-legende-zeile" key={f.fach}>
                    <span
                      className="hu-fort-legende-punkt"
                      style={{ background: f.color }}
                    />
                    <span className="hu-fort-legende-fach">{f.fach}</span>
                    {fortStufe >= 4 && (
                      <span className="hu-fort-legende-bar">
                        {f.segmente.map((s, i) => (
                          <span
                            key={i}
                            className={
                              "hu-fort-bar-seg" + (s.istAktuell ? " aktuell" : "")
                            }
                            style={{
                              flexGrow: s.total || 1,
                              "--seg-farbe": f.color,
                            }}
                          >
                            <span
                              style={{
                                width: Math.round(s.fuellFrac * 100) + "%",
                                background: f.color,
                              }}
                            />
                          </span>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
            </section>

            {/* Rechts oben: Nachrichten (früher Topbar-Glocke, jetzt eigene Box) */}
            <section
              className="hu-karte hu-nachrichten"
              onClick={(e) => maximiereBox(e, "nachrichten")}
            >
          <h2 className="hu-karte-titel">
            <Icon name="chat" className="hu-karte-icon" />
            Nachrichten
          </h2>
          {mitteilungen.length === 0 ? (
            <p className="hu-nachr-leer">Noch nichts Neues.</p>
          ) : (
            <ul className="hu-nachr-liste">
              {mitteilungen.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className={"hu-nachr" + (m.gelesen ? "" : " neu")}
                    onClick={() => setChatOffen(true)}
                  >
                  <span className={"hu-nachr-icon art-" + m.art}>
                    {m.art === "coach" ? (
                      <PersonIcon />
                    ) : (
                      <Icon name="document" className="hu-nachr-svg" />
                    )}
                  </span>
                  <span className="hu-nachr-text">
                    <span className="hu-nachr-kopf">
                      <span className="hu-nachr-titel">{m.titel}</span>
                      <span className="hu-nachr-zeit">{m.zeit}</span>
                    </span>
                    <span className="hu-nachr-body">{m.text}</span>
                  </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
            </section>

            <div
              className={"hu-teiler hu-teiler-v" + (zieh?.key === "o" ? " zieht" : "")}
              style={{
                left: `calc(var(--ref-spalte, 0px) * ${
                  splits.o / 100
                } + var(--grid-gap, 18px) / 2)`,
              }}
              aria-hidden="true"
              {...reglerProps("o")}
            />
          </div>

          <div
            className="hu-row hu-row-2"
            style={{
              gridTemplateColumns: `calc(var(--ref-spalte, 0px) * ${
                splits.u / 100
              }) minmax(0, 1fr)`,
            }}
          >
            {/* Unten rechts: Erinnerungen (per CSS order rechts) */}
            <section
              className="hu-karte hu-notizen"
              onClick={(e) => maximiereBox(e, "notizen")}
            >
          <h2 className="hu-karte-titel">
            <Icon name="erinnerung" className="hu-karte-icon" />
            Erinnerungen
          </h2>
          {eSpan >= 4 && (
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
                    {n.kontext && eSpan >= 3 && (
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
            <button
              type="submit"
              className="hu-notiz-add-knopf"
              aria-label="Erinnerung hinzufügen"
            >
              +
            </button>
            <input
              className="hu-notiz-add-feld"
              type="text"
              value={neueErinnerung}
              onChange={(e) => setNeueErinnerung(e.target.value)}
              placeholder="Erinnerung hinzufügen"
              aria-label="Neue Erinnerung"
            />
          </form>
            </section>

            {/* Unten links: Aufgaben (per CSS order links) */}
            <section
              className="hu-karte hu-aufgaben"
              onClick={(e) => maximiereBox(e, "aufgaben")}
            >
          <h2 className="hu-karte-titel hu-aufgaben-titel">
            <Icon name="task" className="hu-karte-icon" />
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
            </section>

            <div
              className={"hu-teiler hu-teiler-v" + (zieh?.key === "u" ? " zieht" : "")}
              style={{
                left: `calc(var(--ref-spalte, 0px) * ${
                  splits.u / 100
                } + var(--grid-gap, 18px) / 2)`,
              }}
              aria-hidden="true"
              {...reglerProps("u")}
            />
          </div>

        </div>

        {/* Rechte Spalte (volle Höhe): Stundenplan als Tages-Timeline */}
        <aside
          className="hu-karte hu-plan-karte"
          onClick={(e) => maximiereBox(e, "plan")}
        >
          <h2 className="hu-karte-titel">
            <Icon name="week" className="hu-karte-icon" />
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
              const istJetzt = jetztId != null && stundenId(s) === jetztId;
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
                      (istPause ? " neutral" : "") +
                      (istJetzt ? " jetzt" : "")
                    }
                  >
                    {/* Farbbalken nur bei Haupt-/Studierzeit-Stunden (deine
                        Fokusfächer); Nebenfächer bleiben neutral, der Platz bleibt
                        transparent erhalten, damit die Fächer bündig anfangen. */}
                    <span
                      className="hu-stunde-strich"
                      style={{
                        background: istBelegbar(s)
                          ? fachFarbe[s.fach] || "#cbd5d1"
                          : "transparent",
                      }}
                    />
                    <span className="hu-stunde-info">
                      <span className="hu-stunde-fach">{s.fach}</span>
                      {pSpan >= 3 && (
                        <span className="hu-stunde-raum">{s.raum}</span>
                      )}
                      {pSpan >= 4 && (
                        <span className="hu-stunde-lehrer">
                          {lehrkraefte[s.fach] || ""}
                        </span>
                      )}
                      {pSpan >= 5 && artLabel[s.art] && (
                        <span
                          className="hu-stunde-art"
                          style={{ color: fachTextFarbe(s.fach) }}
                        >
                          {artLabel[s.art]}
                        </span>
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

        {/* Regler zwischen linker Fläche und Stundenplan (volle Höhe). */}
        <div
          className={"hu-teiler hu-teiler-v" + (zieh?.key === "p" ? " zieht" : "")}
          style={{ left: teilerLinks(splits.p) }}
          aria-hidden="true"
          {...reglerProps("p")}
        />
      </div>

      {chatOffen && (
        <NachrichtenChat
          mitteilungen={mitteilungen}
          onClose={() => setChatOffen(false)}
        />
      )}
    </div>
  );
}
