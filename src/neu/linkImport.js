// Einen Link automatisch einlesen: bei YouTube die Video-Metadaten, sonst den
// gescrapten Seiteninhalt; dann Fach/Thema/Tags erkennen und als eigenes Material
// ablegen. Dieselbe Pipeline wie der "Hinzufügen"-Dialog, nur ohne Rückfrage (für
// den Discord-Import). Gibt das gespeicherte Material + die Analyse zurück, oder
// null bei ungültiger URL.
import { faecher } from "../data/wissen";
import {
  youtubeId,
  leseYoutube,
  tiktokId,
  instagramRef,
  leseTikTok,
  leseSeite,
  analysiereInhalt,
  titelAusUrl,
} from "./linkLeser";
import { baueTags, speichereEigenes, ladeEigene } from "./eigeneMaterialien";
import { pruefeVision, deuteBildFuerAblage } from "./kiClient";

export async function importiereLinkAuto(url) {
  if (!/^https?:\/\//i.test(url)) return null;

  // Schon vorhanden? Nicht doppelt ablegen (mehrfacher Poll, gleicher Link erneut
  // gepostet). doppelt=true, damit der Aufrufer keine zweite Benachrichtigung schickt.
  const schon = ladeEigene().find((m) => m.url === url);
  if (schon) return { material: schon, analyse: null, doppelt: true };

  const vid = youtubeId(url);
  const tt = !vid ? tiktokId(url) : null;
  const ig = !vid && !tt ? instagramRef(url) : null;
  let titel;
  let inhalt = null;
  let kanal = null;
  let art = "link";
  let videoId = null;
  let embedUrl = null;
  let bild = null;
  let quelle = "link";

  if (vid) {
    const meta = await leseYoutube(vid);
    titel = meta?.titel || titelAusUrl(url);
    kanal = meta?.kanal || null;
    art = "video";
    videoId = vid;
    quelle = "youtube";
  } else if (tt) {
    // TikTok: als Video-Embed. oEmbed liefert (falls erreichbar) Titel/Autor/Bild.
    const meta = await leseTikTok(url);
    titel = meta?.titel || "TikTok-Video";
    kanal = meta?.autor || null;
    bild = meta?.bild || null;
    art = "video";
    embedUrl = `https://www.tiktok.com/embed/v2/${tt}`;
    quelle = "tiktok";
  } else if (ig) {
    // Instagram: als Beitrag-Embed (kein Scrape möglich, Login-Wand).
    titel = "Instagram-Beitrag";
    art = "link";
    embedUrl = `https://www.instagram.com/${ig.typ}/${ig.code}/embed`;
    quelle = "instagram";
  } else {
    const seite = await leseSeite(url);
    titel = seite?.titel || titelAusUrl(url);
    inhalt = seite?.inhalt ? seite.inhalt.slice(0, 4000) : null;
  }

  const analyse = analysiereInhalt({ titel, inhalt, url, kanal });
  const fachId = analyse?.fachId || faecher[0]?.id;
  const thema = analyse?.thema || null;
  const tags = baueTags({
    fachId,
    thema,
    erkannt: analyse?.erkannt,
    stichwort: analyse?.stichwort,
  });

  const material = speichereEigenes({
    titel,
    fachId,
    thema,
    art,
    quelle,
    url,
    inhalt,
    videoId,
    embedUrl,
    bild,
    kanal,
    bereich: "selbstlernen",
    tags,
  });

  return { material, analyse };
}

// Ein Bild herunterladen und als verkleinertes JPEG-Data-URL zurückgeben:
// klein genug für localStorage und das Vision-Modell, und die Ablage bleibt
// auch dann voll, wenn die signierte CDN-URL von Discord später abläuft.
async function ladeBildAlsDataUrl(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const blob = await r.blob();
    const bmp = await createImageBitmap(blob);
    const max = 1024;
    const skala = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * skala));
    canvas.height = Math.max(1, Math.round(bmp.height * skala));
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}

// Ein gesendetes Bild (z. B. Discord-Anhang) automatisch einsortieren: die
// lokale Vision-KI schaut sich das Foto an und bestimmt Titel, Fach, Thema und
// Schlagwörter; läuft keine KI, greift die Text-Analyse über Nachrichtentext
// und Dateiname. anhang = { url, name }, kontext = Nachrichtentext.
export async function importiereBildAuto(anhang, kontext) {
  if (!anhang?.url) return null;

  // Discord-CDN-URLs tragen wechselnde Signatur-Parameter: für die
  // Doppelt-Erkennung zählt nur der Pfad.
  const pfad = anhang.url.split("?")[0];
  const schon = ladeEigene().find((m) => (m.url || "").split("?")[0] === pfad);
  if (schon) return { material: schon, analyse: null, doppelt: true };

  const dateiname = (anhang.name || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  const text = (kontext || "").trim();

  // Lokale Vision-KI (falls sie läuft): Bild anschauen und einsortieren lassen.
  let vision = null;
  let dataUrl = null;
  try {
    const modell = await pruefeVision();
    if (modell) {
      dataUrl = await ladeBildAlsDataUrl(anhang.url);
      if (dataUrl) {
        const liste = faecher
          .map(
            (f) =>
              `${f.fach}: ${(f.themen || []).map((t) => t.label).join(" | ")}`
          )
          .join("\n");
        vision = await deuteBildFuerAblage({
          bild: dataUrl,
          modell,
          faecherListe: liste,
          kontext: text || dateiname || null,
        });
      }
    }
  } catch {
    vision = null; // KI ist optional, der Text-Weg unten trägt immer
  }

  // Eigener Text gewinnt beim Titel (bewusste Beschriftung), sonst benennt
  // die KI das Bild, sonst bleibt der Dateiname.
  const titel =
    (text && text.slice(0, 80)) ||
    vision?.titel ||
    dateiname ||
    "Bild aus Discord";

  // Text-Analyse als Grundlage (nutzt auch die KI-Beschreibung als Signal) ...
  const analyse = analysiereInhalt({
    titel,
    inhalt:
      [text || null, dateiname || null, vision?.beschreibung || null]
        .filter(Boolean)
        .join("\n") || null,
    url: anhang.url,
  });
  let fachId = analyse?.fachId || null;
  let thema = analyse?.thema || null;
  let erkannt = analyse?.erkannt || null;

  // ... aber die Vision-Zuordnung gewinnt, wenn sie auf bekannte Namen zeigt.
  const visionFach =
    vision?.fach &&
    faecher.find(
      (f) => f.fach.toLowerCase() === vision.fach.trim().toLowerCase()
    );
  if (visionFach) {
    const visionThema = (visionFach.themen || []).find(
      (t) => t.label.toLowerCase() === (vision.thema || "").trim().toLowerCase()
    );
    fachId = visionFach.id;
    thema = visionThema?.label || null;
    erkannt = { fach: visionFach.fach, thema: thema || undefined };
  }
  fachId = fachId || faecher[0]?.id;

  // Tags: Fach/Thema-Basis plus die treffendsten KI-Schlagwörter.
  const tags = baueTags({
    fachId,
    thema,
    erkannt,
    stichwort: analyse?.stichwort,
  });
  for (const t of vision?.tags || []) {
    if (tags.length >= 5) break;
    if (!tags.some((v) => v.toLowerCase() === t.toLowerCase())) tags.push(t);
  }

  const material = speichereEigenes({
    titel,
    fachId,
    thema,
    art: "bild",
    quelle: "discord",
    url: anhang.url,
    // Verkleinerte Kopie bevorzugen: bleibt sichtbar, wenn die CDN-URL abläuft.
    bild: dataUrl || anhang.url,
    inhalt: vision?.beschreibung || null,
    bereich: "selbstlernen",
    tags,
  });

  return { material, analyse: { ...analyse, fachId, thema, erkannt } };
}
