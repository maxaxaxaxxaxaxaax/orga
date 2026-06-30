// Gemeinsame Typ-Icons für Materialien, geteilt von Ablage und Fokus (eine
// Quelle, gleiche visuelle Sprache). currentColor + stroke 2, damit sie sich der
// Umgebung anpassen. Nur Komponenten exportieren (Fast Refresh); Daten und Helfer
// liegen in materialTypen.js.

import Icon from "./Icon";

export function IcLernweg(p) {
  return <Icon name="lernweg" width={18} height={18} {...p} />;
}
export function IcAufgabe(p) {
  return <Icon name="task" width={18} height={18} {...p} />;
}
export function IcTafel(p) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 21l2-4M16 21l-2-4" />
    </svg>
  );
}
export function IcNotiz(p) {
  return <Icon name="document" width={18} height={18} {...p} />;
}
export function IcBuch(p) {
  return <Icon name="book" width={18} height={18} {...p} />;
}
export function IcKi(p) {
  return <Icon name="ai" width={18} height={18} {...p} />;
}
