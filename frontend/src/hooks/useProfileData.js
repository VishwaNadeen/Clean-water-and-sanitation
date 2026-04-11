import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../services/profileService";
import { getStoredUser, getToken } from "../utils/auth";

let profileCache = null;
let profileRequestPromise = null;

export default function useProfileData() {
  const navigate = useNavigate();
  const token = getToken();
  const storedUser = getStoredUser();

  const [profile, setProfile] = useState(profileCache);
  const [loading, setLoading] = useState(() => (!token ? false : !profileCache));
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      try {
        if (profileCache) {
          if (isMounted) {
            setProfile(profileCache);
            setLoading(false);
          }
          return;
        }

        if (!profileRequestPromise) {
          profileRequestPromise = getMyProfile();
        }

        const normalizedProfile = await profileRequestPromise;

        profileCache = normalizedProfile;

        if (isMounted) {
          setProfile(normalizedProfile);
          setPageError("");
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(error.message || "Failed to load profile.");
          setLoading(false);
        }
      } finally {
        profileRequestPromise = null;
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  function updateProfileState(nextProfile) {
    profileCache = nextProfile;
    setProfile(nextProfile);
  }

  function clearProfileState() {
    profileCache = null;
    profileRequestPromise = null;
    setProfile(null);
    setLoading(false);
    setPageError("");
  }

  return {
    profile,
    setProfile: updateProfileState,
    loading,
    pageError,
    setPageError,
    storedUser,
    token,
    clearProfileState,
  };
}
