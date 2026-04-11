import { useState } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
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
      {/* Male figure */}
      <circle cx="14" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M14 13v9M14 22l-4 7M14 22l4 7" />
      <path d="M10 16h8" />

      {/* Female figure */}
      <circle cx="34" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M34 13v5" />
      <path d="M28 18h12l-2 11h-8l-2-11Z" fill="rgba(3,105,161,0.15)" />
      <path d="M34 29v6" />

      {/* Divider */}
      <line x1="24" y1="4" x2="24" y2="38" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message: loginMessage, redirect: redirectAfterLogin } =
    location.state || {};

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const storedUser = getStoredUser?.();
  const storedRole = String(storedUser?.role || "").toLowerCase();

  if (isLoggedIn()) {
    if (storedRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (storedRole === "staff") return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to={redirectAfterLogin || "/"} replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  }

  function validate() {
    const errs = {};
    if (!formData.email.trim()) errs.email = "Email is required.";
    if (!formData.password.trim()) errs.password = "Password is required.";
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
      const userRole = String(data?.role || "user").toLowerCase();
      const safeUser = {
        id: data?.id || data?._id || "",
        username: data?.username || data?.fullName || "User",
        fullName: data?.fullName || data?.username || "User",
        email: data?.email || formData.email.trim().toLowerCase(),
        role: userRole,
        mustChangePassword: Boolean(data?.mustChangePassword),
      };
      setAuthSession({ token: data?.token, user: safeUser });
      if (userRole === "admin") navigate("/admin/dashboard", { replace: true });
      else if (userRole === "staff") navigate("/staff/dashboard", { replace: true });
      else navigate(redirectAfterLogin || "/", { replace: true });
    } catch (error) {
      setSubmitError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* ── Left hero panel ── */}
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
                  <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                ),
                title: "Submit & track reports",
                desc: "Log sanitation issues and follow progress in real time.",
              },
              {
                icon: (
                  <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ),
                title: "Get instant notifications",
                desc: "Stay updated when your reports change status.",
              },
              {
                icon: (
                  <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

        {/* ── Right card ── */}
        <div className="w-full max-w-md mx-auto bg-white/75 backdrop-blur-xl border border-sky-200/70 rounded-3xl shadow-xl shadow-sky-100/40 p-8">

          {/* Card header */}
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

            {/* Email */}
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
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
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
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Logging in…
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-sky-100" />
            <span className="text-xs text-sky-300">or</span>
            <div className="flex-1 h-px bg-sky-100" />
          </div>

          {/* Create profile link */}
          <div className="flex items-center justify-center gap-1.5 text-sm text-sky-600">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-2 decoration-sky-300 hover:decoration-sky-500 transition"
            >
              Create a profile
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>

          {/* Terms */}
          <p className="mt-5 text-center text-[11px] text-sky-400 leading-relaxed">
            By signing in you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-sky-600 transition">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-sky-600 transition">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
