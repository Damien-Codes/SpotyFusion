import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../assets/SideBar.css';
import LogoutButton from './LogoutButton';
import UserName from './UserName';
import SwitchItems from './SwitchItems';
import { Music } from 'lucide-react';

type SideBarProps = {
    onSelect: (item: string) => void;
};

const routeToItem: Record<string, string> = {
    "/dashboard": "Statistiques",
    "/blindtest": "Blind Test",
    "/playlist": "Générateur\nde Playlists",
};

const items = ["Statistiques", "Blind Test", "Générateur\nde Playlists"];

const SideBar = ({ onSelect }: SideBarProps) => {
    const location = useLocation();
    
    const getActiveItem = () => routeToItem[location.pathname] || items[0];
    
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    
    const activeItem = selectedItem ?? getActiveItem();

    const handleSelect = (item: string) => {
        setSelectedItem(item);
        onSelect(item);
    };

    return (
        <div className="sidebar">
            <div className="logo-container">
                <div className="logo-icon-wrapper">
                    <Music className="logo-icon" strokeWidth={2} />
                </div>
                <span className="logo-text">SpotyFusion</span>
            </div>

            <div className="sidebar-divider" />
            <UserName />
            <div className="sidebar-divider" />

            <SwitchItems items={items} activeItem={activeItem} onSelect={handleSelect} />

            <LogoutButton />
        </div>
    );
};

export default SideBar;
