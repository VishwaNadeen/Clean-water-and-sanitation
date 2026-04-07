import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/auth";
import { logoutUser } from "../../services/authService";

export default function ProfileLayout({
  title,
  subtitle,
  children,
  token,
  profile,
  storedUser,
}) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
    } finally {
      clearAuthSession();
      navigate("/login");
    }
  }

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-sky-100 text-sky-700 border border-sky-200"
        : "text-slate-700 border border-transparent hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-[0_16px_50px_rgba(56,189,248,0.1)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-100 to-blue-100 text-3xl shadow-[0_10px_28px_rgba(56,189,248,0.14)]">
                👤
              </div>

              <div>
                <p className="text-sm font-medium text-sky-700">My Account</p>
                <h1 className="text-3xl font-bold text-slate-900">
                  {profile?.firstName || storedUser?.fullName || "User"}{" "}
                  {profile?.lastName || ""}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {storedUser?.role || "user"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                Account Settings
              </p>

              <div className="space-y-2">
                <NavLink to="/profile" end className={navItemClass}>
                  <span>Profile Details</span>
                  <span>👤</span>
                </NavLink>

                <NavLink to="/profile/edit" className={navItemClass}>
                  <span>Edit Profile</span>
                  <span>✏️</span>
                </NavLink>

                <NavLink to="/profile/password" className={navItemClass}>
                  <span>Change Password</span>
                  <span>🔐</span>
                </NavLink>

                <NavLink to="/profile/delete" className={navItemClass}>
                  <span>Delete Account</span>
                  <span>🗑️</span>
                </NavLink>
              </div>
            </aside>

            <section className="rounded-2xl border border-sky-200 bg-white p-5">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                {subtitle ? (
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                ) : null}
              </div>

              {children}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}