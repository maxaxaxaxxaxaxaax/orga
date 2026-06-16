import { useMemo, useState } from "react";
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
        <div className="mb-fertig" role="status">
          <span className="mb-fertig-haken" aria-hidden="true">
            ✓
          </span>
          <p className="mb-fertig-text">Alles markiert. Du kennst die Regeln.</p>
          <button type="button" className="mb-neu" onClick={zuruecksetzen}>
            Nochmal durchgehen
          </button>
        </div>
      )}

      <div className="mb-liste">
        {abschnitte.map((ab, ai) => {
          const istOffen = offen[ai];
          const regeln = ab.regeln || [];
          return (
            <section className="mb-abschnitt" key={ai}>
              <button
                type="button"
                className="mb-titel"
                aria-expanded={istOffen}
                onClick={() => umschalten(ai)}
              >
                <span className="mb-titel-text">{ab.titel}</span>
                <span
                  className={"mb-pfeil" + (istOffen ? " auf" : "")}
                  aria-hidden="true"
                >
                  ›
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
                                {z.map((c, ci) => (
                                  <td key={ci}>{c}</td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <p className="mb-tabelle-tipp">
                        Tippe eine Zeile an, um sie hervorzuheben.
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
