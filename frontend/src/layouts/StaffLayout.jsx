import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

function DashboardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="4.5" rx="1.5" />
      <rect x="13" y="11" width="7" height="9" rx="1.5" />
      <rect x="4" y="13.5" width="7" height="6.5" rx="1.5" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 6.5h14" />
      <path d="M5 12h14" />
      <path d="M5 17.5h9" />
    </svg>
  );
}

function RequestsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5c3.4 4 5.1 7 5.1 9.1a5.1 5.1 0 1 1-10.2 0c0-2.1 1.7-5.1 5.1-9.1Z" />
      <path d="M9.5 17.2c.7.5 1.5.8 2.5.8 2.1 0 3.8-1.7 3.8-3.8" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function StaffLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const textTransition =
    "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out";

  const handleLogout = () => {
    const shouldLogout = window.confirm("Are you sure you want to logout?");

    if (!shouldLogout) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/staff/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "My Schedules",
      path: "/staff/my-schedules",
      icon: <RequestsIcon />,
    },
    {
      label: "Work Summary",
      path: "/staff/work-summary",
      icon: <SummaryIcon />,
    },
    {
      label: "Profile",
      path: "/staff/profile",
      icon: <ProfileIcon />,
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100">
      <div
        className={`grid h-screen items-stretch transition-[grid-template-columns] duration-500 ease-out ${
          collapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[260px_1fr]"
        }`}
      >
        <aside className="hidden h-screen overflow-hidden lg:flex lg:flex-col bg-gradient-to-b from-cyan-900 via-sky-900 to-blue-900 text-white shadow-xl transition-all duration-500 ease-out">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
            <div
              className={`min-w-0 transition-all duration-300 ease-out ${
                collapsed ? "max-w-0 -translate-x-3 opacity-0" : "max-w-[180px] translate-x-0 opacity-100"
              }`}
            >
              <div className={textTransition}>
                <h1 className="text-lg font-bold">Staff Panel</h1>
                <p className="text-xs text-cyan-200">Clean Water and Sanitation</p>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-white transition-all duration-300 hover:bg-white/10"
              aria-label={collapsed ? "Expand staff sidebar" : "Collapse staff sidebar"}
            >
              <span
                className={`transition-transform duration-300 ease-out ${
                  collapsed ? "rotate-0" : "rotate-180"
                }`}
              >
                <ChevronRightIcon />
              </span>
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 transition-all duration-300 ease-out ${
                    isActive
                    ? "bg-white text-cyan-900"
                    : "text-white hover:bg-white/10"
                  } ${collapsed ? "justify-center px-2" : "justify-start gap-3 px-4"}`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span
                  className={`${textTransition} text-sm font-medium ${
                    collapsed ? "max-w-0 translate-x-2 opacity-0" : "max-w-[160px] translate-x-0 opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3">
            <button
              onClick={handleLogout}
              className={`flex h-12 w-full items-center overflow-hidden rounded-2xl bg-red-500 text-sm font-medium text-white transition-all duration-300 ease-out hover:bg-red-600 ${
                collapsed
                  ? "justify-center px-0 shadow-[0_10px_24px_rgba(239,68,68,0.3)]"
                  : "justify-center gap-2 px-4"
              }`}
              title={collapsed ? "Logout" : undefined}
              aria-label="Logout"
            >
              <span className="shrink-0">
                <LogoutIcon />
              </span>
              <span
                className={`${textTransition} ${
                  collapsed ? "max-w-0 translate-x-2 opacity-0" : "max-w-[100px] translate-x-0 opacity-100"
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 h-screen flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
            <h1 className="font-bold text-sky-900">Staff Panel</h1>
            <div className="flex items-center gap-2">
              <NavLink
                to="/staff/profile"
                className="rounded bg-sky-700 px-3 py-1 text-white"
              >
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded bg-red-500 px-3 py-1 text-white"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-2 md:px-6 md:pb-6 md:pt-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
