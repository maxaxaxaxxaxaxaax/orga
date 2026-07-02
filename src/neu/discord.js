// Discord-Anbindung über ein kleines Relay (Cloudflare Worker, Code siehe
// discord-relay.worker.js im Projektwurzel). Discord blockt das direkte Lesen von
// Kanal-Nachrichten aus dem Browser (CORS), darum läuft ein winziger, CORS-offener
// Worker dazwischen, der den Bot-Token GEHEIM hält und der App nur die neuen Links
// gibt. Die App speichert nur die Relay-URL (+ optionalen Schlüssel), nie den Token.
const KEY = "neu.discord";
export const DISCORD_EVENT = "neu:discord";

export function ladeDiscord() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

export function speichereDiscord(cfg) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event(DISCORD_EVENT));
  } catch {
    /* localStorage blockiert: dann nur diese Sitzung */
  }
}

// Relay-URL mit Schlüssel und optionalen Parametern zusammenbauen.
function relayUrl(cfg, params = {}) {
  const u = new URL(cfg.relayUrl);
  if (cfg.secret) u.searchParams.set("key", cfg.secret);
  for (const [k, v] of Object.entries(params))
    if (v != null) u.searchParams.set(k, v);
  return u.toString();
}

// Verbindung prüfen: Relay ohne ?after fragen (gibt Kanalname + neueste ID).
export async function testeVerbindung(cfg) {
  if (!cfg.relayUrl) return { ok: false, grund: "Relay-URL nötig." };
  try {
    const r = await fetch(relayUrl(cfg));
    const j = await r.json().catch(() => ({}));
    if (r.status === 403) return { ok: false, grund: j.error || "Falscher Schlüssel." };
    if (!r.ok || !j.ok)
      return { ok: false, grund: j.error || "Fehler " + r.status };
    return { ok: true, name: j.name, latestId: j.latestId || null };
  } catch {
    return { ok: false, grund: "Relay nicht erreichbar (URL prüfen)." };
  }
}

// Neueste Nachrichten-ID als Basislinie (ab hier wird importiert).
export async function neuesteNachrichtId(cfg) {
  try {
    const r = await fetch(relayUrl(cfg));
    if (!r.ok) return null;
    const j = await r.json();
    return j?.latestId || null;
  } catch {
    return null;
  }
}

// Neue Nachrichten nach nachId (aufsteigend, älteste zuerst) als [{id, content}].
export async function holeNeueNachrichten(cfg, nachId) {
  if (!nachId) return null;
  try {
    const r = await fetch(relayUrl(cfg, { after: nachId }));
    const j = await r.json();
    return j?.ok && Array.isArray(j.messages) ? j.messages : null;
  } catch {
    return null;
  }
}

// Kurze Antwort in den Kanal posten (das Relay leitet an Discord weiter).
export async function antworteImKanal(cfg, text) {
  try {
    await fetch(relayUrl(cfg), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
  } catch {
    /* Bestätigung ist optional */
  }
}

// Alle http(s)-URLs aus einem Nachrichtentext (dedupliziert, Satzzeichen am Ende weg).
export function urlsAus(text) {
  const m = (text || "").match(/https?:\/\/[^\s<>()]+/g);
  if (!m) return [];
  return [...new Set(m.map((u) => u.replace(/[.,!?;]+$/, "")))];
}
