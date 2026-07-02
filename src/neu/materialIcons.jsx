// Gemeinsame Typ-Icons für Materialien, geteilt von Ablage und Fokus (eine
// Quelle, gleiche visuelle Sprache). currentColor + einheitliche Strichstärke 1.8
// (betonte Stufe für kleine 18px-Icons), damit sie sich der Umgebung anpassen.
// Nur Komponenten exportieren (Fast Refresh); Daten und Helfer liegen in
// materialTypen.js.

import Icon from "./Icon";

export function IcLernweg(p) {
  return <Icon name="lernweg" width={18} height={18} strokeWidth={1.8} {...p} />;
}
export function IcAufgabe(p) {
  return <Icon name="task" width={18} height={18} strokeWidth={1.8} {...p} />;
}
export function IcTafel(p) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 21l2-4M16 21l-2-4" />
    </svg>
  );
}
export function IcNotiz(p) {
  return <Icon name="document" width={18} height={18} strokeWidth={1.8} {...p} />;
}
export function IcBuch(p) {
  return <Icon name="book" width={18} height={18} strokeWidth={1.8} {...p} />;
}
export function IcKi(p) {
  return <Icon name="ai" width={18} height={18} strokeWidth={1.8} {...p} />;
}
export function IcVideo(p) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M10 9.4l5 2.6-5 2.6z" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IcLink(p) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}
