import React from 'react';
// Import des composants Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import de l'icône spécifique "arrow-right-from-bracket"
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';


const LogoutButton: React.FC = () => {
    const handleLogout = () => {
        // Supprime la clé que Callback/UserName écrivent/lisent
        localStorage.removeItem('spotify_token');

        // Supprime les autres clés de sécurité
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_code_verifier');

        window.location.href = "/";
    };

    return (
        <button
            onClick={handleLogout}
            className="logout-button"
        >
            {/* 🔑 AJOUT DE L'ICÔNE FONT AWESOME */}
            <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                style={{ marginRight: '10px' }} // Petite marge pour séparer l'icône du texte
            />
            Déconnexion
        </button>
    );
};

export default LogoutButton;