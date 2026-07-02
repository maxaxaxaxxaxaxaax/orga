// Liest den Textinhalt einer beliebigen Webseite im Frontend über den öffentlichen,
// CORS-offenen Jina-Reader (r.jina.ai) und ordnet ihn per Stichwort-Abgleich einem
// Lernweg zu. So bekommt orca im Demo ECHTEN Seiteninhalt als Kontext, ohne Backend.
// Die Zuordnung ersetzt kein echtes LLM: sie ist eine einfache, transparente Heuristik.

function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

// Stichwort-Regeln je Lernweg der laufenden Etappe (fachId/thema wie in wissen.js).
const REGELN = [
  {
    fachId: "mathe",
    thema: "Grundlagen negative Zahlen",
    erkannt: { fach: "Mathematik", thema: "Negative Zahlen" },
    woerter: ["negative zahl", "zahlengerade", "vorzeichen", "betrag", "gegenzahl", "ganze zahl"],
  },
  {
    fachId: "mathe",
    thema: "Addieren & Subtrahieren",
    erkannt: { fach: "Mathematik", thema: "Negative Zahlen" },
    woerter: ["addier", "subtrahier", "addition", "subtraktion", "summe", "differenz"],
  },
  {
    fachId: "mathe",
    thema: "Multiplikation & Division",
    erkannt: { fach: "Mathematik", thema: "Negative Zahlen" },
    woerter: ["multiplizier", "dividier", "multiplikation", "division", "produkt", "quotient"],
  },
  {
    fachId: "mathe",
    thema: "Rechengesetze mit Vorzeichen",
    erkannt: { fach: "Mathematik", thema: "Negative Zahlen" },
    woerter: ["rechengesetz", "klammer", "distributiv", "vorrangregel", "vorzeichenregel"],
  },
  {
    fachId: "deutsch",
    thema: "Mini-Vortrag",
    erkannt: { fach: "Deutsch", thema: "Präsentieren und Gestalten" },
    woerter: ["vortrag", "referat", "praesentation", "kurzvortrag", "lampenfieber", "vor der klasse"],
  },
  {
    fachId: "deutsch",
    thema: "Lernplakat",
    erkannt: { fach: "Deutsch", thema: "Präsentieren und Gestalten" },
    woerter: ["lernplakat", "plakat gestalten"],
  },
  {
    fachId: "deutsch",
    thema: "Lapbook",
    erkannt: { fach: "Deutsch", thema: "Präsentieren und Gestalten" },
    woerter: ["lapbook"],
  },
];

// Fach-Ebene (gröber als der Lernweg): greift auch bei englischen oder allgemeinen
// Inhalten, damit wenigstens das Fach stimmt, wenn kein genauer Lernweg passt.
// tag = deutsches Schlagwort für die Anzeige (falls ein Unterthema erkennbar ist).
// Bewusst auf Titel/Kanal angewandt (nicht den ganzen Fließtext), um Fehlgriffe zu
// vermeiden. "multipli" fängt multiplication/Multiplikation/multiplizieren zugleich.
const FACH_REGELN = [
  { fachId: "mathe", fach: "Mathematik", tag: "Negative Zahlen", woerter: ["negative zahl", "negative number", "zahlengerade", "zahlenstrahl", "vorzeichen"] },
  { fachId: "mathe", fach: "Mathematik", tag: "Multiplikation", woerter: ["multipli", "einmaleins", "times table"] },
  { fachId: "mathe", fach: "Mathematik", tag: "Division", woerter: ["division", "dividier", "geteilt durch"] },
  { fachId: "mathe", fach: "Mathematik", tag: "Bruchrechnen", woerter: ["bruchrechnen", "brueche", "fraction"] },
  { fachId: "mathe", fach: "Mathematik", tag: "Geometrie", woerter: ["geometrie", "geometry", "dreieck", "flaecheninhalt"] },
  { fachId: "mathe", fach: "Mathematik", tag: null, woerter: ["mathe", "mathematik", "mathematics", "arithmetic", "algebra", "rechnen", "gleichung", "prozentrechnung"] },
  { fachId: "deutsch", fach: "Deutsch", tag: "Grammatik", woerter: ["grammatik", "wortart", "satzglied", "rechtschreib"] },
  { fachId: "deutsch", fach: "Deutsch", tag: "Vortrag", woerter: ["vortrag", "referat", "praesentier"] },
  { fachId: "deutsch", fach: "Deutsch", tag: null, woerter: ["deutschunterricht", "aufsatz", "gedicht", "erzaehlung", "literatur"] },
  { fachId: "englisch", fach: "Englisch", tag: "Grammar", woerter: ["english grammar", "englisch lernen", "simple past", "present perfect", "vocabulary"] },
  { fachId: "latein", fach: "Latein", tag: null, woerter: ["latein", "deklination", "konjugation", "vokabeln latein"] },
  { fachId: "griechisch", fach: "Griechisch", tag: null, woerter: ["altgriechisch", "griechisch lernen"] },
];

// Nur das Fach (plus optionales Schlagwort) aus Titel/Kanal erkennen. null, wenn
// nichts passt. Bewusst gröber als klassifiziere: fürs "wenigstens richtige Fach".
// Zwei Durchgänge: erst die spezifischen Unterthemen-Regeln (mit tag), damit ein
// konkretes Schlagwort wie "Multiplikation" gewinnt; die allgemeinen Fach-Regeln
// (tag null) sind nur der Rückfall, wenn kein Unterthema passt.
export function erkenneFach(kopfText) {
  const t = norm(kopfText || "");
  const punkte = (r) =>
    r.woerter.reduce((s, w) => s + (t.includes(norm(w)) ? 1 : 0), 0);
  const beste = (nurMitTag) => {
    let best = null;
    let bestScore = 0;
    for (const r of FACH_REGELN) {
      if (nurMitTag ? !r.tag : r.tag) continue;
      const s = punkte(r);
      if (s > bestScore) {
        bestScore = s;
        best = r;
      }
    }
    return best;
  };
  const best = beste(true) || beste(false);
  return best ? { fachId: best.fachId, fach: best.fach, tag: best.tag } : null;
}

// Gesamt-Analyse für die Zuordnung: erst der genaue Lernweg, sonst wenigstens das
// Fach. Liefert { fachId, thema, erkannt, stichwort, sicher }. sicher=true nur bei
// genauem Lernweg-Treffer; sonst ist das Fach gesetzt und der Lernweg offen.
export function analysiereInhalt({ titel, inhalt, url, kanal }) {
  const kopf = [titel, kanal].filter(Boolean).join(" ");
  const lw = klassifiziere({ titel: kopf, inhalt, url });
  if (lw) {
    return {
      fachId: lw.fachId,
      thema: lw.thema,
      erkannt: lw.erkannt,
      stichwort: stichwort(lw, [kopf, inhalt].filter(Boolean).join(" ")),
      sicher: true,
    };
  }
  const f = erkenneFach([kopf, url].filter(Boolean).join(" "));
  if (f) {
    return {
      fachId: f.fachId,
      thema: "",
      erkannt: { fach: f.fach, thema: null },
      stichwort: f.tag,
      sicher: false,
    };
  }
  return null;
}

// Bester Lernweg für den gelesenen Inhalt: Treffer im Titel/der URL zählen stärker
// als im Fließtext. null, wenn nichts passt (dann landet es unter "Weiteres").
export function klassifiziere({ titel, inhalt, url }) {
  const kopf = norm(titel || "") + " " + norm(url || "");
  const rumpf = norm(inhalt || "");
  let best = null;
  let bestScore = 0;
  for (const r of REGELN) {
    let score = 0;
    for (const w of r.woerter) {
      const nw = norm(w);
      if (kopf.includes(nw)) score += 3;
      if (rumpf.includes(nw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return bestScore > 0 ? best : null;
}

// Ein einzelnes, inhaltstragendes Stichwort für die Tags: das spezifischste
// Regel-Wort, das im Titel/Inhalt vorkommt (großgeschrieben). null, wenn keins
// passt. So bekommt ein Link neben Fach und Thema noch ein konkretes Schlagwort.
export function stichwort(rule, text) {
  if (!rule || !Array.isArray(rule.woerter)) return null;
  const t = norm(text || "");
  const treffer = rule.woerter
    .filter((w) => t.includes(norm(w)))
    .sort((a, b) => {
      // Einzelwörter zuerst (ergeben als Tag ein konkretes Schlagwort wie
      // "Zahlengerade" statt der Phrase "negative zahl"), dann das längste.
      const aPhrase = a.includes(" ") ? 1 : 0;
      const bPhrase = b.includes(" ") ? 1 : 0;
      if (aPhrase !== bPhrase) return aPhrase - bPhrase;
      return b.length - a.length;
    });
  const w = treffer[0];
  if (!w) return null;
  return w.charAt(0).toUpperCase() + w.slice(1);
}

// Notfall-Titel aus der URL, falls die Seite keinen eigenen Titel liefert.
export function titelAusUrl(url) {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
    const t = decodeURIComponent(seg)
      .replace(/[-_]+/g, " ")
      .replace(/\.[a-z0-9]+$/i, "")
      .trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : u.hostname;
  } catch {
    return url;
  }
}

// YouTube-Video-Id aus den gängigen URL-Formen (watch, youtu.be, shorts, embed).
// null, wenn es keine YouTube-URL ist.
export function youtubeId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v") || null;
      const m = u.pathname.match(/^\/(shorts|embed|v|live)\/([^/?]+)/);
      if (m) return m[2];
    }
  } catch {
    /* ungueltige URL */
  }
  return null;
}

// Echte Video-Metadaten (Titel + Kanal) über die CORS-offene oEmbed-Schnittstelle
// von YouTube. So bekommt ein gepasteter YouTube-Link seinen richtigen Titel statt
// nur "YouTube" (der Scraper sieht bei YouTube nichts Brauchbares). null bei Fehler.
export async function leseYoutube(videoId) {
  try {
    const watch = "https://www.youtube.com/watch?v=" + videoId;
    const res = await fetch(
      "https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(watch)
    );
    if (!res.ok) return null;
    const j = await res.json();
    return { titel: j.title || null, kanal: j.author_name || null };
  } catch {
    return null;
  }
}

// --- TikTok / Instagram: einbetten statt scrapen ---------------------------
// Diese Plattformen liefern über den Scraper nur eine Login-Wand. Darum wird der
// Beitrag direkt als Embed-iframe angezeigt (die Plattform rendert den Inhalt
// selbst). Hier nur die Erkennung aus der URL plus optionale Metadaten.

// TikTok-Video-Id aus einem vollen Link (/video/{id}). Kurzlinks (vm.tiktok.com,
// /t/…) leiten erst um und geben die Id nicht her -> null (dann Link-Karte).
export function tiktokId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "tiktok.com" && !host.endsWith(".tiktok.com")) return null;
    const m = u.pathname.match(/\/video\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

// Instagram-Beitrag (Post/Reel/IGTV) aus der URL: { typ, code } oder null.
// Fängt /p/, /reel/ und /reels/ (Plural), /tv/ irgendwo im Pfad (auch hinter
// /share/…). Kurz-/Share-Links ohne diese Segmente bleiben null (Redirect nötig).
export function instagramRef(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "instagram.com" && !host.endsWith(".instagram.com")) return null;
    const m = u.pathname.match(/\/(reels?|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!m) return null;
    const typ = m[1] === "p" ? "p" : m[1] === "tv" ? "tv" : "reel";
    return { typ, code: m[2] };
  } catch {
    return null;
  }
}

// TikTok-Metadaten (Titel/Autor/Vorschaubild) über die CORS-offene oEmbed-API.
// null bei Fehler (dann Titel aus der URL); das Embed selbst braucht das nicht.
export async function leseTikTok(url) {
  try {
    const res = await fetch(
      "https://www.tiktok.com/oembed?url=" + encodeURIComponent(url)
    );
    if (!res.ok) return null;
    const j = await res.json();
    return {
      titel: j.title || null,
      autor: j.author_name || null,
      bild: j.thumbnail_url || null,
    };
  } catch {
    return null;
  }
}

// Holt Titel + Textinhalt einer Seite über r.jina.ai (liefert sauberes Markdown mit
// "Title:"- und "Markdown Content:"-Abschnitt). null bei Fehler/Blockade.
export async function leseSeite(url) {
  try {
    const res = await fetch("https://r.jina.ai/" + url);
    if (!res.ok) return null;
    const roh = await res.text();
    const titelMatch = roh.match(/^Title:\s*(.+)$/m);
    const teile = roh.split(/\nMarkdown Content:\s*/);
    const inhalt = (teile.length > 1 ? teile.slice(1).join("\nMarkdown Content:") : roh).trim();
    return {
      titel: titelMatch ? titelMatch[1].trim() : null,
      inhalt,
    };
  } catch {
    return null;
  }
}
