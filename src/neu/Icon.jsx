// Zentrale Icon-Komponente: rendert die in Figma erstellten Outline-Icons aus
// ./icons/*.svg. Die SVGs werden zur Bauzeit als Rohtext eingelesen; die
// Präsentations-Attribute (stroke/fill/stroke-width) werden entfernt, damit
// Größe und Farbe wie bei den bisherigen Inline-SVGs über CSS-Klassen bzw.
// currentColor gesteuert werden (und der Dark Mode weiter greift). Standard ist
// der Strich-Stil des Sets (1.5px, runde Enden), CSS-Klassen können das ändern.
const roh = import.meta.glob("./icons/*.svg", {
  query: "?raw",
  eager: true,
  import: "default",
});

const ICONS = {};
for (const [pfad, text] of Object.entries(roh)) {
  const name = pfad
    .split("/")
    .pop()
    .replace(/\.svg$/, "")
    .toLowerCase();
  ICONS[name] = text
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<\/?svg[^>]*>/g, "")
    .replace(
      /\s(stroke-width|stroke-linecap|stroke-linejoin|stroke|fill)="[^"]*"/g,
      ""
    )
    .trim();
}

// <Icon name="settings" className="…" /> – name = Dateiname ohne .svg (klein).
// size setzt eine feste Pixelgröße; sonst greift die CSS-Klasse (width/height).
export default function Icon({ name, size, className, title, style, ...rest }) {
  const inner = ICONS[String(name).toLowerCase()];
  if (!inner) {
    if (import.meta.env.DEV) console.warn(`Icon "${name}" nicht gefunden`);
    return null;
  }
  const groesse = size != null ? { width: size, height: size } : null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      {...rest}
      style={groesse ? { ...groesse, ...style } : style}
      dangerouslySetInnerHTML={{
        __html: title ? `<title>${title}</title>${inner}` : inner,
      }}
    />
  );
}
