import { frageKi } from "./kiClient";

// Eine KI-Antwort in einen extern gehaltenen Chat-Verlauf streamen: hängt die
// Frage (optional mit Bild) und eine wachsende Antwort-Blase an und füllt Letztere
// über eine stabile, prozessweit eindeutige Id. So überschreibt gleichzeitiges
// Anhängen (z. B. eine Live-Coach-Beobachtung) die streamende Antwort nicht.
// onFehler bekommt die setze-Funktion, um die Blase mit einer Ausweich-Antwort
// zu füllen (Demo-Antwort im Chat, Fehlerhinweis beim Bild).
let streamZaehler = 0;

export async function streameChatAntwort({
  setNachrichten,
  frage,
  bild = null,
  verlauf = [],
  kontextName,
  materialien = [],
  modell,
  systemText,
  onFehler,
}) {
  const id = ++streamZaehler;
  setNachrichten((n) => [
    ...n,
    { von: "ich", text: frage, bild: bild || undefined },
    { von: "ki", text: "", stream: id },
  ]);
  const setze = (aender) =>
    setNachrichten((n) => n.map((m) => (m.stream === id ? aender(m) : m)));
  try {
    await frageKi({
      frage,
      verlauf,
      kontextName,
      materialien,
      modell,
      bild,
      systemText,
      onToken: (stueck) => setze((m) => ({ ...m, text: m.text + stueck })),
    });
  } catch (e) {
    if (onFehler) onFehler(setze, e);
    else
      setze(() => ({
        von: "ki",
        text: "Ich konnte gerade nicht antworten. Versuch es gleich noch einmal.",
      }));
  }
}
