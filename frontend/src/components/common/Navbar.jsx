import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  clearAuthSession,
  getStoredUser,
  isLoggedIn,
} from "../../utils/auth";
import { logoutUser } from "../../services/authService";
import { getMyProfile } from "../../services/profileService";

const NAVBAR_LOGO_URL =
  "https://api.iconify.design/material-symbols/wc-rounded.svg?color=%23000000";

function getDisplayName(user) {
  if (!user) return "My Profile";

  const fullName = String(
    user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      ""
  ).trim();

  if (fullName) return fullName;

  if (user.email) {
    return String(user.email).split("@")[0];
  }

  return "My Profile";
}

function getProfileInitials(user) {
  const displayName = getDisplayName(user);
  const parts = displayName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "MP";

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = getStoredUser();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [profileImageUrl, setProfileImageUrl] = useState(
    storedUser?.profileImageUrl || ""
  );
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuState, setProfileMenuState] = useState("closed");
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);
  const profileMenuRef = useRef(null);
  const profileMenuTimeoutRef = useRef(null);

  useEffect(() => {
    const syncAuth = () => {
      const nextUser = getStoredUser();
      setLoggedIn(isLoggedIn());
      setCurrentUser(nextUser);
      setProfileImageUrl(nextUser?.profileImageUrl || "");
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
        const mergedUser = {
          ...(getStoredUser() || {}),
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || "",
          fullName:
            profile?.fullName ||
            [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
            getStoredUser()?.fullName ||
            "",
          email: profile?.email || getStoredUser()?.email || "",
          role: profile?.role || getStoredUser()?.role || "",
          profileImageUrl: profile?.profileImageUrl || "",
        };

        setCurrentUser(mergedUser);
        setProfileImageUrl(profile?.profileImageUrl || "");
      } catch (error) {
        setCurrentUser(getStoredUser());
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
        closeProfileMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeProfileMenu();
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (profileMenuState !== "closing") return;

    profileMenuTimeoutRef.current = window.setTimeout(() => {
      setProfileMenuState("closed");
      profileMenuTimeoutRef.current = null;
    }, 180);

    return () => {
      if (profileMenuTimeoutRef.current) {
        window.clearTimeout(profileMenuTimeoutRef.current);
        profileMenuTimeoutRef.current = null;
      }
    };
  }, [profileMenuState]);

  async function handleLogout() {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
    } finally {
      clearAuthSession();
      setLoggedIn(false);
      setCurrentUser(null);
      setProfileImageUrl("");
      setProfileMenuState("closed");
      navigate("/login");
    }
  }

  function closeProfileMenu() {
    setProfileMenuState((currentState) =>
      currentState === "open" ? "closing" : currentState
    );
  }

  function toggleProfileMenu() {
    setProfileMenuState((currentState) => {
      if (profileMenuTimeoutRef.current) {
        window.clearTimeout(profileMenuTimeoutRef.current);
        profileMenuTimeoutRef.current = null;
      }

      if (currentState === "open") return "closing";
      return "open";
    });
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
  const profilePath =
    String(currentUser?.role || "").toLowerCase() === "staff"
      ? "/staff/profile"
      : "/profile";
  const isProfileActive =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/") ||
    location.pathname === "/staff/profile" ||
    location.pathname.startsWith("/staff/profile/");
  const displayName = getDisplayName(currentUser);
  const profileInitials = getProfileInitials(currentUser);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

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

        @keyframes nb2-menu-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-8px) scale(0.98); }
        }
      `}</style>

      <header className="sticky top-0 isolate z-[1000] font-['Poppins',sans-serif]">
        <div
          className="relative overflow-visible"
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
            className="relative z-[1] transition-all duration-300"
            style={{
              background:
                "linear-gradient(0deg, rgba(143,208,251,0.88) 0%, rgba(83,179,245,0.94) 45%, rgba(67,160,232,0.98) 100%)",
              boxShadow: scrolled
                ? "0 4px 24px rgba(148,163,184,0.14), 0 1px 4px rgba(0,0,0,0.05)"
                : "0 2px 12px rgba(148,163,184,0.1)",
            }}
          >
            <div
              className={`mx-auto flex max-w-[1200px] items-center justify-between gap-4 transition-all duration-300 ${
                scrolled ? "px-6 py-[10px]" : "px-6 py-[13px]"
              }`}
            >
              <NavLink
                to="/"
                className="flex items-center gap-[10px] no-underline"
                style={{ animation: "nb2-fade-left 0.45s 0.1s both" }}
              >
                <img
                  src={NAVBAR_LOGO_URL}
                  alt="CWAS restroom logo"
                  className="h-7 w-7 shrink-0"
                />
                <div className="text-2xl font-bold leading-[1.2] tracking-[-0.2px] text-black">
                  CWAS
                </div>
              </NavLink>

              <nav className="hidden items-center gap-[2px] md:flex">
                {navLinks.map(({ to, label }, index) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={addRipple}
                    className={({ isActive }) =>
                      `group relative overflow-hidden rounded-[8px] px-[14px] py-[7px] text-[13.5px] font-medium tracking-[0.05px] no-underline transition-all duration-200 hover:text-slate-900 ${
                        isActive
                          ? "bg-white/40 font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                          : "text-gray-700"
                      }`
                    }
                    style={{
                      animation: `nb2-fade-down 0.4s ${0.15 + index * 0.07}s both`,
                    }}
                  >
                    <span className="relative z-[1]">{label}</span>

                    <span className="pointer-events-none absolute bottom-[4px] left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-white transition-all duration-300 group-hover:w-[60%]" />

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
                          animation: "nb2-ripple 0.6s linear forwards",
                        }}
                      />
                    ))}
                  </NavLink>
                ))}
              </nav>

              <div
                className="flex items-center gap-2"
                style={{ animation: "nb2-fade-right 0.45s 0.3s both" }}
              >
                {!loggedIn ? (
                  <>
                    <NavLink
                      to="/auth/register"
                      className="hidden min-h-[38px] items-center justify-center rounded-full border border-white/75 bg-white/95 px-[18px] py-2 text-[13px] font-semibold text-sky-700 no-underline shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:scale-[1.01] hover:border-white hover:bg-slate-50 hover:text-sky-800 hover:shadow-[0_14px_28px_rgba(15,23,42,0.16)] md:inline-flex"
                    >
                      Get Started
                    </NavLink>

                    <button
                      className="min-h-[38px] rounded-full border-[1.5px] border-white/65 bg-white/20 px-4 py-[7px] text-[13px] font-semibold tracking-[0.1px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:border-white hover:bg-white/30"
                      onClick={() => {
                        navigate("/login");
                      }}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <div ref={profileMenuRef} className="relative z-[1100]">
                    <button
                      className={`flex min-h-[42px] items-center gap-3 rounded-full pl-1.5 pr-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:scale-[1.01] ${
                        isProfileActive
                          ? "bg-white/30"
                          : "bg-white/16 hover:bg-white/26"
                      }`}
                      title="Account menu"
                      aria-haspopup="menu"
                      aria-expanded={profileMenuState === "open"}
                      onClick={toggleProfileMenu}
                    >
                      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full border border-white/65 bg-gradient-to-br from-white/95 via-sky-50 to-sky-100 text-[11px] font-bold tracking-[0.08em] text-sky-700 shadow-[0_6px_16px_rgba(15,23,42,0.14)]">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          profileInitials
                        )}
                      </span>

                      <span className="hidden min-w-0 text-left md:block">
                        <span className="block max-w-[160px] truncate text-[13px] font-semibold leading-tight text-slate-900">
                          {displayName}
                        </span>
                      </span>

                      <svg
                        className={`hidden h-4 w-4 shrink-0 text-white/95 transition md:block ${
                          profileMenuState === "open" ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="m5 7.5 5 5 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {profileMenuState !== "closed" ? (
                      <div
                        className="absolute right-0 top-[calc(100%+10px)] z-[1200] min-w-[176px] rounded-[18px] border border-sky-100 bg-white p-2 shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
                        style={{
                          animation:
                            profileMenuState === "closing"
                              ? "nb2-menu-out 0.18s ease-in both"
                              : "nb2-menu-in 0.18s ease-out both",
                        }}
                        role="menu"
                      >
                        <div className="mb-2 rounded-[14px] bg-gradient-to-br from-sky-50 via-white to-blue-50 px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-sky-200 bg-gradient-to-br from-sky-100 to-blue-100 text-xs font-bold tracking-[0.08em] text-sky-700">
                              {profileImageUrl ? (
                                <img
                                  src={profileImageUrl}
                                  alt="Profile"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                profileInitials
                              )}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-[13px] font-semibold text-slate-900">
                                {displayName}
                              </div>
                              <div className="truncate text-[11px] font-medium text-slate-500">
                                {currentUser?.email || "Profile"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          className={`flex w-full items-center gap-[10px] rounded-[12px] px-3 py-[11px] text-left text-[13px] font-semibold transition-all duration-200 hover:-translate-y-[1px] ${
                            isProfileActive
                              ? "bg-sky-50 text-sky-700"
                              : "bg-transparent text-slate-900 hover:bg-slate-50"
                          }`}
                          role="menuitem"
                          onClick={() => {
                            setProfileMenuState("closed");
                            navigate(profilePath);
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

                        <div className="mx-[6px] my-1 h-px bg-black/30" />

                        <button
                          className="flex w-full items-center gap-[10px] rounded-[12px] bg-transparent px-3 py-[11px] text-left text-[13px] font-semibold text-red-600 transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/35"
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
