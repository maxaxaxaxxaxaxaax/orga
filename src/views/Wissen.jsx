import { useEffect, useRef, useState } from "react";
import { faecher, artLabel, statusLabel, bereichLabel } from "../data/wissen";
import { etappen } from "../data/etappen";
import { themaStatus, lernwegStand, effektiveSchritte, fachKbStand } from "../lib/lernstand";
import { standLabel } from "../data/fortschritt";
import WissensGraph from "../components/WissensGraph";
import WissensOrdner from "../components/WissensOrdner";
import MaterialVorschau from "../components/MaterialVorschau";
import TafelSnap from "../components/TafelSnap";
import Begriff from "../components/Begriff";
import Label from "../components/Label";
import Icon from "../components/Icon";

// Stand-Label aus dem aktuellen erbracht/gesamt-Verhältnis ableiten. So bleibt
// das Label immer ehrlich zur tatsächlichen KB-Bilanz, ohne hartcodierte Werte.
function ableitStand(erbracht, gesamt) {
  if (gesamt === 0 || erbracht === 0) return "aufbau";
  const pct = erbracht / gesamt;
  if (pct >= 0.66) return "sicher";
  return "aufweg";
}

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
  aufgaben = [],
  coach = false,
  init = null,
  onInitConsumed,
}) {
  const [fachId, setFachId] = useState(() => wLaden("orga.wissen.fach", faecher[0].id));
  const [ansicht, setAnsicht] = useState(() => {
    const v = wLaden("orga.wissen.ansicht", "lernwege");
    // Alte Werte aus früheren IA-Iterationen umlenken.
    if (v === "graph") return "lernwege";
    if (v === "stand") return "lernwege"; // Stand ist jetzt Kopfzeile, kein Reiter mehr.
    if (v === "verlauf" && !coach) return "lernwege";
    if (v === "netz" && !coach) return "lernwege";
    return v;
  });
  const [thema, setThema] = useState(null);
  const [hinweis, setHinweis] = useState(null);
  const [ueberGlobal, setUeberGlobal] = useState(false);
  const [suche, setSuche] = useState("");
  const [etappe, setEtappe] = useState(() => wLaden("orga.wissen.etappe", null));
  const [statusFilter, setStatusFilter] = useState(() => wLaden("orga.wissen.status", "alle"));
  const [tafelOffen, setTafelOffen] = useState(false);
  const [vorschau, setVorschau] = useState(null);
  const globalInput = useRef(null);

  // Filterzustand reload-fest.
  useEffect(() => localStorage.setItem("orga.wissen.fach", JSON.stringify(fachId)), [fachId]);
  useEffect(() => localStorage.setItem("orga.wissen.ansicht", JSON.stringify(ansicht)), [ansicht]);
  useEffect(() => localStorage.setItem("orga.wissen.etappe", JSON.stringify(etappe)), [etappe]);
  useEffect(() => localStorage.setItem("orga.wissen.status", JSON.stringify(statusFilter)), [statusFilter]);

  // Coach-Modus aus -> zurück zur Lernwege-Ansicht, wenn Power-Reiter aktiv.
  // (Stand wurde durch die Mappen-Kopfzeile ersetzt und ist schon im
  // useState-Init umgelenkt, hier nur noch netz/verlauf relevant.)
  useEffect(() => {
    if (!coach && (ansicht === "netz" || ansicht === "verlauf")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnsicht("lernwege");
    }
  }, [coach, ansicht]);

  // Deep-Link aus anderen Views (z. B. Aufgaben -> Lernweg).
  useEffect(() => {
    if (!init) return;
    if (init.fachId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFachId(init.fachId);
    }
    if (init.themaId) {
      const ziel = faecher.find((f) => f.id === init.fachId);
      const t = ziel?.themen.find((x) => x.id === init.themaId);
      if (t) {
        setThema(t.label);
        setAnsicht("lernwege");
      }
    }
    onInitConsumed?.();
  }, [init, onInitConsumed]);

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
      kbId: t.kbId || null,
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

  // Tafel-Snap: aus einem Demo-Tafelbild wird eine strukturierte Notiz.
  // Sie landet im Ordner als Material des aktuellen Lernwegs (Bereich Unterricht).
  function tafelSpeichern(demo) {
    const ts = Date.now();
    const eintrag = {
      id: "tafel-" + ts,
      fach: demo.fach,
      bereich:
        demo.quelle === "arbeitsblatt" ||
        demo.quelle === "mitschrift" ||
        demo.quelle === "buchseite"
          ? "selbstlernen"
          : "unterricht",
      thema: demo.thema,
      titel: demo.titel,
      art: "tafelnotiz",
      inhalt: demo.inhalt,
      quelle: demo.quelle || "tafelbild",
      ts,
      datum: new Date(ts).toISOString().slice(0, 10),
      uploaded: true,
      fachErkannt: true,
    };
    setHochgeladen((g) => [eintrag, ...g]);
    setHinweis({
      items: [
        {
          titel: eintrag.titel,
          fach: eintrag.fach,
          bereich: eintrag.bereich,
          thema: eintrag.thema,
        },
      ],
    });
    // Optional: direkt zum Fach des Tafelbilds wechseln, damit Max sieht wo's gelandet ist.
    const zielFach = faecher.find((f) => f.fach === demo.fach);
    if (zielFach) setFachId(zielFach.id);
  }

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
    setAnsicht("lernwege");
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

  // Detail-Block (Schritte + Materialien) für lernwege- und netz-Ansicht.
  const detailBlock = thema && gewaehlt ? (
    <div className="knoten-detail">
      <div className="knoten-detail-kopf">
        <button className="zurueck-btn klein" onClick={() => setThema(null)}>← zurück</button>
        <h3 className="thema-titel">{thema}</h3>
        {gewaehlt.kbId && (
          <span className="kb-chip" title="Etappenziel · Könnensbeweis">
            {gewaehlt.kbId.replace(/^(\d)([A-Z])([A-Z])(\d)$/, "$1 $2 $3$4")}
          </span>
        )}
        <span className={"status-chip " + gewaehlt.status}>{statusLabel[gewaehlt.status]}</span>
        <span className="etappe-chip">{etappeKurz[gewaehlt.etappe]}</span>
      </div>
      {stand && (
        <div className="lernweg">
          <div className="lernweg-kopf">
            <span className="lernweg-titel">Dein <Begriff name="lernweg">Lernweg</Begriff></span>
            <span className="lernweg-zahl">{stand.fertig} von {stand.gesamt} Schritten</span>
          </div>
          <ol className="lw-schritte">
            {gewaehlt.schritte.map((s, i) => {
              const istNaechster = gewaehlt.status === "current" && i === stand.naechster;
              return (
                <li key={i}>
                  <button
                    className={"lw-schritt" + (s.fertig ? " fertig" : istNaechster ? " aktuell" : "")}
                    onClick={() => toggleSchritt(fach.id, gewaehlt.id, s.idx, s.fertig)}
                    aria-pressed={s.fertig}
                    aria-label={(s.fertig ? "Erledigt: " : "Offen: ") + s.text}
                  >
                    <span className="lw-mark">{s.fertig ? "✓" : istNaechster ? "→" : ""}</span>
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
  ) : null;

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
            : ansicht === "lernwege"
            ? `Deine Lernwege · ${fach.fach}: ${alleNodes.length}`
            : ansicht === "netz"
            ? `Lernwege als Netz · ${fach.fach}: ${nodes.length}`
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

      {/* Universeller Datei-Einwurf + Tafel-Snap: zwei Wege Material in den
          Lernweg zu bringen. Einwurf für fertige Dateien, Tafel-Snap für
          Tafelbild-Fotos, die aufbereitet werden sollen. */}
      <div className="einwurf-zeile">
        <div
          className={"einwurf" + (ueberGlobal ? " ueber" : "")}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setUeberGlobal(true)}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setUeberGlobal(false);
          }}
          onDrop={globalDrop}
          onClick={() => globalInput.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Dokumente einwerfen, automatisch einsortieren"
        >
          <input ref={globalInput} type="file" multiple hidden onChange={globalGewaehlt} />
          <Icon name="funke" size={18} />
          <div>
            <strong>Dokumente einwerfen</strong>
            <span> · wir erkennen Fach und Lernweg automatisch.</span>
          </div>
        </div>
        <button
          className="tafel-snap-btn"
          onClick={() => setTafelOffen(true)}
          aria-label="Foto-Snap öffnen: Tafelbild, Arbeitsblatt oder Mitschrift aufbereiten"
        >
          <Icon name="kamera" size={18} />
          <div>
            <strong>Foto-Snap</strong>
            <span>Tafelbild, Arbeitsblatt oder Mitschrift wird zur Notiz</span>
          </div>
        </button>
      </div>

      {hinweis && (
        <div className="sortier-hinweis" role="status" aria-live="polite">
          <button className="sortier-x" onClick={() => setHinweis(null)} aria-label="Schließen">×</button>
          <p className="sortier-titel">Automatisch einsortiert:</p>
          <ul className="sortier-liste">
            {hinweis.items.map((it, i) => (
              <li key={i}>
                <button
                  className="sortier-item-btn"
                  onClick={() => {
                    oeffneFachOrdner(it.fach);
                    setHinweis(null);
                  }}
                  title="Im Ordner ansehen"
                >
                  <strong>{it.titel}</strong> → {it.fach} · {bereichLabel[it.bereich]} · {it.thema}
                </button>
              </li>
            ))}
          </ul>
          <p className="sortier-fuss">Tippe einen Eintrag, um ihn im Ordner zu sehen.</p>
        </div>
      )}

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
        <div className={ansicht !== "verlauf" ? "mappe" : ""} style={{ "--c": fach.farbe }}>
          {/* Fach-Auswahl als Register-Reiter der Sichtmappe (nicht im Verlauf) */}
          {ansicht !== "verlauf" && (
            <div className="fach-chips" role="tablist" aria-label="Fach wählen">
              {faecher.map((f) => {
                const pct = fachFortschritt(f);
                return (
                  <button
                    key={f.id}
                    className={"fach-chip-btn" + (f.id === fachId ? " aktiv" : "")}
                    style={{ "--c": f.farbe }}
                    onClick={() => wechselFach(f.id)}
                    title={`${f.fach}: ${pct}% erledigt`}
                    role="tab"
                    aria-selected={f.id === fachId}
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

          <div className={ansicht !== "verlauf" ? "mappe-innenseite" : ""}>
          {/* Umschalter (Schüler: Lernwege/Ordner/Stand; Coach zusätzlich Netz/Verlauf) */}
          <div className="graph-leiste">
            <div className="segment">
              <button
                className={"segment-btn" + (ansicht === "lernwege" ? " aktiv" : "")}
                onClick={() => setAnsicht("lernwege")}
              >
                Lernwege
              </button>
              {coach && (
                <button
                  className={"segment-btn" + (ansicht === "netz" ? " aktiv" : "")}
                  onClick={() => setAnsicht("netz")}
                >
                  Netz
                </button>
              )}
              <button
                className={"segment-btn" + (ansicht === "ordner" ? " aktiv" : "")}
                onClick={() => setAnsicht("ordner")}
              >
                Ordner
              </button>
              {coach && (
                <button
                  className={"segment-btn" + (ansicht === "verlauf" ? " aktiv" : "")}
                  onClick={() => setAnsicht("verlauf")}
                >
                  Verlauf{hochgeladen.length > 0 ? ` (${hochgeladen.length})` : ""}
                </button>
              )}
            </div>
            {ansicht === "netz" && (
              <div className="graph-legende">
                <span className="gleg"><span className="gleg-dot done" /> erledigt</span>
                <span className="gleg"><span className="gleg-dot current" /> aktuell</span>
                <span className="gleg"><span className="gleg-dot upcoming" /> kommt noch</span>
              </div>
            )}
          </div>

          {/* Stand-Kopfzeile (Reflexion: wo stehe ich im Fach?). Nur in den
              Lern-Ansichten; im Ordner geht's um Material-Logistik, da ist der
              KB-Stand nicht relevant. */}
          {(ansicht === "lernwege" || ansicht === "netz") && (() => {
            // Zahlen + Stand IMMER dynamisch aus den echten Lernwegen. Keine
            // hartcodierten Werte aus fortschritt.js (würden auseinanderlaufen).
            // Trend bleibt weg, weil es ohne echte Historie keine ehrliche
            // Verlaufsangabe geben kann.
            const { erbracht, gesamt } = fachKbStand(fach, ctx);
            const standKey = ableitStand(erbracht, gesamt);
            const pct = gesamt ? Math.round((erbracht / gesamt) * 100) : 0;
            return (
              <div className="stand-kopfzeile" style={{ "--c": fach.farbe }}>
                <div className="stand-text">
                  <span className="stand-stand">{standLabel[standKey]}</span>
                  <span className="stand-zahl">
                    {erbracht}/{gesamt} <Begriff name="koennensbeweis">Könnensbeweise</Begriff>
                  </span>
                </div>
                <div className="stand-balken" aria-label={`${pct}% erbracht`}>
                  <div className="stand-balken-fuell" style={{ width: pct + "%" }} />
                </div>
              </div>
            );
          })()}

          {/* Etappen-Filter: bestimmt, was im Netz und Ordner sichtbar ist */}
          {/* Filter: Etappe + Status, nur im Coach-Modus (für Netz/Lernwege/Ordner) */}
          {coach && (ansicht === "netz" || ansicht === "lernwege" || ansicht === "ordner") && (
            <div className="etappe-filter">
              <span className="eleg-titel"><Begriff name="etappe">Etappe</Begriff>:</span>
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

          {coach && (ansicht === "netz" || ansicht === "lernwege") && (
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
          {(ansicht === "lernwege" || ansicht === "netz") && empfohlen && !thema && (
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

          {ansicht === "lernwege" ? (
            thema ? (
              detailBlock
              ) : (
                <div className="lernweg-liste">
                  {["current", "upcoming", "done"].map((s) => {
                    const items = alleNodes.filter((n) => n.status === s);
                    if (items.length === 0) return null;
                    const titel = s === "current" ? "Aktuell" : s === "upcoming" ? "Kommt noch" : "Erledigt";
                    return (
                      <section key={s} className={"lw-gruppe lw-gruppe-" + s}>
                        <h3 className="lw-gruppe-titel">{titel} <span className="lw-gruppe-zahl">{items.length}</span></h3>
                        <ul className="lw-items">
                          {items.map((n) => {
                            const stnd = lernwegStand(n.schritte);
                            return (
                              <li key={n.id}>
                                <button
                                  className={"lw-item lw-item-" + n.status}
                                  onClick={() => setThema(n.label)}
                                >
                                  <span className="lw-item-mark">
                                    {n.status === "done" ? "✓" : n.status === "current" ? "●" : "○"}
                                  </span>
                                  <span className="lw-item-mitte">
                                    <span className="lw-item-titel">{n.label}</span>
                                    <span className="lw-item-meta">
                                      {stnd.fertig}/{stnd.gesamt} Schritten · {etappeKurz[n.etappe]}
                                    </span>
                                  </span>
                                  <span className="lw-item-pfeil">→</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              )
          ) : ansicht === "netz" ? (
            nodes.length === 0 ? (
              <p className="panel-leer">
                Hier gibt es mit diesem Filter gerade nichts zu sehen. Wähle „Alle".
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
                {thema ? detailBlock : (
                  <p className="graph-hinweis">
                    Jeder Punkt ist ein <Begriff name="lernweg">Lernweg</Begriff>.{" "}
                    <strong>Grün</strong> heißt erledigt, <strong>Blau</strong> aktuell,{" "}
                    <strong>Grau</strong> kommt noch.
                  </p>
                )}
              </>
            )
          ) : ansicht === "ordner" ? (
            <WissensOrdner
              fach={fach}
              dokumente={sichtbareDocs}
              onUpload={(files) => addDocs(files, fach.fach)}
              onMove={moveDoc}
              onDelete={deleteDoc}
              onOeffnen={setVorschau}
            />
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
          </div>
        </div>
      )}

      {vorschau && (
        <MaterialVorschau material={vorschau} onClose={() => setVorschau(null)} />
      )}

      {tafelOffen && (
        <TafelSnap
          onClose={() => setTafelOffen(false)}
          onSpeichern={tafelSpeichern}
        />
      )}
    </div>
  );
}
