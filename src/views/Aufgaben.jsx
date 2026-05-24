import { useEffect, useState } from "react";
import { typLabel } from "../data/aufgaben";
import { faecher } from "../data/wissen";
import { fachFarbe } from "../data/stundenplanWoche";
import { tageBis, formatTage } from "../lib/zeit";
import { parseAufgabe } from "../lib/aufgabeParser";
import Wochenplaner from "../components/Wochenplaner";

// Gruppe nach Dringlichkeit (wie Posteingang-Abschnitte).
function gruppe(tage) {
  if (tage < 0) return "ueberfaellig";
  if (tage === 0) return "heute";
  if (tage <= 7) return "woche";
  return "spaeter";
}

const gruppenReihenfolge = [
  { key: "ueberfaellig", titel: "Überfällig" },
  { key: "heute", titel: "Heute" },
  { key: "woche", titel: "Diese Woche" },
  { key: "spaeter", titel: "Später" },
];

export default function Aufgaben({
  jetzt,
  erledigt,
  setErledigt,
  initialModus = "liste",
  aufgaben = [],
  onAdd,
  coach,
  onOpenLernweg,
}) {
  const [nurOffen, setNurOffen] = useState(true);
  const [modus, setModus] = useState(coach ? initialModus : "liste");
  const [neu, setNeu] = useState("");

  // Wenn Coach-Modus ausgeht, immer zurück zur Liste (Cross-Prop-Sync).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!coach && modus !== "liste") setModus("liste");
  }, [coach, modus]);

  // Lernweg-Label aus Aufgabe.lernweg (für klickbare Chips).
  function lernwegLabel(ref) {
    const f = faecher.find((x) => x.id === ref.fachId);
    const t = f?.themen.find((x) => x.id === ref.themaId);
    return t?.label || "Lernweg";
  }

  function toggle(id) {
    setErledigt((e) => ({ ...e, [id]: !e[id] }));
  }
  function hinzufuegen(e) {
    e.preventDefault();
    const a = parseAufgabe(neu, jetzt);
    if (a && onAdd) {
      onAdd(a);
      setNeu("");
    }
  }

  const liste = aufgaben
    .map((a) => ({ ...a, tage: tageBis(a.faellig, jetzt), ist: !!erledigt[a.id] }))
    .filter((a) => (nurOffen ? !a.ist : true))
    .sort((a, b) => a.tage - b.tage);

  const offenGesamt = aufgaben.filter((a) => !erledigt[a.id]).length;

  return (
    <div className={"view" + (modus === "plan" ? " view-breit" : "")}>
      <header className="view-kopf">
        <h1 className="view-titel">Aufgaben</h1>
        <p className="view-sub">
          {modus === "liste" ? `${offenGesamt} offen` : "Könnensbeweise: plane 10 Clusterstunden für diese Woche."}
        </p>
      </header>

      {coach && (
        <div className="segment" style={{ marginBottom: "18px" }}>
          <button
            className={"segment-btn" + (modus === "liste" ? " aktiv" : "")}
            onClick={() => setModus("liste")}
          >
            Liste
          </button>
          <button
            className={"segment-btn" + (modus === "plan" ? " aktiv" : "")}
            onClick={() => setModus("plan")}
          >
            Wochenplan
          </button>
        </div>
      )}

      {modus === "plan" ? (
        <Wochenplaner jetzt={jetzt} />
      ) : (
      <>
      <form className="schnell-add" onSubmit={hinzufuegen}>
        <input
          className="schnell-add-input"
          placeholder="Neue Aufgabe: z. B. „Bio Steckbrief bis Freitag“"
          value={neu}
          onChange={(e) => setNeu(e.target.value)}
          aria-label="Neue Aufgabe hinzufügen"
        />
        <button className="schnell-add-btn" type="submit" disabled={!neu.trim()}>
          Hinzufügen
        </button>
      </form>

      <div className="filter-zeile">
        <button
          className={"filter-btn" + (nurOffen ? " aktiv" : "")}
          onClick={() => setNurOffen(true)}
        >
          Offen
        </button>
        <button
          className={"filter-btn" + (!nurOffen ? " aktiv" : "")}
          onClick={() => setNurOffen(false)}
        >
          Alle
        </button>
      </div>

      <div className="inbox">
        {gruppenReihenfolge.map(({ key, titel }) => {
          const gruppeListe = liste.filter((a) => gruppe(a.tage) === key);
          if (gruppeListe.length === 0) return null;
          return (
            <div className="inbox-gruppe" key={key}>
              <div className={"inbox-gruppe-kopf gk-" + key}>{titel}</div>
              {gruppeListe.map((a) => {
                const farbe = fachFarbe[a.fach] || "#868e96";
                return (
                  <div key={a.id} className={"zeile" + (a.ist ? " ist-erledigt" : "")}>
                    <button
                      className={"check" + (a.ist ? " an" : "")}
                      onClick={() => toggle(a.id)}
                      aria-label="Als erledigt markieren"
                    >
                      {a.ist ? "✓" : ""}
                    </button>
                    <span className="fach-chip" style={{ "--c": farbe }}>{a.fach}</span>
                    <div className="zeile-mitte">
                      <span className="zeile-titel">
                        {a.prio === "hoch" && <span className="prio-punkt" title="Wichtig" />}
                        {a.titel}
                      </span>
                      <span className="zeile-vorschau">
                        {typLabel[a.typ]} · ca. {a.dauer} Min
                        {a.lernweg && (
                          <button
                            className="lernweg-tag lernweg-tag-btn"
                            onClick={() => onOpenLernweg?.(a.lernweg.fachId, a.lernweg.themaId)}
                            title="Zum Lernweg im Wissen-Tab"
                          >
                            ↗ {lernwegLabel(a.lernweg)}
                          </button>
                        )}
                      </span>
                    </div>
                    <span className={"frist" + (a.tage <= 0 ? " dringend" : "")}>
                      {formatTage(a.tage)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
