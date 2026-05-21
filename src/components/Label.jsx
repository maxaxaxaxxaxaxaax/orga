// Kleines, wiederverwendbares Block-Label über Abschnitten.
export default function Label({ children, light = false }) {
  return <span className={"label" + (light ? " label-light" : "")}>{children}</span>;
}
