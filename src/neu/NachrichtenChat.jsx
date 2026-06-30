import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./NachrichtenChat.css";

// Chat-Fenster mit der Lerncoach (Fr. Berg). Öffnet sich, wenn man in der
// Nachrichten-Box auf eine Nachricht tippt: die Mitteilungen erscheinen als
// Verlauf (älteste zuerst), darunter ein einfaches Antwortfeld. Demo ohne
// Backend: eine Antwort fügt eine eigene Blase hinzu, die Coach bestätigt ruhig.
export default function NachrichtenChat({ mitteilungen, onClose }) {
  // Die Liste kommt neueste-zuerst; im Chat lesen wir von oben (alt) nach unten (neu).
  const [verlauf, setVerlauf] = useState(() =>
    [...mitteilungen].reverse().map((m) => ({ von: "coach", text: m.text, zeit: m.zeit }))
  );
  const [eingabe, setEingabe] = useState("");
  const endeRef = useRef(null);

  // Beim Öffnen und nach jeder neuen Blase ans Ende scrollen.
  useEffect(() => {
    endeRef.current?.scrollIntoView({ block: "end" });
  }, [verlauf]);

  // Schließen mit Escape.
  useEffect(() => {
    const aufTaste = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", aufTaste);
    return () => window.removeEventListener("keydown", aufTaste);
  }, [onClose]);

  function senden(e) {
    e.preventDefault();
    const t = eingabe.trim();
    if (!t) return;
    setEingabe("");
    setVerlauf((v) => [...v, { von: "ich", text: t, zeit: "jetzt" }]);
    // Demo: ruhige Bestätigung der Coach, kein echtes Backend.
    setTimeout(() => {
      setVerlauf((v) => [
        ...v,
        {
          von: "coach",
          text: "Alles klar, Max. Ich schau es mir an und melde mich.",
          zeit: "jetzt",
        },
      ]);
    }, 700);
  }

  return createPortal(
    <div className="nc-backdrop" onClick={onClose}>
      <section
        className="nc"
        role="dialog"
        aria-label="Chat mit Fr. Berg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="nc-kopf">
          <span className="nc-avatar" aria-hidden="true">
            B
          </span>
          <span className="nc-wer">
            <span className="nc-name">Fr. Berg</span>
            <span className="nc-rolle">Lerncoach</span>
          </span>
          <button
            type="button"
            className="nc-schliessen"
            onClick={onClose}
            aria-label="Schließen"
          >
            ✕
          </button>
        </header>

        <div className="nc-verlauf">
          {verlauf.map((m, i) => (
            <div key={i} className={"nc-msg nc-" + m.von}>
              <p className="nc-text">{m.text}</p>
              <span className="nc-zeit">{m.zeit}</span>
            </div>
          ))}
          <div ref={endeRef} />
        </div>

        <form className="nc-eingabe" onSubmit={senden}>
          <input
            type="text"
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            placeholder="Nachricht an Fr. Berg…"
            aria-label="Nachricht schreiben"
            autoFocus
          />
          <button
            type="submit"
            className="nc-senden"
            aria-label="Senden"
            disabled={!eingabe.trim()}
          >
            →
          </button>
        </form>
      </section>
    </div>,
    document.body
  );
}
