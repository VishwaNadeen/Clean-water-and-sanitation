import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { setAuthSession, isLoggedIn, getStoredUser } from "../../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const storedUser = getStoredUser?.();
  const storedRole = String(storedUser?.role || "").toLowerCase();

  if (isLoggedIn()) {
    if (storedRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (storedRole === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    }

    return <Navigate to="/profile" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
  }

  function validate() {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

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
      };

      setAuthSession({
        token: data?.token,
        user: safeUser,
      });

      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "staff") {
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      setSubmitError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] px-4 py-10 text-slate-800">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[12px] font-semibold tracking-[0.3px] text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Clean Water &amp; Sanitation
          </div>

          <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Login to manage your reports and account
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600">
            Access your account, view your profile, and manage your sanitation
            and water-related requests in one place.
          </p>
        </div>

        <div className="order-1 md:order-2">
          <div className="mx-auto max-w-md rounded-[28px] border border-sky-200/80 bg-white/95 p-6 shadow-[0_16px_50px_rgba(56,189,248,0.12)] backdrop-blur">
            <div className="mb-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-100 to-blue-100 text-3xl shadow-[0_8px_24px_rgba(56,189,248,0.14)]">
                💧
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email and password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.password && (
                  <p className="mt-2 text-xs font-medium text-red-500">
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
                disabled={loading}
                className="w-full rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}