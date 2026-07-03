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

// Ein gesendetes Bild (z. B. Discord-Anhang) automatisch einsortieren: Titel
// aus Nachrichtentext oder Dateiname, Fach/Thema-Erkennung über dieselbe
// Analyse wie bei Links. anhang = { url, name }, kontext = Nachrichtentext.
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
  const titel = text ? text.slice(0, 80) : dateiname || "Bild aus Discord";

  const analyse = analysiereInhalt({
    titel,
    inhalt: text || dateiname || null,
    url: anhang.url,
  });
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
    art: "bild",
    quelle: "discord",
    url: anhang.url,
    bild: anhang.url,
    bereich: "selbstlernen",
    tags,
  });

  return { material, analyse };
}
