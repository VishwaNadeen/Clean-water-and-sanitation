import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { clearAuthSession, getStoredUser } from "../../utils/auth";
import { getCurrentUserRole } from "../../utils/role";
import { getMyProfile } from "../../services/profileService";

function navClass({ isActive }) {
  return `group block rounded-2xl px-4 py-3.5 text-sm font-medium transition ${
    isActive
      ? "border border-sky-200 bg-white text-sky-700 shadow-[0_10px_24px_rgba(56,189,248,0.12)]"
      : "border border-transparent text-slate-700 hover:border-sky-100 hover:bg-white/90 hover:text-sky-700"
  }`;
}

function SectionTitle({ children }) {
  return (
    <p className="mb-2 mt-5 px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 first:mt-0">
      {children}
    </p>
  );
}

export default function DashboardLayout({ title, subtitle, children }) {
  const user = getStoredUser();
  const role = getCurrentUserRole();
  const isAdmin = role === "ADMIN" || role === "MANAGER";
  const homePath = isAdmin ? "/admin/dashboard" : "/staff/dashboard";
  const [profileImageUrl, setProfileImageUrl] = useState(
    user?.profileImageUrl || ""
  );
  const firstLetter = String(user?.fullName || user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    async function loadProfileImage() {
      try {
        const profile = await getMyProfile();
        setProfileImageUrl(profile?.profileImageUrl || "");
      } catch (error) {
        setProfileImageUrl(user?.profileImageUrl || "");
      }
    }

    loadProfileImage();
  }, [user?.profileImageUrl]);

  function handleLogout() {
    const shouldLogout = window.confirm("Are you sure you want to logout?");

    if (!shouldLogout) {
      return;
    }

    clearAuthSession();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] px-4 py-10 text-slate-800">
      <div className="w-full px-2 lg:px-4">
        <div className="items-start gap-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.9)_0%,rgba(255,255,255,0.98)_100%)] p-5 lg:sticky lg:top-24 lg:self-start">
              <div className="mb-5 rounded-2xl border border-sky-100 bg-white/80 px-4 py-4">
                <div className="mb-4 flex items-center gap-3">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-16 w-16 rounded-2xl border border-sky-200 object-cover"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-100 to-blue-100 text-2xl font-semibold text-sky-900">
                      {firstLetter}
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                  {isAdmin ? "Management Panel" : "Staff Workspace"}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {subtitle || user?.email || "Logged user"}
                </p>
              </div>

              <nav className="space-y-2">
                <SectionTitle>{isAdmin ? "Work Area" : "Workspace"}</SectionTitle>

                <NavLink to={homePath} end className={navClass}>
                  Dashboard
                </NavLink>

                {isAdmin ? (
                  <>
                    <NavLink to="/admin/staff-list" className={navClass}>
                      Staff List
                    </NavLink>
                    <NavLink to="/admin/schedules" className={navClass}>
                      Schedules
                    </NavLink>
                    <NavLink to="/admin/issues" className={navClass}>
                      Issues
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/staff/my-schedules" className={navClass}>
                      My Schedules
                    </NavLink>

                    <SectionTitle>Account</SectionTitle>

                    <NavLink to="/profile" end className={navClass}>
                      Profile Details
                    </NavLink>
                    <NavLink to="/profile/edit" className={navClass}>
                      Edit Profile
                    </NavLink>
                    <NavLink to="/profile/password" className={navClass}>
                      Change Password
                    </NavLink>
                    <NavLink to="/profile/delete" className={navClass}>
                      Delete Account
                    </NavLink>
                  </>
                )}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-5 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Logout
              </button>
          </aside>

          <section className="min-w-0">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
