import { useState } from "react";
import { faecher } from "../data/wissen";
import { koennensbeweise, kbFarbe } from "../data/koennensbeweise";
import { ladeEigene, speichereEigenes } from "./eigeneMaterialien";
import { istOeffenbar } from "./interaktiv";
import { lade, ERLEDIGT_KEY } from "./planung";
import { IcLernweg } from "./materialIcons";
import { CHIPS, chipFuerMaterial, iconFuerMaterial } from "./materialTypen";
import MaterialUpload from "./MaterialUpload";
import MaterialAnsicht from "./MaterialAnsicht";
import KbInhalt from "./KbInhalt";
import Netz from "./Netz";
import Icon from "./Icon";
import "./Ablage.css";

// Ablage: eine Karte "Materialien". Oben drin die Fächer als bunte Ordner (Wahl
// des Fachs), darunter die Materialien des Fachs, gefiltert über Typ-Chips (Alle,
// Tafelaufschriebe, Aufgaben, Lernwege, Notizen, KI, Buchseiten), mit Suche und
// Sortierung. Jede Zeile trägt ein Typ-Icon, Titel und Datum. Icons/Chips kommen
// aus materialIcons (geteilt mit dem Fokus).

// Eigene Fach-Ordner (in Figma erstellt, Fach-Farbe + Buchstabe eingebaut), je
// offen/geschlossen. Als Rohtext eingelesen und 1:1 eingefügt (Farben bleiben).
const ORDNER_SVGS = import.meta.glob("./icons/folders/*.svg", {
  query: "?raw",
  eager: true,
  import: "default",
});
const ORDNER = {};
for (const [pfad, raw] of Object.entries(ORDNER_SVGS)) {
  ORDNER[pfad.split("/").pop().replace(/\.svg$/, "")] = raw;
}
// App-Fachname -> Dateibasis der Ordner-SVGs.
const FACH_ORDNER = {
  Mathematik: "mathe",
  Deutsch: "deutsch",
  Englisch: "englisch",
  Französisch: "franzoesisch",
};

function FolderIcon({ fach, color, offen }) {
  const basis = FACH_ORDNER[fach];
  const svg = basis ? ORDNER[`${basis}-${offen ? "auf" : "zu"}`] : null;
  if (svg) {
    return (
      <span
        className="ab-ordner-svg"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }
  // Fallback: bisheriger eingefärbter Ordner (Fächer ohne eigenes SVG).
  if (offen) {
    return (
      <svg viewBox="0 0 64 52" width="58" height="47" aria-hidden="true">
        <path
          d="M6 10a4 4 0 0 1 4-4h12l5 5h25a4 4 0 0 1 4 4v17H6V10z"
          fill={color}
          opacity="0.45"
        />
        <path
          d="M1 22h62l-6.4 21.6A4 4 0 0 1 52.8 47H11.2a4 4 0 0 1-3.8-2.7L1 22z"
          fill={color}
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 52" width="58" height="47" aria-hidden="true">
      <path
        d="M6 10a4 4 0 0 1 4-4h12l5 5h27a4 4 0 0 1 4 4v3H6V10z"
        fill={color}
        opacity="0.5"
      />
      <path
        d="M4 18a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V18z"
        fill={color}
      />
    </svg>
  );
}

function datumLang(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Ablage() {
  // Standard: kein Fach gewählt -> alle Fächer (global). Ein Ordner-Klick filtert,
  // nochmaliger Klick auf denselben Ordner schließt ihn wieder (zurück zu global).
  const [fachId, setFachId] = useState(null);
  const [chip, setChip] = useState("alle");
  const [suche, setSuche] = useState("");
  const [sort, setSort] = useState("neu"); // neu | az
  const [sortOffen, setSortOffen] = useState(false);
  const [uploadOffen, setUploadOffen] = useState(false);
  const [eigene, setEigene] = useState(ladeEigene);
  const [offenesMaterial, setOffenesMaterial] = useState(null);
  const [offenerLernweg, setOffenerLernweg] = useState(null);
  const [ansicht, setAnsicht] = useState("liste"); // liste | netz

  const fach = faecher.find((f) => f.id === fachId) || null;
  const erledigt = lade(ERLEDIGT_KEY);

  // Lernwege + Materialien eines Fachs als Listenzeilen (Typ-Chip, Icon, Fach).
  const zeilenFuerFach = (f) => {
    if (!f) return [];
    const lernwege = f.themen.filter((t) =>
      koennensbeweise.some((k) => k.id === t.kbId)
    );
    const materialien = [
      ...(f.materialien || []),
      ...eigene.filter((m) => m.fachId === f.id),
    ];
    const lwRows = lernwege.map((t) => ({
      key: f.id + "-lw-" + t.id,
      chip: "lernwege",
      titel: t.label,
      fach: f.fach,
      datum: null,
      Icon: IcLernweg,
      onOpen: () => setOffenerLernweg({ id: t.kbId, label: t.label }),
    }));
    const mRows = materialien.map((m) => ({
      key: f.id + "-m-" + m.id,
      chip: chipFuerMaterial(m),
      titel: m.titel,
      fach: f.fach,
      datum: m.datum || null,
      Icon: iconFuerMaterial(m),
      onOpen: istOeffenbar(m) ? () => setOffenesMaterial(m) : null,
    }));
    return [...lwRows, ...mRows];
  };

  const q = suche.trim().toLowerCase();
  // Ein Fach gewählt -> nur dieses; sonst alle Fächer (global). Die Suche filtert
  // jeweils innerhalb dieses Bereichs.
  const quellFaecher = fach ? [fach] : faecher;
  let rows = quellFaecher.flatMap(zeilenFuerFach);
  if (chip !== "alle") rows = rows.filter((r) => r.chip === chip);
  if (q) rows = rows.filter((r) => r.titel.toLowerCase().includes(q));
  rows = rows.sort((a, b) => {
    if (sort === "az") return a.titel.localeCompare(b.titel, "de");
    // Neueste: Lernwege oben (kein Datum), dann Materialien nach Datum absteigend.
    const al = a.chip === "lernwege",
      bl = b.chip === "lernwege";
    if (al !== bl) return al ? -1 : 1;
    return (b.datum || "").localeCompare(a.datum || "");
  });

  function uploadSpeichern(m) {
    speichereEigenes(m);
    setEigene(ladeEigene());
    setUploadOffen(false);
    if (m.fachId) setFachId(m.fachId);
  }

  // Fächer-Ordner (Buttons), in beiden Ansichten genutzt: in der Liste über den
  // Materialien, im Netz als Overlay oben auf dem Netz. Toggle: gleiches Fach
  // erneut -> zu (global); kein Ansicht-Wechsel, damit man im Netz bleibt.
  const ordnerButtons = faecher.map((f) => (
    <button
      key={f.id}
      type="button"
      className={"ab-ordner" + (f.id === fachId ? " aktiv" : "")}
      onClick={() => {
        setFachId((cur) => (cur === f.id ? null : f.id));
        setChip("alle");
      }}
      aria-pressed={f.id === fachId}
    >
      <FolderIcon
        fach={f.fach}
        color={kbFarbe[f.fach] || f.farbe || "#868e96"}
        offen={f.id === fachId}
      />
      <span className="ab-ordner-name">{f.fach}</span>
    </button>
  ));

  return (
    <>
      <div className="ab-screen">
        <div className="ab-grid">
          {/* Eine Karte: Materialien, mit den Fächer-Ordnern oben drin. */}
          <section
            className={
              "ab-card ab-materialien" + (ansicht === "netz" ? " ab-fuellt" : "")
            }
          >
            <div className="ab-mat-kopf">
              <div>
                <h2 className="ab-card-titel">
                  <Icon name="material" className="ab-card-icon" />
                  Materialien
                </h2>
                <p className="ab-mat-fach">
                  {fach ? `${fach.fach} Gesamt` : "Alle Fächer"}
                </p>
              </div>
              <div className="ab-ansicht" role="tablist" aria-label="Ansicht">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={ansicht === "liste"}
                    className={"ab-ansicht-chip" + (ansicht === "liste" ? " an" : "")}
                    onClick={() => setAnsicht("liste")}
                  >
                    Liste
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={ansicht === "netz"}
                    className={"ab-ansicht-chip" + (ansicht === "netz" ? " an" : "")}
                    onClick={() => setAnsicht("netz")}
                  >
                    Netz
                  </button>
                </div>
            </div>

            {ansicht === "netz" ? (
              <div className="ab-netz">
                <Netz
                  erledigt={erledigt}
                  onSelect={(node) =>
                    setOffenerLernweg({ id: node.kbId, label: node.label })
                  }
                />
              </div>
            ) : (
              <>
                {/* Fächer-Ordner über der Liste (Auswahl filtert die Liste). */}
                <div className="ab-faecher-leiste">{ordnerButtons}</div>
                <div className="ab-chips" role="tablist" aria-label="Material-Typ">
                  {CHIPS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      role="tab"
                      aria-selected={chip === c.key}
                      className={"ab-chip" + (chip === c.key ? " an" : "")}
                      onClick={() => setChip(c.key)}
                    >
                      {c.Icon && <c.Icon className="ab-chip-icon" />}
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="ab-liste-kopf">
                  <div className="ab-liste-werkzeuge">
                    <div className="ab-sort">
                      <button
                        type="button"
                        className="ab-sort-knopf"
                        onClick={() => setSortOffen((v) => !v)}
                        aria-haspopup="listbox"
                        aria-expanded={sortOffen}
                      >
                        Sortieren
                        <span aria-hidden="true">⌄</span>
                      </button>
                      {sortOffen && (
                        <ul className="ab-sort-menue" role="listbox">
                          {[
                            ["neu", "Neueste"],
                            ["az", "A–Z"],
                          ].map(([k, l]) => (
                            <li key={k}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={sort === k}
                                className={"ab-sort-opt" + (sort === k ? " an" : "")}
                                onClick={() => {
                                  setSort(k);
                                  setSortOffen(false);
                                }}
                              >
                                {l}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {rows.length === 0 ? (
                  <p className="ab-liste-leer">Nichts gefunden.</p>
                ) : (
                  <ul className="ab-liste">
                    {rows.map((r) => {
                      const Inhalt = (
                        <>
                          <span className="ab-zeile-icon" aria-hidden="true">
                            <r.Icon />
                          </span>
                          <span className="ab-zeile-titel">{r.titel}</span>
                          {!fach && r.fach && (
                            <span className="ab-zeile-fach">{r.fach}</span>
                          )}
                          <span className="ab-zeile-datum">
                            {r.datum ? datumLang(r.datum) : ""}
                          </span>
                        </>
                      );
                      return (
                        <li key={r.key}>
                          {r.onOpen ? (
                            <button
                              type="button"
                              className="ab-zeile ab-zeile-klick"
                              onClick={r.onOpen}
                            >
                              {Inhalt}
                            </button>
                          ) : (
                            <div className="ab-zeile">{Inhalt}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>

        {uploadOffen && (
          <MaterialUpload
            startFachId={fachId}
            onSpeichern={uploadSpeichern}
            onClose={() => setUploadOffen(false)}
          />
        )}
        {offenesMaterial && (
          <MaterialAnsicht
            material={offenesMaterial}
            onClose={() => setOffenesMaterial(null)}
          />
        )}
        {offenerLernweg && (
          <div
            className="ab-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setOffenerLernweg(null)}
          >
            <div className="ab-overlay-karte" onClick={(e) => e.stopPropagation()}>
              <div className="ab-overlay-kopf">
                <h2 className="ab-overlay-titel">{offenerLernweg.label}</h2>
                <button
                  type="button"
                  className="ab-overlay-zu"
                  onClick={() => setOffenerLernweg(null)}
                  aria-label="Schließen"
                >
                  ✕
                </button>
              </div>
              <div className="ab-overlay-inhalt">
                <KbInhalt key={offenerLernweg.id} kb={offenerLernweg} kompakt />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Untere Leiste (konsistent mit Weg-Leiste/Planung): Suche + Hinzufügen.
          Bewusst außerhalb von .ab-screen: dessen screen-rein-Animation hält einen
          Identity-Transform und würde die fixe Pille sonst an den (hohen) Screen
          statt an den Viewport hängen. */}
      <div className="ab-top">
        <div className="ab-suche">
          <Icon name="search" />
          <input
            type="text"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            onFocus={() => setFachId(null)}
            placeholder="Suche"
            aria-label="Ablage durchsuchen"
          />
        </div>
        <button
          type="button"
          className="ab-add"
          onClick={() => setUploadOffen(true)}
        >
          <span aria-hidden="true">✦</span> Hinzufügen
        </button>
      </div>
    </>
  );
}
