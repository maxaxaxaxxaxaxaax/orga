import { useState } from "react";
import { introNachricht, antwortAuf } from "./materialAssistent";
import { frageKi } from "./kiClient";
import Icon from "./Icon";
import LernzettelModal from "./LernzettelModal";
import WebcamModal from "./WebcamModal";
import "./MaterialChat.css";

// Chat über die eigenen Materialien. Läuft eine lokale KI (kiModell gesetzt),
// streamt die Antwort vom Modell; sonst antwortet der Demo-Assistent. Der
// Kontext (Fach/Lernweg + Materialien) kommt als Prop; bei Wechsel wird die
// Komponente über key neu gestartet, daher kein Effekt nötig.

const VORSCHLAEGE = [
  "Welche Materialien habe ich?",
  "Wie soll ich üben?",
  "Erklär mir das Thema",
  "Fass die wichtigsten Punkte zusammen",
];

export default function MaterialChat({
  kontextName,
  materialien,
  kiModell,
  visionModell,
  systemText,
  onHeften,
}) {
  const ctx = { kontextName, materialien };
  const [nachrichten, setNachrichten] = useState(() => [
    { von: "ki", ...introNachricht(ctx) },
  ]);
  const [eingabe, setEingabe] = useState("");
  const [denkt, setDenkt] = useState(false);
  const [zettelOffen, setZettelOffen] = useState(false);
  const [bild, setBild] = useState(null); // Daten-URL des angehängten Bilds
  const [webcamOffen, setWebcamOffen] = useState(false);

  const standardTitel =
    "Lernzettel: " + kontextName.replace(/[„"]/g, "").trim();

  function sendeDemo(frage) {
    setNachrichten((n) => [...n, { von: "ich", text: frage }]);
    const antwort = antwortAuf(frage, ctx);
    setTimeout(() => {
      setNachrichten((n) => [...n, { von: "ki", ...antwort }]);
    }, 350);
  }

  async function sendeKi(frage, dasBild) {
    const verlauf = nachrichten;
    const modell = dasBild ? visionModell : kiModell;
    setNachrichten((n) => [
      ...n,
      { von: "ich", text: frage, bild: dasBild || undefined },
      { von: "ki", text: "" },
    ]);
    setDenkt(true);
    const setzeLetzte = (aender) =>
      setNachrichten((n) => {
        const kopie = [...n];
        const i = kopie.length - 1;
        kopie[i] = aender(kopie[i]);
        return kopie;
      });
    try {
      await frageKi({
        frage,
        verlauf,
        kontextName,
        materialien,
        modell,
        bild: dasBild,
        systemText,
        onToken: (stueck) => {
          setDenkt(false);
          setzeLetzte((m) => ({ ...m, text: m.text + stueck }));
        },
      });
    } catch {
      if (dasBild) {
        setzeLetzte(() => ({
          von: "ki",
          text: "Ich konnte das Bild gerade nicht ansehen. Versuch es noch einmal.",
        }));
      } else {
        // Text-KI nicht erreichbar: auf Demo-Antwort zurückfallen.
        const antwort = antwortAuf(frage, ctx);
        setzeLetzte(() => ({
          von: "ki",
          ...antwort,
          hinweis: "Lokale KI nicht erreichbar, Demo-Antwort.",
        }));
      }
    } finally {
      setDenkt(false);
    }
  }

  function waehleBild(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setBild(reader.result);
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  function sende(text) {
    const frage = (text ?? eingabe).trim();
    if ((!frage && !bild) || denkt) return;
    const dasBild = bild;
    setEingabe("");
    setBild(null);
    if (dasBild) {
      sendeKi(frage || "Schau dir das Bild an und hilf mir damit.", dasBild);
    } else if (kiModell) {
      sendeKi(frage, null);
    } else {
      sendeDemo(frage);
    }
  }

  const nochKeineFrage = !nachrichten.some((m) => m.von === "ich");

  function geheftet({ titel, inhalt }) {
    onHeften({ titel, inhalt });
    setZettelOffen(false);
    setNachrichten((n) => [
      ...n,
      { von: "ki", text: `Lernzettel „${titel}" ans Wissen geheftet.` },
    ]);
  }

  return (
    <section className="mc">
      <header className="mc-kopf">
        <span className="mc-titel">Materialien-Chat</span>
        {kiModell ? (
          <span className="mc-modus mc-lokal" title={`Läuft lokal auf ${kiModell}`}>
            lokale KI
          </span>
        ) : (
          <span className="mc-modus">Demo-Assistent</span>
        )}
        {onHeften && (
          <button
            type="button"
            className="mc-zettel"
            onClick={() => setZettelOffen(true)}
            disabled={nochKeineFrage}
            title={
              nochKeineFrage
                ? "Schreib erst mit dem Assistenten, dann kannst du einen Lernzettel erstellen"
                : "Aus dem Chat einen Lernzettel erstellen"
            }
          >
            + Lernzettel
          </button>
        )}
      </header>

      <div className="mc-verlauf">
        {nachrichten.map((m, i) => (
          <div key={i} className={"mc-msg mc-" + m.von}>
            {m.bild && (
              <img className="mc-bild" src={m.bild} alt="Angehängtes Bild" />
            )}
            {m.text ? (
              <p className="mc-text">{m.text}</p>
            ) : (
              denkt && (
                <p className="mc-text mc-denkt">
                  <span />
                  <span />
                  <span />
                </p>
              )
            )}
            {m.hinweis && <p className="mc-hinweis">{m.hinweis}</p>}
            {m.quellen?.length > 0 && (
              <div className="mc-quellen">
                {m.quellen.map((q, j) => (
                  <span className="mc-quelle" key={j}>
                    {q}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {nochKeineFrage && (
        <div className="mc-vorschlaege">
          {VORSCHLAEGE.map((v) => (
            <button
              key={v}
              type="button"
              className="mc-chip"
              onClick={() => sende(v)}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {bild && (
        <div className="mc-anhang">
          <img className="mc-anhang-bild" src={bild} alt="Vorschau" />
          <span className="mc-anhang-text">Bild angehängt</span>
          <button
            type="button"
            className="mc-anhang-weg"
            onClick={() => setBild(null)}
            aria-label="Bild entfernen"
          >
            ✕
          </button>
        </div>
      )}

      <form
        className="mc-eingabe"
        onSubmit={(e) => {
          e.preventDefault();
          sende();
        }}
      >
        {visionModell && (
          <label
            className="mc-bild-knopf"
            title="Bild anhängen (Kamera oder Galerie)"
          >
            <input type="file" accept="image/*" onChange={waehleBild} hidden />
            <Icon name="wand" />
          </label>
        )}
        <input
          type="text"
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          placeholder={
            bild ? "Frag etwas zum Bild" : "Frag etwas zu deinen Materialien"
          }
          aria-label="Nachricht an den Assistenten"
        />
        <button
          type="submit"
          className="mc-senden"
          aria-label="Senden"
          disabled={denkt}
        >
          →
        </button>
      </form>

      {zettelOffen && (
        <LernzettelModal
          verlauf={nachrichten}
          kontextName={kontextName}
          kiModell={kiModell}
          standardTitel={standardTitel}
          onHeften={geheftet}
          onClose={() => setZettelOffen(false)}
        />
      )}

      {webcamOffen && (
        <WebcamModal
          onCapture={(daten) => {
            setBild(daten);
            setWebcamOffen(false);
          }}
          onClose={() => setWebcamOffen(false)}
        />
      )}
    </section>
  );
}
