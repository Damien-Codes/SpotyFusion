// SwitchItems.tsx
import { useState } from "react";

type SwitchItemsProps = {
    items: string[]; // Liste des boutons
    onSelect: (item: string) => void; // Fonction pour notifier le parent
};

const SwitchItems = ({ items, onSelect }: SwitchItemsProps) => {
    const [activeItem, setActiveItem] = useState<string>(items[0]); // Par défaut, premier bouton actif

    const handleClick = (item: string) => {
        setActiveItem(item);
        onSelect(item);
    };

    return (
        <ul className="sidebar-nav">
            {items.map((item) => (
                <li key={item} className="nav-item-wrapper">
                    <a
                        href="#"
                        className={`sidebar-nav-item ${activeItem === item ? "active" : ""}`}
                        onClick={() => handleClick(item)}
                    >
                        <span>{item}</span>
                    </a>
                </li>
            ))}
        </ul>
    );
};

export default SwitchItems;