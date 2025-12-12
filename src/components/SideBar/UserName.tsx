import { useState, useEffect } from "react";
import { getUserProfile, type UserProfile } from "../../service/SpotifyApi";

const UserName = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem("spotify_user_profile");
    return cached
      ? JSON.parse(cached)
      : {
          name: "",
          avatarUrl: "/default-avatar.png",
          isPremium: false,
        };
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("spotify_token");
    const cachedProfile = localStorage.getItem("spotify_user_profile");

    if (accessToken && !cachedProfile) {
      getUserProfile(accessToken).then((profile) => {
        if (profile) {
          setUserProfile(profile);
          localStorage.setItem("spotify_user_profile", JSON.stringify(profile));
        }
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
