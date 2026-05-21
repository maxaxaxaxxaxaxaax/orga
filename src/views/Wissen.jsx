import { useEffect, useRef, useState } from "react";
import { faecher, artLabel, statusLabel, bereichLabel } from "../data/wissen";
import { etappen } from "../data/etappen";
import { aufgaben } from "../data/aufgaben";
import { themaStatus, lernwegStand, effektiveSchritte } from "../lib/lernstand";
import WissensGraph from "../components/WissensGraph";
import WissensOrdner from "../components/WissensOrdner";
import MaterialVorschau from "../components/MaterialVorschau";
import Label from "../components/Label";
import Icon from "../components/Icon";

const etappeKurz = Object.fromEntries(etappen.map((e) => [e.id, e.kurz]));

const wLaden = (k, f) => {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : f;
  } catch {
    return f;
  }
};

export default function Wissen({
  hochgeladen,
  setHochgeladen,
  addDokumente,
  erledigt = {},
  lernschritte = {},
  setLernschritte,
}) {
  const [fachId, setFachId] = useState(() => wLaden("orga.wissen.fach", faecher[0].id));
  const [ansicht, setAnsicht] = useState(() => wLaden("orga.wissen.ansicht", "graph"));
  const [thema, setThema] = useState(null);
  const [hinweis, setHinweis] = useState(null);
  const [ueberGlobal, setUeberGlobal] = useState(false);
  const [suche, setSuche] = useState("");
  const [etappe, setEtappe] = useState(() => wLaden("orga.wissen.etappe", null));
  const [statusFilter, setStatusFilter] = useState(() => wLaden("orga.wissen.status", "alle"));
  const [vorschau, setVorschau] = useState(null);
  const globalInput = useRef(null);

  // Filterzustand reload-fest.
  useEffect(() => localStorage.setItem("orga.wissen.fach", JSON.stringify(fachId)), [fachId]);
  useEffect(() => localStorage.setItem("orga.wissen.ansicht", JSON.stringify(ansicht)), [ansicht]);
  useEffect(() => localStorage.setItem("orga.wissen.etappe", JSON.stringify(etappe)), [etappe]);
  useEffect(() => localStorage.setItem("orga.wissen.status", JSON.stringify(statusFilter)), [statusFilter]);

  const fach = faecher.find((f) => f.id === fachId) || faecher[0];

  // Alle Dokumente eines Fachs (statisch + hochgeladen).
  const docsVonFach = (name) => [
    ...(faecher.find((f) => f.fach === name)?.materialien || []).map((m) => ({ ...m, fach: name, uploaded: false })),
    ...hochgeladen.filter((d) => d.fach === name),
  ];
  const fachDocs = docsVonFach(fach.fach);
  const docsThema = (label) => fachDocs.filter((d) => d.thema === label);

  // Effektiver Schritt-Stand (Override > Vorgabe > gekoppelte Aufgabe), zentral in lib.
  const ctx = { lernschritte, erledigt, aufgaben };
  const effSchritte = (fId, t) => effektiveSchritte(fId, t, ctx);
  function toggleSchritt(fId, tId, idx, aktuellFertig) {
    if (!setLernschritte) return;
    setLernschritte((m) => ({ ...m, [`${fId}:${tId}:${idx}`]: !aktuellFertig }));
  }

  // Fortschritt eines Fachs (für den Ring am Fach-Chip).
  const fachFortschritt = (f) => {
    let fertig = 0;
    let gesamt = 0;
    for (const t of f.themen) {
      for (const s of effSchritte(f.id, t)) {
        gesamt += 1;
        if (s.fertig) fertig += 1;
      }
    }
    return gesamt ? Math.round((fertig / gesamt) * 100) : 0;
  };

  // Etappenfilter: welche Themen/Materialien sind sichtbar?
  const themenInEtappe = fach.themen.filter((t) => etappe == null || t.etappe === etappe);

  // Knoten = Lernwege; Status aus den (effektiven) Schritten abgeleitet.
  const alleNodes = themenInEtappe.map((t) => {
    const schritte = effSchritte(fach.id, t);
    return {
      id: t.id,
      label: t.label,
      etappe: t.etappe,
      schritte,
      status: themaStatus({ schritte, hatMaterial: docsThema(t.label).length > 0 }),
    };
  });
  const nodes = alleNodes.filter((n) =>
    statusFilter === "offen"
      ? n.status !== "done"
      : statusFilter === "aktuell"
      ? n.status === "current"
      : true
  );
  const etappeLabels = new Set(themenInEtappe.map((t) => t.label));
  const sichtbareDocs =
    etappe == null ? fachDocs : fachDocs.filter((d) => etappeLabels.has(d.thema));

  // Nächster empfohlener Lernweg (erster „aktueller", sonst erster offener).
  const empfohlen =
    alleNodes.find((n) => n.status === "current") ||
    alleNodes.find((n) => n.status === "upcoming");

  function wechselFach(id) {
    setFachId(id);
    setThema(null);
  }
  function waehleEtappe(id) {
    setEtappe(id);
    setThema(null);
  }

  function addDocs(files, zielFach) {
    const neu = addDokumente(files, zielFach);
    setHinweis({
      items: neu.map((d) => ({ titel: d.titel, fach: d.fach, bereich: d.bereich, thema: d.thema })),
    });
  }
  const moveDoc = (id, bereich) =>
    setHochgeladen((g) => g.map((d) => (d.id === id ? { ...d, bereich } : d)));
  const deleteDoc = (id) => setHochgeladen((g) => g.filter((d) => d.id !== id));

  function oeffneFachOrdner(fachName) {
    const ziel = faecher.find((f) => f.fach === fachName);
    if (ziel) setFachId(ziel.id);
    setThema(null);
    setAnsicht("ordner");
    setSuche("");
  }
  function oeffneThema(id, label) {
    setFachId(id);
    setThema(label);
    setAnsicht("graph");
    setSuche("");
  }

  function globalGewaehlt(e) {
    const files = [...(e.target.files || [])];
    if (files.length) addDocs(files);
    e.target.value = "";
  }
  function globalDrop(e) {
    e.preventDefault();
    setUeberGlobal(false);
    const files = [...(e.dataTransfer.files || [])];
    if (files.length) addDocs(files);
  }

  const gewaehlt = thema && alleNodes.find((n) => n.label === thema);
  const detailMaterial = thema ? docsThema(thema) : [];
  const stand = gewaehlt && gewaehlt.schritte ? lernwegStand(gewaehlt.schritte) : null;

  // --- Suche (fachübergreifend) ---
  const q = suche.trim().toLowerCase();
  const themenTreffer = q
    ? faecher.flatMap((f) =>
        f.themen
          .filter(
            (t) => t.label.toLowerCase().includes(q) || f.fach.toLowerCase().includes(q)
          )
          .map((t) => ({ f, t }))
      )
    : [];
  const alleDocs = [
    ...faecher.flatMap((f) => f.materialien.map((m) => ({ ...m, fach: f.fach }))),
    ...hochgeladen,
  ];
  const dokTreffer = q
    ? alleDocs.filter(
        (d) =>
          d.titel.toLowerCase().includes(q) ||
          (d.thema || "").toLowerCase().includes(q) ||
          (d.fach || "").toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="view">
      <header className="view-kopf">
        <h1 className="view-titel">Wissen</h1>
        <p className="view-sub">
          {q
            ? `Suche · ${themenTreffer.length + dokTreffer.length} Treffer`
            : ansicht === "graph"
            ? `Deine Lernwege als Netz · ${fach.fach}: ${nodes.length} Lernwege`
            : ansicht === "verlauf"
            ? "Verlauf: was du eingespeist hast und wo es liegt."
            : "Dein Ringbuchordner: Unterricht und Selbstlernen, automatisch sortiert."}
        </p>
      </header>

      {/* Echte Suche über Themen und Materialien */}
      <div className="suche">
        <Icon name="suche" size={18} className="suche-icon" />
        <input
          className="suche-input"
          placeholder="Durchsuche Themen und Materialien …"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
        />
        {suche && (
          <button className="suche-clear" onClick={() => setSuche("")} aria-label="Suche löschen">×</button>
        )}
      </div>

      {q ? (
        <div className="block">
          {themenTreffer.length + dokTreffer.length === 0 ? (
            <p className="panel-leer">Nichts gefunden für „{suche}“.</p>
          ) : (
            <>
              {themenTreffer.length > 0 && (
                <section className="block">
                  <Label>Lernwege ({themenTreffer.length})</Label>
                  <div className="such-liste">
                    {themenTreffer.map(({ f, t }) => {
                      const st = themaStatus({
                        schritte: t.schritte,
                        hatMaterial: docsVonFach(f.fach).some((d) => d.thema === t.label),
                      });
                      return (
                        <button
                          key={f.id + t.id}
                          className="such-treffer"
                          onClick={() => oeffneThema(f.id, t.label)}
                        >
                          <span className="fach-chip" style={{ "--c": f.farbe }}>{f.fach}</span>
                          <span className="such-titel">{t.label}</span>
                          <span className={"status-chip " + st}>{statusLabel[st]}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
              {dokTreffer.length > 0 && (
                <section className="block">
                  <Label>Materialien ({dokTreffer.length})</Label>
                  <div className="such-liste">
                    {dokTreffer.map((d) => (
                      <button
                        key={d.id}
                        className="such-treffer"
                        onClick={() => oeffneFachOrdner(d.fach)}
                      >
                        <span className={"material-art art-" + d.art}>{artLabel[d.art]}</span>
                        <span className="such-titel">{d.titel}</span>
                        <span className="such-meta">
                          {d.fach}{d.bereich ? ` · ${bereichLabel[d.bereich]}` : ""}{d.thema ? ` · ${d.thema}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {/* Fach-Auswahl (nicht im Verlauf) */}
          {ansicht !== "verlauf" && (
            <div className="fach-chips">
              {faecher.map((f) => {
                const pct = fachFortschritt(f);
                return (
                  <button
                    key={f.id}
                    className={"fach-chip-btn" + (f.id === fachId ? " aktiv" : "")}
                    style={{ "--c": f.farbe }}
                    onClick={() => wechselFach(f.id)}
                    title={`${f.fach}: ${pct}% erledigt`}
                  >
                    <span
                      className="fach-chip-ring"
                      style={{ "--c": f.farbe, "--pct": pct }}
                    />
                    {f.fach}
                  </button>
                );
              })}
            </div>
          )}

          {/* Umschalter + Legende */}
          <div className="graph-leiste">
            <div className="segment">
              <button
                className={"segment-btn" + (ansicht === "graph" ? " aktiv" : "")}
                onClick={() => setAnsicht("graph")}
              >
                Netz
              </button>
              <button
                className={"segment-btn" + (ansicht === "ordner" ? " aktiv" : "")}
                onClick={() => setAnsicht("ordner")}
              >
                Ordner
              </button>
              <button
                className={"segment-btn" + (ansicht === "verlauf" ? " aktiv" : "")}
                onClick={() => setAnsicht("verlauf")}
              >
                Verlauf{hochgeladen.length > 0 ? ` (${hochgeladen.length})` : ""}
              </button>
            </div>
            {ansicht === "graph" && (
              <div className="graph-legende">
                <span className="gleg"><span className="gleg-dot done" /> erledigt</span>
                <span className="gleg"><span className="gleg-dot current" /> aktuell</span>
                <span className="gleg"><span className="gleg-dot upcoming" /> kommt noch</span>
              </div>
            )}
          </div>

          {/* Etappen-Filter: bestimmt, was im Netz und Ordner sichtbar ist */}
          {ansicht !== "verlauf" && (
            <div className="etappe-filter">
              <span className="eleg-titel">Etappe:</span>
              <div className="filter-zeile">
                <button
                  className={"filter-btn" + (etappe == null ? " aktiv" : "")}
                  onClick={() => waehleEtappe(null)}
                >
                  Alle
                </button>
                {etappen.map((e) => (
                  <button
                    key={e.id}
                    className={"filter-btn" + (etappe === e.id ? " aktiv" : "")}
                    onClick={() => waehleEtappe(e.id)}
                    title={e.label}
                  >
                    {e.kurz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status-Filter: nur im Netz */}
          {ansicht === "graph" && (
            <div className="etappe-filter">
              <span className="eleg-titel">Anzeigen:</span>
              <div className="filter-zeile">
                {[
                  { k: "alle", l: "Alle" },
                  { k: "offen", l: "Offen" },
                  { k: "aktuell", l: "Aktuell" },
                ].map((o) => (
                  <button
                    key={o.k}
                    className={"filter-btn" + (statusFilter === o.k ? " aktiv" : "")}
                    onClick={() => {
                      setStatusFilter(o.k);
                      setThema(null);
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empfehlung: was als Nächstes dran ist */}
          {ansicht === "graph" && empfohlen && !thema && (
            <button
              className="empfehlung"
              onClick={() => setThema(empfohlen.label)}
            >
              <Icon name="funke" size={16} />
              <span>
                <strong>Als Nächstes dran:</strong> {empfohlen.label}
                {empfohlen.status === "current" ? " (mittendrin)" : " (noch offen)"}
              </span>
              <span className="empfehlung-pfeil">→</span>
            </button>
          )}

          {ansicht === "graph" ? (
            nodes.length === 0 ? (
              <p className="panel-leer">
                Hier gibt es mit diesem Filter gerade nichts zu sehen. Wähle „Alle“.
              </p>
            ) : (
            <>
              <WissensGraph
                key={fach.id + "-" + (etappe ?? "alle")}
                nodes={nodes}
                links={fach.verknuepfungen}
                farbe={fach.farbe}
                selectedId={gewaehlt ? gewaehlt.id : null}
                onSelect={(n) => setThema(n.label)}
              />

              {thema ? (
                <div className="knoten-detail">
                  <div className="knoten-detail-kopf">
                    <h3 className="thema-titel">{thema}</h3>
                    {gewaehlt && (
                      <>
                        <span className={"status-chip " + gewaehlt.status}>
                          {statusLabel[gewaehlt.status]}
                        </span>
                        <span className="etappe-chip">
                          {etappeKurz[gewaehlt.etappe]}
                        </span>
                      </>
                    )}
                  </div>

                  {stand && (
                    <div className="lernweg">
                      <div className="lernweg-kopf">
                        <span className="lernweg-titel">Dein Lernweg</span>
                        <span className="lernweg-zahl">
                          {stand.fertig} von {stand.gesamt} Schritten
                        </span>
                      </div>
                      <ol className="lw-schritte">
                        {gewaehlt.schritte.map((s, i) => {
                          const istNaechster =
                            gewaehlt.status === "current" && i === stand.naechster;
                          return (
                            <li key={i}>
                              <button
                                className={
                                  "lw-schritt" +
                                  (s.fertig ? " fertig" : istNaechster ? " aktuell" : "")
                                }
                                onClick={() =>
                                  toggleSchritt(fach.id, gewaehlt.id, s.idx, s.fertig)
                                }
                                aria-pressed={s.fertig}
                                aria-label={
                                  (s.fertig ? "Erledigt: " : "Offen: ") + s.text
                                }
                              >
                                <span className="lw-mark">
                                  {s.fertig ? "✓" : istNaechster ? "→" : ""}
                                </span>
                                <span className="lw-text">{s.text}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                      <p className="lw-tipp">Tippe einen Schritt an, um ihn abzuhaken.</p>
                    </div>
                  )}

                  <div className="lernweg-material">
                    <span className="lernweg-material-titel">Material dazu</span>
                    {detailMaterial.length > 0 ? (
                      <ul className="material-liste">
                        {detailMaterial.map((m) => (
                          <li key={m.id}>
                            <button className="material material-klick" onClick={() => setVorschau(m)}>
                              <span className={"material-art art-" + m.art}>{artLabel[m.art]}</span>
                              <span className="material-titel">{m.titel}</span>
                              <span className="material-datum">
                                {new Date(m.datum).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="panel-leer">Noch kein Material zu diesem Lernweg.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="graph-hinweis">
                  Jeder Punkt ist ein <strong>Lernweg</strong>. <strong>Grün</strong> heißt
                  erledigt, <strong>Blau</strong> ist dein aktueller Lernweg, <strong>Grau</strong>{" "}
                  kommt noch. Tippe einen an: oben siehst du deine Schritte, darunter die Materialien.
                </p>
              )}
            </>
            )
          ) : ansicht === "ordner" ? (
            <>
              {/* Globaler Einwurf: über alle Fächer automatisch verteilen */}
              <div
                className={"einwurf" + (ueberGlobal ? " ueber" : "")}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setUeberGlobal(true)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setUeberGlobal(false);
                }}
                onDrop={globalDrop}
                onClick={() => globalInput.current?.click()}
              >
                <input ref={globalInput} type="file" multiple hidden onChange={globalGewaehlt} />
                <Icon name="funke" size={18} />
                <div>
                  <strong>Dokumente einwerfen</strong>
                  <span> — wir erkennen Fach und Register automatisch.</span>
                </div>
              </div>

              {hinweis && (
                <div className="sortier-hinweis">
                  <button className="sortier-x" onClick={() => setHinweis(null)} aria-label="Schließen">×</button>
                  <p className="sortier-titel">Automatisch einsortiert:</p>
                  <ul className="sortier-liste">
                    {hinweis.items.map((it, i) => (
                      <li key={i}>
                        <strong>{it.titel}</strong> → {it.fach} · {bereichLabel[it.bereich]} · {it.thema}
                      </li>
                    ))}
                  </ul>
                  <p className="sortier-fuss">Nicht passend? Du kannst es unten verschieben.</p>
                </div>
              )}

              <WissensOrdner
                fach={fach}
                dokumente={sichtbareDocs}
                onUpload={(files) => addDocs(files, fach.fach)}
                onMove={moveDoc}
                onDelete={deleteDoc}
              />
            </>
          ) : (
            <div className="verlauf">
              {hochgeladen.length === 0 ? (
                <p className="panel-leer">
                  Noch nichts eingespeist. Wechsle zu „Ordner“ und wirf Dokumente ein.
                </p>
              ) : (
                <ul className="verlauf-liste">
                  {hochgeladen.map((d) => (
                    <li key={d.id} className="verlauf-item">
                      <span className={"material-art art-" + d.art}>{artLabel[d.art]}</span>
                      <div className="verlauf-mitte">
                        <span className="verlauf-titel">{d.titel}</span>
                        <span className="verlauf-ort">
                          liegt in <strong>{d.fach}</strong> · {bereichLabel[d.bereich]} · {d.thema}
                        </span>
                      </div>
                      <span className="verlauf-zeit">
                        {d.ts
                          ? new Date(d.ts).toLocaleString("de-DE", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : d.datum}
                      </span>
                      <span className="material-aktionen">
                        <button className="mini-btn" onClick={() => oeffneFachOrdner(d.fach)}>
                          Öffnen
                        </button>
                        <button
                          className="mini-btn mini-x"
                          onClick={() => deleteDoc(d.id)}
                          aria-label="Löschen"
                        >
                          ×
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {vorschau && (
        <MaterialVorschau material={vorschau} onClose={() => setVorschau(null)} />
      )}
    </div>
  );
}
