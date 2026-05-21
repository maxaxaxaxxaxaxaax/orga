import { student, naechsterKnb } from "../data/schule";
import { stundenHeute, fachFarbe, artLabel } from "../data/stundenplanWoche";
import { typLabel } from "../data/aufgaben";
import { tageBis, formatTage, stundenStatus } from "../lib/zeit";
import Icon from "../components/Icon";

export default function Heute({ jetzt, erledigt, setErledigt, aufgaben = [], name }) {
  const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();
  const heuteStunden = stundenHeute(jetzt);
  const { aktuell, naechste } = stundenStatus(heuteStunden, jetztMin);

  const stunde = jetzt.getHours();
  const gruss = stunde < 11 ? "Guten Morgen" : stunde < 17 ? "Hallo" : "Guten Abend";
  const datumText = jetzt.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const offene = aufgaben
    .map((a) => ({ ...a, tage: tageBis(a.faellig, jetzt), ist: !!erledigt[a.id] }))
    .filter((a) => a.tage <= 7)
    .sort((a, b) => a.tage - b.tage);

  const knbTage = tageBis(naechsterKnb.datum, jetzt);

  function toggle(id) {
    setErledigt((e) => ({ ...e, [id]: !e[id] }));
  }

  return (
    <div className="view">
      <header className="view-kopf">
        <p className="view-datum">{datumText}</p>
        <h1 className="view-titel">{gruss}, {name || student.name}.</h1>
        <p className="view-sub">Klasse {student.klasse} · Lerncoach: {student.tutor}</p>
      </header>

      {/* Fokus: was läuft gerade */}
      <section className="fokus">
        <span className="label label-light fokus-label">
          <Icon name="uhr" size={15} /> Gerade jetzt
        </span>
        {aktuell ? (
          <>
            <h2 className="fokus-titel">{aktuell.fach}</h2>
            <p className="fokus-meta">Raum {aktuell.raum} · bis {aktuell.bis} Uhr</p>
          </>
        ) : naechste ? (
          <>
            <h2 className="fokus-titel">Pause</h2>
            <p className="fokus-meta">Als Nächstes: {naechste.fach} um {naechste.von} Uhr · Raum {naechste.raum}</p>
          </>
        ) : (
          <>
            <h2 className="fokus-titel">Kein Unterricht gerade</h2>
            <p className="fokus-meta">Nutze die Zeit für deine Aufgaben.</p>
          </>
        )}
      </section>

      {/* Zwei Spalten: Mein Tag + Zu erledigen */}
      <div className="zwei-spalten">
        {/* Mein Tag */}
        <section className="panel">
          <div className="panel-kopf">
            <Icon name="kalender" size={16} />
            <h3>Mein Tag</h3>
          </div>
          {heuteStunden.length > 0 ? (
            <ul className="agenda">
              {heuteStunden.map((s, i) => {
                const ist = aktuell && s.von === aktuell.von && s.fach === aktuell.fach;
                const farbe = fachFarbe[s.fach] || "#868e96";
                return (
                  <li key={i} className={"agenda-item" + (ist ? " jetzt" : "")}>
                    <span className="agenda-zeit">{s.von}</span>
                    <span className="agenda-strich" style={{ background: farbe }} />
                    <span className="agenda-fach">
                      {s.fach}
                      {s.art && s.art !== "angeleitet" && (
                        <span className="agenda-tag">{artLabel[s.art]}</span>
                      )}
                    </span>
                    <span className="agenda-raum">{s.raum}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="panel-leer">Heute kein Unterricht. Wochenende!</p>
          )}
        </section>

        {/* Zu erledigen */}
        <section className="panel">
          <div className="panel-kopf">
            <Icon name="aufgaben" size={16} />
            <h3>Zu erledigen</h3>
          </div>

          <div className="frist-karte">
            <span className="frist-karte-label">Nächster Könnensbeweis</span>
            <span className="frist-karte-fach">{naechsterKnb.fach}</span>
            <span className="frist-karte-tage">{formatTage(knbTage)}</span>
          </div>

          {offene.length > 0 ? (
            <ul className="todo">
              {offene.map((a) => {
                const farbe = fachFarbe[a.fach] || "#868e96";
                return (
                  <li key={a.id} className={"todo-item" + (a.ist ? " ist-erledigt" : "")}>
                    <button
                      className={"check" + (a.ist ? " an" : "")}
                      onClick={() => toggle(a.id)}
                      aria-label="Erledigt"
                    >
                      {a.ist ? "✓" : ""}
                    </button>
                    <div className="todo-text">
                      <p className="todo-titel">{a.titel}</p>
                      <p className="todo-meta">
                        <span className="fach-chip" style={{ "--c": farbe }}>{a.fach}</span>
                        {typLabel[a.typ]}
                      </p>
                    </div>
                    <span className={"frist" + (a.tage <= 0 ? " dringend" : "")}>
                      {formatTage(a.tage)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="panel-leer">Nichts offen. Stark!</p>
          )}
        </section>
      </div>
    </div>
  );
}
