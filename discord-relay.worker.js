// Discord-Relay für die Orca-Demo (Cloudflare Worker).
// ---------------------------------------------------------------------------
// Warum: Discord lässt Browser die Nachrichten eines Kanals nicht direkt lesen
// (CORS blockt /channels/.../messages). Dieses winzige Relay läuft serverseitig,
// hält den Bot-Token GEHEIM (als Cloudflare-Secret, nie im Browser) und gibt der
// App nur die neuen Nachrichten als JSON zurück (CORS-offen).
//
// Deploy in ~10 Minuten:
//   1. dash.cloudflare.com  ->  Workers & Pages  ->  Create  ->  Worker  ->  Deploy
//   2. "Edit code": den kompletten Inhalt dieser Datei einfügen, Deploy.
//   3. Worker -> Settings -> Variables and Secrets, drei Secrets anlegen:
//        DISCORD_TOKEN = dein Bot-Token (Developer Portal, "Message Content Intent" an)
//        CHANNEL_ID    = die Kanal-ID (Discord: Entwicklermodus an, Rechtsklick -> ID kopieren)
//        RELAY_KEY     = ein selbst gewähltes Passwort (frei erfunden)
//   4. Die Worker-URL (endet auf .workers.dev) und den RELAY_KEY in der App unter
//      "Discord verbinden" eintragen. Fertig.
//
// Der Bot muss auf dem Server sein und den Kanal lesen dürfen (Berechtigungen
// "View Channel" + "Read Message History").
// ---------------------------------------------------------------------------
const API = "https://discord.com/api/v10";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    // RELAY_KEY ist Pflicht: sonst stünde das Relay (und damit dein Kanal) offen im Netz.
    if (!env.RELAY_KEY || url.searchParams.get("key") !== env.RELAY_KEY)
      return json({ ok: false, error: "Falscher oder fehlender Schlüssel." }, 403);
    if (!env.DISCORD_TOKEN || !env.CHANNEL_ID)
      return json({ ok: false, error: "Relay nicht konfiguriert (Token/Channel fehlen)." }, 500);
    const auth = { Authorization: "Bot " + env.DISCORD_TOKEN };
    const chan = `${API}/channels/${env.CHANNEL_ID}`;

    // POST: eine Antwort in den Kanal schreiben (der "Bot" bestätigt).
    if (req.method === "POST") {
      let body = {};
      try {
        body = await req.json();
      } catch {
        /* kein JSON-Body */
      }
      await fetch(`${chan}/messages`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ content: String(body.content || "").slice(0, 1900) }),
      });
      return json({ ok: true });
    }

    // Kanalname für die Anzeige.
    let name = env.CHANNEL_ID;
    try {
      const cr = await fetch(chan, { headers: auth });
      if (cr.ok) name = (await cr.json()).name || name;
    } catch { /* egal */ }

    const after = url.searchParams.get("after");
    // Ohne ?after: nur Test + Basislinie (neueste Nachrichten-ID).
    if (!after) {
      const r = await fetch(`${chan}/messages?limit=1`, { headers: auth });
      if (!r.ok) return json({ ok: false, error: "Discord: " + r.status }, 200);
      let msgs;
      try {
        msgs = await r.json();
      } catch {
        return json({ ok: false, error: "Discord: ungültige Antwort." }, 200);
      }
      return json({ ok: true, name, latestId: msgs[0]?.id || null });
    }
    // Mit ?after=ID: neue Nachrichten (aufsteigend, älteste zuerst).
    const r = await fetch(`${chan}/messages?after=${encodeURIComponent(after)}&limit=50`, { headers: auth });
    if (!r.ok) return json({ ok: false, error: "Discord: " + r.status }, 200);
    let msgs;
    try {
      msgs = await r.json();
    } catch {
      return json({ ok: false, error: "Discord: ungültige Antwort." }, 200);
    }
    // Bild-Anhänge reichen wir mit durch (URL + Dateiname), damit die App auch
    // gesendete Fotos einsortieren kann, nicht nur Links im Text.
    const messages = Array.isArray(msgs)
      ? msgs
          .map((m) => ({
            id: m.id,
            content: m.content,
            anhaenge: (m.attachments || [])
              .filter((a) => (a.content_type || "").startsWith("image/"))
              .map((a) => ({ url: a.url, name: a.filename || "" })),
          }))
          .reverse()
      : [];
    return json({ ok: true, name, messages });
  },
};
