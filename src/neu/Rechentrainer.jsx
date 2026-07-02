import { useEffect, useRef, useState } from "react";
import Fertig from "./Fertig";
import UebungHinweis from "./UebungHinweis";
import "./Rechentrainer.css";

// Rechen-Trainer für negative Zahlen: der Schüler TIPPT das Ergebnis (echte
// Produktion statt Multiple Choice), die Aufgaben werden bei jedem Durchlauf neu
// erzeugt (kein Auswendiglernen der Lösungen). Bei einem Fehler kommt erst eine
// diagnostische Hilfe und ein zweiter Versuch, dann die Auflösung. Für Plus/Minus
// lässt sich der Zahlenstrahl als Stütze einblenden. Nicht auf Anhieb gelöste
// Aufgaben kommen am Ende erneut dran (Mastery).

const fmt = (n) => (n < 0 ? `−${Math.abs(n)}` : String(n));
// Zweiter Operand mit Klammer, wenn negativ (wie in den Aufgabentexten).
const klammer = (n) => (n < 0 ? `(${fmt(n)})` : fmt(n));
const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Plus/Minus: Ergebnis und erster Summand im Bereich, zweiter daraus abgeleitet.
// Es muss ein negatives Vorzeichen oder ein Überschreiten der Null vorkommen,
// sonst ist die Aufgabe für dieses Thema zu leicht.
function baueAddSub(von, bis) {
  for (let i = 0; i < 60; i++) {
    const op = wahl(["+", "−"]);
    const a = rnd(von, bis);
    const r = rnd(von, bis);
    const b = op === "+" ? r - a : a - r;
    if (b < von || b > bis || b === 0 || a === 0) continue;
    if (a > 0 && b > 0 && r > 0) continue; // rein positiv: zu leicht
    return { art: "addsub", a, b, op, r, term: `${fmt(a)} ${op} ${klammer(b)}` };
  }
  return { art: "addsub", a: -3, b: 7, op: "+", r: 4, term: "−3 + 7" };
}

// Mal/Geteilt: einstellige Beträge, Division geht glatt auf. Vorzeichen zufällig,
// damit alle vier Kombinationen vorkommen.
function baueMulDiv() {
  const op = wahl(["·", ":"]);
  let vz1 = wahl([1, -1]);
  let vz2 = wahl([1, -1]);
  // Mindestens ein negatives Vorzeichen, sonst übt die Aufgabe die Vorzeichenregel
  // nicht (rein positiv wäre für dieses Thema sinnlos).
  if (vz1 === 1 && vz2 === 1) {
    if (Math.random() < 0.5) vz1 = -1;
    else vz2 = -1;
  }
  if (op === "·") {
    const a = vz1 * rnd(2, 9);
    const b = vz2 * rnd(2, 9);
    return { art: "muldiv", a, b, op, r: a * b, term: `${fmt(a)} ${op} ${klammer(b)}` };
  }
  const b = vz2 * rnd(2, 9); // Divisor
  const r = vz1 * rnd(2, 9); // Ergebnis
  const a = b * r; // Dividend (glatt teilbar)
  return { art: "muldiv", a, b, op, r, term: `${fmt(a)} ${op} ${klammer(b)}` };
}

function baueItems(daten) {
  const modus = daten?.modus || "addsub";
  const anzahl = daten?.anzahl ?? 8;
  const von = daten?.von ?? -10;
  const bis = daten?.bis ?? 10;
  const items = [];
  let schutz = 0;
  while (items.length < anzahl && schutz < anzahl * 25) {
    schutz++;
    let it;
    if (modus === "muldiv") it = baueMulDiv();
    else if (modus === "gemischt")
      it = Math.random() < 0.5 ? baueAddSub(von, bis) : baueMulDiv();
    else it = baueAddSub(von, bis);
    if (items.some((x) => x.term === it.term)) continue; // keine Dopplung
    items.push(it);
  }
  return items;
}

// Diagnostische Hilfe nach dem ersten Fehler: benennt den wahrscheinlichen
// Denkfehler, ohne die Lösung zu verraten.
function diagnose(it, u) {
  const betragOk = Math.abs(u) === Math.abs(it.r);
  if (it.art === "addsub") {
    if (betragOk)
      return "Der Betrag stimmt, nur das Vorzeichen nicht. Welche der beiden Zahlen hat den größeren Betrag? Ihr Vorzeichen bekommt das Ergebnis.";
    if (u === it.a + it.b || u === it.a - it.b)
      return "Achte auf die Zeichen: löse zuerst das Doppelzeichen auf. „− (−)“ wird „+“, „+ (−)“ wird „−“. Dann rechne weiter.";
    return "Geh in Schritten vor: Plus heißt auf dem Zahlenstrahl nach rechts, Minus nach links. Blende die Linie unten ein und zähle mit.";
  }
  if (betragOk)
    return "Der Betrag stimmt. Bestimme nur noch das Vorzeichen: gleiche Vorzeichen ergeben Plus, verschiedene ergeben Minus.";
  if (u === it.a + it.b || u === it.a - it.b)
    return "Hier wird mal- oder geteilt-gerechnet, nicht plus oder minus. Rechne erst die Beträge, dann das Vorzeichen.";
  return "Zwei Schritte: erst das Vorzeichen (gleich = plus, verschieden = minus), dann die Beträge mal oder geteilt.";
}

// Ausführliche Auflösung nach dem zweiten Fehler.
function loesungsweg(it) {
  if (it.art === "addsub") {
    const net = it.op === "+" ? it.b : -it.b;
    const richtung = net >= 0 ? "nach rechts" : "nach links";
    return `Doppelzeichen auflösen: ${it.term} = ${fmt(it.a)} ${net >= 0 ? "+" : "−"} ${Math.abs(net)}. Von ${fmt(it.a)} ${Math.abs(net)} Schritte ${richtung}: ${fmt(it.r)}.`;
  }
  const gleich = it.a < 0 === it.b < 0;
  const zeichen = it.op === "·" ? "mal" : "geteilt durch";
  return `Vorzeichen: ${gleich ? "gleich, also Plus" : "verschieden, also Minus"}. Beträge: ${Math.abs(it.a)} ${zeichen} ${Math.abs(it.b)} = ${Math.abs(it.r)}. Ergebnis: ${fmt(it.r)}.`;
}

function parse(str) {
  const t = (str || "").replace(/−/g, "-").replace(/[^0-9-]/g, "");
  if (t === "" || t === "-") return null;
  const n = parseInt(t, 10);
  return Number.isNaN(n) ? null : n;
}

// Ruhiger Hilfs-Zahlenstrahl (nicht klickbar), zeigt die Startzahl als Anker.
function MiniStrahl({ von, bis, start }) {
  const pct = (w) => ((w - von) / (bis - von)) * 100;
  const ticks = [];
  for (let w = von; w <= bis; w++) ticks.push(w);
  return (
    <div className="rt-strahl" aria-hidden="true">
      <span className="rt-achse" />
      {ticks.map((w) => (
        <span key={w} className="rt-tick" style={{ left: pct(w) + "%" }}>
          <span className={"rt-strich" + (w === 0 ? " null" : "")} />
          <span className={"rt-zahl" + (w === 0 ? " null" : "")}>{fmt(w)}</span>
        </span>
      ))}
      {start != null && (
        <span className="rt-start" style={{ left: pct(start) + "%" }}>
          <span className="rt-start-punkt" />
          <span className="rt-start-text">Start {fmt(start)}</span>
        </span>
      )}
    </div>
  );
}

export default function Rechentrainer({ daten, onAbgeschlossen }) {
  const von = daten?.von ?? -10;
  const bis = daten?.bis ?? 10;
  const strahlAn = daten?.strahl !== false;

  const [s, setS] = useState(() => {
    const q = baueItems(daten);
    return { durchgang: 1, queue: q, pos: 0, falsche: [], startAnzahl: q.length };
  });
  const [eingabe, setEingabe] = useState("");
  const [versuch, setVersuch] = useState(0);
  const [status, setStatus] = useState(null); // null | "ok" | "fehler" | "aufgeloest"
  const [hinweis, setHinweis] = useState("");
  const [serie, setSerie] = useState(0);
  const [besteSerie, setBesteSerie] = useState(0);
  const [aufAnhieb, setAufAnhieb] = useState(0);
  const [strahlOffen, setStrahlOffen] = useState(false);
  const [fertig, setFertig] = useState(false);
  const eingabeRef = useRef(null);

  // Bei jeder neuen Aufgabe ins Eingabefeld springen.
  useEffect(() => {
    if (!fertig) eingabeRef.current?.focus();
  }, [s.pos, s.durchgang, fertig]);

  if (s.startAnzahl === 0)
    return <p className="rt-leer">Keine Aufgaben.</p>;

  function neuStarten() {
    const q = baueItems(daten);
    setS({ durchgang: 1, queue: q, pos: 0, falsche: [], startAnzahl: q.length });
    setEingabe("");
    setVersuch(0);
    setStatus(null);
    setHinweis("");
    setSerie(0);
    setBesteSerie(0);
    setAufAnhieb(0);
    setStrahlOffen(false);
    setFertig(false);
  }

  if (fertig) {
    const allesAufAnhieb = aufAnhieb === s.startAnzahl;
    return (
      <div className="rt">
        <Fertig
          text={`Alle ${s.startAnzahl} Aufgaben gerechnet.`}
          bilanz={
            (allesAufAnhieb
              ? "Jede auf Anhieb richtig. Stark gerechnet."
              : "Die kniffligen hast du nachgearbeitet, jetzt sitzen sie.") +
            (besteSerie >= 3 ? ` Beste Serie: ${besteSerie} nacheinander.` : "")
          }
          nochmalLabel="Neue Aufgaben"
          onNochmal={neuStarten}
        />
      </div>
    );
  }

  const it = s.queue[s.pos];
  const beantwortet = status === "ok" || status === "aufgeloest";
  const istNacharbeit = s.durchgang > 1;
  const proz = Math.round((s.pos / s.queue.length) * 100);
  const zeigeStrahl = strahlAn && it.art === "addsub";
  const eingabeStatus =
    status === "ok" ? " ok" : status === "fehler" || status === "aufgeloest" ? " no" : "";

  function pruefe(e) {
    e.preventDefault();
    if (beantwortet) return;
    const u = parse(eingabe);
    if (u === null) return;
    if (u === it.r) {
      setStatus("ok");
      if (versuch === 0) {
        setAufAnhieb((v) => v + 1);
        const n = serie + 1;
        setSerie(n);
        if (n > besteSerie) setBesteSerie(n);
      } else {
        setSerie(0);
      }
    } else if (versuch === 0) {
      setVersuch(1);
      setStatus("fehler");
      setHinweis(diagnose(it, u));
      setSerie(0);
    } else {
      setStatus("aufgeloest");
      setSerie(0);
    }
  }

  function weiter() {
    const ersterOk = status === "ok" && versuch === 0;
    const neueFalsche =
      ersterOk || s.falsche.includes(it) ? s.falsche : [...s.falsche, it];
    const naechste = s.pos + 1;
    if (naechste < s.queue.length) {
      setS({ ...s, pos: naechste, falsche: neueFalsche });
    } else if (neueFalsche.length > 0) {
      setS({
        durchgang: s.durchgang + 1,
        queue: neueFalsche,
        pos: 0,
        falsche: [],
        startAnzahl: s.startAnzahl,
      });
    } else {
      setFertig(true);
      onAbgeschlossen?.();
    }
    setEingabe("");
    setVersuch(0);
    setStatus(null);
    setHinweis("");
    setStrahlOffen(false);
  }

  const weiterLabel =
    s.pos + 1 < s.queue.length
      ? "Weiter →"
      : s.falsche.length > 0 || !(status === "ok" && versuch === 0)
        ? "Zur Nacharbeit →"
        : "Fertig →";

  return (
    <div className="rt">
      <div className="rt-kopf">
        <span className="rt-label">
          {istNacharbeit ? "Nochmal" : "Aufgabe"} {s.pos + 1} / {s.queue.length}
        </span>
        {serie >= 2 && (
          <span className="rt-serie" aria-label={`${serie} richtig in Folge`}>
            {serie} in Folge
          </span>
        )}
      </div>
      <div className="rt-fortschritt" aria-hidden="true">
        <div
          className="rt-fortschritt-fuell"
          style={{ transform: `scaleX(${proz / 100})` }}
        />
      </div>

      {istNacharbeit && s.pos === 0 && (
        <p className="rt-nacharbeit">Diese noch einmal, dann sitzen sie.</p>
      )}

      <UebungHinweis id="rechentrainer">
        Tippe das Ergebnis ein und drücke Enter. Bei einem Fehler bekommst du einen
        Tipp und einen zweiten Versuch.
      </UebungHinweis>

      {daten?.titel && <p className="rt-thema">{daten.titel}</p>}

      <form className="rt-aufgabe" onSubmit={pruefe}>
        <span className="rt-term">{it.term} =</span>
        <input
          ref={eingabeRef}
          type="text"
          inputMode="numeric"
          className={"rt-eingabe" + eingabeStatus}
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          placeholder="?"
          disabled={beantwortet}
          aria-label="Ergebnis eingeben"
        />
        {!beantwortet && (
          <button
            type="submit"
            className="rt-pruef"
            disabled={parse(eingabe) === null}
          >
            {versuch === 0 ? "Prüfen" : "Nochmal prüfen"}
          </button>
        )}
      </form>

      {zeigeStrahl && (
        <button
          type="button"
          className="rt-strahl-toggle"
          onClick={() => setStrahlOffen((o) => !o)}
        >
          {strahlOffen ? "Zahlenstrahl ausblenden" : "Zahlenstrahl als Hilfe"}
        </button>
      )}
      {zeigeStrahl && strahlOffen && (
        <MiniStrahl von={von} bis={bis} start={it.a} />
      )}

      {status === "fehler" && (
        <div className="rt-feedback no">
          <p className="rt-feedback-text">Noch nicht. {hinweis}</p>
        </div>
      )}
      {status === "ok" && (
        <div className="rt-feedback ok">
          <p className="rt-feedback-text">
            Richtig! {it.term} = {fmt(it.r)}.
          </p>
          <button type="button" className="rt-weiter" onClick={weiter}>
            {weiterLabel}
          </button>
        </div>
      )}
      {status === "aufgeloest" && (
        <div className="rt-feedback no">
          <p className="rt-feedback-text">
            Die Lösung: {it.term} = <b>{fmt(it.r)}</b>.
          </p>
          <p className="rt-weg">{loesungsweg(it)}</p>
          <button type="button" className="rt-weiter" onClick={weiter}>
            {weiterLabel}
          </button>
        </div>
      )}
    </div>
  );
}
