import { useEffect, useRef } from "react";

// Weiche Ränder für scrollbare Bereiche statt harter Kante: setzt --fade-top und
// --fade-bottom auf dem Element, die eine CSS-Maske (mask-image) steuern. Oben wird
// nur ausgeblendet, wenn nach oben noch Inhalt liegt, unten nur, wenn nach unten
// noch etwas kommt. Reagiert auf Scrollen, Größen- und Inhaltsänderungen.
// Nutzung: const ref = useScrollFade(); <div className="… fade-scroll" ref={ref}>.
export function useScrollFade(fade = 24) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      const oben = el.scrollTop > 1;
      const unten =
        Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight - 1;
      el.style.setProperty("--fade-top", oben ? fade + "px" : "0px");
      el.style.setProperty("--fade-bottom", unten ? fade + "px" : "0px");
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    const mo =
      typeof MutationObserver !== "undefined" ? new MutationObserver(update) : null;
    mo?.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
      mo?.disconnect();
    };
  }, [fade]);
  return ref;
}
