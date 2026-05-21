import { useState } from "react";
import { nachrichten, rolleFarbe } from "../data/nachrichten";

const filter = [
  { key: "alle", label: "Alle" },
  { key: "aktion", label: "Antwort nötig" },
  { key: "lehrer", label: "Lehrkräfte" },
  { key: "klasse", label: "Klasse" },
  { key: "schule", label: "Schule" },
];

function initialen(name) {
  const teile = name.replace(/[„“]/g, "").split(" ");
  if (teile.length === 1) return teile[0].slice(0, 2).toUpperCase();
  return (teile[0][0] + teile[1][0]).toUpperCase();
}

export default function Nachrichten({ gelesen, setGelesen }) {
  const [aktiv, setAktiv] = useState("alle");
  const [offenId, setOffenId] = useState(null);
  const [antwort, setAntwort] = useState("");
  const [gesendet, setGesendet] = useState({});

  const liste = nachrichten.filter((n) =>
    aktiv === "alle" ? true : aktiv === "aktion" ? n.aktion : n.kategorie === aktiv
  );
  const ungelesen = nachrichten.filter((n) => !n.gelesen && !gelesen[n.id]).length;
  const offen = nachrichten.find((n) => n.id === offenId);

  function oeffnen(n) {
    setOffenId(n.id);
    setAntwort("");
    setGelesen((g) => ({ ...g, [n.id]: true }));
  }
  function senden(e) {
    e.preventDefault();
    if (!antwort.trim()) return;
    setGesendet((g) => ({ ...g, [offenId]: true }));
    setAntwort("");
  }

  // Detailansicht einer Nachricht.
  if (offen) {
    const farbe = rolleFarbe[offen.kategorie];
    return (
      <div className="view">
        <button className="zurueck-btn" onClick={() => setOffenId(null)}>← Zurück zum Posteingang</button>
        <article className="nachricht-detail">
          <header className="nd-kopf">
            <span className="nachricht-avatar gross" style={{ background: farbe }}>
              {initialen(offen.von)}
            </span>
            <div className="nd-kopf-text">
              <h1 className="nd-betreff">{offen.betreff}</h1>
              <p className="nd-von">
                <strong>{offen.von}</strong> · {offen.rolle} · {offen.zeit}
              </p>
            </div>
            {offen.aktion && <span className="aktion-badge">Antwort nötig</span>}
          </header>
          <div className="nd-text">{offen.text || offen.vorschau}</div>

          {offen.aktion && (
            <form className="nd-antwort" onSubmit={senden}>
              {gesendet[offen.id] ? (
                <p className="nd-gesendet">✓ Antwort gesendet (Demo).</p>
              ) : (
                <>
                  <label className="nd-antwort-label">Antworten</label>
                  <textarea
                    className="nd-antwort-feld"
                    rows={3}
                    placeholder="Deine Antwort …"
                    value={antwort}
                    onChange={(e) => setAntwort(e.target.value)}
                  />
                  <div className="nd-antwort-btns">
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() => setAntwort("Vielen Dank für die Info! ")}
                    >
                      Vorlage einfügen
                    </button>
                    <button type="submit" className="schnell-add-btn" disabled={!antwort.trim()}>
                      Senden
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="view">
      <header className="view-kopf">
        <h1 className="view-titel">Nachrichten</h1>
        <p className="view-sub">
          Alles an einem Ort{ungelesen > 0 ? ` · ${ungelesen} ungelesen` : ""}
        </p>
      </header>

      <div className="filter-zeile">
        {filter.map((f) => (
          <button
            key={f.key}
            className={"filter-btn" + (aktiv === f.key ? " aktiv" : "")}
            onClick={() => setAktiv(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="inbox">
        {liste.length === 0 ? (
          <p className="panel-leer" style={{ padding: "18px" }}>Keine Nachrichten in dieser Ansicht.</p>
        ) : (
          liste.map((n) => {
            const ist = n.gelesen || gelesen[n.id];
            const farbe = rolleFarbe[n.kategorie];
            return (
              <button
                key={n.id}
                className={"nachricht" + (ist ? "" : " ungelesen")}
                onClick={() => oeffnen(n)}
              >
                <span className="nachricht-punkt">{!ist && <span className="punkt" />}</span>
                <span className="nachricht-avatar" style={{ background: farbe }}>
                  {initialen(n.von)}
                </span>
                <span className="nachricht-mitte">
                  <span className="nachricht-kopf">
                    <span className="nachricht-von">{n.von}</span>
                    <span className="nachricht-rolle">{n.rolle}</span>
                  </span>
                  <span className="nachricht-betreff">{n.betreff}</span>
                  <span className="nachricht-vorschau">{n.vorschau}</span>
                </span>
                <span className="nachricht-rechts">
                  <span className="nachricht-zeit">{n.zeit}</span>
                  {n.aktion && <span className="aktion-badge">Antwort nötig</span>}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
