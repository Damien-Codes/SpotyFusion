import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { clearTokens } from '../../service/spotifyAuth';

const LogoutButton: React.FC = () => {
    const handleLogout = () => {
        clearTokens();
        localStorage.removeItem('spotify_token');
        window.location.href = "/";
    };

    return (
        <button
            onClick={handleLogout}
            className="logout-button"
        >
            <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                style={{ marginRight: '10px' }}
            />
            Déconnexion
        </button>
    );
};

export default LogoutButton;