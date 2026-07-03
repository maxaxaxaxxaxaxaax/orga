import { useEffect, useRef, useState } from "react";
import { NEUTRAL_FARBE } from "./farbe";
import { createPortal } from "react-dom";
import { faecher } from "../data/wissen";
import { koennensbeweise, kbFarbe } from "../data/koennensbeweise";
import { FACH_STRUKTUR } from "../data/fachStruktur";
import { ladeEigene, speichereEigenes, EIGENE_EVENT } from "./eigeneMaterialien";
import {
  ladeFavoriten,
  toggleFavorit,
  ladeOrte,
  ortVon,
  verschiebeMaterial,
  META_EVENT,
} from "./materialMeta";
import { istOeffenbar } from "./interaktiv";
import { IcLernweg } from "./materialIcons";
import { CHIPS, chipFuerMaterial, iconFuerMaterial } from "./materialTypen";
import MaterialUpload from "./MaterialUpload";
import MaterialInhalt from "./MaterialInhalt";
import { plattformLabel, quelleLabel } from "./material";
import Icon from "./Icon";
import LeerZustand from "./LeerZustand";
import { useScrollFade } from "./useScrollFade";
import { useRasterZiehen } from "./rasterZiehen";
import { RasterGriff, RasterOverlay } from "./raster";
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

// Baut aus den (gefilterten) Zeilen eines Fachs den geordneten Baum
//   Kategorie > Subkategorie > Lernweg (Aufgabe/Koennensbeweis) > Materialien.
// Reihenfolge von Kategorie/Subkategorie aus FACH_STRUKTUR (lehrplan-treu), die
// Lernwege in Themen-Reihenfolge, die Materialien je Lernweg per sortFn. Zeilen ohne
// Gliederung (z. B. Franzoesisch) landen unter "Weiteres". Faecher ohne Struktur ->
// null (Aufrufer zeigt dann die flache Liste).
function baueFachBaum(rows, fach, sortFn) {
  const struktur = FACH_STRUKTUR[fach.id];
  if (!struktur) return null;
  const themaIndex = new Map((fach.themen || []).map((t, i) => [t.label, i]));
  const tree = new Map();
  const weiteres = [];
  for (const r of rows) {
    if (!r.kategorie || !r.subkategorie) {
      weiteres.push(r);
      continue;
    }
    if (!tree.has(r.kategorie)) tree.set(r.kategorie, new Map());
    const subMap = tree.get(r.kategorie);
    if (!subMap.has(r.subkategorie)) subMap.set(r.subkategorie, new Map());
    const lwMap = subMap.get(r.subkategorie);
    const key = r.lernweg || "—";
    if (!lwMap.has(key))
      lwMap.set(key, { label: r.lernweg || null, kopf: null, material: [] });
    const g = lwMap.get(key);
    if (r.istLernweg) g.kopf = r;
    else g.material.push(r);
  }
  const kategorien = [];
  for (const kat of struktur.kategorien) {
    const subMap = tree.get(kat);
    if (!subMap) continue;
    const subOrder = struktur.subkategorien[kat] || [];
    const subKeys = [
      ...subOrder.filter((s) => subMap.has(s)),
      ...[...subMap.keys()].filter((s) => !subOrder.includes(s)),
    ];
    const subs = subKeys.map((s) => {
      const gruppen = [...subMap.get(s).values()];
      gruppen.forEach((g) => g.material.sort(sortFn));
      gruppen.sort(
        (a, b) =>
          (themaIndex.get(a.label) ?? 999) - (themaIndex.get(b.label) ?? 999)
      );
      return { sub: s, gruppen };
    });
    kategorien.push({ kat, subs });
  }
  return { kategorien, weiteres: [...weiteres].sort(sortFn) };
}

export default function Ablage({
  untenSlot,
  vorn,
  oeffneMaterialId,
  onGeoeffnet,
} = {}) {
  // Deep-Link-Ziel (Klick auf eine Benachrichtigung) auflösen: erst unter den eigenen
  // Materialien (z. B. Discord-Import), sonst unter den Seed-Materialien eines Fachs.
  const zielMaterial = (id) => {
    if (!id) return null;
    const eig = ladeEigene().find((x) => x.id === id);
    if (eig) return eig;
    for (const f of faecher) {
      const s = (f.materialien || []).find((x) => x.id === id);
      if (s) return { ...s, fachId: f.id };
    }
    return null;
  };

  // Standard: kein Fach gewählt -> alle Fächer (global). Ein Ordner-Klick filtert,
  // nochmaliger Klick auf denselben Ordner schließt ihn wieder (zurück zu global).
  // Kommt der Screen per Deep-Link, ist direkt das Ziel-Fach/-Material offen.
  const [fachId, setFachId] = useState(
    () => zielMaterial(oeffneMaterialId)?.fachId || null
  );
  const [chip, setChip] = useState("alle");
  const [suche, setSuche] = useState("");
  const [sort, setSort] = useState("neu"); // neu | az
  const [sortOffen, setSortOffen] = useState(false);
  const [uploadOffen, setUploadOffen] = useState(false);
  const [eigene, setEigene] = useState(ladeEigene);
  const [offenesMaterial, setOffenesMaterial] = useState(() =>
    zielMaterial(oeffneMaterialId)
  );
  // Ein geöffneter Lernweg wird wie ein Ordner behandelt: die Liste zeigt dann
  // nur dessen Materialien (zum einzeln Anschauen), statt die ganze Lektion.
  const [offenerLwOrdner, setOffenerLwOrdner] = useState(null);
  // Ordner + Filter beim Runterscrollen einziehen, beim Hochscrollen wieder zeigen.
  const [eingezogen, setEingezogen] = useState(false);
  const letzterScroll = useRef(0);
  // Weiche Ränder für die scrollbare Materialliste (statt harter Kante).
  const matScrollRef = useScrollFade();

  // Scroll-Richtung der Material-Liste: runter (über kleiner Schwelle) zieht Kopf ein,
  // hoch zieht ihn wieder auf. Nahe am Anfang immer offen.
  function beiListenScroll(e) {
    const y = e.currentTarget.scrollTop;
    const vorher = letzterScroll.current;
    if (y <= 8) setEingezogen(false);
    else if (y > vorher + 4) setEingezogen(true);
    else if (y < vorher - 4) setEingezogen(false);
    letzterScroll.current = y;
    setSortOffen(false);
  }

  const fach = faecher.find((f) => f.id === fachId) || null;

  // Ein Material-Dokument ist rechts im Split geöffnet. Esc schließt es. (Ein
  // geöffneter Lernweg ist ein Ordner in der Liste, kein Split-Dokument.)
  const detailOffen = offenesMaterial;
  // Grenze Liste|Dokument per Griff ziehen (gleiches Raster-Rezept wie Übersicht
  // und Fokus, rastet auf die 12 Spalten ein). teil = Spalten der Liste.
  const [teil, setTeil] = useState(6);
  const {
    ref: rasterRef,
    zieht: rasterZieht,
    griff: rasterGriff,
  } = useRasterZiehen();
  // Tags im Detail wie in der Zeile: das Fach weglassen (steht schon im Ordner),
  // damit beide Ansichten dieselben, konkreten Schlagwörter zeigen.
  const detailFachLabel = offenesMaterial
    ? faecher.find((f) => f.id === offenesMaterial.fachId)?.fach
    : null;
  const detailTags = offenesMaterial
    ? (offenesMaterial.tags || []).filter((t) => t !== detailFachLabel)
    : [];
  // Herkunfts-Tag: über welchen verbundenen Dienst das Material kam (Moodle,
  // YouTube, ...). Der Weg des Materials in die App, eigene Uploads ohne.
  const detailPlattform = offenesMaterial
    ? plattformLabel(offenesMaterial)
    : null;
  // Art-Tag "was es ist" (Arbeitsblatt, Lernzettel, ...); entfällt, wenn er nur
  // die Plattform wiederholen würde (z. B. "YouTube-Video" neben "YouTube").
  const artTagFuer = (m) => {
    const art = quelleLabel(m);
    const pl = plattformLabel(m);
    if (!art) return null;
    if (pl && art.toLowerCase().includes(pl.toLowerCase())) return null;
    return art;
  };
  const detailArt = offenesMaterial ? artTagFuer(offenesMaterial) : null;
  function schliesseDetail() {
    setOffenesMaterial(null);
  }
  useEffect(() => {
    if (!detailOffen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOffenesMaterial(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailOffen]);

  // Neu gespeicherte Materialien live nachladen (z. B. Discord-Import im Hintergrund).
  useEffect(() => {
    const f = () => setEigene(ladeEigene());
    window.addEventListener(EIGENE_EVENT, f);
    return () => window.removeEventListener(EIGENE_EVENT, f);
  }, []);

  // Favoriten-Sterne und verschobene Ablageorte (siehe materialMeta.js).
  const [favoriten, setFavoriten] = useState(ladeFavoriten);
  const [orte, setOrte] = useState(ladeOrte);
  useEffect(() => {
    const f = () => {
      setFavoriten(ladeFavoriten());
      setOrte(ladeOrte());
    };
    window.addEventListener(META_EVENT, f);
    return () => window.removeEventListener(META_EVENT, f);
  }, []);
  // Heimat-Fach eines Materials: eigene tragen fachId, Seeds stehen in ihrem Fach.
  const heimatFachId = (m) =>
    m.fachId ||
    faecher.find((x) => (x.materialien || []).some((s) => s.id === m.id))?.id ||
    null;

  // Ablageort des offenen Dokuments (Kopfzeile "Fach / Thema", beides wählbar).
  // Effektiv gilt: Verschiebung > Heimat (Fach aus den Daten, Thema am Material).
  const detailHeimatFach = offenesMaterial
    ? heimatFachId(offenesMaterial)
    : null;
  const detailHeimatThema = offenesMaterial?.thema || null;
  const detailOrt = offenesMaterial ? ortVon(orte, offenesMaterial.id) : null;
  const detailOrtFach = detailOrt?.fachId || detailHeimatFach || "";
  const detailOrtThema = detailOrt
    ? detailOrt.thema || ""
    : detailHeimatThema || "";
  // Wählbare Themen = Lernwege des gerade gewählten Fachs (wie in der Liste).
  const detailOrtThemen = (
    faecher.find((f) => f.id === detailOrtFach)?.themen || []
  ).filter((t) => koennensbeweise.some((k) => k.id === t.kbId));

  // Deep-Link (Klick auf eine Link-/Material-Benachrichtigung): Das Ziel-Material ist
  // beim Mounten schon als offenes Detail gesetzt (useState-Initializer oben). Hier nur
  // das Ziel im Parent zurücksetzen, damit ein späterer Wechsel es nicht erneut öffnet.
  useEffect(() => {
    if (oeffneMaterialId) onGeoeffnet?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oeffneMaterialId]);

  // Lernwege + Materialien eines Fachs als Listenzeilen (Typ-Chip, Icon, Fach).
  const zeilenFuerFach = (f) => {
    if (!f) return [];
    const lernwege = f.themen.filter((t) =>
      koennensbeweise.some((k) => k.id === t.kbId)
    );
    // Effektiver Ablageort: verschobene Materialien wandern in ihr Ziel-Fach
    // (raus aus dem Heimat-Fach, rein bei den Verschobenen anderer Fächer).
    const ortFach = (m) => ortVon(orte, m.id)?.fachId || null;
    const materialien = [
      ...(f.materialien || []).filter(
        (m) => !ortFach(m) || ortFach(m) === f.id
      ),
      ...faecher
        .filter((a) => a.id !== f.id)
        .flatMap((a) =>
          (a.materialien || []).filter((m) => ortFach(m) === f.id)
        ),
      ...eigene.filter((m) => (ortFach(m) || m.fachId) === f.id),
    ];
    const lwRows = lernwege.map((t) => ({
      key: f.id + "-lw-" + t.id,
      kbId: t.kbId,
      chip: "lernwege",
      titel: t.label,
      fach: f.fach,
      datum: null,
      Icon: IcLernweg,
      kategorie: t.kategorie || null,
      subkategorie: t.subkategorie || null,
      lernweg: t.label,
      istLernweg: true,
      onOpen: () => {
        // Wie einen Ordner öffnen: Liste zeigt danach nur die Materialien
        // dieses Lernwegs. Ein evtl. offenes Material schließt mit.
        setOffenesMaterial(null);
        setFachId(f.id);
        setOffenerLwOrdner({ fachId: f.id, label: t.label });
      },
    }));
    const mRows = materialien.map((m) => {
      // Material gehoert ueber thema === Lernweg-Label zu einem Lernweg; dessen
      // Kategorie/Subkategorie erbt es fuer die Gruppierung. Ein verschobener
      // Ort bringt sein eigenes Thema mit (auch keins).
      const o = ortVon(orte, m.id);
      const themaEff = o ? o.thema : m.thema;
      const eltern = f.themen.find((t) => t.label === themaEff) || null;
      return {
        key: f.id + "-m-" + m.id,
        id: m.id,
        favorit: !!favoriten[m.id],
        chip: chipFuerMaterial(m),
        titel: m.titel,
        fach: f.fach,
        datum: m.datum || null,
        Icon: iconFuerMaterial(m),
        quelle: m.quelle || null,
        plattform: plattformLabel(m),
        art: artTagFuer(m),
        tags: m.tags || [],
        kategorie: eltern?.kategorie || null,
        subkategorie: eltern?.subkategorie || null,
        lernweg: eltern?.label || m.thema || null,
        istLernweg: false,
        onOpen: istOeffenbar(m) ? () => setOffenesMaterial(m) : null,
      };
    });
    return [...lwRows, ...mRows];
  };

  const q = suche.trim().toLowerCase();
  // Ein Fach gewählt -> nur dieses; sonst alle Fächer (global). Die Suche filtert
  // jeweils innerhalb dieses Bereichs.
  const quellFaecher = fach ? [fach] : faecher;
  let rows = quellFaecher.flatMap(zeilenFuerFach);
  if (chip !== "alle") rows = rows.filter((r) => r.chip === chip);
  if (q) rows = rows.filter((r) => r.titel.toLowerCase().includes(q));
  const sortFn = (a, b) => {
    if (sort === "az") return a.titel.localeCompare(b.titel, "de");
    // Neueste: Lernwege oben (kein Datum), dann Materialien nach Datum absteigend.
    const al = a.chip === "lernwege",
      bl = b.chip === "lernwege";
    if (al !== bl) return al ? -1 : 1;
    return (b.datum || "").localeCompare(a.datum || "");
  };
  // In einem offenen Lernweg-Ordner: nur dessen Materialien als flache Liste.
  const imLwOrdner = !!offenerLwOrdner;
  const ordnerRows = imLwOrdner
    ? rows.filter((r) => !r.istLernweg && r.lernweg === offenerLwOrdner.label)
    : rows;
  // In einem offenen Fach-Ordner (ohne Lernweg-Ordner): nach Kategorie >
  // Subkategorie > Lernweg gruppieren. Global oder Lernweg-Ordner: flache Liste.
  const baum = fach && !imLwOrdner ? baueFachBaum(rows, fach, sortFn) : null;
  const flachSortiert = baum ? null : [...ordnerRows].sort(sortFn);

  function uploadSpeichern(m) {
    speichereEigenes(m);
    setEigene(ladeEigene());
    setUploadOffen(false);
    if (m.fachId) setFachId(m.fachId);
  }

  // Fächer-Ordner (Buttons) über der Liste. Toggle: dasselbe Fach erneut -> zu
  // (zurück zu global, alle Fächer).
  const ordnerButtons = faecher.map((f) => (
    <button
      key={f.id}
      type="button"
      className={"ab-ordner" + (f.id === fachId ? " aktiv" : "")}
      onClick={() => {
        setFachId((cur) => (cur === f.id ? null : f.id));
        setChip("alle");
        setOffenerLwOrdner(null);
      }}
      aria-pressed={f.id === fachId}
    >
      <FolderIcon
        fach={f.fach}
        color={kbFarbe[f.fach] || f.farbe || NEUTRAL_FARBE}
        offen={f.id === fachId}
      />
      <span className="ab-ordner-name">{f.fach}</span>
    </button>
  ));

  // Eine Listenzeile (Lernweg oder Material). extra setzt z. B. die Einrückung der
  // Materialien (ab-unter) oder die Kopf-Betonung des Lernwegs (ab-lw-kopf).
  const zeileInhalt = (r) => (
    <>
      <span className="ab-zeile-icon" aria-hidden="true">
        <r.Icon />
      </span>
      <span className="ab-zeile-titel">{r.titel}</span>
      {/* Favoriten-Marker (nur Anzeige; markieren geht im geöffneten Dokument). */}
      {r.favorit && (
        <Icon name="stern" className="ab-zeile-stern" title="Favorit" />
      )}
      {!fach && r.fach && <span className="ab-zeile-fach">{r.fach}</span>}
      {/* Tags wie im geöffneten Dokument: Herkunft (Moodle, YouTube, ...), dann
         die Art "was es ist" (Arbeitsblatt, Lernzettel, ...), dann das Thema
         (der Lernweg) und Schlagwörter. Das Fach lassen wir weg (steht schon
         im Ordner), ein Thema, das schon als Schlagwort da ist, auch. */}
      {!r.istLernweg &&
        (r.plattform ||
          r.art ||
          r.lernweg ||
          (r.tags && r.tags.filter((t) => t !== r.fach).length > 0)) && (
        <span className="ab-zeile-tags">
          {r.plattform && (
            <span className="ab-tag ab-tag-plattform">{r.plattform}</span>
          )}
          {r.art && <span className="ab-tag">{r.art}</span>}
          {r.lernweg && !(r.tags || []).includes(r.lernweg) && (
            <span className="ab-tag">{r.lernweg}</span>
          )}
          {(r.tags || [])
            .filter((t) => t !== r.fach)
            .slice(0, 2)
            .map((t) => (
              <span className="ab-tag" key={t}>
                {t}
              </span>
            ))}
        </span>
      )}
      <span className="ab-zeile-datum">{r.datum ? datumLang(r.datum) : ""}</span>
    </>
  );
  const zeileLi = (r, extra) => {
    // Aktiv: das geöffnete Material bzw. der als Ordner geöffnete Lernweg.
    const an = r.istLernweg
      ? offenerLwOrdner?.label === r.lernweg
      : !!r.id && offenesMaterial?.id === r.id;
    return (
      <li key={r.key} className={extra || undefined}>
        {r.onOpen ? (
          <button
            type="button"
            className={"ab-zeile ab-zeile-klick" + (an ? " an" : "")}
            onClick={r.onOpen}
            aria-current={an || undefined}
          >
            {zeileInhalt(r)}
          </button>
        ) : (
          <div className="ab-zeile">{zeileInhalt(r)}</div>
        )}
      </li>
    );
  };

  // Untere Leiste (Suche + Hinzufügen). Wird in den festen Anker (untenSlot)
  // portaliert, damit sie beim Screen-Wechsel NICHT mit der wischenden Schiene
  // mitrutscht, sondern wie die anderen Leisten stehen bleibt.
  const untenLeiste = (
    <div className="ab-top">
      <div className="ab-suche">
        <Icon name="search" />
        <input
          type="text"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          onFocus={() => {
            setFachId(null);
            setOffenerLwOrdner(null);
          }}
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
  );

  return (
    <>
      <div className="ab-screen">
        <div
          className={
            "ab-grid" +
            (detailOffen ? " ab-split" : "") +
            (rasterZieht ? " raster-zieht" : "")
          }
          ref={rasterRef}
          style={detailOffen ? { "--ab-teil": teil + 1 } : undefined}
        >
          {detailOffen && <RasterOverlay />}
          {/* Eine Karte: Materialien, mit den Fächer-Ordnern oben drin. */}
          <section
            className={"ab-card ab-materialien" + (eingezogen ? " eingezogen" : "")}
          >
            {/* Grenze Liste|Dokument ziehen (nur im Split). */}
            {detailOffen && (
              <RasterGriff
                {...rasterGriff("liste", (s) =>
                  setTeil(Math.max(3, Math.min(9, s)))
                )}
              />
            )}
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
            </div>

            {/* Im Lernweg-Ordner: Brotkrumen zurück zum Fach. Sonst die Fächer
                als Ordner über der Liste (Auswahl filtert die Liste). */}
                {imLwOrdner ? (
                  <div className="ab-krumen" aria-label="Ordner-Pfad">
                    <button
                      type="button"
                      className="ab-krume"
                      onClick={() => setOffenerLwOrdner(null)}
                    >
                      <Icon name="chevron-left" size={16} />
                      {fach?.fach || "Alle Fächer"}
                    </button>
                    <span className="ab-krume-sep" aria-hidden="true">
                      /
                    </span>
                    <span className="ab-krume-aktuell">
                      {offenerLwOrdner.label}
                    </span>
                  </div>
                ) : (
                  <div
                    className="ab-faecher-leiste"
                    role="group"
                    aria-label="Fach-Filter"
                  >
                    {ordnerButtons}
                  </div>
                )}
                <div
                  className={"ab-filterzeile" + (sortOffen ? " sort-offen" : "")}
                >
                  {/* Filter, keine echten Tabs: group + aria-pressed (ein Muster
                     für alle Filter-Chip-Gruppen der App). */}
                  <div className="ab-chips" role="group" aria-label="Material-Typ">
                    {/* "Lernwege" und "KI" hier ausgeblendet: die Materialien bleiben
                       unter "Alle" sichtbar, nur die zwei Filter-Chips entfallen. */}
                    {CHIPS.filter(
                      (c) => c.key !== "lernwege" && c.key !== "ki"
                    ).map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        aria-pressed={chip === c.key}
                        className={"ab-chip" + (chip === c.key ? " an" : "")}
                        onClick={() =>
                          setChip((v) => (v === c.key ? "alle" : c.key))
                        }
                      >
                        {c.Icon && <c.Icon className="ab-chip-icon" />}
                        {c.label}
                      </button>
                    ))}
                  </div>
                  {/* Sortieren auf derselben Höhe wie die Filter (rechts in der Zeile). */}
                  <div className="ab-sort">
                    <button
                      type="button"
                      className="ab-sort-knopf"
                      onClick={() => setSortOffen((v) => !v)}
                      aria-haspopup="listbox"
                      aria-expanded={sortOffen}
                    >
                      Sortieren
                      <Icon name="chevron-down" className="ab-sort-chevron" size={14} />
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

                <div
                  className="ab-mat-scroll fade-scroll"
                  ref={matScrollRef}
                  onScroll={beiListenScroll}
                >
                {(baum ? rows.length === 0 : flachSortiert.length === 0) ? (
                  <LeerZustand
                    titel={suche ? "Nichts gefunden" : "Noch keine Materialien"}
                    text={
                      suche
                        ? "Für deine Suche gibt es hier nichts. Probier ein anderes Wort."
                        : imLwOrdner
                          ? "In diesem Lernweg liegt noch nichts."
                          : "Materialien, die du hinzufügst oder aus Discord schickst, landen hier."
                    }
                  />
                ) : baum ? (
                  <div className="ab-baum">
                    {baum.kategorien.map((k) => (
                      <section className="ab-kat" key={k.kat}>
                        <h3 className="ab-kat-titel">{k.kat}</h3>
                        {k.subs.map((su) => (
                          <div className="ab-sub" key={su.sub}>
                            <h4 className="ab-sub-titel">{su.sub}</h4>
                            {su.gruppen.map((g, gi) => (
                              <ul
                                className="ab-liste ab-lw-liste"
                                key={(g.label || "rest") + gi}
                              >
                                {g.kopf ? (
                                  zeileLi(g.kopf, "ab-lw-kopf")
                                ) : g.label ? (
                                  <li className="ab-lw-label">
                                    <span>{g.label}</span>
                                  </li>
                                ) : null}
                                {g.material.map((r) => zeileLi(r, "ab-unter"))}
                              </ul>
                            ))}
                          </div>
                        ))}
                      </section>
                    ))}
                    {baum.weiteres.length > 0 && (
                      <section className="ab-kat">
                        <h3 className="ab-kat-titel">Weiteres</h3>
                        <ul className="ab-liste">
                          {baum.weiteres.map((r) => zeileLi(r))}
                        </ul>
                      </section>
                    )}
                  </div>
                ) : (
                  <ul className="ab-liste">
                    {flachSortiert.map((r) => zeileLi(r))}
                  </ul>
                )}
                </div>
          </section>

          {detailOffen && (
            <aside
              key={"m" + offenesMaterial.id}
              className="ab-card ab-detail"
              aria-label="Dokument"
            >
              <div className="ab-detail-kopf">
                <div className="ab-detail-titel-wrap">
                  {/* Ablageort als Kopfzeile "Fach / Thema": beides direkt
                      antippbar, falsch Einsortiertes lässt sich hier umhängen
                      (siehe materialMeta.js). */}
                  {offenesMaterial && (
                    <div
                      className="ab-detail-ort"
                      role="group"
                      aria-label="Ablageort"
                    >
                      <span className="ab-detail-ort-feld">
                        <select
                          value={detailOrtFach}
                          aria-label="Ablageort: Fach"
                          onChange={(e) => {
                            const neu = e.target.value;
                            verschiebeMaterial(
                              offenesMaterial.id,
                              neu,
                              neu === detailHeimatFach
                                ? detailHeimatThema
                                : null,
                              detailHeimatFach,
                              detailHeimatThema
                            );
                          }}
                        >
                          {faecher.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.fach}
                            </option>
                          ))}
                        </select>
                        <Icon
                          name="chevron-down"
                          className="ab-detail-ort-chevron"
                          size={14}
                        />
                      </span>
                      <span className="ab-detail-ort-sep" aria-hidden="true">
                        /
                      </span>
                      <span className="ab-detail-ort-feld">
                        <select
                          value={detailOrtThema}
                          aria-label="Ablageort: Thema"
                          onChange={(e) =>
                            verschiebeMaterial(
                              offenesMaterial.id,
                              detailOrtFach,
                              e.target.value || null,
                              detailHeimatFach,
                              detailHeimatThema
                            )
                          }
                        >
                          <option value="">Ohne Thema</option>
                          {detailOrtThema &&
                            !detailOrtThemen.some(
                              (t) => t.label === detailOrtThema
                            ) && (
                              <option value={detailOrtThema}>
                                {detailOrtThema}
                              </option>
                            )}
                          {detailOrtThemen.map((t) => (
                            <option key={t.id} value={t.label}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <Icon
                          name="chevron-down"
                          className="ab-detail-ort-chevron"
                          size={14}
                        />
                      </span>
                    </div>
                  )}
                  <div className="ab-detail-titel-zeile">
                    <h2 className="ab-detail-titel">{offenesMaterial.titel}</h2>
                    {offenesMaterial && (
                      <button
                        type="button"
                        className={
                          "ab-detail-stern" +
                          (favoriten[offenesMaterial.id] ? " an" : "")
                        }
                        onClick={() => toggleFavorit(offenesMaterial.id)}
                        aria-pressed={!!favoriten[offenesMaterial.id]}
                        aria-label={
                          favoriten[offenesMaterial.id]
                            ? "Favorit entfernen"
                            : "Als Favorit markieren"
                        }
                        title="Favorit: steht im Fokus bei den passenden Materialien ganz oben"
                      >
                        <Icon name="stern" />
                      </button>
                    )}
                  </div>
                  {(detailPlattform || detailArt || detailTags.length > 0) && (
                    <div className="ab-detail-tags">
                      {detailPlattform && (
                        <span className="ab-tag ab-tag-plattform">
                          {detailPlattform}
                        </span>
                      )}
                      {detailArt && (
                        <span className="ab-tag">{detailArt}</span>
                      )}
                      {detailTags.map((t) => (
                        <span className="ab-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="ab-detail-zu"
                  onClick={schliesseDetail}
                  aria-label="Schließen"
                >
                  ✕
                </button>
              </div>
              <div className="ab-detail-inhalt">
                <MaterialInhalt material={offenesMaterial} />
              </div>
            </aside>
          )}
        </div>

        {/* Portal an den body: der Screen-Wisch-Wrapper ist transform-animiert
            und würde sonst zum Bezugsrahmen des fixed-Overlays (Backdrop deckt
            dann nicht den ganzen Schirm und liegt unter Nav-/Unten-Leiste). */}
        {uploadOffen &&
          createPortal(
            <MaterialUpload
              startFachId={fachId}
              onSpeichern={uploadSpeichern}
              onClose={() => setUploadOffen(false)}
            />,
            document.body
          )}
      </div>
      {vorn !== false &&
        (untenSlot ? createPortal(untenLeiste, untenSlot) : untenLeiste)}
    </>
  );
}
