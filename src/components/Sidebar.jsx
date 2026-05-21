import Icon from "./Icon";

const bereiche = [
  { id: "heute", label: "Heute", icon: "heute" },
  { id: "kalender", label: "Stundenplan", icon: "kalender" },
  { id: "aufgaben", label: "Aufgaben", icon: "aufgaben" },
  { id: "wissen", label: "Wissen", icon: "wissen" },
  { id: "kommunikation", label: "Nachrichten", icon: "kommunikation" },
  { id: "entwicklung", label: "Fortschritt", icon: "entwicklung" },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <nav className="nav">
        {bereiche.map((b) => (
          <button
            key={b.id}
            className={"nav-item" + (active === b.id ? " aktiv" : "")}
            onClick={() => onSelect(b.id)}
          >
            <Icon name={b.icon} className="nav-icon" />
            {b.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
