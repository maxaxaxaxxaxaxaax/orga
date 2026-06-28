import { useState } from "react";
import { faecher } from "../data/wissen";
import { koennensbeweise, kbFarbe } from "../data/koennensbeweise";
import { ladeEigene, speichereEigenes } from "./eigeneMaterialien";
import { istOeffenbar } from "./interaktiv";
import { FACH_STRUKTUR } from "../data/fachStruktur";
import { lade, ERLEDIGT_KEY } from "./planung";
import { IcLernweg } from "./materialIcons";
import { CHIPS, chipFuerMaterial, iconFuerMaterial } from "./materialTypen";
import MaterialUpload from "./MaterialUpload";
import MaterialAnsicht from "./MaterialAnsicht";
import KbInhalt from "./KbInhalt";
import Netz from "./Netz";
import { useRasterZiehen } from "./rasterZiehen";
import { RasterGriff, RasterOverlay } from "./raster";
import "./Ablage.css";

// Ablage: links die Fächer als bunte Ordner (plus später Kompetenzen), rechts die
// Materialien des gewählten Fachs, gefiltert über Typ-Chips (Alle, Tafelaufschriebe,
// Aufgaben, Lernwege, Notizen, KI, Buchseiten), mit Suche und Sortierung. Jede Zeile
// trägt ein Typ-Icon, Titel und Datum. Icons/Chips kommen aus materialIcons (geteilt
// mit dem Fokus).

function FolderIcon({ color, offen }) {
  if (offen) {
    // Geöffneter Ordner: hintere Wand + nach vorne geklappte, oben breitere Lasche.
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

const STD_FACH =
  faecher.find((f) => f.fach === "Mathematik")?.id || faecher[0]?.id || null;

export default function Ablage() {
  const [fachId, setFachId] = useState(STD_FACH);
  const [chip, setChip] = useState("alle");
  const [suche, setSuche] = useState("");
  const [sort, setSort] = useState("neu"); // neu | az
  const [sortOffen, setSortOffen] = useState(false);
  const [katOffen, setKatOffen] = useState(() => new Set()); // offene Kompetenzbereiche
  const [uploadOffen, setUploadOffen] = useState(false);
  const [eigene, setEigene] = useState(ladeEigene);
  const [offenesMaterial, setOffenesMaterial] = useState(null);
  const [offenerLernweg, setOffenerLernweg] = useState(null);
  const [ansicht, setAnsicht] = useState("liste"); // liste | netz
  // Prototyp: die Grenze zwischen Seitenleiste und Materialien per Ziehen
  // verschieben (geteilt mit Übersicht/Fokus, siehe ./rasterZiehen).
  const [abGrenze, setAbGrenze] = useState(4);
  const { ref: gridRef, zieht, griff } = useRasterZiehen();

  const fach = faecher.find((f) => f.id === fachId) || null;
  const struktur = fach ? FACH_STRUKTUR[fach.id] : null;
  const erledigt = lade(ERLEDIGT_KEY);
  function toggleKat(kat) {
    setKatOffen((prev) => {
      const next = new Set(prev);
      if (next.has(kat)) next.delete(kat);
      else next.add(kat);
      return next;
    });
  }

  // Aktive Lernwege des Fachs (die mit echtem Könnensbeweis in der Etappe).
  const lernwege = fach
    ? fach.themen.filter((t) => koennensbeweise.some((k) => k.id === t.kbId))
    : [];
  const materialien = fach
    ? [
        ...(fach.materialien || []),
        ...eigene.filter((m) => m.fachId === fach.id),
      ]
    : [];

  // Alles in eine Liste: Lernwege + Materialien, je mit Typ-Chip und Icon.
  const lernwegRows = lernwege.map((t) => ({
    key: "lw-" + t.id,
    chip: "lernwege",
    titel: t.label,
    datum: null,
    Icon: IcLernweg,
    onOpen: () => setOffenerLernweg({ id: t.kbId, label: t.label }),
  }));
  const matRows = materialien.map((m) => ({
    key: "m-" + m.id,
    chip: chipFuerMaterial(m),
    titel: m.titel,
    datum: m.datum || null,
    Icon: iconFuerMaterial(m),
    onOpen: istOeffenbar(m) ? () => setOffenesMaterial(m) : null,
  }));

  let rows = [...lernwegRows, ...matRows];
  if (chip !== "alle") rows = rows.filter((r) => r.chip === chip);
  const q = suche.trim().toLowerCase();
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

  return (
    <>
    <div className="ab-screen">
      <div
        className={"ab-grid" + (zieht ? " raster-zieht" : "")}
        ref={gridRef}
        style={{ "--ab-start": abGrenze + 1 }}
      >
        <RasterOverlay />
        {/* Linke Spalte: Fächer + Kompetenzen */}
        <div className="ab-links">
          <section className="ab-card ab-faecher">
            <h2 className="ab-card-titel">
              <svg className="ab-card-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7.5a2 2 0 0 1 2-2h3.2l1.6 2H18a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z" />
              </svg>
              Fächer
            </h2>
            <div className="ab-ordner-grid">
              {faecher.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={"ab-ordner" + (f.id === fachId ? " aktiv" : "")}
                  onClick={() => {
                    setFachId(f.id);
                    setChip("alle");
                  }}
                  aria-pressed={f.id === fachId}
                >
                  <FolderIcon
                    color={kbFarbe[f.fach] || f.farbe || "#868e96"}
                    offen={f.id === fachId}
                  />
                  <span className="ab-ordner-name">{f.fach}</span>
                </button>
              ))}
            </div>
          </section>

          {ansicht === "netz" && (
          <section className="ab-card ab-kompetenzen">
            <h2 className="ab-card-titel">Kompetenzen</h2>
            {!fach ? (
              <p className="ab-kompetenzen-leer">Wähle ein Fach.</p>
            ) : struktur ? (
              <div className="ab-komp">
                {struktur.kategorien.map((kat) => {
                  const wege = fach.themen.filter((t) => t.kategorie === kat);
                  if (!wege.length) return null;
                  const offen = katOffen.has(kat);
                  return (
                    <div className="ab-komp-kat" key={kat}>
                      <button
                        type="button"
                        className="ab-komp-kopf"
                        onClick={() => toggleKat(kat)}
                        aria-expanded={offen}
                      >
                        <span className="ab-komp-pfeil" aria-hidden="true">
                          {offen ? "▾" : "▸"}
                        </span>
                        <span className="ab-komp-name">{kat}</span>
                        <span className="ab-komp-zahl">{wege.length}</span>
                      </button>
                      {offen && (
                        <ul className="ab-komp-wege">
                          {wege.map((t) => (
                            <li key={t.id}>
                              <button
                                type="button"
                                className="ab-komp-weg"
                                onClick={() =>
                                  setOffenerLernweg({
                                    id: t.kbId,
                                    label: t.label,
                                  })
                                }
                              >
                                {t.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <ul className="ab-komp-wege ab-komp-flach">
                {fach.themen.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="ab-komp-weg"
                      onClick={() =>
                        setOffenerLernweg({ id: t.kbId, label: t.label })
                      }
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          )}
          <RasterGriff
            {...griff("ab", (s) => setAbGrenze(Math.max(2, Math.min(10, s))))}
          />
        </div>

        {/* Rechte Spalte: Materialien */}
        <section className="ab-card ab-materialien">
          <div className="ab-mat-kopf">
            <div>
              <h2 className="ab-card-titel">
                <svg className="ab-card-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5.5" y="3.5" width="13" height="17" rx="2" />
                  <path d="M9.5 3.5v17M12.5 8.5h4M12.5 12h4" />
                </svg>
                Materialien
              </h2>
              <p className="ab-mat-fach">{fach ? `${fach.fach} Gesamt` : ""}</p>
            </div>
            {struktur && (
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
            )}
          </div>

          {ansicht === "netz" && struktur ? (
            <div className="ab-netz">
              <Netz
                fach={fach}
                struktur={struktur}
                erledigt={erledigt}
                onSelect={(themaId) => {
                  const t = fach.themen.find((x) => x.id === themaId);
                  if (t) setOffenerLernweg({ id: t.kbId, label: t.label });
                }}
              />
            </div>
          ) : (
            <>
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
            <div className="ab-suche ab-suche-klein">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
                placeholder="Suche"
                aria-label="Materialien durchsuchen"
              />
            </div>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
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
