import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import {
  loginUser,
  loginWithGoogle,
  loginWithFacebook,
} from "../../services/authService";
import { setAuthSession, isLoggedIn, getStoredUser } from "../../utils/auth";

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.7 10s3-5 8.3-5 8.3 5 8.3 5-3 5-8.3 5-8.3-5-8.3-5Z" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 2l16 16" />
      <path d="M8.8 4.9A9.8 9.8 0 0 1 10 4.8c5.3 0 8.3 5.2 8.3 5.2a13.7 13.7 0 0 1-2.8 3.4" />
      <path d="M5.2 5.3A14.3 14.3 0 0 0 1.7 10s3 5.2 8.3 5.2a8.9 8.9 0 0 0 3-.5" />
      <path d="M8.6 8.6A2 2 0 0 0 8 10a2 2 0 0 0 2 2c.5 0 1-.2 1.4-.6" />
    </svg>
  );
}

function RestroomIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-8 w-8"
      stroke="#0369a1"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="14" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M14 13v9M14 22l-4 7M14 22l4 7" />
      <path d="M10 16h8" />

      <circle cx="34" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M34 13v5" />
      <path d="M28 18h12l-2 11h-8l-2-11Z" fill="rgba(3,105,161,0.15)" />
      <path d="M34 29v6" />

      <line
        x1="24"
        y1="4"
        x2="24"
        y2="38"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.07.72-2.43 1.15-4.06 1.15-3.12 0-5.76-2.1-6.7-4.93H1.3v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.31A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.57.37-2.31V6.6H1.3A12 12 0 0 0 0 12c0 1.93.46 3.75 1.3 5.4l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.2 15.24 0 12 0A12 12 0 0 0 1.3 6.6l4 3.09c.94-2.83 3.58-4.92 6.7-4.92Z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"
      />
    </svg>
  );
}

function buildSafeUser(data, fallbackEmail = "") {
  const role = String(data?.role || "user").toLowerCase();

  return {
    id: data?.id || data?._id || data?.profileId || "",
    username: data?.username || data?.fullName || "User",
    fullName: data?.fullName || data?.username || "User",
    email: data?.email || fallbackEmail,
    role,
    authProvider: data?.authProvider || "local",
    mustChangePassword: Boolean(data?.mustChangePassword),
  };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleBtnRef = useRef(null);

  const { message: loginMessage, redirect: redirectAfterLogin } =
    location.state || {};

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const storedUser = getStoredUser?.();
  const storedRole = String(storedUser?.role || "").toLowerCase();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

  if (isLoggedIn()) {
    if (storedRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (storedRole === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    }

    return <Navigate to={redirectAfterLogin || "/"} replace />;
  }

  function redirectByRole(role) {
    const lowerRole = String(role || "user").toLowerCase();

    if (lowerRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (lowerRole === "staff") {
      navigate("/staff/dashboard", { replace: true });
      return;
    }

    navigate(redirectAfterLogin || "/", { replace: true });
  }

  async function completeSocialLogin(data, fallbackEmail = "") {
    const safeUser = buildSafeUser(data, fallbackEmail);
    setAuthSession({ token: data?.token, user: safeUser });
    redirectByRole(safeUser.role);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  }

  function validate() {
    const errs = {};

    if (!formData.email.trim()) {
      errs.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      errs.password = "Password is required.";
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");

      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      const safeUser = buildSafeUser(data, formData.email.trim().toLowerCase());
      setAuthSession({ token: data?.token, user: safeUser });
      redirectByRole(safeUser.role);
    } catch (error) {
      setSubmitError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!googleClientId) return;

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
          if (!window.google?.accounts?.id || !googleBtnRef.current) return;

          window.clearInterval(intervalId);
          googleBtnRef.current.innerHTML = "";

          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              try {
                setSubmitError("");
                setSocialLoading("google");
                const data = await loginWithGoogle(response.credential);
                await completeSocialLogin(data);
              } catch (error) {
                setSubmitError(error.message || "Google login failed.");
              } finally {
                setSocialLoading("");
              }
            },
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            logo_alignment: "center",
            width: googleBtnRef.current.offsetWidth || 320,
          });

          window.setTimeout(() => {
            const googleIframe = googleBtnRef.current?.querySelector("iframe");

            if (googleIframe) {
              googleIframe.style.borderRadius = "0.75rem";
            }
          }, 0);
        }, 200);
      })
      .catch((error) => {
        if (!isCancelled) {
          setSubmitError(error.message || "Google login setup failed.");
        }
      });

    return () => {
      isCancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [googleClientId]);

  useEffect(() => {
    if (!facebookAppId) return;

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
      })
      .catch((error) => {
        if (!isCancelled) {
          setSubmitError(error.message || "Facebook login setup failed.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [facebookAppId]);

  function handleFacebookLogin() {
    try {
      if (!window.FB) {
        throw new Error("Facebook SDK is not ready yet.");
      }

      setSubmitError("");
      setSocialLoading("facebook");

      window.FB.login(
        (response) => {
          (async () => {
            try {
              if (!response?.authResponse?.accessToken) {
                throw new Error("Facebook login was cancelled or failed.");
              }

              const data = await loginWithFacebook(
                response.authResponse.accessToken
              );

              await completeSocialLogin(data);
            } catch (error) {
              setSubmitError(error.message || "Facebook login failed.");
            } finally {
              setSocialLoading("");
            }
          })();
        },
        { scope: "public_profile,email" }
      );
    } catch (error) {
      setSocialLoading("");
      setSubmitError(error.message || "Facebook login failed.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:flex flex-col">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-sky-100/70 border border-sky-200 mb-6">
            <RestroomIcon />
          </div>

          <h1 className="text-4xl font-bold leading-tight text-sky-900">
            Manage your reports &amp; account
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-sky-700 max-w-sm">
            Access your profile, submit sanitation requests, and track the
            status of your reports — all in one secure place.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {[
              {
                icon: (
                  <svg
                    className="h-5 w-5 text-sky-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                ),
                title: "Submit & track reports",
                desc: "Log sanitation issues and follow progress in real time.",
              },
              {
                icon: (
                  <svg
                    className="h-5 w-5 text-sky-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ),
                title: "Get instant notifications",
                desc: "Stay updated when your reports change status.",
              },
              {
                icon: (
                  <svg
                    className="h-5 w-5 text-sky-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                title: "Secure &amp; private",
                desc: "Your data is protected with role-based access control.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-sky-100/80 border border-sky-200 flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-sky-900">{title}</p>
                  <p className="text-xs text-sky-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto bg-white/75 backdrop-blur-xl border border-sky-200/70 rounded-3xl shadow-xl shadow-sky-100/40 p-8">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100/80 border border-sky-200 mb-4 md:hidden">
              <RestroomIcon />
            </div>
            <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100/80 border border-sky-200 mb-4">
              <RestroomIcon />
            </div>

            <h2 className="text-2xl font-bold text-sky-900">Welcome back</h2>
            <p className="mt-1 text-sm text-sky-500">Sign in to your account</p>

            {loginMessage && (
              <div className="mt-3 w-full flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                <span>⚠</span>
                <span>{loginMessage}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-sky-800 tracking-wide uppercase">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-sky-800 tracking-wide uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-sky-500 hover:text-sky-700 hover:underline underline-offset-2 transition"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 pr-12 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 flex items-center justify-center w-8 h-full text-sky-400 hover:text-sky-600 transition"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100/80">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </span>
                </button>
              </div>

              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Boolean(socialLoading)}
              className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Logging in…
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-sky-100" />
            <span className="text-xs text-sky-300">or continue with</span>
            <div className="flex-1 h-px bg-sky-100" />
          </div>

          <div className="space-y-3">
            <div
              className={`relative ${
                !googleClientId ? "hidden" : ""
              }`}
            >
              <div className="pointer-events-none flex w-full items-center justify-center gap-3 rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-900">
                <GoogleMark />
                Continue with Google
              </div>
              <div
                ref={googleBtnRef}
                className="absolute inset-0 overflow-hidden rounded-xl opacity-0 [&>div]:!h-full [&>div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full"
              />
            </div>

            {!googleClientId && (
              <button
                type="button"
                disabled
                className="hidden w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-400"
              >
                <GoogleMark />
                Google is not configured
              </button>
            )}

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={!facebookAppId || socialLoading === "facebook" || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {socialLoading === "facebook" ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Connecting Facebook…
                </>
              ) : (
                <>
                  <FacebookMark />
                  Continue with Facebook
                </>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-sky-600">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-2 decoration-sky-300 hover:decoration-sky-500 transition"
            >
              Create a profile
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
