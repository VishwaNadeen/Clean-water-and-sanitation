import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useLayoutEffect, useRef } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import PageTransition from "../components/common/PageTransition";

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

function UsersIcon() {
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
      <path d="M16 21v-1.3A4.7 4.7 0 0 0 11.3 15H7.7A4.7 4.7 0 0 0 3 19.7V21" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M21 21v-1.3a4.7 4.7 0 0 0-3.3-4.5" />
      <path d="M16.5 4.8a3.5 3.5 0 0 1 0 5.4" />
    </svg>
  );
}

function StaffIcon() {
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
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <path d="M18.5 6.5h2.5" />
      <path d="M19.8 5.2v2.6" />
    </svg>
  );
}

function RestroomsIcon() {
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
      <path d="M7 3v7" />
      <path d="M17 3v7" />
      <circle cx="7" cy="3.8" r="1.3" />
      <circle cx="17" cy="3.8" r="1.3" />
      <path d="M5.2 12h3.6L10 21" />
      <path d="M18.8 12h-3.6L14 21" />
      <path d="M12 9v12" />
    </svg>
  );
}

function ComplaintsIcon() {
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
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

function CategoriesIcon() {
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
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h10" />
      <path d="M6 5.5h.01" />
      <path d="M6 10.5h.01" />
      <path d="M6 15.5h.01" />
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

function ChevronDownIcon() {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);

  const [collapsed, setCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    staff: false,
    categories: false,
  });

  const textTransition =
    "overflow-hidden whitespace-nowrap transition-all duration-300 ease-out";

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const displayRole = useMemo(() => {
    const role = String(user?.role || "admin").trim().toLowerCase();
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : "Admin";
  }, [user]);

  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
  }, [location.pathname, location.search]);

  const performLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: <UsersIcon />,
    },
    {
      menuKey: "staff",
      label: "Staff",
      path: "/admin/staff",
      icon: <StaffIcon />,
      children: [
        {
          label: "Manage Staff",
          path: "/admin/staff",
        },
        {
          label: "Add Staff Member",
          path: "/admin/register-staff",
        },
      ],
    },
    {
      label: "Restrooms",
      path: "/admin/restrooms",
      icon: <RestroomsIcon />,
    },
    {
      label: "Complaints",
      path: "/admin/complaints",
      icon: <ComplaintsIcon />,
    },
    {
      menuKey: "categories",
      label: "Categories",
      path: "/admin/categories/view",
      icon: <CategoriesIcon />,
      children: [
        {
          label: "Create Category",
          path: "/admin/categories/create",
        },
        {
          label: "View Categories",
          path: "/admin/categories/view",
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const isParentActive = (item) =>
    item.children?.some((child) => location.pathname === child.path) ||
    location.pathname === item.path;

  const isMenuExpanded = (menuKey) => Boolean(expandedMenus[menuKey]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div
        className={`grid h-screen transition-[grid-template-columns] duration-500 ease-out ${
          collapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[260px_1fr]"
        }`}
      >
        <aside className="sticky top-0 hidden h-screen overflow-hidden bg-slate-900 text-white transition-all duration-500 ease-out lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-5">
            <div
              className={`min-w-0 transition-all duration-300 ease-out ${
                collapsed
                  ? "max-w-0 -translate-x-3 opacity-0"
                  : "max-w-[180px] translate-x-0 opacity-100"
              }`}
            >
              <div className={textTransition}>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="mt-2 text-sm text-slate-400">
                  Smart Healthcare System
                </p>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-white transition-all duration-300 hover:bg-slate-700"
              aria-label={
                collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"
              }
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

          <nav className="no-scrollbar flex-1 overflow-y-auto px-2 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  {item.children ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (collapsed) {
                            navigate(item.path);
                            return;
                          }

                          if (item.menuKey) {
                            toggleMenu(item.menuKey);
                          }
                        }}
                        title={collapsed ? item.label : undefined}
                        className={`flex w-full rounded-xl py-3 text-sm font-medium transition-all duration-300 ease-out hover:bg-blue-600 hover:text-white ${
                          isParentActive(item) ? "bg-blue-600 text-white" : ""
                        } ${
                          collapsed
                            ? "justify-center px-2"
                            : "items-center justify-between px-4"
                        }`}
                      >
                        <span className={`flex ${collapsed ? "" : "gap-3"}`}>
                          <span className="shrink-0">{item.icon}</span>
                          <span
                            className={`${textTransition} ${
                              collapsed
                                ? "max-w-0 translate-x-2 opacity-0"
                                : "max-w-[160px] translate-x-0 opacity-100"
                            }`}
                          >
                            {item.label}
                          </span>
                        </span>

                        {!collapsed ? (
                          <span
                            className={`transition-transform duration-300 ${
                              isMenuExpanded(item.menuKey)
                                ? "rotate-0"
                                : "-rotate-90"
                            }`}
                          >
                            <ChevronDownIcon />
                          </span>
                        ) : null}
                      </button>

                      {!collapsed && isMenuExpanded(item.menuKey) ? (
                        <ul className="space-y-1 pl-6">
                          {item.children.map((child) => (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                className={`block rounded-lg px-4 py-2.5 text-sm transition ${
                                  isActive(child.path)
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`flex rounded-xl py-3 text-sm font-medium transition-all duration-300 ease-out hover:bg-blue-600 hover:text-white ${
                        isActive(item.path) ? "bg-blue-600 text-white" : ""
                      } ${
                        collapsed
                          ? "justify-center px-2"
                          : "justify-start gap-3 px-4"
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span
                        className={`${textTransition} ${
                          collapsed
                            ? "max-w-0 translate-x-2 opacity-0"
                            : "max-w-[160px] translate-x-0 opacity-100"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div
            className={`border-t border-slate-800 transition-all duration-300 ease-out ${
              collapsed ? "px-3 py-4" : "px-6 py-5 text-center"
            }`}
          >
            <div
              className={`transition-all duration-300 ease-out ${
                collapsed ? "mx-auto flex w-full justify-center" : ""
              }`}
            >
              {collapsed ? (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 font-semibold text-white"
                  title={user?.email || displayRole}
                >
                  {displayRole.charAt(0)}
                </div>
              ) : (
                <div className={textTransition}>
                  <p className="font-semibold">{displayRole}</p>
                  <p className="text-sm text-slate-400">{user?.email || ""}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setLogoutDialogOpen(true)}
              className={`mt-4 flex w-full items-center overflow-hidden rounded-lg bg-red-600 text-sm font-medium text-white transition-all duration-300 ease-out hover:bg-red-500 ${
                collapsed
                  ? "justify-center px-0 py-3"
                  : "justify-center gap-2 px-4 py-2"
              }`}
              title={collapsed ? "Logout" : undefined}
              aria-label="Logout"
            >
              <span className="shrink-0">
                <LogoutIcon />
              </span>
              <span
                className={`${textTransition} ${
                  collapsed
                    ? "max-w-0 translate-x-2 opacity-0"
                    : "max-w-[100px] translate-x-0 opacity-100"
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        </aside>

        <section className="flex h-screen min-h-0 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
          </header>

          <main
            ref={contentRef}
            className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-6"
          >
            <PageTransition
              routeKey={`${location.pathname}${location.search}`}
              className="h-full w-full"
            >
              <Outlet />
            </PageTransition>
          </main>
        </section>
      </div>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Logout"
        message="Are you sure you want to logout from your admin account?"
        confirmText="Logout"
        cancelText="Stay"
        tone="danger"
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={() => {
          setLogoutDialogOpen(false);
          performLogout();
        }}
      />
    </div>
  );
}