import { useEffect, useState } from "react";
import { faecher } from "../data/wissen";
import { MATHE_KATEGORIEN } from "../data/matheKategorien";
import {
  leseSeite,
  analysiereInhalt,
  youtubeId,
  leseYoutube,
  titelAusUrl,
} from "./linkLeser";
import { baueTags } from "./eigeneMaterialien";
import "./MaterialUpload.css";

// Eigenes Material hinzufügen (Demo): Datei wählen, die App erkennt Fach und
// Lernweg am Dateinamen (simulierte KI) und schlägt die Zuordnung vor; man
// kann sie jederzeit selbst ändern. Gespeichert wird nur die Beschreibung.

const ART_AUS_ENDUNG = {
  pdf: "pdf",
  png: "bild",
  jpg: "bild",
  jpeg: "bild",
  heic: "bild",
};

// Für den Vergleich normalisieren: Kleinschreibung + Umlaute auflösen,
// damit "uebersetzung.pdf" den Lernweg "Übersetzung" findet.
function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

const STOPPWOERTER = new Set(["mit", "und", "der", "die", "das", "fuer", "von", "zum", "im"]);

// Zuordnung am Dateinamen erkennen: erst Lernweg-Wörter und KB-Kürzel,
// dann Fach-Namen.
function erkenneZuordnung(dateiname) {
  const name = norm(dateiname);
  for (const f of faecher) {
    for (const t of f.themen) {
      const woerter = norm(t.label)
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 3 && !STOPPWOERTER.has(w));
      if (
        woerter.some((w) => name.includes(w)) ||
        (t.kbId && name.includes(norm(t.kbId)))
      ) {
        return { fachId: f.id, thema: t.label };
      }
    }
  }
  for (const f of faecher) {
    if (name.includes(norm(f.fach)) || name.includes(f.id)) {
      return { fachId: f.id, thema: "" };
    }
  }
  return null;
}

export default function MaterialUpload({
  startFachId,
  startThema = "",
  onSpeichern,
  onClose,
}) {
  const [datei, setDatei] = useState(null);
  const [erkannt, setErkannt] = useState(false);
  const [fachId, setFachId] = useState(startFachId || faecher[0]?.id);
  const [thema, setThema] = useState(startThema);
  const [titel, setTitel] = useState("");
  const [bereich, setBereich] = useState("selbstlernen");
  const [linkUrl, setLinkUrl] = useState("");
  const [liest, setLiest] = useState(false);
  const [istLink, setIstLink] = useState(false);
  const [linkInhalt, setLinkInhalt] = useState(null);
  const [linkErkannt, setLinkErkannt] = useState(null);
  const [linkStichwort, setLinkStichwort] = useState(null);
  // Ein gepasteter YouTube-Link wird als Video abgelegt (spielt inline).
  const [linkArt, setLinkArt] = useState("link"); // "link" | "video"
  const [linkVideoId, setLinkVideoId] = useState(null);
  const [linkKanal, setLinkKanal] = useState(null);
  // sicher = genauer Lernweg-Treffer; sonst nur das Fach erkannt.
  const [sicher, setSicher] = useState(false);

  const fach = faecher.find((f) => f.id === fachId) || faecher[0];

  // Esc schliesst das Modal, wie bei den anderen Overlays.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function waehleDatei(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setDatei(f);
    const basis = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
    setTitel(basis.charAt(0).toUpperCase() + basis.slice(1));
    const z = erkenneZuordnung(f.name);
    if (z) {
      setFachId(z.fachId);
      setThema(z.thema);
      setErkannt(true);
    } else {
      setErkannt(false);
    }
  }

  // Link einfügen: orca holt Titel und Inhalt und schlägt die Zuordnung vor. Bei
  // YouTube die echten Video-Metadaten (Titel + Kanal) und Ablage als Video; sonst
  // den Seiteninhalt (r.jina.ai). Die Analyse vergibt Titel, Fach/Lernweg und Tags.
  async function linkLesen(e) {
    e.preventDefault();
    let url = linkUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setLinkUrl(url);
    setLiest(true);

    const vid = youtubeId(url);
    let titelText;
    let inhalt = null;
    let kanal = null;
    if (vid) {
      const meta = await leseYoutube(vid);
      titelText = meta?.titel || titelAusUrl(url);
      kanal = meta?.kanal || null;
      setLinkArt("video");
      setLinkVideoId(vid);
      setLinkKanal(kanal);
      setLinkInhalt(null);
    } else {
      const seite = await leseSeite(url);
      titelText = seite?.titel || titelAusUrl(url);
      inhalt = seite?.inhalt ? seite.inhalt.slice(0, 4000) : null;
      setLinkArt("link");
      setLinkVideoId(null);
      setLinkKanal(null);
      setLinkInhalt(inhalt);
    }

    const analyse = analysiereInhalt({ titel: titelText, inhalt, url, kanal });
    setTitel(titelText);
    if (analyse) {
      setFachId(analyse.fachId);
      setThema(analyse.thema);
      setErkannt(true);
      setSicher(analyse.sicher);
      setLinkErkannt(analyse.erkannt);
      setLinkStichwort(analyse.stichwort);
    } else {
      setErkannt(false);
      setSicher(false);
      setLinkErkannt(null);
      setLinkStichwort(null);
    }
    setIstLink(true);
    setLiest(false);
  }

  function speichern() {
    if (istLink) {
      const tags = baueTags({
        fachId,
        thema,
        erkannt: linkErkannt,
        stichwort: linkStichwort,
      });
      if (linkArt === "video") {
        // Gepasteter YouTube-Link: als Video ablegen, damit es inline spielt und den
        // YouTube-Badge bekommt (wie ein gelikte Video).
        onSpeichern({
          titel: titel.trim() || linkUrl,
          fachId,
          thema,
          art: "video",
          quelle: "youtube",
          url: linkUrl,
          videoId: linkVideoId,
          kanal: linkKanal,
          bereich,
          tags,
        });
        return;
      }
      onSpeichern({
        titel: titel.trim() || linkUrl,
        fachId,
        thema,
        art: "link",
        quelle: "link",
        url: linkUrl,
        inhalt: linkInhalt,
        bereich,
        tags,
      });
      return;
    }
    const endung = (datei?.name.split(".").pop() || "").toLowerCase();
    onSpeichern({
      titel: titel.trim() || datei?.name || "Eigenes Material",
      fachId,
      thema,
      art: ART_AUS_ENDUNG[endung] || "notiz",
      bereich,
      tags: baueTags({ fachId, thema }),
    });
  }

  const gelesen = linkArt === "video" ? "Video erkannt" : "Seite gelesen";

  return (
    <div className="mu-overlay" onClick={onClose}>
      <div
        className="mu-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Material hinzufügen"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="mu-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <h2 className="mu-titel">Material hinzufügen</h2>

        {!datei && !istLink ? (
          <>
            <label className="mu-drop">
              <input type="file" onChange={waehleDatei} />
              <span className="mu-drop-gross">Datei auswählen</span>
              <span className="mu-drop-klein">
                Foto, PDF oder Notiz von deinem Gerät
              </span>
            </label>
            <div className="mu-oder">
              <span>oder</span>
            </div>
            <form className="mu-link" onSubmit={linkLesen}>
              <input
                type="url"
                className="mu-link-feld"
                placeholder="Link einfügen (https://…)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                disabled={liest}
              />
              <button
                type="submit"
                className="mu-link-knopf"
                disabled={liest || !linkUrl.trim()}
              >
                {liest ? (
                  <>
                    <span className="mu-scan" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    orca liest…
                  </>
                ) : (
                  "Einfügen"
                )}
              </button>
            </form>
            <p className="mu-link-info">
              orca liest den Seiteninhalt und schlägt vor, wohin es passt.
            </p>
          </>
        ) : (
          <>
            <p className="mu-datei">{istLink ? linkUrl : datei.name}</p>
            <p className={"mu-hinweis" + ((istLink ? sicher : erkannt) ? " ok" : "")}>
              {istLink
                ? sicher
                  ? `${gelesen} und automatisch zugeordnet. Passt das?`
                  : erkannt
                    ? `${gelesen}, Fach erkannt. Wähle den passenden Lernweg oder lass es im Fach.`
                    : `${gelesen}. orca konnte es nicht sicher zuordnen: wähle selbst.`
                : erkannt
                  ? "Automatisch zugeordnet. Passt das?"
                  : "Keine automatische Zuordnung erkannt: wähle selbst, wohin es soll."}
            </p>

            <label className="mu-feld">
              <span>Titel</span>
              <input
                type="text"
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
              />
            </label>
            <label className="mu-feld">
              <span>Fach</span>
              <select
                value={fachId}
                onChange={(e) => {
                  setFachId(e.target.value);
                  setThema("");
                }}
              >
                {faecher.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fach}
                  </option>
                ))}
              </select>
            </label>
            <label className="mu-feld">
              <span>Lernweg (optional)</span>
              <select value={thema} onChange={(e) => setThema(e.target.value)}>
                <option value="">Nur im Fach ablegen</option>
                {fach.themen.some((t) => t.kategorie)
                  ? MATHE_KATEGORIEN.map((kat) => {
                      const wege = fach.themen.filter(
                        (t) => t.kategorie === kat
                      );
                      if (!wege.length) return null;
                      return (
                        <optgroup key={kat} label={kat}>
                          {wege.map((t) => (
                            <option key={t.id} value={t.label}>
                              {t.label}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })
                  : fach.themen.map((t) => (
                      <option key={t.id} value={t.label}>
                        {t.label}
                      </option>
                    ))}
              </select>
            </label>
            <label className="mu-feld">
              <span>Woher</span>
              <select
                value={bereich}
                onChange={(e) => setBereich(e.target.value)}
              >
                <option value="selbstlernen">Selbst gelernt</option>
                <option value="unterricht">Aus dem Unterricht</option>
              </select>
            </label>

            <div className="mu-aktionen">
              <button type="button" className="mu-abbrechen" onClick={onClose}>
                Abbrechen
              </button>
              <button type="button" className="mu-speichern" onClick={speichern}>
                Speichern
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
