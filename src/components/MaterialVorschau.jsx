import { useEffect, useState } from "react";
import { artLabel, bereichLabel } from "../data/wissen";
import { NotizVorschau } from "./TafelSnap";
import { tafelMockSvg, QUELLE_LABEL } from "../data/tafelDemos";

// Leichte Vorschau für ein Material. Strukturierte Tafel-Notizen werden mit
// dem Original-Tafelfoto links und der aufbereiteten Notiz rechts gezeigt;
// Foto-Spalte ist über einen Toggle ein-/ausblendbar (mobile-tauglich).
// Andere Material-Arten zeigen Platzhalter, weil im Demo keine echten
// Dateiinhalte hinterlegt sind.
export default function MaterialVorschau({ material, onClose }) {
  const [fotoSichtbar, setFotoSichtbar] = useState(true);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const datum = new Date(material.datum).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const istTafelnotiz = material.art === "tafelnotiz" && material.inhalt;
  const fotoHtml = istTafelnotiz
    ? tafelMockSvg(material.fach, material.thema, material.quelle || "tafelbild")
    : null;
  const hatFoto = fotoHtml && fotoHtml.trim().length > 0;
  const quelleText = QUELLE_LABEL[material.quelle || "tafelbild"] || "Foto";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={"modal" + (istTafelnotiz ? " modal-tafelnotiz" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={material.titel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-kopf">
          <span className={"material-art art-" + material.art}>{artLabel[material.art]}</span>
          <h3 className="modal-titel">{material.titel}</h3>
          {istTafelnotiz && hatFoto && (
            <button
              type="button"
              className="material-foto-toggle"
              onClick={() => setFotoSichtbar((v) => !v)}
              aria-pressed={fotoSichtbar}
              aria-label={
                fotoSichtbar
                  ? "Original-Tafelaufschrieb ausblenden"
                  : "Original-Tafelaufschrieb einblenden"
              }
            >
              {fotoSichtbar ? "Foto ausblenden" : "Foto einblenden"}
            </button>
          )}
          <button className="modal-x" onClick={onClose} aria-label="Schließen">×</button>
        </div>
        <p className="modal-meta">
          {material.fach ? material.fach + " · " : ""}
          {material.bereich ? bereichLabel[material.bereich] + " · " : ""}
          {material.thema ? material.thema + " · " : ""}
          {datum}
        </p>
        {istTafelnotiz ? (
          <div
            className={
              "modal-inhalt tafelnotiz-vorschau" +
              (fotoSichtbar && hatFoto ? " mit-foto" : " ohne-foto")
            }
          >
            {fotoSichtbar && hatFoto && (
              <aside className="tafel-spalte tafel-spalte-foto">
                <p className="tafel-spalte-label">Original · {quelleText}</p>
                <div
                  className="tafel-vorher"
                  dangerouslySetInnerHTML={{ __html: fotoHtml }}
                />
                <p className="tafel-vorher-hint">
                  {material.quelle === "arbeitsblatt"
                    ? "So sah dein Arbeitsblatt aus."
                    : material.quelle === "buchseite"
                    ? "So sah die Buchseite aus."
                    : material.quelle === "mitschrift"
                    ? "So sah deine eigene Mitschrift aus."
                    : "So sah die Tafel im Unterricht aus."}
                </p>
              </aside>
            )}
            <main className="tafel-spalte tafel-spalte-notiz">
              <NotizVorschau
                inhalt={material.inhalt}
                fach={material.fach}
                thema={material.thema}
              />
            </main>
          </div>
        ) : (
          <div className="modal-platzhalter">
            <span className="modal-platzhalter-icon">📄</span>
            <p className="modal-platzhalter-text">
              Im Demo sind noch keine Dateiinhalte hinterlegt. Hier würde „{material.titel}"
              geöffnet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
