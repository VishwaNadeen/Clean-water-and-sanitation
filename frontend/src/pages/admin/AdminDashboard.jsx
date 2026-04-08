import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const cards = [
    {
      title: "Manage Users",
      description: "View, search, update, and control registered users.",
      link: "/admin/users",
    },
    {
      title: "Manage Staff",
      description: "Handle staff accounts, roles, and profile details.",
      link: "/admin/staff",
    },
    {
      title: "Reports",
      description: "View system activity, summaries, and platform insights.",
      link: "/admin/reports",
    },
    {
      title: "Settings",
      description: "Control system settings and administrative options.",
      link: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col bg-slate-900 text-white">
          <div className="border-b border-slate-800 px-6 py-6">
            <h1 className="text-2xl font-bold tracking-wide">Admin Panel</h1>
            <p className="mt-2 text-sm text-slate-400">
              Smart Healthcare System
            </p>
          </div>

          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin/dashboard"
                  className="block rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Users
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/staff"
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Staff
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/reports"
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/settings"
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </nav>

          <div className="border-t border-slate-800 px-6 py-5">
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="mt-1 font-semibold">{user?.username || "Admin"}</p>
            <p className="text-sm text-slate-400">{user?.email || ""}</p>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex min-h-screen flex-col">
          {/* Top bar */}
          <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Admin Dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Welcome back, {user?.username || "Admin"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Site
                </Link>
                <Link
                  to="/login"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                >
                  Logout
                </Link>
              </div>
            </div>
          </header>

          {/* Page body */}
          <main className="flex-1 p-6">
            {/* Mobile admin title */}
            <div className="mb-6 rounded-2xl bg-slate-900 p-5 text-white lg:hidden">
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="mt-1 text-sm text-slate-300">
                Smart Healthcare System
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-800">120</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Registered platform users
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Total Staff
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-800">24</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Active staff members
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  Active Sessions
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-800">18</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Current live activities
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-500">
                  System Status
                </p>
                <h3 className="mt-3 text-2xl font-bold text-green-600">
                  Healthy
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  All core services running
                </p>
              </div>
            </div>

            {/* Action cards */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-slate-800">
                Quick Actions
              </h3>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {cards.map((item) => (
                  <Link
                    key={item.title}
                    to={item.link}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <h4 className="text-lg font-semibold text-slate-800">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                      Open section →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent activity section */}
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                Recent Activity
              </h3>

              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-medium text-slate-800">
                      New user account created
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      A new patient registered to the system.
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">2 min ago</span>
                </div>

                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-medium text-slate-800">
                      Staff profile updated
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      A staff account information was modified.
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">10 min ago</span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800">
                      Admin login successful
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Administrative access granted to the dashboard.
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">Just now</span>
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}