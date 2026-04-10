import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/profileService";
import { getStoredUser, getToken } from "../utils/auth";

export default function useProfileData() {
  const navigate = useNavigate();
  const token = getToken();
  const storedUser = getStoredUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const normalizedProfile = await getMyProfile();
      setProfile(normalizedProfile);
    } catch (error) {
      setPageError(error.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadProfile();

    const handleRefresh = () => {
      loadProfile();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadProfile();
      }
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("auth-changed", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("auth-changed", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, navigate, loadProfile]);

  return {
    profile,
    setProfile,
    loadProfile,
    loading,
    pageError,
    setPageError,
    storedUser,
    token,
  };
}
