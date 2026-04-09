import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { clearAuthSession, getStoredUser, isLoggedIn } from "../../utils/auth";
import { logoutUser } from "../../services/authService";
import { getMyProfile } from "../../services/profileService";

const NAVBAR_LOGO_URL =
  "https://api.iconify.design/material-symbols/wc-rounded.svg?color=%23000000";

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [profileImageUrl, setProfileImageUrl] = useState(
    getStoredUser()?.profileImageUrl || ""
  );
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const syncAuth = () => {
      setLoggedIn(isLoggedIn());
      setProfileImageUrl(getStoredUser()?.profileImageUrl || "");
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  useEffect(() => {
    async function loadProfileImage() {
      if (!loggedIn) {
        setProfileImageUrl("");
        return;
      }

      try {
        const profile = await getMyProfile();
        setProfileImageUrl(profile?.profileImageUrl || "");
      } catch (error) {
        setProfileImageUrl(getStoredUser()?.profileImageUrl || "");
      }
    }

    loadProfileImage();
  }, [loggedIn]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    const shouldLogout = window.confirm("Are you sure you want to logout?");

    if (!shouldLogout) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (token) await logoutUser(token);
    } catch (error) {
    } finally {
      clearAuthSession();
      setLoggedIn(false);
      setProfileMenuOpen(false);
      navigate("/login");
    }
  }

  function addRipple(e) {
    const id = rippleId.current++;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples((r) => [...r, { id, x, y }]);

    setTimeout(() => {
      setRipples((r) => r.filter((rip) => rip.id !== id));
    }, 600);
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/rest-rooms", label: "Rest Rooms" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .nb2-root { font-family: 'Poppins', sans-serif; }

        @keyframes nb2-slide-in {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }

        @keyframes nb2-fade-left {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes nb2-fade-right {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes nb2-fade-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes nb2-ripple {
          to { transform: scale(5); opacity: 0; }
        }

        @keyframes nb2-menu-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .nb2-link {
          position: relative;
          overflow: hidden;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          color: #374151;
          transition: background 0.18s, color 0.18s;
          letter-spacing: 0.05px;
        }

        .nb2-link:hover {
          color: #0f172a;
        }

        .nb2-link.active {
          background: rgba(255,255,255,0.42);
          color: #0f172a;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
          font-weight: 600;
        }

        .nb2-link::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          height: 2px;
          width: 0;
          border-radius: 99px;
          background: rgba(255,255,255,0.95);
          transition: width 0.25s ease;
        }

        .nb2-link:hover::after {
          width: 55%;
        }

        .nb2-ripple-dot {
          pointer-events: none;
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.55);
          transform: scale(0);
          animation: nb2-ripple 0.6s linear forwards;
        }

        .nb2-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          background: rgba(255,255,255,0.92);
          color: #0369a1;
          border: 1px solid rgba(255,255,255,0.75);
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.1px;
          box-shadow: 0 10px 24px rgba(15,23,42,0.12);
          transition: background 0.18s, color 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.18s;
        }

        .nb2-btn-primary:hover {
          background: #f8fafc;
          border-color: #ffffff;
          color: #075985;
          box-shadow: 0 14px 28px rgba(15,23,42,0.16);
          transform: translateY(-1px) scale(1.01);
        }

        .nb2-btn-outline {
          min-height: 38px;
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          background: rgba(255,255,255,0.18);
          color: #ffffff;
          border: 1.5px solid rgba(255,255,255,0.65);
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
          transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
          letter-spacing: 0.1px;
        }

        .nb2-btn-outline:hover {
          background: rgba(255,255,255,0.28);
          border-color: #ffffff;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .nb2-btn-icon {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.16);
          border: 1.5px solid rgba(255,255,255,0.65);
          color: #ffffff;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
          transition: background 0.18s, border-color 0.18s, transform 0.18s;
        }

        .nb2-btn-icon:hover,
        .nb2-btn-icon[data-open="true"] {
          background: rgba(255,255,255,0.28);
          border-color: #ffffff;
          transform: translateY(-1px) scale(1.03);
        }

        .nb2-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 176px;
          padding: 8px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.8);
          box-shadow: 0 18px 36px rgba(15,23,42,0.16);
          backdrop-filter: blur(12px);
          animation: nb2-menu-in 0.18s ease-out both;
        }

        .nb2-menu-item {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 10px;
          border: 0;
          background: transparent;
          border-radius: 12px;
          padding: 11px 12px;
          color: #0f172a;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          transition: background 0.18s, transform 0.18s;
        }

        .nb2-menu-item:hover {
          background: rgba(255,255,255,0.35);
          transform: translateY(-1px);
        }

        .nb2-menu-divider {
          margin: 4px 6px;
          height: 1px;
          background: rgba(0,0,0,0.32);
        }

        .nb2-menu-item-danger {
          color: #dc2626;
        }
      `}</style>

      <header className="nb2-root relative z-[200]">
        <div
          className="relative overflow-visible"
          style={{
            animation: "nb2-slide-in 0.45s cubic-bezier(0.34,1.4,0.64,1) both",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.2), transparent 72%)",
            }}
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.16), transparent 72%)",
            }}
          />
          <div
            className="relative z-[1]"
            style={{
              background:
                "linear-gradient(0deg, rgba(143,208,251,0.88) 0%, rgba(83,179,245,0.94) 45%, rgba(67,160,232,0.98) 100%)",
              boxShadow: scrolled
                ? "0 4px 24px rgba(148,163,184,0.14), 0 1px 4px rgba(0,0,0,0.05)"
                : "0 2px 12px rgba(148,163,184,0.1)",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: scrolled ? "10px 24px" : "13px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                transition: "padding 0.3s",
              }}
            >
              <NavLink
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  animation: "nb2-fade-left 0.45s 0.1s both",
                }}
              >
                <img
                  src={NAVBAR_LOGO_URL}
                  alt="CWAS restroom logo"
                  style={{
                    width: 28,
                    height: 28,
                    flexShrink: 0,
                  }}
                >
                  <span className="absolute inset-0 rounded-[10px] bg-sky-200/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <span className="relative z-10">{label}</span>

                  <span className="absolute bottom-[5px] left-1/2 h-[1.5px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-transparent transition-all duration-300 group-hover:w-[60%]" />

                  {ripples.map((r) => (
                    <span
                      key={r.id}
                      className="pointer-events-none absolute rounded-full bg-sky-300/50"
                      style={{
                        left: r.x - 10,
                        top: r.y - 10,
                        width: 20,
                        height: 20,
                        transform: "scale(0)",
                        animation: "rippleAnim 0.6s linear forwards",
                      }}
                    />
                  ))}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {!loggedIn ? (
                <a
                  href="#get-started"
                  className="relative hidden overflow-hidden rounded-[11px] border border-sky-300/80 bg-gradient-to-br from-sky-400 to-blue-300 px-[18px] py-[9px] text-[13px] font-semibold tracking-[0.2px] text-white shadow-[0_2px_14px_rgba(56,189,248,0.22)] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_24px_rgba(56,189,248,0.35),0_0_0_3px_rgba(125,211,252,0.22)] md:inline-block animate-[fadeSlideRight_0.4s_0.3s_both]"
                >
                  <span className="absolute left-[-100%] top-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 hover:left-[100%]" />
                  <span className="relative z-10">Get Started</span>
                </a>
              ) : null}

              {!loggedIn ? (
                <button
                  className="rounded-[10px] border border-sky-300/80 bg-sky-100/80 px-4 py-2 text-[13px] font-semibold tracking-[0.1px] text-sky-600 transition-all duration-200 hover:border-sky-400 hover:bg-sky-200/70 hover:text-slate-900 hover:shadow-[0_0_14px_rgba(56,189,248,0.16)] animate-[fadeSlideRight_0.4s_0.3s_both]"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  CWAS
                </div>
              </NavLink>

              <nav
                className="hidden md:flex"
                style={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                {navLinks.map(({ to, label }, index) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={addRipple}
                    className={({ isActive }) => `nb2-link${isActive ? " active" : ""}`}
                    style={{ animation: `nb2-fade-down 0.4s ${0.15 + index * 0.07}s both` }}
                  >
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="h-full w-full rounded-[10px] object-cover"
                      />
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M20 20.5c-1.6-4-5-6-8-6s-6.4 2-8 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  animation: "nb2-fade-right 0.45s 0.3s both",
                }}
              >
                {!loggedIn ? (
                  <>
                    <NavLink to="/auth/register" className="nb2-btn-primary hidden md:inline-flex">
                      Get Started
                    </NavLink>
                    <button
                      className="nb2-btn-outline"
                      onClick={() => {
                        navigate("/login");
                      }}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <div ref={profileMenuRef} style={{ position: "relative" }}>
                    <button
                      className="nb2-btn-icon"
                      title="Account menu"
                      aria-haspopup="menu"
                      aria-expanded={profileMenuOpen}
                      data-open={profileMenuOpen ? "true" : "false"}
                      onClick={() => {
                        setProfileMenuOpen((open) => !open);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M20 20.5c-1.6-4-5-6-8-6s-6.4 2-8 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    {profileMenuOpen ? (
                      <div className="nb2-menu" role="menu">
                        <button
                          className="nb2-menu-item"
                          role="menuitem"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate("/profile");
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M20 20.5c-1.6-4-5-6-8-6s-6.4 2-8 6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                          Profile
                        </button>
                        <div className="nb2-menu-divider" />
                        <button
                          className="nb2-menu-item nb2-menu-item-danger"
                          role="menuitem"
                          onClick={handleLogout}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
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
                          Logout
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
