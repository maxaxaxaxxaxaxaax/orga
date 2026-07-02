import { useEffect, useState } from "react";
import {
  ladeDiscord,
  speichereDiscord,
  testeVerbindung,
  DISCORD_EVENT,
} from "./discord";
import "./DiscordModal.css";

// Discord verbinden (Demo): Die App liest den Kanal über ein kleines Relay (Worker),
// das den Bot-Token geheim hält. Hier trägt man nur die Relay-URL (+ Schlüssel) ein.
// Nach dem Verbinden holt der Poller in App.jsx neue Links und legt sie in der Ablage ab.
export default function DiscordModal({ onClose }) {
  const cfg = ladeDiscord();
  const [relayUrl, setRelayUrl] = useState(cfg.relayUrl || "");
  const [secret, setSecret] = useState(cfg.secret || "");
  const [aktiv, setAktiv] = useState(!!cfg.aktiv);
  const [antwort, setAntwort] = useState(cfg.antwort !== false);
  const [status, setStatus] = useState(
    cfg.name ? { phase: "ok", name: cfg.name } : { phase: "idle" }
  );

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const verbunden = status.phase === "ok";

  async function verbinden() {
    const u = relayUrl.trim();
    const s = secret.trim();
    if (!u) {
      setStatus({ phase: "fehler", grund: "Relay-URL nötig." });
      return;
    }
    setStatus({ phase: "teste" });
    const res = await testeVerbindung({ relayUrl: u, secret: s });
    if (!res.ok) {
      setStatus({ phase: "fehler", grund: res.grund });
      return;
    }
    // Basislinie: nur ab jetzt neue Nachrichten importieren (kein alter Rückstau).
    setAktiv(true);
    setStatus({ phase: "ok", name: res.name });
    speichereDiscord({
      relayUrl: u,
      secret: s,
      aktiv: true,
      antwort,
      letzteId: res.latestId,
      name: res.name,
    });
  }

  function toggleAktiv() {
    const n = !aktiv;
    setAktiv(n);
    speichereDiscord({ ...ladeDiscord(), aktiv: n, antwort });
  }

  function toggleAntwort() {
    const n = !antwort;
    setAntwort(n);
    speichereDiscord({ ...ladeDiscord(), antwort: n });
  }

  function jetztPruefen() {
    window.dispatchEvent(new Event(DISCORD_EVENT));
  }

  function trennen() {
    const jetzt = ladeDiscord();
    setAktiv(false);
    setStatus({ phase: "idle" });
    // Relay-URL + Schlüssel behalten, damit Wiederverbinden leicht bleibt; nur deaktivieren.
    speichereDiscord({ relayUrl: jetzt.relayUrl, secret: jetzt.secret });
  }

  return (
    <div className="dc-overlay" onClick={onClose}>
      <div
        className="dc-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Discord verbinden"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="dc-close" onClick={onClose} aria-label="Schließen">
          ✕
        </button>
        <h2 className="dc-titel">Discord verbinden</h2>
        <p className="dc-sub">
          Schick Links in deinen Discord-Kanal, orca liest sie, ordnet sie ein und
          legt sie in der Ablage ab.
        </p>

        {verbunden ? (
          <div className="dc-verbunden">
            <p className="dc-status ok">
              <span className="dc-punkt" aria-hidden="true" /> Verbunden mit{" "}
              <b>#{status.name}</b>
            </p>
            <label className="dc-schalter">
              <input type="checkbox" checked={aktiv} onChange={toggleAktiv} />
              <span>Neue Links automatisch einlesen</span>
            </label>
            <label className="dc-schalter">
              <input type="checkbox" checked={antwort} onChange={toggleAntwort} />
              <span>Der Bot bestätigt im Kanal, wohin er einsortiert hat</span>
            </label>
            <div className="dc-aktionen">
              <button type="button" className="dc-sekundaer" onClick={trennen}>
                Trennen
              </button>
              <button type="button" className="dc-primaer" onClick={jetztPruefen}>
                Jetzt prüfen
              </button>
            </div>
            <p className="dc-hinweis">
              orca prüft den Kanal alle paar Sekunden, solange die App offen ist.
            </p>
          </div>
        ) : (
          <>
            <label className="dc-feld">
              <span>Relay-URL</span>
              <input
                type="url"
                value={relayUrl}
                onChange={(e) => setRelayUrl(e.target.value)}
                placeholder="https://dein-relay.workers.dev"
                autoComplete="off"
              />
            </label>
            <label className="dc-feld">
              <span>Schlüssel (RELAY_KEY)</span>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="dein selbst gewähltes Passwort"
                autoComplete="off"
              />
            </label>
            {status.phase === "fehler" && (
              <p className="dc-status fehler">{status.grund}</p>
            )}
            <div className="dc-aktionen">
              <button type="button" className="dc-sekundaer" onClick={onClose}>
                Abbrechen
              </button>
              <button
                type="button"
                className="dc-primaer"
                onClick={verbinden}
                disabled={status.phase === "teste"}
              >
                {status.phase === "teste" ? "Verbinde…" : "Verbinden"}
              </button>
            </div>
            <details className="dc-hilfe">
              <summary>So richtest du das Relay ein (einmalig)</summary>
              <ol>
                <li>
                  Discord-Bot anlegen: discord.com/developers → New Application → Bot.
                  Token kopieren, „Message Content Intent" anschalten, Bot mit „View
                  Channels" + „Read Message History" auf deinen Server einladen.
                </li>
                <li>
                  Relay deployen: die Datei <code>discord-relay.worker.js</code> (im
                  Projekt) als Cloudflare Worker einfügen und deployen. Dort drei
                  Secrets setzen: <code>DISCORD_TOKEN</code>, <code>CHANNEL_ID</code>,{" "}
                  <code>RELAY_KEY</code> (frei gewähltes Passwort).
                </li>
                <li>
                  Die Worker-URL und den <code>RELAY_KEY</code> hier oben eintragen und
                  auf „Verbinden".
                </li>
              </ol>
              <p className="dc-warnung">
                Der Bot-Token bleibt auf dem Relay (Cloudflare), nie im Browser. In der
                App liegt nur die URL + der Schlüssel, lokal auf diesem Gerät.
              </p>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
