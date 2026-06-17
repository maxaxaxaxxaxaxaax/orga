import {
  faecherKompetenz,
  standLabel,
  staerken,
  dranArbeiten,
  coachEinschaetzung,
} from "../data/fortschritt";
import { fachFarbe } from "../data/stundenplanWoche";
import { faecher } from "../data/wissen";
import { effektiveSchritte, lernwegStand, themaStatus } from "../lib/lernstand";
import Label from "../components/Label";
import Icon from "../components/Icon";

// Kompetenzstand -> Farbklasse.
function standKlasse(stand) {
  if (stand === "sicher") return "gut";
  if (stand === "aufweg") return "mittel";
  return "schwach";
}

const trendInfo = {
  auf: { pfeil: "↑", text: "steigend", klasse: "auf" },
  stabil: { pfeil: "→", text: "stabil", klasse: "stabil" },
  ab: { pfeil: "↓", text: "im Aufbau", klasse: "ab" },
};

// Mini-Verlaufskurve aus einer Zahlenreihe.
function Sparkline({ werte = [], farbe }) {
  if (werte.length < 2) return null;
  const w = 60;
  const h = 20;
  const max = Math.max(...werte);
  const min = Math.min(...werte);
  const spanne = max - min || 1;
  const punkte = werte
    .map((v, i) => {
      const x = (i / (werte.length - 1)) * w;
      const y = h - ((v - min) / spanne) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={punkte}
        fill="none"
        stroke={farbe}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Fortschritt({
  erledigt = {},
  lernschritte = {},
  aufgaben = [],
  embedded = false,
  fachFilter = null, // wenn gesetzt, nur dieses Fach (im Wissen-Tab/Mappe verwendet)
}) {
  // Aktive Lernwege je Fach direkt aus dem Wissen-Netz ableiten (eine Quelle).
  const ctx = { lernschritte, erledigt, aufgaben };
  const aktiveLernwege = faecher
    .filter((f) => !fachFilter || f.fach === fachFilter)
    .flatMap((f) => {
      // Im Fach-Filter zeigen wir ALLE Lernwege (current + upcoming + done),
      // damit der Schüler ein vollständiges Bild für dieses Fach hat.
      const eintraege = f.themen.filter((t) => !t.landkarte).map((t) => {
        const schritte = effektiveSchritte(f.id, t, ctx);
        const stand = lernwegStand(schritte);
        const naechster = schritte.find((s) => !s.fertig);
        return {
          fach: f.fach,
          thema: t.label,
          status: themaStatus({ schritte }),
          fertig: stand.fertig,
          gesamt: stand.gesamt,
          naechsterSchritt: naechster ? naechster.text : null,
        };
      });
      if (fachFilter) return eintraege;
      // Ohne Filter: jeweils nur den aktuellsten Lernweg pro Fach.
      const akt =
        eintraege.find((x) => x.status === "current") ||
        eintraege.find((x) => x.status === "upcoming");
      return akt ? [akt] : [];
    });

  // Heute erledigte Aufgaben werden sichtbar zu erbrachten Könnensbeweisen.
  const bonusProFach = {};
  for (const a of aufgaben) {
    if (erledigt[a.id]) bonusProFach[a.fach] = (bonusProFach[a.fach] || 0) + 1;
  }
  const mitBonus = faecherKompetenz
    .filter((f) => !fachFilter || f.fach === fachFilter)
    .map((f) => {
      const erbracht = Math.min(f.gesamt, f.erbracht + (bonusProFach[f.fach] || 0));
      return { ...f, anzeige: erbracht, bonus: erbracht - f.erbracht };
    });

  const erbracht = mitBonus.reduce((s, f) => s + f.anzeige, 0);
  const gesamt = mitBonus.reduce((s, f) => s + f.gesamt, 0);
  const gesamtBonus = mitBonus.reduce((s, f) => s + f.bonus, 0);

  return (
    <div className={embedded ? "fortschritt-eingebettet" : "view"}>
      {!embedded && (
        <header className="view-kopf">
          <h1 className="view-titel">Fortschritt</h1>
          <p className="view-sub">
            Dein Lernstand · {erbracht} von {gesamt} Könnensbeweisen erbracht
            {gesamtBonus > 0 && <span className="plus-badge">+{gesamtBonus} heute</span>}
          </p>
        </header>
      )}
      {embedded && (
        <p className="fortschritt-zusammenfassung">
          {fachFilter ? `${fachFilter}: ` : ""}{erbracht} von {gesamt} Könnensbeweisen erbracht
          {gesamtBonus > 0 && <span className="plus-badge"> +{gesamtBonus} heute</span>}
        </p>
      )}

      {gesamtBonus > 0 ? (
        <div className="erfolg-banner">
          <span className="erfolg-icon">🎉</span>
          <span>
            <strong>Heute geschafft!</strong> Dein Fortschritt ist gewachsen –
            {" "}+{gesamtBonus} Könnensbeweis{gesamtBonus > 1 ? "e" : ""} erbracht.
          </span>
        </div>
      ) : !fachFilter ? (
        <p className="info-zeile">
          An der Theresianum gibt es in Klasse 5–8 keine Noten, sondern Könnensbeweise.
        </p>
      ) : null}

      {/* Einschätzung vom Lerncoach: nur ohne Fach-Filter (generisch). */}
      {!fachFilter && (
        <section className="block">
          <Label>Einschätzung deines Lerncoachs</Label>
          <div className="coach">
            <div className="coach-avatar"><Icon name="funke" size={18} /></div>
            <div>
              <p className="coach-text">{coachEinschaetzung.text}</p>
              <p className="coach-von">{coachEinschaetzung.von}, Tutorin</p>
            </div>
          </div>
        </section>
      )}

      {/* Fächer / Kompetenzstand */}
      <section className="block">
        <Label>{fachFilter ? "Kompetenzstand" : "Deine Fächer"}</Label>
        <div className="noten-raster">
          {mitBonus.map((f) => {
            const t = trendInfo[f.trend];
            const farbe = fachFarbe[f.fach] || "#868e96";
            return (
              <div className={"note-karte" + (f.bonus > 0 ? " gewachsen" : "")} key={f.fach}>
                <span className="note-fach">
                  <span className="note-punkt" style={{ background: farbe }} />
                  {f.fach}
                </span>
                <span className={"komp-stand " + standKlasse(f.stand)}>
                  {standLabel[f.stand]}
                </span>
                <div className="note-zeile">
                  <span className="komp-zahl">
                    {f.anzeige}/{f.gesamt} Könnensbeweise
                    {f.bonus > 0 && <span className="plus-badge klein">+{f.bonus}</span>}
                  </span>
                  <span className={"trend " + t.klasse}>{t.pfeil} {t.text}</span>
                </div>
                {f.verlauf && (
                  <div className="note-verlauf">
                    <Sparkline werte={f.verlauf} farbe={farbe} />
                    <span className="note-verlauf-label">letzte Wochen</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Lernwege: ohne Filter der aktuellste je Fach, mit Filter alle des Fachs. */}
      <section className="block">
        <Label>{fachFilter ? "Lernwege im Fach" : "Deine aktiven Lernwege"}</Label>
        <div className="card card-pad">
          {aktiveLernwege.map((l) => {
            const pct = l.gesamt ? Math.round((l.fertig / l.gesamt) * 100) : 0;
            const fertig = l.fertig === l.gesamt;
            return (
              <div className="ziel" key={l.fach + l.thema}>
                <div className="ziel-kopf">
                  <span>{fachFilter ? l.thema : `${l.fach}: ${l.thema}`}</span>
                  <span className="ziel-zahl">
                    {fertig ? "fertig" : `${l.fertig}/${l.gesamt}`}
                  </span>
                </div>
                <div className="balken">
                  <div
                    className={"balken-fuell" + (fertig ? " fertig" : "")}
                    style={{ width: pct + "%" }}
                  />
                </div>
                {l.naechsterSchritt && (
                  <p className="ziel-naechster">Nächster Schritt: {l.naechsterSchritt}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Stärken + Daran arbeiten: nur ohne Fach-Filter (generisch). */}
      {!fachFilter && (
        <div className="zwei-spalten">
          <section className="panel">
            <div className="panel-kopf">
              <h3>Deine Stärken</h3>
            </div>
            <ul className="punkt-liste">
              {staerken.map((s) => (
                <li key={s}><span className="punkt-ok">✓</span>{s}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-kopf">
              <h3>Daran arbeitest du</h3>
            </div>
            <ul className="punkt-liste">
              {dranArbeiten.map((s) => (
                <li key={s}><span className="punkt-warn">→</span>{s}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
