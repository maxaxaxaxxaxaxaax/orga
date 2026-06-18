import { useEffect, useState } from "react";
import { faecher } from "../data/wissen";
import { koennensbeweise, kbFarbe } from "../data/koennensbeweise";
import { lade, ERLEDIGT_KEY } from "./planung";
import { ladeSchritte } from "./lernschritte";
import { ART_LABEL } from "./material";
import { ladeEigene, speichereEigenes } from "./eigeneMaterialien";
import KbInhalt from "./KbInhalt";
import MaterialUpload from "./MaterialUpload";
import MaterialChat from "./MaterialChat";
import MaterialAnsicht from "./MaterialAnsicht";
import { istOeffenbar, aktivitaetLabel, TYP_LABEL } from "./interaktiv";
import Begriff from "./Begriff";
import { pruefeKi, pruefeVision } from "./kiClient";
import { FACH_STRUKTUR } from "../data/fachStruktur";
import Netz from "./Netz";
import "./Ablage.css";

// Merkt sich, wie der Schüler die Ablage zuletzt sortiert/gruppiert hat, damit
// die Ansicht beim nächsten Mal vertraut bleibt (kleine, unsichtbare Usability).
const GRUPPE_KEY = "neu.ablage.gruppe";
const SORT_KEY = "neu.ablage.sort";
const KAT_KEY = "neu.ablage.mathe.kategorien";
const SUB_KEY = "neu.ablage.mathe.subkategorien"; // eingeklappte Subkategorien

function ladeText(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
function speichereText(key, wert) {
  try {
    localStorage.setItem(key, wert);
  } catch {
    /* localStorage nicht verfügbar: still ignorieren */
  }
}

// Ablage: zwei Schritte gegen Überladung. Erst ein Fach wählen (ruhige
// Übersicht), dann das Master-Detail dieses Fachs: links die Lernwege, rechts
// alles zum gewählten Lernweg (Materialien, Schritte, Übung). Die Suche oben
// findet quer über alle Fächer und springt direkt in den Treffer.

function datumText(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function passt(text, q) {
  return (text || "").toLowerCase().includes(q);
}

// Schritt-Fortschritt eines Lernwegs: schon erledigte Schritte / gesamt. Zeigt
// in der Lernweg-Liste, was angefangen wurde (dünne Leiste, Skill-Überblick).
function schrittFortschritt(thema) {
  const schritte = thema?.schritte || [];
  if (!schritte.length) return null;
  const stand = ladeSchritte(thema.kbId);
  const fertig = schritte.filter((st, i) =>
    stand[i] != null ? stand[i] : !!st.fertig
  ).length;
  return { fertig, gesamt: schritte.length };
}

// Unterregister der "Alle Materialien"-Ansicht: nach Art, Lernweg oder Bereich
// (Unterricht/Selbstlernen, nutzt das vorhandene bereich-Feld). Innerhalb jeder
// Gruppe wird nach Datum oder Titel sortiert.
const ART_ORDER = [
  "arbeitsblatt",
  "zusammenfassung",
  "lernzettel",
  "notiz",
  "tafelnotiz",
  "pdf",
  "bild",
];
const BEREICH_LABEL = {
  unterricht: "Aus dem Unterricht",
  selbstlernen: "Selbst gelernt",
};

function sortierer(sort) {
  return sort === "az"
    ? (a, b) => (a.titel || "").localeCompare(b.titel || "", "de")
    : (a, b) => (b.datum || "").localeCompare(a.datum || "");
}

// Reihenfolge der Aufgabentyp-Register: erst die Übungsformen, dann Lesestoff.
const TYP_ORDER = [...Object.values(TYP_LABEL), "Lesen", "Sonstiges"];

function gruppiere(materialien, modus, sort, themenReihenfolge) {
  const items = [...materialien].sort(sortierer(sort));
  const map = new Map();
  const schluessel = (m) =>
    modus === "lernweg"
      ? m.thema || "Ohne Lernweg"
      : modus === "bereich"
        ? m.bereich || "selbstlernen"
        : modus === "typ"
          ? aktivitaetLabel(m) || "Sonstiges"
          : m.art;
  for (const m of items) {
    const k = schluessel(m);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(m);
  }
  // Gruppen-Reihenfolge je nach Modus festlegen.
  let order;
  if (modus === "lernweg") order = [...themenReihenfolge, "Ohne Lernweg"];
  else if (modus === "bereich") order = ["unterricht", "selbstlernen"];
  else if (modus === "typ") order = TYP_ORDER;
  else order = ART_ORDER;
  const beschriftung = (k) =>
    modus === "lernweg"
      ? k
      : modus === "bereich"
        ? BEREICH_LABEL[k] || k
        : modus === "typ"
          ? k
          : ART_LABEL[k] || k;
  const gruppen = [];
  for (const k of order) {
    if (map.has(k)) {
      gruppen.push({ label: beschriftung(k), items: map.get(k) });
      map.delete(k);
    }
  }
  // alles, was die feste Reihenfolge nicht kannte, hinten anhängen.
  for (const [k, its] of map) gruppen.push({ label: beschriftung(k), items: its });
  return gruppen;
}

export default function Ablage() {
  const [fachId, setFachId] = useState(null); // null = noch kein Fach gewählt
  const [gewaehltId, setGewaehltId] = useState(null); // gewählter Lernweg
  const [ansicht, setAnsicht] = useState("liste"); // liste | netz
  const [suche, setSuche] = useState("");
  const [uploadOffen, setUploadOffen] = useState(false);
  const [eigene, setEigene] = useState(ladeEigene);
  const [kiModell, setKiModell] = useState(null); // Text-Modell oder null = Demo
  const [visionModell, setVisionModell] = useState(null); // Vision-Modell oder null
  const [offenesMaterial, setOffenesMaterial] = useState(null); // Lese-Ansicht
  const [materialGruppe, setMaterialGruppe] = useState(() =>
    ladeText(GRUPPE_KEY, "art")
  ); // Unterregister: art | lernweg | bereich | typ
  const [materialSort, setMaterialSort] = useState(() =>
    ladeText(SORT_KEY, "neu")
  ); // neu | az
  const [katOffen, setKatOffen] = useState(() => {
    // Standard: alle Kategorien eingeklappt (ruhiger Einstieg). Der zuletzt
    // aufgeklappte Stand wird weiter gemerkt.
    try {
      const r = localStorage.getItem(KAT_KEY);
      return new Set(r ? JSON.parse(r) : []);
    } catch {
      return new Set();
    }
  });
  function toggleKat(name) {
    setKatOffen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      try {
        localStorage.setItem(KAT_KEY, JSON.stringify([...next]));
      } catch {
        /* localStorage nicht verfuegbar */
      }
      return next;
    });
  }
  // Subkategorien sind standardmäßig offen; hier merken wir die EINGEKLAPPTen
  // (Schlüssel "Kategorie||Subkategorie"), damit der Default ohne Eintrag offen ist.
  const [subZu, setSubZu] = useState(() => {
    try {
      const r = localStorage.getItem(SUB_KEY);
      return new Set(r ? JSON.parse(r) : []);
    } catch {
      return new Set();
    }
  });
  function toggleSub(schluessel) {
    setSubZu((prev) => {
      const next = new Set(prev);
      if (next.has(schluessel)) next.delete(schluessel);
      else next.add(schluessel);
      try {
        localStorage.setItem(SUB_KEY, JSON.stringify([...next]));
      } catch {
        /* localStorage nicht verfuegbar */
      }
      return next;
    });
  }
  const erledigt = lade(ERLEDIGT_KEY);

  // Gruppieren/Sortieren über Sitzungen hinweg merken.
  useEffect(() => {
    speichereText(GRUPPE_KEY, materialGruppe);
  }, [materialGruppe]);
  useEffect(() => {
    speichereText(SORT_KEY, materialSort);
  }, [materialSort]);

  // Einmal prüfen, welche lokalen Modelle (Ollama) laufen.
  useEffect(() => {
    let aktiv = true;
    pruefeKi().then((modell) => {
      if (aktiv) setKiModell(modell);
    });
    pruefeVision().then((modell) => {
      if (aktiv) setVisionModell(modell);
    });
    return () => {
      aktiv = false;
    };
  }, []);

  const fach = fachId ? faecher.find((f) => f.id === fachId) : null;
  const farbe = fach ? kbFarbe[fach.fach] || fach.farbe || "#868e96" : null;
  const q = suche.trim().toLowerCase();

  const gewaehlt = fach
    ? fach.themen.find((t) => t.id === gewaehltId) || null
    : null;
  const gewaehltKb = gewaehlt
    ? koennensbeweise.find((k) => k.id === gewaehlt.kbId)
    : null;
  // Landkarten-Lernwege haben keinen echten KB. Ersatz-Objekt nur mit id/label,
  // damit KbInhalt (das ueber kb.id den Lernweg findet) funktioniert.
  const detailKb = gewaehltKb || (gewaehlt ? { id: gewaehlt.kbId, label: gewaehlt.label } : null);
  const alleMaterialien = fach
    ? [
        ...(fach.materialien || []),
        ...eigene.filter((m) => m.fachId === fach.id),
      ].sort((a, b) => (b.datum || "").localeCompare(a.datum || ""))
    : [];

  // Kontext für den Material-Chat: gewählter Lernweg > Fach > ganze Ablage.
  const gewaehltMaterialien = gewaehlt
    ? [
        ...(fach.materialien || []).filter((m) => m.thema === gewaehlt.label),
        ...eigene.filter(
          (m) => m.fachId === fach.id && m.thema === gewaehlt.label
        ),
      ]
    : [];
  const alleGesamt = faecher.flatMap((f) => [
    ...(f.materialien || []),
    ...eigene.filter((m) => m.fachId === f.id),
  ]);
  const chatMaterialien = gewaehlt
    ? gewaehltMaterialien
    : fach
    ? alleMaterialien
    : alleGesamt;
  const chatKontext = gewaehlt
    ? `„${gewaehlt.label}"`
    : fach
    ? fach.fach
    : "deiner Ablage";

  // Treffer über ALLE Fächer: Lernwege und Materialien getrennt.
  let treffer = null;
  if (q) {
    const wege = [];
    const materialien = [];
    for (const f of faecher) {
      for (const t of f.themen) {
        const kb = koennensbeweise.find((k) => k.id === t.kbId);
        if (passt(t.label, q) || passt(kb?.titel, q) || passt(kb?.code, q)) {
          wege.push({ fach: f, thema: t, kb });
        }
      }
      const fachMaterialien = [
        ...(f.materialien || []),
        ...eigene.filter((m) => m.fachId === f.id),
      ];
      for (const m of fachMaterialien) {
        if (
          passt(m.titel, q) ||
          passt(m.thema, q) ||
          passt(ART_LABEL[m.art] || m.art, q) ||
          passt(aktivitaetLabel(m), q)
        ) {
          materialien.push({ fach: f, material: m });
        }
      }
    }
    treffer = { wege, materialien };
  }

  function oeffneLernweg(f, thema) {
    setFachId(f.id);
    setGewaehltId(thema?.id || null);
    setSuche("");
  }
  function oeffneMaterial(f, material) {
    const thema = f.themen.find((t) => t.label === material.thema);
    oeffneLernweg(f, thema);
    // Direkt ins Material springen (Übung/Lesen), der Lernweg liegt dahinter.
    if (istOeffenbar(material)) setOffenesMaterial(material);
  }
  function zuFaechern() {
    setFachId(null);
    setGewaehltId(null);
  }

  function uploadSpeichern(m) {
    speichereEigenes(m);
    setEigene(ladeEigene());
    setUploadOffen(false);
    setSuche("");
    setFachId(m.fachId);
    const ziel = faecher
      .find((f) => f.id === m.fachId)
      ?.themen.find((t) => t.label === m.thema);
    setGewaehltId(ziel ? ziel.id : null);
  }

  // Lernzettel aus dem Chat ans aktuelle Fach/Lernweg heften.
  function lernzettelHeften({ titel, inhalt }) {
    if (!fach) return;
    speichereEigenes({
      titel,
      fachId: fach.id,
      thema: gewaehlt?.label || null,
      art: "lernzettel",
      inhalt,
    });
    setEigene(ladeEigene());
  }

  // Ein Material-Eintrag in der Liste. `modus` blendet die Dimension aus, nach
  // der gerade gruppiert wird (sonst Dopplung mit der Register-Überschrift).
  function materialEintrag(m, modus) {
    const aktivitaet = aktivitaetLabel(m);
    // Die Markierung, nach der gerade gruppiert wird, steht schon in der
    // Register-Überschrift: am Eintrag weglassen, damit nichts doppelt wirkt.
    const zeigeArt = modus !== "art";
    const zeigeAktiv = aktivitaet && modus !== "typ";
    const inner = (
      <>
        {zeigeArt && (
          <span className="ab-mat-art">{ART_LABEL[m.art] || m.art}</span>
        )}
        <span className="ab-mat-text">
          <span className="ab-mat-titel">{m.titel}</span>
          <span className="ab-mat-sub">
            {[
              m.eigen ? "von dir" : null,
              modus === "lernweg" ? null : m.thema,
              m.datum ? datumText(m.datum) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        {zeigeAktiv && (
          <span
            className={
              "ab-mat-aktiv" + (aktivitaet === "Lesen" ? " lesen" : "")
            }
          >
            {aktivitaet}
          </span>
        )}
      </>
    );
    return (
      <li key={m.id}>
        {istOeffenbar(m) ? (
          <button
            type="button"
            className="ab-mat ab-mat-klick"
            onClick={() => setOffenesMaterial(m)}
            title="Material öffnen"
          >
            {inner}
          </button>
        ) : (
          <div className="ab-mat">{inner}</div>
        )}
      </li>
    );
  }

  return (
    <div className="ab-screen">
      <header className="ab-kopf">
        <div className="ab-kopf-text">
          {fach && !q && (
            <button type="button" className="ab-zurueck" onClick={zuFaechern}>
              ← Alle Fächer
            </button>
          )}
          <p className="ab-eyebrow">Ablage</p>
          <h1 className="ab-titel">
            {q ? "Suche" : fach ? fach.fach : "Wähle ein Fach"}
          </h1>
        </div>
      </header>

      <div className="ab-werkzeuge">
        <div className="ab-suche">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Material oder Lernweg suchen"
            aria-label="Ablage durchsuchen"
          />
          {suche && (
            <button
              type="button"
              className="ab-suche-leeren"
              onClick={() => setSuche("")}
              aria-label="Suche löschen"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          className="ab-hochladen"
          onClick={() => setUploadOffen(true)}
        >
          + Material
        </button>
      </div>

      {q ? (
        <div className="ab-treffer">
          {treffer.wege.length === 0 && treffer.materialien.length === 0 ? (
            <p className="ab-treffer-leer">
              Nichts gefunden zu „{suche.trim()}".
            </p>
          ) : (
            <>
              {treffer.wege.length > 0 && (
                <section className="ab-treffer-gruppe">
                  <h2 className="ab-treffer-label">Lernwege</h2>
                  <ul className="ab-treffer-liste">
                    {treffer.wege.map(({ fach: f, thema, kb }) => (
                      <li key={f.id + thema.id}>
                        <button
                          type="button"
                          className="ab-treffer-zeile"
                          onClick={() => oeffneLernweg(f, thema)}
                        >
                          <span
                            className="ab-treffer-punkt"
                            style={{ background: kbFarbe[f.fach] || f.farbe }}
                            aria-hidden="true"
                          />
                          <span className="ab-treffer-titel">{thema.label}</span>
                          <span className="ab-treffer-info">
                            {f.fach}
                            {kb ? ` · ${kb.code}` : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {treffer.materialien.length > 0 && (
                <section className="ab-treffer-gruppe">
                  <h2 className="ab-treffer-label">Materialien</h2>
                  <ul className="ab-treffer-liste">
                    {treffer.materialien.map(({ fach: f, material: m }) => (
                      <li key={f.id + m.id}>
                        <button
                          type="button"
                          className="ab-treffer-zeile"
                          onClick={() => oeffneMaterial(f, m)}
                          title="Im Lernweg öffnen"
                        >
                          <span className="ab-treffer-art">
                            {ART_LABEL[m.art] || m.art}
                          </span>
                          <span className="ab-treffer-titel">{m.titel}</span>
                          <span className="ab-treffer-info">
                            {f.fach} · {m.thema}
                          </span>
                          <span className="ab-treffer-datum">
                            {m.datum ? datumText(m.datum) : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      ) : !fach ? (
        // Schritt 1: Fach auswählen.
        <div className="ab-faecher-grid">
          {faecher.map((f) => {
            const c = kbFarbe[f.fach] || f.farbe || "#868e96";
            const wege = f.themen.length;
            const mats =
              (f.materialien?.length || 0) +
              eigene.filter((m) => m.fachId === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                className="ab-fachkarte"
                style={{ "--c": c }}
                onClick={() => setFachId(f.id)}
              >
                <span className="ab-fachkarte-name">{f.fach}</span>
                <span className="ab-fachkarte-meta">
                  {wege}{" "}
                  <Begriff name="lernweg">
                    {wege === 1 ? "Lernweg" : "Lernwege"}
                  </Begriff>{" "}
                  · {mats} {mats === 1 ? "Material" : "Materialien"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        // Schritt 2: Master-Detail des gewählten Fachs.
        <div className="ab-bereich" style={{ "--c": farbe }}>
          {FACH_STRUKTUR[fach.id] && (
            <div className="ab-ansicht-schalter" role="tablist" aria-label="Ansicht">
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
          <div
            className={
              "ab-spalten" +
              (ansicht === "netz" && FACH_STRUKTUR[fach.id] ? " ab-spalten-netz" : "")
            }
          >
          {ansicht === "netz" && FACH_STRUKTUR[fach.id] ? (
            <div className="ab-liste ab-netz-spalte">
              <Netz
                fach={fach}
                struktur={FACH_STRUKTUR[fach.id]}
                erledigt={erledigt}
                onSelect={(themaId) => setGewaehltId(themaId)}
              />
            </div>
          ) : (
            <nav className="ab-liste" aria-label="Lernwege">
            <button
              type="button"
              className={
                "ab-zeile ab-zeile-alle" + (gewaehltId === null ? " aktiv" : "")
              }
              onClick={() => setGewaehltId(null)}
              aria-pressed={gewaehltId === null}
            >
              <span className="ab-zeile-status" aria-hidden="true" />
              <span className="ab-zeile-titel">Alle Materialien</span>
              <span className="ab-zeile-zahl">{alleMaterialien.length}</span>
            </button>
            {(() => {
              function lernwegButton(t) {
                const kb = koennensbeweise.find((k) => k.id === t.kbId);
                const aktiv = gewaehltId === t.id;
                const fertig = kb ? !!erledigt[kb.id] : false;
                const matAnzahl = alleMaterialien.filter(
                  (m) => m.thema === t.label
                ).length;
                const fort = schrittFortschritt(t);
                // Dünne Leiste nur, wenn angefangen aber noch nicht durch.
                const zeigeBalken =
                  !fertig && fort && fort.fertig > 0 && fort.fertig < fort.gesamt;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={"ab-zeile" + (aktiv ? " aktiv" : "")}
                    onClick={() => setGewaehltId(aktiv ? null : t.id)}
                    aria-pressed={aktiv}
                  >
                    <span
                      className={"ab-zeile-status" + (fertig ? " fertig" : "")}
                      aria-hidden="true"
                    >
                      {fertig ? "✓" : ""}
                    </span>
                    <span className="ab-zeile-titel">{t.label}</span>
                    {!t.landkarte && koennensbeweise.some((k) => k.id === t.kbId) && (
                      <span className="ab-zeile-aktiv" title="In dieser Etappe aktiv">aktiv</span>
                    )}
                    {matAnzahl > 0 && (
                      <span className="ab-zeile-zahl">{matAnzahl}</span>
                    )}
                    {zeigeBalken && (
                      <span
                        className="ab-zeile-balken"
                        aria-hidden="true"
                        title={`${fort.fertig} von ${fort.gesamt} Schritten`}
                      >
                        <span
                          className="ab-zeile-balken-fuell"
                          style={{
                            width: (fort.fertig / fort.gesamt) * 100 + "%",
                          }}
                        />
                      </span>
                    )}
                  </button>
                );
              }
              const struktur = FACH_STRUKTUR[fach.id];
              return struktur ? (
                struktur.kategorien.map((kat) => {
                  const wege = fach.themen.filter((t) => t.kategorie === kat);
                  if (!wege.length) return null;
                  const offen = katOffen.has(kat);
                  const subListe = struktur.subkategorien[kat] || [];
                  return (
                    <div className="ab-kat" key={kat}>
                      <button
                        type="button"
                        className="ab-kat-kopf"
                        onClick={() => toggleKat(kat)}
                        aria-expanded={offen}
                      >
                        <span className="ab-kat-pfeil" aria-hidden="true">
                          {offen ? "▾" : "▸"}
                        </span>
                        <span className="ab-kat-name">{kat}</span>
                        <span className="ab-kat-stand">{wege.length}</span>
                      </button>
                      {offen &&
                        subListe.map((sub) => {
                          const subWege = wege.filter(
                            (t) => t.subkategorie === sub
                          );
                          if (!subWege.length) return null;
                          const schluessel = kat + "||" + sub;
                          const subOffen = !subZu.has(schluessel);
                          return (
                            <div className="ab-sub" key={sub}>
                              <button
                                type="button"
                                className="ab-sub-kopf"
                                onClick={() => toggleSub(schluessel)}
                                aria-expanded={subOffen}
                              >
                                <span className="ab-sub-pfeil" aria-hidden="true">
                                  {subOffen ? "▾" : "▸"}
                                </span>
                                <span className="ab-sub-name">{sub}</span>
                                <span className="ab-sub-zahl">
                                  {subWege.length}
                                </span>
                              </button>
                              {subOffen &&
                                subWege.map((t) => lernwegButton(t))}
                            </div>
                          );
                        })}
                    </div>
                  );
                })
              ) : (
                fach.themen.map((t) => lernwegButton(t))
              );
            })()}
            </nav>
          )}

          <section className="ab-detail">
            {gewaehlt ? (
              <>
                <header className="ab-detail-kopf">
                  <span className="ab-detail-fach">{fach.fach}</span>
                  <h2 className="ab-detail-titel">
                    {gewaehlt.label}
                    {detailKb && erledigt[detailKb.id] && (
                      <span className="ab-detail-fertig">✓ erledigt</span>
                    )}
                  </h2>
                  {gewaehltKb && (
                    <p className="ab-detail-meta">
                      {gewaehltKb.code} · {gewaehltKb.cluster}{" "}
                      <Begriff name="cluster">
                        {gewaehltKb.cluster === 1
                          ? "Clusterstunde"
                          : "Clusterstunden"}
                      </Begriff>
                    </p>
                  )}
                </header>
                <div className="ab-detail-inhalt">
                  <KbInhalt key={detailKb.id} kb={detailKb} kompakt />
                </div>
              </>
            ) : (
              <>
                <header className="ab-detail-kopf">
                  <span className="ab-detail-fach">{fach.fach}</span>
                  <h2 className="ab-detail-titel">Alle Materialien</h2>
                  <p className="ab-detail-meta">
                    {alleMaterialien.length}{" "}
                    {alleMaterialien.length === 1 ? "Material" : "Materialien"}
                  </p>
                </header>
                {alleMaterialien.length === 0 ? (
                  <p className="ab-detail-leer">
                    Noch keine Materialien in diesem Fach. Du findest sie auch
                    bei den Lernwegen links, oder lade über „+ Material" etwas
                    Neues hoch.
                  </p>
                ) : (
                  <>
                    <div className="ab-mat-werkzeuge">
                      <div className="ab-mat-steller">
                        <span className="ab-mat-steller-label">Gruppieren</span>
                        {[
                          ["art", "Art"],
                          ["typ", "Aufgabentyp"],
                          ["lernweg", "Lernweg"],
                          ["bereich", "Bereich"],
                        ].map(([k, l]) => (
                          <button
                            key={k}
                            type="button"
                            className={
                              "ab-mat-chip" + (materialGruppe === k ? " an" : "")
                            }
                            onClick={() => setMaterialGruppe(k)}
                            aria-pressed={materialGruppe === k}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <div className="ab-mat-steller">
                        <span className="ab-mat-steller-label">Sortieren</span>
                        {[
                          ["neu", "Neueste"],
                          ["az", "A–Z"],
                        ].map(([k, l]) => (
                          <button
                            key={k}
                            type="button"
                            className={
                              "ab-mat-chip" + (materialSort === k ? " an" : "")
                            }
                            onClick={() => setMaterialSort(k)}
                            aria-pressed={materialSort === k}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    {gruppiere(
                      alleMaterialien,
                      materialGruppe,
                      materialSort,
                      fach.themen.map((t) => t.label)
                    ).map((g) => (
                      <div className="ab-register" key={g.label}>
                        <h3 className="ab-register-titel">
                          {g.label}
                          <span className="ab-register-zahl">
                            {g.items.length}
                          </span>
                        </h3>
                        <ul className="ab-mats">
                          {g.items.map((m) => materialEintrag(m, materialGruppe))}
                        </ul>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </section>
          </div>
        </div>
      )}

      {!q && fach && (
        <MaterialChat
          key={fachId + ":" + (gewaehltId || "")}
          kontextName={chatKontext}
          materialien={chatMaterialien}
          kiModell={kiModell}
          visionModell={visionModell}
          onHeften={lernzettelHeften}
        />
      )}

      {uploadOffen && (
        <MaterialUpload
          startFachId={fach?.id}
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
    </div>
  );
}
