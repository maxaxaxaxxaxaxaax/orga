// Anbindung an eine lokale KI (Ollama) über den Vite-Proxy /lokale-ki.
// Ollama spricht ein OpenAI-kompatibles API. Wenn kein Modell läuft, fällt
// der Chat auf den Demo-Assistenten zurück (siehe MaterialChat).

const BASIS = "/lokale-ki";

// Modellnamen einmal abfragen (oder null bei Fehler).
async function modellNamen() {
  try {
    const r = await fetch(BASIS + "/api/tags");
    if (!r.ok) return null;
    const daten = await r.json();
    return (daten.models || []).map((m) => m.name);
  } catch {
    return null;
  }
}

// Welches Text-Modell nehmen wir? qwen bevorzugt, sonst das erste, das kein
// reines Vision-Modell ist.
export async function pruefeKi() {
  const namen = await modellNamen();
  if (!namen || !namen.length) return null;
  const text = namen.filter((n) => !istVision(n));
  const wahl = text.length ? text : namen;
  return wahl.find((n) => n.startsWith("qwen2.5:")) || wahl[0];
}

// Erkennt Vision-Modelle am Namen.
function istVision(name) {
  return /vl|vision|llava|moondream|minicpm-v|bakllava|gemma3/.test(name);
}

// Läuft ein Vision-Modell (für Bild-Fragen)? Gibt den Namen zurück oder null.
export async function pruefeVision() {
  const namen = await modellNamen();
  if (!namen || !namen.length) return null;
  const vision = namen.filter(istVision);
  if (!vision.length) return null;
  return vision.find((n) => n.startsWith("qwen2.5vl")) || vision[0];
}

function systemPrompt(kontextName, materialien) {
  const liste = materialien.length
    ? materialien
        .map(
          (m) =>
            `- ${m.titel} (${m.art}${m.thema ? `, Thema: ${m.thema}` : ""})`
        )
        .join("\n")
    : "(noch keine Materialien)";
  return [
    "Du bist ein freundlicher Lern-Assistent für eine Schülerin oder einen Schüler der Klasse 7 (12 bis 14 Jahre).",
    "Antworte ausschließlich auf Deutsch, niemals in einer anderen Sprache.",
    "Gib genau eine kurze, hilfreiche Antwort (höchstens vier Sätze). Erfinde keine weitere Unterhaltung und gib dir keine eigenen Folgefragen.",
    "Schreibe einfach und kindgerecht. Verwende keine Gedankenstriche.",
    `Es geht um die folgenden Lern-Materialien zu ${kontextName}:`,
    liste,
    "Hilf, mit genau diesen Materialien zu lernen, und nenne passende Materialien beim Namen.",
    "Gib keine fertigen Lösungen für Aufgaben vor, sondern leite mit einer kurzen Rückfrage zum Selberdenken an.",
    "Wenn ein Bild mitgeschickt wird, schau es dir genau an und beziehe dich konkret auf das, was darauf zu sehen ist.",
  ].join("\n");
}

function verlaufText(verlauf) {
  return verlauf
    .map((m) => (m.von === "ich" ? "Schüler" : "Assistent") + ": " + m.text)
    .join("\n");
}

// Aus dem Chatverlauf einen strukturierten Lernzettel erzeugen (streamend).
export async function erstelleLernzettel({
  verlauf,
  kontextName,
  modell,
  onToken,
  signal,
}) {
  const nachrichten = [
    {
      role: "system",
      content: [
        "Du erstellst aus einem Gespräch einen kurzen, klar strukturierten Lernzettel auf Deutsch für eine Schülerin oder einen Schüler der Klasse 7.",
        "Nutze genau diese Struktur:",
        "Das Wichtigste:",
        "- drei bis fünf kurze Stichpunkte",
        "Beispiel: (nur wenn sinnvoll, ein kurzes Beispiel)",
        "Nächster Schritt: (ein Satz, was als Nächstes zu tun ist)",
        "Keine Einleitung, kein Schlusssatz, keine Gedankenstriche. Nur der Lernzettel.",
      ].join("\n"),
    },
    {
      role: "user",
      content: `Thema: ${kontextName}\n\nGespräch:\n${verlaufText(
        verlauf
      )}\n\nErstelle daraus den Lernzettel.`,
    },
  ];

  const r = await fetch(BASIS + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modell,
      messages: nachrichten,
      stream: true,
      temperature: 0.3,
      max_tokens: 400,
      stop: ["<|im_end|>", "<|im_start|>"],
    }),
    signal,
  });
  if (!r.ok || !r.body) throw new Error("Lernzettel fehlgeschlagen: " + r.status);

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let voll = "";
  let puffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    puffer += decoder.decode(value, { stream: true });
    const zeilen = puffer.split("\n");
    puffer = zeilen.pop() || "";
    for (const zeile of zeilen) {
      const t = zeile.trim();
      if (!t.startsWith("data:")) continue;
      const daten = t.slice(5).trim();
      if (daten === "[DONE]") continue;
      try {
        const j = JSON.parse(daten);
        const stueck = j.choices?.[0]?.delta?.content || "";
        if (stueck) {
          voll += stueck;
          onToken?.(stueck);
        }
      } catch {
        // unvollständiges JSON-Stück
      }
    }
  }
  return voll;
}

// Rechenweg-Coach: bekommt ein Bild des handschriftlichen Rechenwegs und sucht
// den ersten Schritt, an dem das Denken kippt, ohne die Lösung zu verraten
// (Lern-Coach, keine Antwortmaschine). Streamt die Antwort. Braucht ein lokales
// Vision-Modell (siehe pruefeVision).
export async function analysiereRechenweg({ bild, modell, onToken, signal }) {
  const system = [
    "Du bist ein geduldiger Mathe-Lerncoach für eine Schülerin oder einen Schüler der Klasse 7 (12 bis 14 Jahre).",
    "Auf dem Bild steht ein handschriftlicher Rechenweg.",
    "Antworte ausschließlich auf Deutsch, einfach und kindgerecht, höchstens vier Sätze, keine Gedankenstriche.",
    "Geh so vor: Lies den Rechenweg Schritt für Schritt. Finde den ERSTEN Schritt, an dem ein Denkfehler passiert.",
    "Sage kurz, WELCHER Schritt kippt und was dort schiefläuft, und gib einen gezielten Hinweis zum Selber-Korrigieren.",
    "Verrate NICHT die fertige Lösung und rechne sie nicht vor.",
    "Wenn alles richtig ist, bestätige das kurz und ermutigend.",
    "Wenn du die Handschrift nicht sicher lesen kannst, sag das freundlich und bitte um deutlicheres Schreiben.",
  ].join("\n");
  const nachrichten = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        { type: "text", text: "Hier ist mein Rechenweg. An welchem Schritt kippt mein Denken?" },
        { type: "image_url", image_url: { url: bild } },
      ],
    },
  ];

  const r = await fetch(BASIS + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modell,
      messages: nachrichten,
      stream: true,
      temperature: 0.2,
      max_tokens: 350,
      stop: ["<|im_end|>", "<|im_start|>", "\nuser", "\nassistant"],
    }),
    signal,
  });
  if (!r.ok || !r.body)
    throw new Error("Rechenweg-Analyse fehlgeschlagen: " + r.status);

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let voll = "";
  let puffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    puffer += decoder.decode(value, { stream: true });
    const zeilen = puffer.split("\n");
    puffer = zeilen.pop() || "";
    for (const zeile of zeilen) {
      const t = zeile.trim();
      if (!t.startsWith("data:")) continue;
      const daten = t.slice(5).trim();
      if (daten === "[DONE]") continue;
      try {
        const j = JSON.parse(daten);
        const stueck = j.choices?.[0]?.delta?.content || "";
        if (stueck) {
          voll += stueck;
          onToken?.(stueck);
        }
      } catch {
        // unvollständiges JSON-Stück
      }
    }
  }
  return voll;
}

// Streaming-Chat: onToken(stück) wird pro Text-Stück aufgerufen, der ganze
// Text wird am Ende zurückgegeben.
export async function frageKi({
  frage,
  verlauf,
  kontextName,
  materialien,
  modell,
  bild,
  onToken,
  signal,
}) {
  // Mit Bild: Inhalt als Array (Text + Bild) im OpenAI-Format.
  const userInhalt = bild
    ? [
        { type: "text", text: frage },
        { type: "image_url", image_url: { url: bild } },
      ]
    : frage;
  const nachrichten = [
    { role: "system", content: systemPrompt(kontextName, materialien) },
    ...verlauf.map((m) => ({
      role: m.von === "ich" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: userInhalt },
  ];

  const r = await fetch(BASIS + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modell,
      messages: nachrichten,
      stream: true,
      temperature: 0.4,
      max_tokens: 350,
      // Modell soll nach seiner Antwort stoppen und keine neue Rolle erfinden.
      stop: ["<|im_end|>", "<|im_start|>", "\nuser", "\nassistant"],
    }),
    signal,
  });
  if (!r.ok || !r.body) throw new Error("KI-Antwort fehlgeschlagen: " + r.status);

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let voll = "";
  let puffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    puffer += decoder.decode(value, { stream: true });
    const zeilen = puffer.split("\n");
    puffer = zeilen.pop() || "";
    for (const zeile of zeilen) {
      const t = zeile.trim();
      if (!t.startsWith("data:")) continue;
      const daten = t.slice(5).trim();
      if (daten === "[DONE]") continue;
      try {
        const j = JSON.parse(daten);
        const stueck = j.choices?.[0]?.delta?.content || "";
        if (stueck) {
          voll += stueck;
          onToken?.(stueck);
        }
      } catch {
        // unvollständiges JSON-Stück, beim nächsten Chunk weiter
      }
    }
  }
  return voll;
}
