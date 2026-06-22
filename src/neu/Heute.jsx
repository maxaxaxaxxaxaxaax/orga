import { useEffect, useState } from "react";
import { koennensbeweise, kbFarbe, kbFaecher } from "../data/koennensbeweise";
import { stundenWoche, fachFarbe, stundenId } from "../data/stundenplanWoche";
import { etappen } from "../data/etappen";
import { lernwegFuerKb } from "../data/wissen";
import { generatorFuerKb } from "./uebungen";
import Etappenring from "./Etappenring";
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

  function notizWeg(i) {
    setNotizen(entferneNotiz(i));
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

  // Eine Aufgaben-Karte, geteilt von "Meine Aufgaben" und "Noch offen von früher".
  function karte(k, istStart) {
    const done = !!erledigt[k.id];
    const info = kbInfo(k.id);
    const st = tagesStunde(k);
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
          <span className="hu-auf-zeit">
            {st ? `${st.von} – ${st.bis}` : "frei einteilbar"}
          </span>
          {done ? (
            <span className="hu-auf-marke done" aria-label="erledigt">
              ✓ fertig
            </span>
          ) : info.bereit ? (
            <span className="hu-auf-marke bereit">bereit</span>
          ) : istStart ? (
            <span className="hu-auf-marke start">
              {offeneAnzahl >= 2 ? "Start hier" : "jetzt"}
            </span>
          ) : info.hatUebung ? (
            <span className="hu-auf-marke ueben">Üben</span>
          ) : null}
        </span>
        <span className="hu-auf-titel">{k.titel}</span>
        <span className="hu-auf-fuss">
          <span className="hu-auf-badge">{k.fach}</span>
          {st && <span className="hu-auf-raum">{st.raum}</span>}
          <span className="hu-auf-cue" aria-hidden="true">
            Fokus →
          </span>
        </span>
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
  // Wie viele Uhren sind für morgen schon verplant? Nur Fakt, kein Vorwurf:
  // ein voller Tag früh sehen, damit man heute noch umplanen kann (ohne Druck).
  const morgenUhren =
    tag < 4
      ? koennensbeweise.reduce((sum, k) => {
          if (wochenZuordnung[k.id] !== AKTUELLE_WOCHE) return sum;
          return (
            sum +
            (stundenZuord[k.id] || []).filter((sid) => slotTag(sid) === tag + 1)
              .length
          );
        }, 0)
      : 0;
  const morgenVoll = morgenUhren >= 5;

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
  const restMs =
    new Date(ETAPPE.bis + "T23:59:59").getTime() - tagDatum.getTime();
  const restWochen = Math.max(0, Math.ceil(restMs / (7 * 24 * 3600 * 1000)));
  const wocheKbs = koennensbeweise.filter(
    (k) => wochenZuordnung[k.id] === AKTUELLE_WOCHE
  );
  const wocheDone = wocheKbs.filter((k) => erledigt[k.id]).length;

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
          <p className="hu-eyebrow">Übersicht</p>
          <h1 className="hu-titel">{gruss}, Max.</h1>
          <p className="hu-sub">{datumText}</p>
        </div>
        <div
          className="hu-tag-nav"
          role="group"
          aria-label="Tag wählen"
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
          <span className="hu-tag-label">{kurzTag}</span>
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

      <div className="hu-grid">
        <div className="hu-main">
          <div className="hu-oben">
            <section className="hu-karte hu-fortschritt">
              <h2 className="hu-karte-titel">Etappenfortschritt</h2>
              <Etappenring ringe={proFach} />
              <div className="hu-stats">
                <div className="hu-stat">
                  <span className="hu-stat-zahl">
                    {zieleDone}
                    <span className="hu-stat-von">/{zieleGesamt}</span>
                  </span>
                  <span className="hu-stat-label">Ziele erreicht</span>
                </div>
                <div className="hu-stat">
                  <span className="hu-stat-zahl">{restWochen}</span>
                  <span className="hu-stat-label">
                    {restWochen === 1 ? "Woche übrig" : "Wochen übrig"}
                  </span>
                </div>
                <div className="hu-stat">
                  <span className="hu-stat-zahl">
                    {wocheKbs.length ? (
                      <>
                        {wocheDone}
                        <span className="hu-stat-von">/{wocheKbs.length}</span>
                      </>
                    ) : (
                      "–"
                    )}
                  </span>
                  <span className="hu-stat-label">diese Woche</span>
                </div>
              </div>
            </section>

            <KlassenPuls />
          </div>

          <section className="hu-karte hu-aufgaben">
            <h2 className="hu-karte-titel">Meine Aufgaben</h2>
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
              <div className="hu-auf-grid">
                {tagKbs.map((k) =>
                  karte(k, !erledigt[k.id] && ersterOffen?.id === k.id)
                )}
              </div>
            )}
            {morgenAnzahl > 0 && (
              <p className={"hu-morgen" + (morgenVoll ? " voll" : "")}>
                Morgen geplant: {morgenAnzahl}{" "}
                {morgenAnzahl === 1 ? "Ziel" : "Ziele"}
                {morgenUhren > 0 &&
                  `, ${morgenUhren} ${morgenUhren === 1 ? "Uhr" : "Uhren"}`}
                {morgenVoll && " · ziemlich voll"}
              </p>
            )}

            {nachzueglerList.length > 0 && (
              <div className="hu-nachzuegler">
                <h3 className="hu-nachzuegler-titel">Noch offen von früher</h3>
                <div className="hu-auf-grid">
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

          {notizen.length > 0 && (
            <section className="hu-karte hu-notizen">
              <h2 className="hu-karte-titel">Notizzettel</h2>
              <p className="hu-notizen-hinweis">
                Geparkte Gedanken aus dem Fokus. Hak einen ab, wenn er erledigt
                ist.
              </p>
              <ul className="hu-notiz-liste">
                {notizen.map((n, i) => (
                  <li className="hu-notiz" key={i}>
                    <button
                      type="button"
                      className="hu-notiz-weg"
                      onClick={() => notizWeg(i)}
                      aria-label="Notiz wegräumen"
                    >
                      ✓
                    </button>
                    <span className="hu-notiz-text">
                      {n.text}
                      {n.kontext && (
                        <span className="hu-notiz-kontext">{n.kontext}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="hu-aside">
          <section className="hu-karte hu-plan-karte">
            <h2 className="hu-karte-titel">Stundenplan</h2>
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
        </aside>
      </div>
    </div>
  );
}
