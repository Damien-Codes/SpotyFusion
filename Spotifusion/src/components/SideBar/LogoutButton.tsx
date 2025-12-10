import { LogOut } from 'lucide-react';
import { clearTokens } from '../../service/spotifyAuth';

const LogoutButton = () => {
    const handleLogout = () => {
        clearTokens();
        localStorage.removeItem('spotify_token');
        window.location.href = "/";
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            <LogOut strokeWidth={1.5} />
            <span>Déconnexion</span>
        </button>
    );
};

export default LogoutButton;
