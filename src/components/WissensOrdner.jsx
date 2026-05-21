import { useRef, useState } from "react";
import { artLabel, bereichLabel } from "../data/wissen";

export default function WissensOrdner({ fach, dokumente, onUpload, onMove, onDelete }) {
  const [register, setRegister] = useState("unterricht");
  const [ueber, setUeber] = useState(false);
  const inputRef = useRef(null);

  const zahl = (b) => dokumente.filter((d) => d.bereich === b).length;

  // Dokumente des aktiven Registers nach Thema gruppieren (Themen-Reihenfolge, Eingang zuletzt).
  const imRegister = dokumente.filter((d) => d.bereich === register);
  const themenOrder = [...fach.themen.map((t) => t.label), "Eingang"];
  const themen = [...new Set(imRegister.map((d) => d.thema))].sort(
    (a, b) => {
      const ia = themenOrder.indexOf(a);
      const ib = themenOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    }
  );

  function dateienWaehlen(e) {
    const files = [...(e.target.files || [])];
    if (files.length) onUpload(files);
    e.target.value = "";
  }
  function onDrop(e) {
    e.preventDefault();
    setUeber(false);
    const files = [...(e.dataTransfer.files || [])];
    if (files.length) onUpload(files);
  }

  return (
    <div className="ordner">
      {/* Register-Reiter */}
      <div className="register-reiter">
        {["unterricht", "selbstlernen"].map((b) => (
          <button
            key={b}
            className={"reiter" + (register === b ? " aktiv" : "")}
            style={{ "--c": fach.farbe }}
            onClick={() => setRegister(b)}
          >
            {bereichLabel[b]}
            <span className="reiter-zahl">{zahl(b)}</span>
          </button>
        ))}
      </div>

      {/* Upload in dieses Fach */}
      <div
        className={"dropzone" + (ueber ? " ueber" : "")}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setUeber(true)}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setUeber(false);
        }}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple hidden onChange={dateienWaehlen} />
        <strong>+ Dokument hinzufügen</strong>
        <span>Datei hierher ziehen oder klicken · wird automatisch einsortiert</span>
      </div>

      {/* Inhalt des Registers */}
      {themen.length === 0 ? (
        <p className="panel-leer">Noch nichts unter „{bereichLabel[register]}“.</p>
      ) : (
        themen.map((thema) => (
          <div className="thema-block" key={thema}>
            <h3 className="thema-titel">{thema}</h3>
            <ul className="material-liste">
              {imRegister
                .filter((d) => d.thema === thema)
                .map((d) => (
                  <li key={d.id} className="material">
                    <span className={"material-art art-" + d.art}>{artLabel[d.art]}</span>
                    <span className="material-titel">
                      {d.titel}
                      {d.uploaded && <span className="neu-badge">hochgeladen</span>}
                    </span>
                    <span className="material-datum">
                      {new Date(d.datum).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                    </span>
                    {d.uploaded && (
                      <span className="material-aktionen">
                        <button
                          className="mini-btn"
                          onClick={() =>
                            onMove(d.id, d.bereich === "unterricht" ? "selbstlernen" : "unterricht")
                          }
                        >
                          → {d.bereich === "unterricht" ? "Selbstlernen" : "Unterricht"}
                        </button>
                        <button
                          className="mini-btn mini-x"
                          onClick={() => onDelete(d.id)}
                          aria-label="Löschen"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
