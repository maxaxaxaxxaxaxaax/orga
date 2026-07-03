import Karteikarten from "./Karteikarten";
import Zahlenstrahl from "./Zahlenstrahl";
import Merkblatt from "./Merkblatt";
import Lueckentext from "./Lueckentext";
import Zuordnung from "./Zuordnung";
import Reihenfolge from "./Reihenfolge";
import Auswahlquiz from "./Auswahlquiz";
import Satzbau from "./Satzbau";
import Bildzuordnung from "./Bildzuordnung";
import Markieren from "./Markieren";
import Rechentrainer from "./Rechentrainer";
import { interaktivFuerMaterial } from "./interaktiv";
import { instagramRef, tiktokId } from "./linkLeser";
import "./MaterialAnsicht.css";

// Embed (iframe-Quelle + Plattform) für ein Material: bevorzugt das beim Import
// gespeicherte embedUrl, sonst aus der url abgeleitet. So bettet auch ein früher
// als "Webseite" abgelegter TikTok/Instagram-Link ein. null = kein Embed.
function embedFuer(material) {
  if (material.embedUrl)
    return { url: material.embedUrl, quelle: material.quelle || null };
  const tt = tiktokId(material.url || "");
  if (tt) return { url: `https://www.tiktok.com/embed/v2/${tt}`, quelle: "tiktok" };
  const ig = instagramRef(material.url || "");
  if (ig)
    return {
      url: `https://www.instagram.com/${ig.typ}/${ig.code}/embed`,
      quelle: "instagram",
    };
  return null;
}

// YouTube-Video (aus den Likes automatisch einsortiert): ruhige Vorschaukarte mit
// Kanal, Dauer, Link und dem Hinweis, wie es hierher kam.
function VideoInhalt({ material }) {
  return (
    <div className="ma-video">
      {material.videoId ? (
        // Direkt in der App abspielbar (kein Wechsel zu YouTube nötig).
        // youtube-nocookie: kein Tracking-Cookie, bis wirklich abgespielt wird.
        <div className="ma-video-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${material.videoId}?rel=0`}
            title={material.titel}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className="ma-video-thumb" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="#fff">
            <path d="M9 7.5l8 4.5-8 4.5z" />
          </svg>
          {material.dauer && (
            <span className="ma-video-dauer">{material.dauer}</span>
          )}
        </div>
      )}
      {material.kanal && <p className="ma-video-kanal">{material.kanal}</p>}
      {material.videoId && (
        <a
          className="ma-video-link"
          href={`https://www.youtube.com/watch?v=${material.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Auf YouTube öffnen
        </a>
      )}
      <p className="ma-video-hinweis">
        {material.url
          ? "orca hat den Titel dieses Videos gelesen und es automatisch hier einsortiert."
          : "orca hat dieses Video aus deinen YouTube-Likes automatisch hier einsortiert."}
      </p>
    </div>
  );
}

// TikTok/Instagram-Beitrag: direkt eingebettet, die Plattform rendert den Inhalt
// (scrapen scheitert dort an der Login-Wand). embedUrl ist der iframe-Quelllink.
function EmbedInhalt({ material, embed }) {
  const plattform =
    embed.quelle === "tiktok"
      ? "TikTok"
      : embed.quelle === "instagram"
        ? "Instagram"
        : "Beitrag";
  return (
    <div className="ma-embed">
      <div className={"ma-embed-frame " + (embed.quelle || "")}>
        <iframe
          src={embed.url}
          title={material.titel || plattform}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; web-share"
          allowFullScreen
        />
      </div>
      {material.kanal && <p className="ma-video-kanal">{material.kanal}</p>}
      {material.url && (
        <a
          className="ma-video-link"
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Auf {plattform} öffnen
        </a>
      )}
      <p className="ma-video-hinweis">
        orca hat diesen {plattform}-Beitrag automatisch hier einsortiert.
      </p>
    </div>
  );
}

// Leichter Text-Renderer für Materialien mit Volltext (Lernzettel u. ä.):
// "- " wird Stichpunkt, eine Zeile auf ":" wird kleine Überschrift.
function Textinhalt({ text }) {
  const zeilen = (text || "").split("\n");
  return (
    <div className="ma-inhalt">
      {zeilen.map((z, i) => {
        const t = z.trim();
        if (!t) return null;
        if (t.startsWith("- "))
          return (
            <p className="ma-punkt" key={i}>
              {t.slice(2)}
            </p>
          );
        if (t.endsWith(":"))
          return (
            <p className="ma-ueberschrift" key={i}>
              {t}
            </p>
          );
        return (
          <p className="ma-zeile" key={i}>
            {t}
          </p>
        );
      })}
    </div>
  );
}

// Markdown grob zu lesbaren Zeilen entschärfen. Wikipedia ist der harte Fall:
// URLs mit Klammern plus Link-Titel lassen sich nicht sauber per Klammer-Regex
// fassen, darum bleiben nach dem Link-Ersetzen "..."-Titelreste stehen, die
// gezielt entfernt werden (im deutschen Text stehen echte Zitate in „…").
function alsText(md) {
  return (md || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // Bilder
    .replace(/\[\[\d+\]\]\([^)]*\)/g, "") // Fußnoten [[1]](url)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/\s*"[^"]*"\)?/g, "") // übrige Wikipedia-Titelreste "…" bzw. "…")
    .replace(/\(\s*\)/g, "") // leere Klammern
    .replace(/\[([^\]]*)\]/g, "$1") // restliche [text]
    .replace(/https?:\/\/\S+/g, "") // blanke URLs
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_`>|]+/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .split("\n")
    .map((z) => z.trim())
    .filter((z) => z.length > 1)
    .slice(0, 30);
}

// Gepasteter Link: gelesener Seiteninhalt als Kontext, plus Domain und "Seite öffnen".
function LinkInhalt({ material }) {
  let domain = material.url || "";
  try {
    domain = new URL(material.url).hostname.replace(/^www\./, "");
  } catch {
    /* ungueltige URL: dann eben die Rohform */
  }
  const zeilen = alsText(material.inhalt);
  return (
    <div className="ma-link">
      <div className="ma-link-kopf">
        <span className="ma-link-domain">{domain}</span>
        {material.url && (
          <a
            className="ma-video-link"
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Seite öffnen
          </a>
        )}
      </div>
      {zeilen.length ? (
        <div className="ma-link-inhalt">
          {zeilen.map((z, i) => (
            <p className="ma-zeile" key={i}>
              {z}
            </p>
          ))}
        </div>
      ) : (
        <p className="ma-leer">Der Seiteninhalt konnte nicht gelesen werden.</p>
      )}
      <p className="ma-video-hinweis">
        orca hat den Seiteninhalt gelesen und diese Seite automatisch hier
        einsortiert.
      </p>
    </div>
  );
}

// Gesendetes Bild (z. B. Discord-Anhang): das Foto selbst, darunter der
// übliche Einsortiert-Hinweis.
function BildInhalt({ material }) {
  return (
    <div className="ma-bild">
      <img className="ma-bild-foto" src={material.bild} alt={material.titel} />
      <p className="ma-video-hinweis">
        orca hat das Bild automatisch hier einsortiert.
      </p>
    </div>
  );
}

// Dispatcher: wählt die passende Darstellung für ein Material. Interaktive
// Formate zuerst, dann Volltext, sonst ein ruhiger Platzhalter.
export default function MaterialInhalt({ material, onAbgeschlossen }) {
  const eintrag = interaktivFuerMaterial(material.id);
  if (eintrag?.typ === "karteikarten")
    return <Karteikarten daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "zahlenstrahl")
    return <Zahlenstrahl daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "merkblatt") return <Merkblatt daten={eintrag.daten} />;
  if (eintrag?.typ === "lueckentext")
    return <Lueckentext daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "zuordnung")
    return <Zuordnung daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "reihenfolge")
    return <Reihenfolge daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "auswahlquiz")
    return <Auswahlquiz daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "satzbau")
    return <Satzbau daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "bildzuordnung")
    return <Bildzuordnung daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "markieren")
    return <Markieren daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  if (eintrag?.typ === "rechentrainer")
    return <Rechentrainer daten={eintrag.daten} onAbgeschlossen={onAbgeschlossen} />;
  const embed = embedFuer(material);
  if (embed) return <EmbedInhalt material={material} embed={embed} />;
  if (material.art === "video") return <VideoInhalt material={material} />;
  if (material.art === "link") return <LinkInhalt material={material} />;
  if (material.art === "bild" && material.bild)
    return <BildInhalt material={material} />;
  if (material.inhalt) return <Textinhalt text={material.inhalt} />;
  return (
    <p className="ma-leer">Für dieses Material gibt es noch keine Vorschau.</p>
  );
}
