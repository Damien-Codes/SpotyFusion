import { useState, useEffect } from "react";

interface UserProfile {
    name: string;
    avatarUrl: string;
    isPremium: boolean;
}

async function fetchUserProfile(accessToken: string): Promise<UserProfile | null> {
    if (!accessToken) return null;

    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem("spotify_token");
            window.location.reload();
        }
        return null;
    }

    const data = await response.json();

    return {
        name: data.display_name || "Utilisateur Spotify",
        avatarUrl: data.images?.[0]?.url || "https://via.placeholder.com/40",
        isPremium: data.product === "premium",
    };
}

const UserName = () => {
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: "",
        avatarUrl: "/default-avatar.png",
        isPremium: false,
    });

    useEffect(() => {
        const accessToken = localStorage.getItem("spotify_token");
        if (accessToken) {
            fetchUserProfile(accessToken).then(profile => {
                if (profile) setUserProfile(profile);
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
};

export default UserName;