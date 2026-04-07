import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
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
    }

    loadProfile();
  }, [token, navigate]);

  return {
    profile,
    setProfile,
    loading,
    pageError,
    setPageError,
    storedUser,
    token,
  };
}