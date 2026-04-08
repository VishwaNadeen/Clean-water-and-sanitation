import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { clearAuthSession, getStoredUser, isLoggedIn } from "../../utils/auth";
import { logoutUser } from "../../services/authService";
import { getMyProfile } from "../../services/profileService";

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [profileImageUrl, setProfileImageUrl] = useState(
    getStoredUser()?.profileImageUrl || ""
  );
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);

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

  async function handleLogout() {
    const shouldLogout = window.confirm("Are you sure you want to logout?");

    if (!shouldLogout) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
    } finally {
      clearAuthSession();
      setLoggedIn(false);
      setMenuOpen(false);
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .navbar-root {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        @keyframes rippleAnim {
          to { transform: scale(4); opacity: 0; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes navbarSlideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes mobileMenuOpen {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header
        className={`navbar-root sticky top-0 z-[100] transition-all duration-300 ${
          scrolled ? "py-0" : ""
        }`}
      >
        <div
          className={`overflow-hidden border-b border-sky-200/70 backdrop-blur-[28px] transition-all duration-300 animate-[navbarSlideIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both] ${
            scrolled
              ? "bg-gradient-to-br from-white/95 via-sky-50/95 to-blue-100/95 shadow-[0_8px_40px_rgba(59,130,246,0.18),inset_0_1px_0_rgba(255,255,255,0.8)]"
              : "bg-gradient-to-br from-white/90 via-sky-50/85 to-blue-50/90 shadow-[0_4px_32px_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(59,130,246,0.06)]"
          }`}
        >
          <div
            className={`mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 transition-all duration-300 ${
              scrolled ? "py-[10px]" : "py-[14px]"
            }`}
          >
            <NavLink
              to="/"
              className="relative z-[1] flex items-center gap-[11px] no-underline animate-[fadeSlideLeft_0.5s_0.1s_cubic-bezier(0.4,0,0.2,1)_both]"
            >
              <div
                className="grid h-[42px] w-[42px] place-items-center rounded-[14px] border border-sky-300/70 bg-gradient-to-br from-sky-200/80 to-blue-100/80 text-[20px] shadow-[0_0_18px_rgba(56,189,248,0.18),0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-110"
                style={{ animation: "logoFloat 4s ease-in-out infinite" }}
              >
                💧
              </div>

              <div>
                <div className="text-[15px] font-bold leading-[1.2] tracking-[-0.2px] text-slate-800">
                  Clean Water
                  <span className="mx-[3px] font-light text-sky-500">&</span>
                  Sanitation
                </div>
                <div className="mt-[2px] text-[11px] font-normal leading-[1] tracking-[0.5px] text-sky-700/70">
                  Safe water · Hygiene · Health
                </div>
              </div>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map(({ to, label }, index) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={addRipple}
                  className={({ isActive }) =>
                    `group relative overflow-hidden rounded-[10px] px-[14px] py-[8px] text-[13.5px] font-medium tracking-[0.1px] transition-all duration-200 ${
                      isActive
                        ? "border border-sky-300/70 bg-sky-100/90 text-sky-600"
                        : "text-sky-800/70 hover:text-slate-900"
                    }`
                  }
                  style={{
                    animation: `fadeSlideDown 0.4s ${0.15 + index * 0.07}s both`,
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
                  Login
                </button>
              ) : (
                <>
                  <button
                    className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-sky-300/80 bg-sky-100/80 text-sky-600 transition-all duration-300 hover:scale-105 hover:border-sky-400 hover:bg-sky-200/70 hover:shadow-[0_0_16px_rgba(56,189,248,0.18)] animate-[fadeSlideRight_0.4s_0.3s_both]"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    title="Profile"
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

                  <button
                    className="rounded-[10px] border border-red-200 bg-red-50 px-[14px] py-[8px] text-[13px] font-semibold tracking-[0.1px] text-red-400 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-500 hover:shadow-[0_0_14px_rgba(239,68,68,0.12)] animate-[fadeSlideRight_0.4s_0.3s_both]"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}

              <button
                className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-[9px] border border-sky-300/80 bg-sky-100/80 transition-all duration-200 hover:bg-sky-200/70 md:hidden"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <span
                  className={`block h-[1.5px] w-[18px] rounded-full bg-sky-500 transition-all duration-300 ${
                    menuOpen ? "translate-y-[6.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-[18px] rounded-full bg-sky-500 transition-all duration-300 ${
                    menuOpen ? "scale-x-0 opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-[18px] rounded-full bg-sky-500 transition-all duration-300 ${
                    menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {menuOpen && (
            <div
              className="flex flex-col gap-1 border-t border-sky-200/70 bg-white/80 px-5 pb-4 pt-3 md:hidden"
              style={{ animation: "mobileMenuOpen 0.3s cubic-bezier(0.4, 0, 0.2, 1) both" }}
            >
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-[10px] px-[14px] py-[11px] text-[14px] font-medium no-underline transition-all duration-200 ${
                      isActive
                        ? "bg-sky-100 text-slate-900"
                        : "text-sky-800/70 hover:bg-sky-100 hover:text-slate-900"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}

              {!loggedIn ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login");
                  }}
                  className="rounded-[10px] border border-sky-300/80 bg-sky-100/80 px-[14px] py-[11px] text-left text-[14px] font-semibold text-sky-600 transition-all duration-200 hover:border-sky-400 hover:bg-sky-200/70 hover:text-slate-900"
                >
                  Login
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="rounded-[10px] border border-sky-300/80 bg-sky-100/80 px-[14px] py-[11px] text-left text-[14px] font-semibold text-sky-600 transition-all duration-200 hover:border-sky-400 hover:bg-sky-200/70 hover:text-slate-900"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="rounded-[10px] border border-red-200 bg-red-50 px-[14px] py-[11px] text-left text-[14px] font-semibold text-red-400 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-500"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}

          <div
            className="h-[1.5px] w-full bg-[length:200%_100%]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.18) 20%, rgba(125,211,252,0.55) 50%, rgba(56,189,248,0.18) 80%, transparent 100%)",
              animation: "shimmer 3s linear infinite",
            }}
          />
        </div>
      </header>
    </>
  );
}
