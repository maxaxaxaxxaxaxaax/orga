// Anzeige-Labels für Material-Arten (geteilt von KbInhalt und Ablage).
export const ART_LABEL = {
  notiz: "Notiz",
  arbeitsblatt: "Arbeitsblatt",
  zusammenfassung: "Zusammenfassung",
  tafelnotiz: "Tafelnotiz",
  pdf: "PDF",
  bild: "Bild",
  lernzettel: "Lernzettel",
  aufschrieb: "Mein Aufschrieb",
  video: "YouTube-Video",
  link: "Webseite",
};

// Feineres Label unter Berücksichtigung der Quelle, damit ein TikTok nicht als
// "YouTube-Video" und ein Instagram-Beitrag nicht als "Webseite" auftaucht.
export function quelleLabel(m) {
  if (!m) return "";
  if (m.quelle === "tiktok") return "TikTok";
  if (m.quelle === "instagram") return "Instagram";
  if (m.quelle === "youtube") return "YouTube-Video";
  return ART_LABEL[m.art] || m.art || "";
}
