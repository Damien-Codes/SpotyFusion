import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BarChart3, Music2, ListMusic } from "lucide-react";

type SwitchItemsProps = {
  items: string[];
  activeItem: string;
  onSelect: (item: string) => void;
};

const iconMap: Record<string, React.ReactNode> = {
  Statistiques: <BarChart3 className="nav-icon" strokeWidth={1.5} />,
  "Blind Test": <Music2 className="nav-icon" strokeWidth={1.5} />,
  "Générateur\nde Playlists": (
    <ListMusic className="nav-icon" strokeWidth={1.5} />
  ),
};

const routeToItem: Record<string, string> = {
  "/dashboard": "Statistiques",
  "/blindtest": "Blind Test",
  "/playlist": "Générateur\nde Playlists",
};

const SwitchItems = ({ items, activeItem, onSelect }: SwitchItemsProps) => {
  const location = useLocation();

  useEffect(() => {
    const currentItem = routeToItem[location.pathname];
    if (currentItem && currentItem !== activeItem) {
      onSelect(currentItem);
    }
  }, [location.pathname]);

  const handleClick = (item: string) => {
    onSelect(item);
  };

  return (
    <ul className="sidebar-nav">
      {items.map((item) => (
        <li key={item} className="nav-item-wrapper">
          <a
            href="#"
            className={`sidebar-nav-item ${activeItem === item ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleClick(item);
            }}
          >
            {iconMap[item]}
            <span>{item}</span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SwitchItems;
