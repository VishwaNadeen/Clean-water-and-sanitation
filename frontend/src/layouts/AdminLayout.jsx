import { Outlet, Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="grid h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-screen overflow-hidden bg-slate-900 text-white lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="mt-2 text-sm text-slate-400">
              Smart Healthcare System
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin/dashboard"
                  className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-blue-600 hover:text-white"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/users"
                  className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-blue-600 hover:text-white"
                >
                  Users
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/staff"
                  className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-blue-600 hover:text-white"
                >
                  Staff
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/reports"
                  className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-blue-600 hover:text-white"
                >
                  Reports
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/settings"
                  className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-blue-600 hover:text-white"
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

            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="flex h-screen min-w-0 flex-col overflow-hidden">
          <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}
