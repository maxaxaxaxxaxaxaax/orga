import { useEffect, useRef } from "react";

// Wir sammeln alle Keys mit Präfix "orga.", damit auch dynamisch erzeugte Keys
// (Etappenplan pro Etappe, Wochenplan pro KW, Tour-Flag usw.) automatisch
// dabei sind, ohne dass diese Liste gepflegt werden muss.
function alleOrgaKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("orga.")) keys.push(k);
  }
  return keys;
}

export default function Einstellungen({
  name,
  setName,
  theme,
  setTheme,
  coach,
  setCoach,
  demoModus,
  setDemoModus,
  onClose,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function exportieren() {
    const daten = {};
    for (const k of alleOrgaKeys()) {
      const v = localStorage.getItem(k);
      if (v != null) daten[k] = v;
    }
    const blob = new Blob([JSON.stringify(daten, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orgatool-daten.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importieren(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const daten = JSON.parse(reader.result);
        for (const [k, v] of Object.entries(daten)) {
          if (k.startsWith("orga.")) localStorage.setItem(k, v);
        }
        window.location.reload();
      } catch {
        window.alert("Die Datei konnte nicht gelesen werden.");
      }
    };
    reader.readAsText(file);
  }

  function zuruecksetzen() {
    if (
      !window.confirm(
        "Wirklich alle Daten zurücksetzen? Etappenplan und Wochenplan werden neu abgefragt."
      )
    ) {
      return;
    }
    for (const k of alleOrgaKeys()) localStorage.removeItem(k);
    // Onboarding-Banner nach Reset überspringen, damit die Planung sofort kommt.
    localStorage.setItem("orga.tourGesehen", "true");
    window.location.reload();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Einstellungen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-kopf">
          <h3 className="modal-titel">Einstellungen</h3>
          <button ref={closeRef} className="modal-x" onClick={onClose} aria-label="Schließen">×</button>
        </div>

        <div className="einst-feld">
          <label className="einst-label" htmlFor="einst-name">Dein Name</label>
          <input
            id="einst-name"
            className="schnell-add-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="einst-feld einst-zeile">
          <span className="einst-label">Darstellung</span>
          <div className="segment">
            <button
              className={"segment-btn" + (theme !== "dunkel" ? " aktiv" : "")}
              onClick={() => setTheme("hell")}
            >
              Hell
            </button>
            <button
              className={"segment-btn" + (theme === "dunkel" ? " aktiv" : "")}
              onClick={() => setTheme("dunkel")}
            >
              Dunkel
            </button>
          </div>
        </div>

        <div className="einst-feld einst-zeile">
          <span className="einst-label">
            Coach-Modus
            <span className="einst-hint">Zeigt Power-Funktionen (Netz, Wochenplaner, Befehle).</span>
          </span>
          <div className="segment">
            <button
              className={"segment-btn" + (!coach ? " aktiv" : "")}
              onClick={() => setCoach(false)}
            >
              Aus
            </button>
            <button
              className={"segment-btn" + (coach ? " aktiv" : "")}
              onClick={() => setCoach(true)}
            >
              An
            </button>
          </div>
        </div>

        <div className="einst-feld einst-zeile">
          <span className="einst-label">
            Demo-Modus
            <span className="einst-hint">
              Startet bei jedem Laden frisch mit dem Etappenplan. Zeigt eine Leiste,
              mit der du durch Wochen und Tage springen kannst.
            </span>
          </span>
          <div className="segment">
            <button
              className={"segment-btn" + (!demoModus ? " aktiv" : "")}
              onClick={() => setDemoModus(false)}
            >
              Aus
            </button>
            <button
              className={"segment-btn" + (demoModus ? " aktiv" : "")}
              onClick={() => setDemoModus(true)}
            >
              An
            </button>
          </div>
        </div>

        <div className="einst-feld">
          <span className="einst-label">Daten</span>
          <div className="einst-btns">
            <button className="mini-btn" onClick={exportieren}>Exportieren</button>
            <label className="mini-btn einst-import">
              Importieren
              <input type="file" accept="application/json" hidden onChange={importieren} />
            </label>
            <button className="mini-btn mini-x" onClick={zuruecksetzen}>Zurücksetzen</button>
          </div>
        </div>
      </div>
    </div>
  );
}
