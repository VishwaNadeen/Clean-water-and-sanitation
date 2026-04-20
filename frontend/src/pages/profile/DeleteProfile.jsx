import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { deleteMyProfile } from "../../services/profileService";
import { clearAuthSession, getStoredUser } from "../../utils/auth";

export default function DeleteProfile() {
  const navigate = useNavigate();
  const { setPageError, profileBasePath } = useOutletContext();

  const storedUser = getStoredUser();
  const authProvider = String(storedUser?.authProvider || "local").toLowerCase();

  const isGoogleAccount = authProvider === "google";
  const isFacebookAccount = authProvider === "facebook";
  const isLocalAccount = !isGoogleAccount && !isFacebookAccount;

  const googleButtonRef = useRef(null);

  const [deletePassword, setDeletePassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [googleCredential, setGoogleCredential] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const [facebookReady, setFacebookReady] = useState(false);
  const [facebookAccessToken, setFacebookAccessToken] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

  useEffect(() => {
    if (!isGoogleAccount || !googleClientId) return;

    let isCancelled = false;
    let intervalId;

    const loadGoogleScript = () =>
      new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }

        const existing = document.querySelector(
          'script[src="https://accounts.google.com/gsi/client"]'
        );

        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error("Failed to load Google SDK.")),
            { once: true }
          );
          return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Google SDK."));
        document.body.appendChild(script);
      });

    loadGoogleScript()
      .then(() => {
        if (isCancelled) return;

        intervalId = window.setInterval(() => {
          if (!window.google?.accounts?.id || !googleButtonRef.current) return;

          window.clearInterval(intervalId);
          googleButtonRef.current.innerHTML = "";

          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response) => {
              setGoogleCredential(response?.credential || "");
              setPageError("");
            },
          });

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "continue_with",
            width: googleButtonRef.current.offsetWidth || 320,
          });

          setGoogleReady(true);
        }, 200);
      })
      .catch((error) => {
        if (!isCancelled) {
          setPageError(error.message || "Google confirmation setup failed.");
        }
      });

    return () => {
      isCancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [googleClientId, isGoogleAccount, setPageError]);

  useEffect(() => {
    if (!isFacebookAccount || !facebookAppId) return;

    let isCancelled = false;

    const loadFacebookScript = () =>
      new Promise((resolve, reject) => {
        if (window.FB) {
          resolve();
          return;
        }

        const existing = document.querySelector(
          'script[src="https://connect.facebook.net/en_US/sdk.js"]'
        );

        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error("Failed to load Facebook SDK.")),
            { once: true }
          );
          return;
        }

        const script = document.createElement("script");
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Facebook SDK."));
        document.body.appendChild(script);
      });

    loadFacebookScript()
      .then(() => {
        if (isCancelled || !window.FB) return;

        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: false,
          version: "v19.0",
        });

        setFacebookReady(true);
      })
      .catch((error) => {
        if (!isCancelled) {
          setPageError(error.message || "Facebook confirmation setup failed.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [facebookAppId, isFacebookAccount, setPageError]);

  function handleFacebookConfirm() {
    try {
      if (!window.FB) {
        throw new Error("Facebook SDK is not ready yet.");
      }

      setPageError("");

      window.FB.login(
        (response) => {
          const accessToken = response?.authResponse?.accessToken || "";

          if (!accessToken) {
            setPageError("Facebook confirmation was cancelled or failed.");
            return;
          }

          setFacebookAccessToken(accessToken);
        },
        { scope: "public_profile,email" }
      );
    } catch (error) {
      setPageError(error.message || "Facebook confirmation failed.");
    }
  }

  async function handleDelete(event) {
    event.preventDefault();

    if (confirmText.trim().toLowerCase() !== "delete") {
      setPageError('Please type "delete" to confirm.');
      return;
    }

    if (isGoogleAccount) {
      if (!googleCredential) {
        setPageError("Please confirm with Google before deleting your account.");
        return;
      }
    } else if (isFacebookAccount) {
      if (!facebookAccessToken) {
        setPageError("Please confirm with Facebook before deleting your account.");
        return;
      }
    } else {
      if (!deletePassword.trim()) {
        setPageError("Password is required.");
        return;
      }
    }

    try {
      setDeleting(true);
      setPageError("");

      const data = await deleteMyProfile(
        isGoogleAccount
          ? { googleCredential }
          : isFacebookAccount
          ? { facebookAccessToken }
          : { password: deletePassword }
      );

      clearAuthSession();
      alert(data?.message || "Account deleted successfully.");
      navigate("/login");
    } catch (error) {
      setPageError(error.message || "Failed to delete profile.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Delete Account
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            This action is permanent.
            {isGoogleAccount ? (
              <>
                {" "}Confirm with Google and type{" "}
                <span className="font-semibold text-red-600">delete</span> to
                continue.
              </>
            ) : isFacebookAccount ? (
              <>
                {" "}Confirm with Facebook and type{" "}
                <span className="font-semibold text-red-600">delete</span> to
                continue.
              </>
            ) : (
              <>
                {" "}Enter your password and type{" "}
                <span className="font-semibold text-red-600">delete</span> to
                confirm.
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleDelete} className="space-y-6">
          {isGoogleAccount ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Confirm with Google
              </label>

              <div
                ref={googleButtonRef}
                className="min-h-[44px] w-full overflow-hidden rounded-full"
              />

              {!googleClientId && (
                <p className="mt-2 text-sm text-red-500">
                  Google is not configured.
                </p>
              )}

              {googleReady && googleCredential && (
                <p className="mt-3 text-sm font-medium text-emerald-600">
                  Google confirmation completed.
                </p>
              )}
            </div>
          ) : isFacebookAccount ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Confirm with Facebook
              </label>

              <button
                type="button"
                onClick={handleFacebookConfirm}
                disabled={!facebookReady}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue with Facebook
              </button>

              {!facebookAppId && (
                <p className="mt-2 text-sm text-red-500">
                  Facebook is not configured.
                </p>
              )}

              {facebookReady && facebookAccessToken && (
                <p className="mt-3 text-sm font-medium text-emerald-600">
                  Facebook confirmation completed.
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setPageError("");
                }}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Type "delete" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setPageError("");
              }}
              placeholder='Type "delete"'
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="submit"
              disabled={deleting}
              className="rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70"
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </button>

            <button
              type="button"
              onClick={() => navigate(profileBasePath)}
              className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}