import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  clearAuthSession,
  getStoredUser,
  isLoggedIn,
  updateStoredUser,
} from "../../utils/auth";
import { logoutUser } from "../../services/authService";
import { getMyProfile } from "../../services/profileService";

const NAVBAR_LOGO_URL =
  "https://api.iconify.design/material-symbols/wc-rounded.svg?color=%230369a1";

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

function getUserProfileImage(user) {
  return user?.profilePhotoUrl || user?.profileImageUrl || user?.avatarUrl || "";
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = getStoredUser();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [profileImageUrl, setProfileImageUrl] = useState(getUserProfileImage(storedUser));
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuState, setProfileMenuState] = useState("closed");
  const profileMenuRef = useRef(null);
  const profileMenuTimeoutRef = useRef(null);

  useEffect(() => {
    const syncAuth = () => {
      const nextUser = getStoredUser();
      setLoggedIn(isLoggedIn());
      setCurrentUser(nextUser);
      setProfileImageUrl(getUserProfileImage(nextUser));
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
          profileImageUrl: getUserProfileImage(profile),
          profilePhotoUrl: getUserProfileImage(profile),
        };

        updateStoredUser(mergedUser);
        setCurrentUser(mergedUser);
        setProfileImageUrl(getUserProfileImage(profile));
      } catch {
        setCurrentUser(getStoredUser());
        setProfileImageUrl(getUserProfileImage(getStoredUser()));
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
      if (event.key === "Escape") closeProfileMenu();
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
      if (token) await logoutUser(token);
    } catch {}
    finally {
      clearAuthSession();
      setLoggedIn(false);
      setCurrentUser(null);
      setProfileImageUrl("");
      setProfileMenuState("closed");
      navigate("/login");
    }
  }

  function closeProfileMenu() {
    setProfileMenuState((s) => (s === "open" ? "closing" : s));
  }

  function toggleProfileMenu() {
    setProfileMenuState((s) => {
      if (profileMenuTimeoutRef.current) {
        window.clearTimeout(profileMenuTimeoutRef.current);
        profileMenuTimeoutRef.current = null;
      }
      return s === "open" ? "closing" : "open";
    });
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
  const complaintsPath = "/complaints";

  const isProfileActive =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/") ||
    location.pathname === "/staff/profile" ||
    location.pathname.startsWith("/staff/profile/");

  const displayName = getDisplayName(currentUser);
  const profileInitials = getProfileInitials(currentUser);

  /* animation delay map for nav links */
  const animDelays = ["[animation-delay:150ms]", "[animation-delay:220ms]", "[animation-delay:290ms]", "[animation-delay:360ms]"];

  return (
    <header className="sticky top-0 isolate z-[1000]">
      <div className="relative overflow-visible">

        {/* Top shimmer line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent" />

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

        {/* Main bar — two layers reproduce the original opaque navbar exactly:
            bottom layer: fully solid sky gradient (no transparency) blocks all page content
            top layer:    the semi-transparent overlay for the glass shimmer effect        */}
        <div
          className={`relative z-[1] transition-all duration-300 ${
            scrolled ? "shadow-[0_4px_24px_rgba(148,163,184,0.14),0_1px_4px_rgba(0,0,0,0.05)]" : "shadow-[0_2px_12px_rgba(148,163,184,0.1)]"
          }`}
        >
          {/* Solid base — fully opaque, nothing bleeds through */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(143,208,251)] via-[rgb(83,179,245)] to-[rgb(67,160,232)]" />
          {/* Glass shimmer overlay on top */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sky-300/30 via-sky-400/20 to-sky-500/10 backdrop-blur-[2px]" />
          <div
            className={`relative z-[1] mx-auto flex max-w-[1200px] items-center justify-between gap-4 transition-all duration-300 ${
              scrolled ? "px-6 py-[10px]" : "px-6 py-[13px]"
            }`}
          >
            {/* Logo */}
            <NavLink
              to="/"
              className="flex animate-[fadeInLeft_0.45s_0.1s_both] items-center gap-[10px] no-underline"
            >
              <img
                src={NAVBAR_LOGO_URL}
                alt="CWAS restroom logo"
                className="h-7 w-7 shrink-0"
              />
              <span className="text-2xl font-bold leading-[1.2] tracking-[-0.2px] text-sky-900">
                CWAS
              </span>
            </NavLink>

            {/* Nav links */}
            <nav className="hidden items-center gap-[2px] md:flex">
              {navLinks.map(({ to, label }, index) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `group relative overflow-hidden rounded-[8px] px-[14px] py-[7px] text-[13.5px] font-medium tracking-[0.05px] no-underline transition-all duration-200 animate-[fadeInDown_0.4s_both] ${animDelays[index]} hover:text-slate-900 ${
                      isActive
                        ? "bg-white/40 font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                        : "text-gray-700"
                    }`
                  }
                >
                  <span className="relative z-[1]">{label}</span>
                  {/* hover underline pill */}
                  <span className="pointer-events-none absolute bottom-[4px] left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-white transition-all duration-300 group-hover:w-[60%]" />
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex animate-[fadeInRight_0.45s_0.3s_both] items-center gap-2">
              {!loggedIn ? (
                <>
                  <NavLink
                    to="/auth/register"
                    className="hidden min-h-[38px] items-center justify-center rounded-full border border-white/75 bg-white/95 px-[18px] py-2 text-[13px] font-semibold text-sky-700 no-underline shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:scale-[1.01] hover:border-white hover:bg-slate-50 hover:text-sky-800 hover:shadow-[0_14px_28px_rgba(15,23,42,0.16)] md:inline-flex"
                  >
                    Get Started
                  </NavLink>

                  <button
                    className="min-h-[38px] rounded-full bg-white/20 px-4 py-[7px] text-[13px] font-semibold tracking-[0.1px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-white/30"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                </>
              ) : (
                <div ref={profileMenuRef} className="relative z-[1100]">
                  {/* Avatar button */}
                  <button
                    className={`flex min-h-[42px] cursor-pointer items-center gap-3 rounded-full pl-1.5 pr-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:scale-[1.01] ${
                      isProfileActive ? "bg-white/30" : "bg-white/[0.16] hover:bg-white/[0.26]"
                    }`}
                    title="Account menu"
                    aria-haspopup="menu"
                    aria-expanded={profileMenuState === "open"}
                    onClick={toggleProfileMenu}
                  >
                    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-white/95 via-sky-50 to-sky-100 text-[11px] font-bold tracking-[0.08em] text-sky-700 shadow-[0_6px_16px_rgba(15,23,42,0.14)]">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
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
                      className={`hidden h-4 w-4 shrink-0 text-white/95 transition-transform duration-200 md:block ${
                        profileMenuState === "open" ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {profileMenuState !== "closed" && (
                    <div
                      className={`absolute right-0 top-[calc(100%+10px)] z-[1200] w-[232px] rounded-[20px] border border-sky-100/80 bg-white/95 p-2.5 shadow-[0_20px_40px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
                        profileMenuState === "closing"
                          ? "animate-[menuOut_0.18s_ease-in_both]"
                          : "animate-[menuIn_0.18s_ease-out_both]"
                      }`}
                      role="menu"
                    >
                      {/* User info card */}
                      <div className="mb-2.5 rounded-[16px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-medium text-slate-500">
                            {currentUser?.email || "Profile"}
                          </div>
                        </div>
                      </div>

                      {/* Profile link */}
                      <button
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-left text-[14px] font-semibold transition-all duration-200 hover:-translate-y-[1px] ${
                          isProfileActive
                            ? "bg-sky-50 text-sky-700 shadow-[inset_0_0_0_1px_rgba(186,230,253,0.9)]"
                            : "bg-transparent text-slate-900 hover:bg-sky-50 hover:text-sky-800"
                        }`}
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuState("closed");
                          navigate(profilePath);
                        }}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                            <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z" stroke="currentColor" strokeWidth="1.8" />
                            <path d="M20 20.5c-1.6-4-5-6-8-6s-6.4 2-8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </span>
                        <span className="flex-1">Profile</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <button
                        className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-left text-[14px] font-semibold text-slate-900 transition-all duration-200 hover:-translate-y-[1px] hover:bg-sky-50 hover:text-sky-800"
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuState("closed");
                          navigate(complaintsPath);
                        }}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M8 10h8M8 14h5m-7 6 1.2-3.2A8 8 0 1 1 20 12a8 8 0 0 1-8 8H6Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="flex-1">My Complaints</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <div className="mx-2 my-2.5 h-px bg-gradient-to-r from-transparent via-sky-100 to-transparent" />

                      {/* Logout */}
                      <button
                        className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] bg-transparent px-3.5 py-2.5 text-left text-[14px] font-semibold text-red-600 transition-all duration-200 hover:-translate-y-[1px] hover:bg-red-50 hover:text-red-700"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <path d="M16 17l5-5-5-5" />
                            <path d="M21 12H9" />
                          </svg>
                        </span>
                        <span className="flex-1">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe definitions via Tailwind @layer if using JIT — fallback style tag kept minimal */}
      <style>{`
        @keyframes fadeInLeft  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInRight { from { opacity:0; transform:translateX(12px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInDown  { from { opacity:0; transform:translateY(-8px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes menuIn  { from { opacity:0; transform:translateY(-8px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes menuOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-8px) scale(0.98); } }
      `}</style>
    </header>
  );
}
