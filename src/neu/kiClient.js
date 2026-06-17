// Anbindung an eine lokale KI (Ollama) über den Vite-Proxy /lokale-ki.
// Ollama spricht ein OpenAI-kompatibles API. Wenn kein Modell läuft, fällt
// der Chat auf den Demo-Assistenten zurück (siehe MaterialChat).

import { pruefeArithmetik } from "./rechenpruefer";

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

// Ein einzelner, nicht gestreamter Chat-Aufruf (ganze Antwort auf einmal).
async function chatEinmal({
  nachrichten,
  modell,
  signal,
  temperature = 0.1,
  maxTokens = 400,
}) {
  const r = await fetch(BASIS + "/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modell,
      messages: nachrichten,
      stream: false,
      temperature,
      max_tokens: maxTokens,
    }),
    signal,
  });
  if (!r.ok) throw new Error("KI-Aufruf fehlgeschlagen: " + r.status);
  const j = await r.json();
  return (j.choices?.[0]?.message?.content || "").trim();
}

// Schritt 1: den handschriftlichen Rechenweg NUR ablesen (Texterkennung), ohne
// zu rechnen oder zu bewerten. Trennt das Lesen vom Urteilen, das macht beides
// zuverlässiger und deckt Lesefehler auf (die Abschrift wird dem Kind gezeigt).
export async function lieRechenweg({ bild, modell, signal }) {
  const system = [
    "Du bist eine genaue Texterkennung für handschriftliche Mathematik.",
    "Auf dem Bild steht ein handschriftlicher Rechenweg, oft über mehrere Zeilen.",
    "Schreibe NUR ab, was du siehst, Zeile für Zeile, genau die Zeichen (Zahlen, + - · : = ( ) und Buchstaben wie x).",
    "Rechne nichts, bewerte nichts, ergänze nichts und ändere nichts.",
    "Wenn eine Zeile nicht lesbar ist, schreibe dort [unklar].",
    "Gib ausschließlich die abgeschriebenen Zeilen aus, sonst keinen Text.",
  ].join("\n");
  return chatEinmal({
    nachrichten: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: "Schreibe diesen Rechenweg Zeile für Zeile ab." },
          { type: "image_url", image_url: { url: bild } },
        ],
      },
    ],
    modell,
    signal,
  });
}

// LLM-Urteil nur für Fälle, die wir NICHT deterministisch prüfen können
// (Gleichungen, Variablen, Umformungen). Neutraler Prompt: erst selbst nachrechnen,
// dann ein knappes, parsebares Urteil. Bewusst KEIN "beginne mit Richtig" (das
// verleitet zum Durchwinken) und KEIN "finde den Fehler" (das verleitet zum Erfinden).
async function ermittleUrteilKi({ transkript, modell, signal }) {
  const system = [
    "Du bist ein sehr genauer Mathe-Pruefer. Du bekommst einen abgeschriebenen Rechenweg aus mehreren Ausdruecken, getrennt durch Gleichheitszeichen oder Pfeile.",
    "Pruefe Schritt fuer Schritt. Fuer JEDE Gleichheit: berechne die linke Seite komplett selbst (Klammern, Punkt vor Strich) und vergleiche dein Ergebnis Ziffer fuer Ziffer mit der rechten Seite. Pruefe besonders sorgfaeltig, ob das Endergebnis stimmt.",
    "Schreibe pro Gleichheit eine kurze Zeile mit deiner eigenen Rechnung.",
    "Schreibe danach als ALLERLETZTE Zeile, ohne Sternchen oder Fettdruck, genau eine dieser zwei Formen:",
    "URTEIL: RICHTIG",
    "URTEIL: FALSCH",
    "Markiere FALSCH nur, wenn deine eigene Rechnung wirklich ein anderes Ergebnis ergibt als im Rechenweg steht.",
  ].join("\n");
  let txt;
  try {
    txt = await chatEinmal({
      nachrichten: [
        { role: "system", content: system },
        { role: "user", content: `Rechenweg:\n${transkript}` },
      ],
      modell,
      signal,
      temperature: 0,
      maxTokens: 700,
    });
  } catch {
    return "offen";
  }
  const m = txt.match(/URTEIL[:\s*]*\**\s*(RICHTIG|FALSCH)/i);
  if (!m) return "offen";
  return /RICHTIG/i.test(m[1]) ? "richtig" : "falsch";
}

// Schritt 2: den ABGESCHRIEBENEN Rechenweg prüfen und eine kindgerechte Rückmeldung
// geben. Reine Zahlen-Rechenwege werden exakt selbst nachgerechnet (rechenpruefer),
// alles andere geht ans Sprachmodell. Die Rückmeldung ist bewusst vorformuliert:
// sie bestätigt, wenn alles stimmt, lädt zum erneuten Anschauen ein, wenn nicht,
// und verrät nie die fertige Lösung. Der onToken-Callback bekommt den ganzen Text
// (die Schnittstelle bleibt zur gestreamten Variante kompatibel).
export async function pruefeRechenwegText({ transkript, modell, onToken, signal }) {
  const sende = (text) => {
    onToken?.(text);
    return text;
  };

  // Gar nichts Lesbares abgeschrieben.
  if (
    !transkript ||
    /\[unklar\]/i.test(transkript) ||
    !/[0-9]/.test(transkript)
  ) {
    return sende(
      "Ich kann deinen Rechenweg nicht überall sicher lesen. Schreib die Stelle, die unklar ist, gern noch einmal etwas größer und deutlicher, dann schaue ich es mir an."
    );
  }

  // 1) Reine Zahlen-Rechenwege: exakt selbst nachrechnen (verlässlich). Die
  //    Botschaft bezieht sich immer auf die oben angezeigte Lesart: stimmt die
  //    nicht (Verleser der Handschrift), kann der Schüler das sofort einordnen.
  const det = pruefeArithmetik(transkript);
  if (det.status === "richtig") {
    return sende(
      "So wie ich deinen Weg oben lese, geht alles auf: ich komme überall auf das Gleiche wie du. Das sieht richtig aus, stark gemacht!"
    );
  }
  if (det.status === "falsch") {
    return sende(
      `So wie ich deinen Weg oben lese, geht eine Stelle nicht ganz auf: schau nochmal hin, wo aus „${det.vorher}“ dann „${det.nachher}“ wird, und rechne sie langsam nach. Falls ich mich verlesen habe, schreib die Stelle einfach etwas größer.`
    );
  }

  // 2) Gleichungen oder Umformungen: das Sprachmodell urteilen lassen, aber weich
  //    formulieren (das Modell kann sich verrechnen, also nichts hart behaupten).
  const urteil = await ermittleUrteilKi({
    transkript,
    modell,
    signal,
  });
  if (urteil === "richtig") {
    return sende(
      "So wie ich deinen Weg oben lese, sieht er für mich stimmig aus. Gut gemacht!"
    );
  }
  if (urteil === "falsch") {
    return sende(
      "So wie ich deinen Weg oben lese, geht eine Umformung nicht ganz auf. Geh ihn nochmal Schritt für Schritt durch und prüfe jede Zeile einzeln. Falls ich mich verlesen habe, schreib die Stelle einfach etwas deutlicher."
    );
  }

  // 3) Unsicher: nichts behaupten, zum Selbstvergleich einladen.
  return sende(
    "Ich bin mir bei deinem Weg nicht ganz sicher. Vergleich am besten selbst nochmal Schritt für Schritt und prüfe, ob jede Zeile zur vorherigen passt."
  );
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
