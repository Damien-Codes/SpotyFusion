import React, { useState, useEffect } from "react";

// 1. Définition de l'interface pour le profil utilisateur (bonne pratique)
interface UserProfile {
    name: string;
    avatarUrl: string;
    isPremium: boolean;
}

// 2. Fonction pour appeler l'API de Spotify pour récupérer le profil
async function fetchUserProfile(accessToken: string): Promise<UserProfile | null> {
    if (!accessToken) return null;

    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        console.error("Échec de la récupération du profil Spotify:", response.status);
        // Si le jeton est expiré (401), il faut le retirer
        if (response.status === 401) {
            localStorage.removeItem("spotify_token");
            window.location.reload(); // Force la déconnexion
        }
        return null;
    }

    const data = await response.json();

    return {
        // Le champ de l'API est 'display_name'
        name: data.display_name || "Utilisateur Spotify",
        // Récupère l'URL de la première image (avatar)
        avatarUrl: (data.images && data.images.length > 0) ? data.images[0].url : "https://via.placeholder.com/40",
        isPremium: data.product === 'premium',
    };
}


const UserName: React.FC = () => {

    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: "",
        avatarUrl: "/default-avatar.png",
        isPremium: false,
    });

    useEffect(() => {
        // Lecture du jeton
        const accessToken = localStorage.getItem("spotify_token");

        if (accessToken) {
            // Appel de la fonction pour récupérer le profil
            fetchUserProfile(accessToken)
                .then(profile => {
                    if (profile) {
                        setUserProfile(profile); // Mise à jour de l'état
                    }
                })
                .catch(error => {
                    console.error("Erreur lors du fetch du profil:", error);
                });
        }
    }, []);

    return (
        <div className="user-profile-section">
            <img
                src={userProfile.avatarUrl}
                alt={userProfile.name || "Avatar utilisateur"}
                className="avatar"
            />
            <div>
                <h2 className="username">{userProfile.name}</h2>
                {userProfile.isPremium && <span className="premium-tag">Premium</span>}
            </div>
        </div>
    );
}

export default UserName;