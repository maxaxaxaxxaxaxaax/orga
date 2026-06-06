import { useEffect, useRef, useState } from "react";
import { kiAntwortText, kiAntwortBild } from "../lib/kiAntworten";

// Strategie-spezifisches Intro vor dem Quiz. Bewusst KURZ und FOKUSSIERT,
// damit die Wahl konkret unterschiedlich erlebbar ist und nicht zum Duplikat
// der Erklärung-Tab wird.
//
// - selbst       → kein Intro (sofort Quiz)
// - beispiele    → durchgerechneter Lösungsweg EINER Aufgabe (Walkthrough)
// - mitschueler  → EINE konkrete Hilfe-Nachricht von Lena
// - ki-hilfe     → EINE sokratische Aktivierungs-Frage
export default function StrategieIntro({
  strategie,
  inhalt,
  themaLabel,
  onFertig,
}) {
  if (strategie === "beispiele") {
    return <BeispieleIntro inhalt={inhalt} onFertig={onFertig} />;
  }
  if (strategie === "mitschueler") {
    return <MitschuelerIntro inhalt={inhalt} themaLabel={themaLabel} onFertig={onFertig} />;
  }
  if (strategie === "ki-hilfe") {
    return <KIIntro inhalt={inhalt} themaLabel={themaLabel} onFertig={onFertig} />;
  }
  return null;
}

function BeispieleIntro({ inhalt, onFertig }) {
  const w = inhalt?.walkthrough;
  return (
    <div className="strat-intro strat-beispiele">
      <header className="strat-intro-kopf">
        <span className="strat-intro-icon" aria-hidden="true">📖</span>
        <div>
          <h3 className="strat-intro-titel">Ein Beispiel durchgerechnet</h3>
          <p className="strat-intro-sub">
            Schau dir den Lösungsweg an, dann probierst du selbst.
          </p>
        </div>
      </header>
      {w ? (
        <div className="walkthrough">
          <div className="walkthrough-aufgabe">
            <span className="walkthrough-label">Aufgabe</span>
            <code className="walkthrough-frage">{w.aufgabe}</code>
          </div>
          <ol className="walkthrough-schritte">
            {w.schritte.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="walkthrough-loesung">
            <span className="walkthrough-label">Lösung</span>
            <strong>{w.loesung}</strong>
          </div>
        </div>
      ) : (
        <p className="strat-intro-leer">
          Für dieses Thema gibt es noch keinen Walkthrough. Probier es selbst.
        </p>
      )}
      <button type="button" className="primary-btn" onClick={onFertig}>
        Jetzt selbst probieren
      </button>
    </div>
  );
}

function MitschuelerIntro({ inhalt, themaLabel, onFertig }) {
  const titel = themaLabel || "dem Thema";
  const tipp =
    inhalt?.tipps?.mitschueler ||
    "Schau dir EIN Beispiel langsam an. Wenn das sitzt, ist der Rest leichter.";
  return (
    <div className="strat-intro strat-chat">
      <header className="strat-intro-kopf">
        <span className="strat-intro-icon" aria-hidden="true">👥</span>
        <div>
          <h3 className="strat-intro-titel">Tipp von Lena</h3>
          <p className="strat-intro-sub">
            Ein simulierter Hilfe-Tipp aus dem Klassenchat.
          </p>
        </div>
      </header>
      <div className="strat-chat-verlauf kompakt">
        <div className="strat-chat-msg msg-me">
          <span className="strat-chat-text">
            Hilfe zu {titel}?
          </span>
        </div>
        <div className="strat-chat-msg msg-lena">
          <span className="strat-chat-name">Lena</span>
          <span className="strat-chat-text">{tipp}</span>
        </div>
      </div>
      <button type="button" className="primary-btn" onClick={onFertig}>
        Danke, los geht's
      </button>
    </div>
  );
}

function KIIntro({ inhalt, themaLabel, onFertig }) {
  const titel = themaLabel || "dem Thema";
  const startVerweis = inhalt?.abschnitte?.find((a) =>
    ["regel", "schema", "tipp"].includes(a.typ),
  );
  const [messages, setMessages] = useState(() => [
    {
      from: "ki",
      text: `Hi! Ich helfe dir nachzudenken zu „${titel}". Frag mich was, oder lade ein Foto deines Hefts oder Arbeitsblatts hoch. Ich gebe dir keine Lösung, aber zeige dir, wo du nachschauen kannst.`,
      verweis: startVerweis
        ? { titel: startVerweis.ueberschrift, typ: startVerweis.typ, tab: "Erklärung" }
        : null,
    },
  ]);
  const [text, setText] = useState("");
  const [denkt, setDenkt] = useState(false);
  const verlaufRef = useRef(null);
  const fileRef = useRef(null);

  // Chat-Scroll: bei neuer Nachricht ans Ende.
  useEffect(() => {
    const el = verlaufRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, denkt]);

  function sendeText() {
    const t = text.trim();
    if (!t || denkt) return;
    setMessages((m) => [...m, { from: "user", text: t }]);
    setText("");
    setDenkt(true);
    setTimeout(() => {
      const antwort = kiAntwortText(t, inhalt);
      setMessages((m) => [...m, { from: "ki", ...antwort }]);
      setDenkt(false);
    }, 700);
  }

  function sendeBild(file) {
    if (!file || denkt) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const bildUrl = e.target.result;
      setMessages((m) => [...m, { from: "user", typ: "bild", bildUrl }]);
      setDenkt(true);
      setTimeout(() => {
        const antwort = kiAntwortBild(inhalt);
        setMessages((m) => [...m, { from: "ki", ...antwort }]);
        setDenkt(false);
      }, 900);
    };
    reader.readAsDataURL(file);
    // Input zurücksetzen, damit derselbe Datei nochmal hochladbar ist
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="strat-intro strat-ki">
      <header className="strat-intro-kopf">
        <span className="strat-intro-icon" aria-hidden="true">💡</span>
        <div>
          <h3 className="strat-intro-titel">KI-Chat</h3>
          <p className="strat-intro-sub">
            Frag oder zeig ein Foto. KI verweist auf deine Notiz, gibt aber keine Lösung.
          </p>
        </div>
      </header>

      <div className="ki-chat" ref={verlaufRef}>
        {messages.map((m, i) => (
          <KIMessage key={i} message={m} />
        ))}
        {denkt && (
          <div className="ki-msg msg-ki">
            <span className="ki-avatar" aria-hidden="true">💡</span>
            <div className="ki-bubble ki-bubble-denkt">
              <span className="ki-denkt-punkt" />
              <span className="ki-denkt-punkt" />
              <span className="ki-denkt-punkt" />
            </div>
          </div>
        )}
      </div>

      <div className="ki-eingabe">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => sendeBild(e.target.files?.[0])}
        />
        <button
          type="button"
          className="ki-bild-btn"
          onClick={() => fileRef.current?.click()}
          aria-label="Bild hochladen"
          title="Foto vom Heft oder Arbeitsblatt"
          disabled={denkt}
        >
          📎
        </button>
        <input
          type="text"
          className="ki-text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendeText()}
          placeholder="Frag mich was..."
          disabled={denkt}
        />
        <button
          type="button"
          className="ki-send-btn"
          onClick={sendeText}
          disabled={denkt || !text.trim()}
        >
          Senden
        </button>
      </div>

      <button type="button" className="primary-btn" onClick={onFertig}>
        Bereit, Quiz starten
      </button>
    </div>
  );
}

function KIMessage({ message }) {
  if (message.typ === "bild") {
    return (
      <div className="ki-msg msg-user msg-bild">
        <img src={message.bildUrl} alt="Hochgeladenes Bild" />
      </div>
    );
  }
  return (
    <div className={"ki-msg msg-" + message.from}>
      {message.from === "ki" && (
        <span className="ki-avatar" aria-hidden="true">💡</span>
      )}
      <div className="ki-bubble">
        <p className="ki-text">{message.text}</p>
        {message.verweis && <KIVerweisChip verweis={message.verweis} />}
      </div>
    </div>
  );
}

function KIVerweisChip({ verweis }) {
  return (
    <div className="ki-verweis" role="note">
      <span className="ki-verweis-icon" aria-hidden="true">📖</span>
      <span className="ki-verweis-text">
        Schau in <strong>{verweis.tab}</strong> · „{verweis.titel}"
      </span>
    </div>
  );
}
