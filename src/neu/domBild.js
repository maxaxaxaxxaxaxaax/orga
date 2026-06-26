// DOM-Knoten als PNG-Daten-URL, ohne externe Bibliothek. Der Knoten wird geklont,
// die berechneten Stile werden inline auf den Klon geschrieben (selbsttragend),
// das Ganze in ein SVG <foreignObject> verpackt, als Bild geladen und auf ein
// Canvas gezeichnet. So entsteht ein echter Screenshot der gerade offenen
// Material-Fläche, ohne neue Abhängigkeit.
//
// Grenze: <canvas>-basierte Widgets (z.B. Zahlenstrahl) und fremd-Origin-Bilder
// erscheinen im foreignObject leer bzw. machen das Canvas "tainted". Schlägt das
// Zeichnen oder der Export fehl, gibt diese Funktion null zurück, und der Aufrufer
// fällt auf ein leeres weißes Blatt zurück (das Werkzeug funktioniert immer).

// Webfonts laden im SVG nicht zuverlässig: diese Eigenschaften überspringen wir,
// damit die Serialisierung klein bleibt und nicht an externen url()-Werten hängt.
const UEBERSPRINGEN = new Set([
  "background-image",
  "cursor",
  "-webkit-text-fill-color",
]);

function inlineStile(quelle, ziel) {
  const cs = getComputedStyle(quelle);
  let text = "";
  for (let i = 0; i < cs.length; i++) {
    const prop = cs[i];
    if (UEBERSPRINGEN.has(prop)) continue;
    const wert = cs.getPropertyValue(prop);
    if (wert) text += `${prop}:${wert};`;
  }
  ziel.setAttribute("style", text);
  const qk = quelle.children;
  const zk = ziel.children;
  for (let i = 0; i < qk.length && i < zk.length; i++) inlineStile(qk[i], zk[i]);
}

export async function domBild(node) {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const breite = Math.max(1, Math.ceil(rect.width));
  const hoehe = Math.max(1, Math.ceil(rect.height));

  const klon = node.cloneNode(true);
  try {
    inlineStile(node, klon);
  } catch {
    return null;
  }
  klon.style.margin = "0";

  let xml;
  try {
    xml = new XMLSerializer().serializeToString(klon);
  } catch {
    return null;
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${breite}" height="${hoehe}">` +
    `<foreignObject width="100%" height="100%">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${breite}px;height:${hoehe}px;background:#ffffff;box-sizing:border-box">` +
    xml +
    `</div></foreignObject></svg>`;
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  const img = new Image();
  const geladen = new Promise((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Bild konnte nicht geladen werden"));
  });
  img.src = url;
  try {
    await geladen;
  } catch {
    return null;
  }

  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(breite * dpr);
  canvas.height = Math.round(hoehe * dpr);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(dpr, dpr);
  try {
    ctx.drawImage(img, 0, 0, breite, hoehe);
    return canvas.toDataURL("image/png");
  } catch {
    return null; // getaintetes Canvas (fremde Bilder) o.ä.
  }
}
