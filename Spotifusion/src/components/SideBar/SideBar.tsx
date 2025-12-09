// SideBar.tsx
import '../../assets/SideBar.css';
import LogoutButton from './LogoutButton';
import UserName from './UserName';
import SwitchItems from './SwitchItems';

type SideBarProps = {
    onSelect: (item: string) => void;
};

const SideBar = ({ onSelect }: SideBarProps) => {
    const items = ["Statistiques", "Blind Test", "Générateur de playlist"];

    return (
        <div className="sidebar">
            <div className="logo-container">
                <div className="logo-icon-wrapper">
                    <svg
                        className="logo-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <h1>SpotyFusion</h1>
            </div>

            <UserName />

            {/* Ici on utilise SwitchItems pour gérer tous les boutons */}
            <SwitchItems items={items} onSelect={onSelect} />

            <LogoutButton />
        </div>
    );
};

export default SideBar;