import "./LeerZustand.css";

// Wiederverwendbarer Leer-Zustand für Flächen ohne Inhalt: zentriert einen kurzen
// Titel und einen leisen Untertitel (ohne Icon, bewusst schlicht).
// kompakt = kleinere Variante für enge Boxen (z. B. Dashboard-Kacheln).
export default function LeerZustand({ titel, text, kompakt = false }) {
  return (
    <div className={"leerzustand" + (kompakt ? " kompakt" : "")}>
      {titel && <p className="leerzustand-titel">{titel}</p>}
      {text && <p className="leerzustand-text">{text}</p>}
    </div>
  );
}
