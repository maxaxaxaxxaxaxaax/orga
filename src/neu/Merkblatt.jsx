import { useMemo, useState } from "react";
import Fertig from "./Fertig";
import Icon from "./Icon";
import UebungHinweis from "./UebungHinweis";
import "./Merkblatt.css";

// Interaktives Merk-/Nachschlageblatt: Abschnitte mit Regeln und kleinen
// Tabellen. Abschnitte lassen sich auf-/zuklappen, einzelne Regeln als
// "verstanden" abhaken (mit Fortschritt), Tabellenzeilen beim Tippen
// hervorheben. Wenn alle Regeln abgehakt sind, kommt ein ruhiger Fertig-Hinweis
// mit "nochmal". Reiner Nachschlage-/Lernmodus, kein Tracking nach außen.
export default function Merkblatt({ daten }) {
  const abschnitte = useMemo(() => daten?.abschnitte || [], [daten]);

  // Alle Regeln über alle Abschnitte stabil durchnummerieren, damit der
  // "verstanden"-Status pro Regel eindeutig ist (Schluessel "a-r").
  const regelSchluessel = useMemo(() => {
    const keys = [];
    abschnitte.forEach((ab, ai) => {
      (ab.regeln || []).forEach((_, ri) => keys.push(`${ai}-${ri}`));
    });
    return keys;
  }, [abschnitte]);

  // Zuerst nur der erste Abschnitt offen, der Rest eingeklappt: scrollarm.
  const [offen, setOffen] = useState(() =>
    abschnitte.map((_, i) => i === 0)
  );
  const [verstanden, setVerstanden] = useState({});
  const [zeile, setZeile] = useState(null); // hervorgehobene Tabellenzeile
  // Aktives Abrufen: pro Tabelle die Antwort-Spalten verdecken, einzeln aufdecken.
  const [verdeckt, setVerdeckt] = useState({}); // ai -> bool
  const [aufgedeckt, setAufgedeckt] = useState({}); // "ai-zi-ci" -> true

  if (abschnitte.length === 0)
    return <p className="mb-leer">Kein Inhalt vorhanden.</p>;

  const gesamt = regelSchluessel.length;
  const geschafft = regelSchluessel.filter((k) => verstanden[k]).length;
  const alleVerstanden = gesamt > 0 && geschafft === gesamt;

  function umschalten(i) {
    setOffen((o) => o.map((v, k) => (k === i ? !v : v)));
  }
  function abhaken(key) {
    setVerstanden((v) => ({ ...v, [key]: !v[key] }));
  }
  function zuruecksetzen() {
    setVerstanden({});
    setZeile(null);
    setOffen(abschnitte.map((_, i) => i === 0));
  }
  function toggleVerdeckt(ai) {
    setVerdeckt((v) => ({ ...v, [ai]: !v[ai] }));
    // Beim Umschalten die schon aufgedeckten Zellen dieser Tabelle zurücksetzen.
    setAufgedeckt((a) => {
      const n = { ...a };
      for (const k of Object.keys(n)) if (k.startsWith(ai + "-")) delete n[k];
      return n;
    });
  }
  function deckeAuf(ai, zi, ci) {
    setAufgedeckt((a) => ({ ...a, [`${ai}-${zi}-${ci}`]: true }));
  }

  return (
    <div className="mb">
      <div className="mb-kopf">
        <span className="mb-label">Merkblatt</span>
        {gesamt > 0 && (
          <span className="mb-zaehler">
            {geschafft} / {gesamt} verstanden
          </span>
        )}
      </div>
      {gesamt > 0 && (
        <div className="mb-balken" aria-hidden="true">
          <div
            className="mb-balken-fuell"
            style={{ width: (geschafft / gesamt) * 100 + "%" }}
          />
        </div>
      )}

      {alleVerstanden && (
        <Fertig
          text="Alles markiert. Du kennst die Regeln."
          nochmalLabel="Nochmal durchgehen"
          onNochmal={zuruecksetzen}
        />
      )}

      <UebungHinweis id="merkblatt">
        Klapp die Abschnitte auf und hake ab, was du schon sicher kannst.
      </UebungHinweis>

      <div className="mb-liste">
        {abschnitte.map((ab, ai) => {
          const istOffen = offen[ai];
          const regeln = ab.regeln || [];
          // Pro Abschnitt zeigen, wie viele Regeln schon abgehakt sind: so wird
          // der Stand auch bei eingeklappten Abschnitten sichtbar.
          const abGeschafft = regeln.filter((_, ri) => verstanden[`${ai}-${ri}`]).length;
          const abVoll = regeln.length > 0 && abGeschafft === regeln.length;
          return (
            <section className="mb-abschnitt" key={ai}>
              <button
                type="button"
                className="mb-titel"
                aria-expanded={istOffen}
                onClick={() => umschalten(ai)}
              >
                <span className="mb-titel-text">{ab.titel}</span>
                {regeln.length > 0 && (
                  <span className={"mb-titel-zahl" + (abVoll ? " voll" : "")}>
                    {abVoll ? "✓" : `${abGeschafft}/${regeln.length}`}
                  </span>
                )}
                {/* Geteiltes Klapp-Chevron: dreht über [aria-expanded] (index.css). */}
                <span className="mb-pfeil" aria-hidden="true">
                  <Icon name="chevron-down" className="klapp-chevron" size={18} />
                </span>
              </button>

              {istOffen && (
                <div className="mb-body">
                  {ab.einleitung && (
                    <p className="mb-einleitung">{ab.einleitung}</p>
                  )}

                  {regeln.length > 0 && (
                    <ul className="mb-regeln">
                      {regeln.map((r, ri) => {
                        const key = `${ai}-${ri}`;
                        const text = typeof r === "string" ? r : r.text;
                        const bsp = typeof r === "string" ? null : r.beispiel;
                        const ok = !!verstanden[key];
                        return (
                          <li key={ri}>
                            <button
                              type="button"
                              className={"mb-regel" + (ok ? " ok" : "")}
                              aria-pressed={ok}
                              onClick={() => abhaken(key)}
                            >
                              <span
                                className="mb-haken"
                                aria-hidden="true"
                              >
                                {ok ? "✓" : ""}
                              </span>
                              <span className="mb-regel-inhalt">
                                <span className="mb-regel-text">{text}</span>
                                {bsp && (
                                  <span className="mb-regel-bsp">{bsp}</span>
                                )}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {ab.tabelle && (
                    <div className="mb-tabelle-wrap">
                      <div className="mb-tabelle-werkzeug">
                        <button
                          type="button"
                          className={
                            "mb-verdecken" + (verdeckt[ai] ? " an" : "")
                          }
                          onClick={() => toggleVerdeckt(ai)}
                          aria-pressed={!!verdeckt[ai]}
                        >
                          {verdeckt[ai] ? "Wieder zeigen" : "Selbst abfragen"}
                        </button>
                      </div>
                      <table className="mb-tabelle">
                        <thead>
                          <tr>
                            {ab.tabelle.kopf.map((k, ki) => (
                              <th key={ki}>{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ab.tabelle.zeilen.map((z, zi) => {
                            const zk = `${ai}-${zi}`;
                            const aktiv = zeile === zk;
                            return (
                              <tr
                                key={zi}
                                className={aktiv ? "aktiv" : ""}
                                onClick={() =>
                                  setZeile((cur) => (cur === zk ? null : zk))
                                }
                              >
                                {z.map((c, ci) => {
                                  const versteckt =
                                    verdeckt[ai] &&
                                    ci > 0 &&
                                    !aufgedeckt[`${ai}-${zi}-${ci}`];
                                  return (
                                    <td key={ci}>
                                      {versteckt ? (
                                        <button
                                          type="button"
                                          className="mb-zelle-verdeckt"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deckeAuf(ai, zi, ci);
                                          }}
                                          aria-label="Antwort aufdecken"
                                        >
                                          ?
                                        </button>
                                      ) : (
                                        c
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <p className="mb-tabelle-tipp">
                        {verdeckt[ai]
                          ? "Sag die verdeckte Antwort, dann tippe das Feld zum Aufdecken."
                          : "Tippe eine Zeile an, um sie hervorzuheben. Oder frag dich selbst ab."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
