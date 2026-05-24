// Schwebende Leiste am Bildschirmrand, sichtbar nur im Demo-Modus.
// Mit ihr kann man die App "in der Zeit reisen" lassen: Tag/Woche vor und
// zurück oder zurück auf das echte heutige Datum.
export default function DemoBar({ jetzt, onSetDatum, onReset }) {
  function verschiebe(deltaTage) {
    const d = new Date(jetzt);
    d.setDate(d.getDate() + deltaTage);
    onSetDatum(d.toISOString());
  }

  const datumText = jetzt.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="demo-bar" role="region" aria-label="Demo-Datum">
      <span className="demo-bar-label">Demo</span>
      <div className="demo-bar-buttons">
        <button
          className="demo-bar-btn"
          onClick={() => verschiebe(-7)}
          aria-label="Eine Woche zurück"
          title="Eine Woche zurück"
        >
          ‹‹
        </button>
        <button
          className="demo-bar-btn"
          onClick={() => verschiebe(-1)}
          aria-label="Ein Tag zurück"
          title="Ein Tag zurück"
        >
          ‹
        </button>
        <span className="demo-bar-datum">{datumText}</span>
        <button
          className="demo-bar-btn"
          onClick={() => verschiebe(1)}
          aria-label="Ein Tag vor"
          title="Ein Tag vor"
        >
          ›
        </button>
        <button
          className="demo-bar-btn"
          onClick={() => verschiebe(7)}
          aria-label="Eine Woche vor"
          title="Eine Woche vor"
        >
          ››
        </button>
      </div>
      <button className="demo-bar-reset" onClick={onReset}>
        Heute
      </button>
    </div>
  );
}
