import { useEffect, useRef, useState } from "react";
import { student, naechsterKnb } from "../data/schule";
import { stundenHeute, fachFarbe } from "../data/stundenplanWoche";
import { nachrichten } from "../data/nachrichten";
import { faecherKompetenz } from "../data/fortschritt";
import { bereichLabel } from "../data/wissen";
import { tageBis, formatTage, stundenStatus } from "../lib/zeit";
import Icon from "../components/Icon";
import Tagesfokus from "../components/Tagesfokus";

// Eine klickbare Kachel: ganze Fläche öffnet die Seite.
function Kachel({ id, icon, titel, onOpen, children }) {
  return (
    <div
      className="kachel"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(id)}
    >
      <span className="kachel-kopf">
        <Icon name={icon} size={18} className="kachel-icon" />
        <span className="kachel-titel">{titel}</span>
        <span className="kachel-pfeil">→</span>
      </span>
      <span className="kachel-body">{children}</span>
    </div>
  );
}

// Wissen-Ablage: Datei per Drag & Drop + Schnellnotiz, beides automatisch einsortiert.
function AblageKachel({ onOpen, addDokumente, addNotiz }) {
  const [ueber, setUeber] = useState(false);
  const [notiz, setNotiz] = useState("");
  const [feedback, setFeedback] = useState(null);
  const fileRef = useRef(null);

  function zeige(doc) {
    setFeedback(`abgelegt in ${doc.fach} · ${bereichLabel[doc.bereich]}`);
  }
  function dateienWaehlen(e) {
    const files = [...(e.target.files || [])];
    if (files.length) zeige(addDokumente(files)[0]);
    e.target.value = "";
  }
  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setUeber(false);
    const files = [...(e.dataTransfer.files || [])];
    if (files.length) zeige(addDokumente(files)[0]);
  }
  function notizAblegen(e) {
    e.stopPropagation();
    if (!notiz.trim()) return;
    zeige(addNotiz(notiz));
    setNotiz("");
  }

  return (
    <div
      className={"kachel ablage-kachel" + (ueber ? " ueber" : "")}
      role="button"
      tabIndex={0}
      onClick={() => onOpen("wissen")}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen("wissen")}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setUeber(true)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setUeber(false);
      }}
      onDrop={onDrop}
    >
      <span className="kachel-kopf">
        <Icon name="wissen" size={18} className="kachel-icon" />
        <span className="kachel-titel">Wissen</span>
        <span className="kachel-pfeil">→</span>
      </span>
      <span className="kachel-body">
        <span className="ablage-zeile" onClick={(e) => e.stopPropagation()}>
          <span className="ablage-hint">
            {ueber ? "Datei loslassen – wird einsortiert" : "Datei ziehen oder wählen – automatisch einsortiert"}
          </span>
          <input ref={fileRef} type="file" multiple hidden onChange={dateienWaehlen} />
          <button className="mini-btn" onClick={() => fileRef.current?.click()}>Datei wählen</button>
        </span>
        <span className="ablage-notiz" onClick={(e) => e.stopPropagation()}>
          <input
            className="ablage-input"
            placeholder="Schnell-Notiz festhalten …"
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && notizAblegen(e)}
          />
          <button className="mini-btn" onClick={notizAblegen}>Ablegen</button>
        </span>
        {feedback && <span className="ablage-feedback">✓ {feedback}</span>}
      </span>
    </div>
  );
}

// Fokus-/Lerntimer (öffnet keine Seite).
function FokusTimer() {
  const presets = [25, 15, 5];
  const [minuten, setMinuten] = useState(25);
  const [sek, setSek] = useState(25 * 60);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    if (!laeuft) return;
    const id = setInterval(() => setSek((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [laeuft]);

  const fertig = sek === 0;
  const mm = String(Math.floor(sek / 60)).padStart(2, "0");
  const ss = String(sek % 60).padStart(2, "0");
  const setze = (m) => {
    setMinuten(m);
    setSek(m * 60);
    setLaeuft(false);
  };
  const reset = () => {
    setSek(minuten * 60);
    setLaeuft(false);
  };

  return (
    <div className="kachel kachel-timer">
      <span className="kachel-kopf">
        <Icon name="uhr" size={18} className="kachel-icon" />
        <span className="kachel-titel">Fokus</span>
      </span>
      <div className="timer-zeit">{mm}:{ss}</div>
      {fertig ? (
        <p className="timer-fertig">★ Geschafft! Gönn dir eine Pause.</p>
      ) : (
        <div className="timer-presets">
          {presets.map((m) => (
            <button
              key={m}
              className={"timer-preset" + (m === minuten ? " aktiv" : "")}
              onClick={() => setze(m)}
            >
              {m} Min
            </button>
          ))}
        </div>
      )}
      <div className="timer-btns">
        <button
          className="timer-haupt"
          onClick={() => (fertig ? reset() : setLaeuft((l) => !l))}
        >
          {fertig ? "Neu starten" : laeuft ? "Pause" : "Start"}
        </button>
        <button className="timer-reset" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

export default function Dashboard({
  jetzt,
  onOpen,
  erledigt,
  setErledigt,
  gelesen,
  setGelesen,
  addDokumente,
  addNotiz,
  lernschritte = {},
  aufgaben = [],
  name,
  showSchritt = 0,
}) {
  const datum = jetzt.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const stunde = jetzt.getHours();
  const gruss = stunde < 11 ? "Guten Morgen" : stunde < 17 ? "Hallo" : "Guten Abend";

  const heuteStunden = stundenHeute(jetzt);
  const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();
  const { aktuell, naechste } = stundenStatus(heuteStunden, jetztMin);

  const offene = aufgaben
    .map((a) => ({ ...a, tage: tageBis(a.faellig, jetzt), ist: !!erledigt[a.id] }))
    .filter((a) => !a.ist)
    .sort((a, b) => a.tage - b.tage);
  const heuteListe = offene.filter((a) => a.tage <= 0);
  const heuteFaellig = heuteListe.length;

  const ungeleseneListe = nachrichten.filter((n) => !n.gelesen && !gelesen[n.id]);
  const topNachricht = ungeleseneListe[0];

  const erbracht = faecherKompetenz.reduce((s, f) => s + f.erbracht, 0);
  const gesamtKB = faecherKompetenz.reduce((s, f) => s + f.gesamt, 0);
  const imAufbau = faecherKompetenz.find((f) => f.stand === "aufbau");

  const knbTage = tageBis(naechsterKnb.datum, jetzt);

  return (
    <div className="view dashboard-view">
      <header className="view-kopf">
        <p className="view-datum">{datum}</p>
        <h1 className="view-titel">{gruss}, {name || student.name}.</h1>
        <p className="view-sub">Deine Übersicht auf einen Blick.</p>
      </header>

      <Tagesfokus
        jetzt={jetzt}
        erledigt={erledigt}
        lernschritte={lernschritte}
        aufgaben={aufgaben}
        onOpen={onOpen}
      />

      {showSchritt === 3 && (
        <div className="neuer-tag">
          <Icon name="heute" size={18} />
          <span><strong>Neuer Tag.</strong> Das steht heute an — hake alles ab!</span>
        </div>
      )}

      <div className="kacheln">
        <Kachel id="heute" icon="heute" titel="Heute" onOpen={onOpen}>
          <span className="kachel-haupt">{heuteFaellig} Aufgaben heute fällig</span>
          <span className="kachel-meta">
            Nächster Könnensbeweis: {naechsterKnb.fach} · {formatTage(knbTage)}
          </span>
        </Kachel>

        <Kachel id="kalender" icon="kalender" titel="Stundenplan" onOpen={onOpen}>
          {aktuell ? (
            <>
              <span className="kachel-haupt">Jetzt: {aktuell.fach}</span>
              <span className="kachel-meta">Raum {aktuell.raum} · bis {aktuell.bis} Uhr</span>
            </>
          ) : naechste ? (
            <>
              <span className="kachel-haupt">Als Nächstes: {naechste.fach}</span>
              <span className="kachel-meta">{naechste.von} Uhr · Raum {naechste.raum}</span>
            </>
          ) : (
            <span className="kachel-haupt">Kein Unterricht mehr heute</span>
          )}
        </Kachel>

        <Kachel id="aufgaben" icon="aufgaben" titel="Aufgaben" onOpen={onOpen}>
          <span className="kachel-haupt">{offene.length} offen · {heuteFaellig} heute</span>
          {heuteListe.length > 0 ? (
            <span className="kachel-checkliste" onClick={(e) => e.stopPropagation()}>
              {heuteListe.map((a) => (
                <span className="kachel-zeile" key={a.id}>
                  <button
                    className="check klein"
                    onClick={() => setErledigt((m) => ({ ...m, [a.id]: true }))}
                    aria-label="Erledigt"
                  />
                  <span className="kachel-zeile-text">
                    <span className="fach-chip" style={{ "--c": fachFarbe[a.fach] || "#868e96" }}>
                      {a.fach}
                    </span>
                    {a.titel}
                  </span>
                </span>
              ))}
            </span>
          ) : (
            <span className="kachel-meta">Heute alles erledigt. Stark!</span>
          )}
        </Kachel>

        <Kachel id="kommunikation" icon="kommunikation" titel="Nachrichten" onOpen={onOpen}>
          <span className="kachel-haupt">{ungeleseneListe.length} ungelesen</span>
          {topNachricht ? (
            <span className="kachel-zeile" onClick={(e) => e.stopPropagation()}>
              <span className="kachel-zeile-text">
                <strong>{topNachricht.von}:</strong> {topNachricht.betreff}
              </span>
              <button
                className="mini-btn"
                onClick={() => setGelesen((m) => ({ ...m, [topNachricht.id]: true }))}
              >
                gelesen
              </button>
            </span>
          ) : (
            <span className="kachel-meta">Keine neuen Nachrichten.</span>
          )}
        </Kachel>

        <AblageKachel onOpen={onOpen} addDokumente={addDokumente} addNotiz={addNotiz} />

        <Kachel id="entwicklung" icon="entwicklung" titel="Fortschritt" onOpen={onOpen}>
          <span className="kachel-haupt">{erbracht} von {gesamtKB} Könnensbeweisen</span>
          <span className="kachel-meta">
            {imAufbau ? `Im Aufbau: ${imAufbau.fach}` : "Du bist gut dabei!"}
          </span>
        </Kachel>

        <FokusTimer />
      </div>
    </div>
  );
}
