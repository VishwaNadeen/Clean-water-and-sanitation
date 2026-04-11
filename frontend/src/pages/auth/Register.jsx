import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchCountries } from "../../services/countryService";
import API_BASE_URL from "../../config/api";

/* ── Icons ─────────────────────────────────────────────── */

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M4.5 17a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path d="m4.5 6.5 5.5 4 5.5-4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.3 3.8h2.1l1 3-1.5 1.5a11 11 0 0 0 3.8 3.8l1.5-1.5 3 1v2.1a1.6 1.6 0 0 1-1.8 1.6A12.9 12.9 0 0 1 4.7 5.6a1.6 1.6 0 0 1 1.6-1.8Z" />
    </svg>
  );
}

function GenderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="3.5" />
      <path d="M10 10.5v6M7.5 14h5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.7 10s3-5 8.3-5 8.3 5 8.3 5-3 5-8.3 5-8.3-5-8.3-5Z" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l16 16" />
      <path d="M8.8 4.9A9.8 9.8 0 0 1 10 4.8c5.3 0 8.3 5.2 8.3 5.2a13.7 13.7 0 0 1-2.8 3.4" />
      <path d="M5.2 5.3A14.3 14.3 0 0 0 1.7 10s3 5.2 8.3 5.2a8.9 8.9 0 0 0 3-.5" />
      <path d="M8.6 8.6A2 2 0 0 0 8 10a2 2 0 0 0 2 2c.5 0 1-.2 1.4-.6" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20"
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 7 5 5 5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function RestroomIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8"
      stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="14" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M14 13v9M14 22l-4 7M14 22l4 7M10 16h8" />
      <circle cx="34" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M34 13v5" />
      <path d="M28 18h12l-2 11h-8l-2-11Z" fill="rgba(3,105,161,0.15)" />
      <path d="M34 29v6" />
      <line x1="24" y1="4" x2="24" y2="38" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

function CountryFlag({ src, alt }) {
  if (!src) return (
    <span className="grid h-5 w-7 place-items-center rounded bg-sky-100 text-[10px] font-bold text-sky-500">--</span>
  );
  return <img src={src} alt={alt} className="h-5 w-7 rounded border border-sky-100 object-cover" loading="lazy" />;
}

/* ── Shared tokens ──────────────────────────────────────── */
const fieldClass =
  "w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 pr-12 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

const dropdownBtnClass =
  "flex w-full items-center rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 pr-12 text-left text-sm text-sky-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 hover:border-sky-300";

const labelClass =
  "block mb-1.5 text-xs font-semibold text-sky-800 tracking-wide uppercase";

function FieldIcon({ children }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100/80 text-sky-500">
        {children}
      </span>
    </div>
  );
}

/* ── Left panel step cards ─────────────────────────────── */
const STEPS = [
  {
    number: "01",
    title: "Fill in your details",
    desc: "Enter your name, email, and contact information to identify your account.",
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Set a secure password",
    desc: "Choose a strong password (6–12 chars) with uppercase, numbers, and symbols.",
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Verify & start reporting",
    desc: "Once registered, verify your email and start submitting sanitation reports instantly.",
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

/* ── Component ─────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const countryDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    countryCode: "+94", phone: "", gender: "MALE",
    password: "", confirmPassword: "",
  });

  const [countries, setCountries] = useState([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [countryError, setCountryError] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,12}$/;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchCountries();
        if (!mounted) return;
        setCountries(data);
        const lk = data.find((c) => c.dialCode === "+94");
        if (lk) setForm((p) => ({ ...p, countryCode: lk.dialCode }));
      } catch {
        if (mounted) setCountryError("Unable to load country list.");
      } finally {
        if (mounted) setCountryLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.dialCode === form.countryCode) || { name: "Select", flagUrl: "", dialCode: form.countryCode },
    [countries, form.countryCode]
  );

  const filteredCountries = useMemo(() => {
    const kw = countrySearch.trim().toLowerCase();
    if (!kw) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(kw) || c.dialCode.includes(kw) || c.code.toLowerCase().includes(kw)
    );
  }, [countries, countrySearch]);

  const genderOptions = useMemo(() => [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ], []);

  const selectedGender = useMemo(
    () => genderOptions.find((o) => o.value === form.gender) || genderOptions[0],
    [form.gender, genderOptions]
  );

  useEffect(() => {
    const handler = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) setCountryOpen(false);
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(e.target)) setGenderOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    if (["password", "confirmPassword"].includes(e.target.name)) setPasswordError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handlePhoneChange = (e) =>
    setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }));

  const handleCountrySelect = (country) => {
    setForm((p) => ({ ...p, countryCode: country.dialCode }));
    setCountryOpen(false);
    setCountrySearch("");
  };

  const handleGenderSelect = (value) => {
    setForm((p) => ({ ...p, gender: value }));
    setGenderOpen(false);
  };

  const validateForm = () => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.countryCode.trim()) return "Country code is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.password) { setPasswordError("Password is required."); return "Password is required."; }
    if (!form.confirmPassword) { setPasswordError("Please confirm your password."); return "Please confirm your password."; }
    if (form.password.length < 6 || form.password.length > 12) {
      const m = "Password must be 6–12 characters and include uppercase, lowercase, number, and special character.";
      setPasswordError(m); return m;
    }
    if (!passwordRule.test(form.password)) {
      const m = "Password must include uppercase, lowercase, number, and special character.";
      setPasswordError(m); return m;
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match."); return "Passwords do not match.";
    }
    setPasswordError("");
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setPasswordError("");
    const err = validateForm();
    if (err) { setError(err); return; }
    try {
      setLoading(true);
      const payload = {
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(), countryCode: form.countryCode.trim(),
        phone: form.phone.trim(), gender: form.gender, password: form.password,
      };
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      navigate("/auth/verify-email", { state: { email: payload.email } });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /*
     * Full-viewport flex row:
     *   Left  — sticky hero panel, always fully visible
     *   Right — scrollable form card
     */
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200 flex items-stretch px-4 py-12 md:px-10 lg:px-16">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-start">

        {/* ── LEFT: sticky hero panel ── */}
        <div className="hidden md:flex flex-col flex-shrink-0 w-80 sticky top-12 self-start">

          {/* Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-sky-100/80 border border-sky-200 mb-7">
            <RestroomIcon />
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold leading-tight text-sky-900">
            Build your profile in 3 easy steps
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-sky-600">
            Your account lets you report sanitation issues, track requests, and stay notified — all in one place.
          </p>

          {/* Step cards */}
          <div className="mt-8 flex flex-col gap-4">
            {STEPS.map((step) => (
              <div key={step.number}
                className="flex items-start gap-4 rounded-2xl border border-sky-200/70 bg-white/60 backdrop-blur-sm px-4 py-4">
                {/* Step number pill */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-100/80 border border-sky-200">
                    {step.icon}
                  </span>
                  <span className="text-[10px] font-bold text-sky-400 tracking-widest">
                    {step.number}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-sky-900 leading-snug">{step.title}</p>
                  <p className="mt-1 text-xs text-sky-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Already have account nudge */}
          <div className="mt-8 flex items-center gap-2 text-sm text-sky-600">
            <span>Already registered?</span>
            <Link to="/auth/login"
              className="font-semibold text-sky-700 underline underline-offset-2 decoration-sky-300 hover:decoration-sky-500 hover:text-sky-900 transition">
              Login →
            </Link>
          </div>
        </div>

        {/* ── RIGHT: scrollable form card ── */}
        <div className="flex-1 min-w-0">
          {/*
           * max-h + overflow-y-auto makes the card itself scroll.
           * The left panel stays sticky while the user scrolls through the form.
           */}
          <div className="w-full bg-white/75 backdrop-blur-xl border border-sky-200/70 rounded-3xl shadow-xl shadow-sky-100/40
                          max-h-[calc(100vh-6rem)] overflow-y-auto
                          [&::-webkit-scrollbar]:w-1.5
                          [&::-webkit-scrollbar-track]:rounded-full
                          [&::-webkit-scrollbar-track]:bg-sky-50
                          [&::-webkit-scrollbar-thumb]:rounded-full
                          [&::-webkit-scrollbar-thumb]:bg-sky-200
                          hover:[&::-webkit-scrollbar-thumb]:bg-sky-300">

            {/* Sticky card header inside scroll */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-sky-100 rounded-t-3xl px-8 py-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100/80 border border-sky-200 md:hidden">
                  <RestroomIcon />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sky-900 leading-tight">Create a profile</h2>
                  <p className="text-xs text-sky-400 mt-0.5">Fill in all fields below — all required</p>
                </div>
              </div>
            </div>

            {/* Scrollable form body */}
            <div className="px-8 py-7 space-y-5">

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* First + Last */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>First name</label>
                    <div className="relative">
                      <input type="text" name="firstName" value={form.firstName}
                        onChange={handleChange} required placeholder="First name" className={fieldClass} />
                      <FieldIcon><UserIcon /></FieldIcon>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Last name</label>
                    <div className="relative">
                      <input type="text" name="lastName" value={form.lastName}
                        onChange={handleChange} required placeholder="Last name" className={fieldClass} />
                      <FieldIcon><UserIcon /></FieldIcon>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email address</label>
                  <div className="relative">
                    <input type="email" name="email" value={form.email}
                      onChange={handleChange} required placeholder="you@example.com" className={fieldClass} />
                    <FieldIcon><MailIcon /></FieldIcon>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>Phone number</label>
                  <div className="grid gap-3 grid-cols-[160px_1fr]">

                    {/* Country picker */}
                    <div ref={countryDropdownRef} className="relative">
                      <button type="button" onClick={() => setCountryOpen((p) => !p)}
                        className={dropdownBtnClass}>
                        <span className="flex items-center gap-2 min-w-0">
                          <CountryFlag src={selectedCountry.flagUrl} alt={`${selectedCountry.name} flag`} />
                          <span className="truncate text-sm font-medium text-sky-800">{selectedCountry.dialCode}</span>
                        </span>
                      </button>
                      <FieldIcon><ChevronIcon open={countryOpen} /></FieldIcon>

                      {countryOpen && (
                        <div className="absolute z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl shadow-sky-100/40">
                          <div className="border-b border-sky-100 p-3">
                            <input type="text" value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country…"
                              className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 placeholder:text-sky-300 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
                          </div>
                          <div className="max-h-56 overflow-y-auto p-2">
                            {countryLoading ? (
                              <p className="px-3 py-2 text-sm text-sky-400">Loading…</p>
                            ) : countryError ? (
                              <p className="px-3 py-2 text-sm text-red-500">{countryError}</p>
                            ) : filteredCountries.length === 0 ? (
                              <p className="px-3 py-2 text-sm text-sky-400">No results.</p>
                            ) : filteredCountries.map((c) => (
                              <button key={`${c.code}-${c.dialCode}`} type="button"
                                onClick={() => handleCountrySelect(c)}
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 transition hover:bg-sky-50">
                                <span className="flex items-center gap-2 min-w-0">
                                  <CountryFlag src={c.flagUrl} alt={`${c.name} flag`} />
                                  <span className="truncate text-sm text-sky-800">{c.name}</span>
                                </span>
                                <span className="ml-2 text-xs font-medium text-sky-500">{c.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone input */}
                    <div className="relative">
                      <input type="tel" name="phone" value={form.phone}
                        onChange={handlePhoneChange} required placeholder="Phone number"
                        inputMode="numeric" pattern="[0-9]*" className={fieldClass} />
                      <FieldIcon><PhoneIcon /></FieldIcon>
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className={labelClass}>Gender</label>
                  <div ref={genderDropdownRef} className="relative">
                    <button type="button" onClick={() => setGenderOpen((p) => !p)}
                      className={`${dropdownBtnClass} ${genderOpen ? "border-sky-400 bg-white ring-4 ring-sky-100" : ""}`}>
                      <span className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100/80 text-sky-500">
                          <GenderIcon />
                        </span>
                        <span>{selectedGender.label}</span>
                      </span>
                    </button>
                    <FieldIcon><ChevronIcon open={genderOpen} /></FieldIcon>

                    {genderOpen && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl shadow-sky-100/40">
                        <div className="p-2">
                          {genderOptions.map((opt) => {
                            const active = opt.value === form.gender;
                            return (
                              <button key={opt.value} type="button"
                                onClick={() => handleGenderSelect(opt.value)}
                                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                                  active
                                    ? "bg-gradient-to-r from-sky-400 to-blue-500 font-semibold text-white"
                                    : "text-sky-800 hover:bg-sky-50"
                                }`}>
                                <span>{opt.label}</span>
                                {active && (
                                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"
                                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 8l4 4 6-7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-sky-100" />
                  <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-widest">Security</span>
                  <div className="flex-1 h-px bg-sky-100" />
                </div>

                {/* Password hint */}
                <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                  <span className="mt-0.5 flex-shrink-0 text-sky-400"><LockIcon /></span>
                  <p className="text-[11.5px] leading-5 text-sky-600">
                    Password must be <span className="font-semibold">6–12 characters</span> and include at least one
                    uppercase letter, lowercase letter, number, and special character.
                  </p>
                </div>

                {/* Password + Confirm */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password"
                        value={form.password} onChange={handleChange}
                        required placeholder="Password" className={fieldClass} />
                      <button type="button" onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-3 flex items-center justify-center text-sky-400 hover:text-sky-600 transition">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100/80">
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirm password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                        value={form.confirmPassword} onChange={handleChange}
                        required placeholder="Re-enter password" className={fieldClass} />
                      <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        className="absolute inset-y-0 right-3 flex items-center justify-center text-sky-400 hover:text-sky-600 transition">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100/80">
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 text-red-600">
                    {passwordError}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Creating account…
                    </span>
                  ) : "Create profile"}
                </button>

              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-6">
                <div className="flex-1 h-px bg-sky-100" />
                <span className="text-xs text-sky-300">or</span>
                <div className="flex-1 h-px bg-sky-100" />
              </div>

              {/* Login link */}
              <div className="flex items-center justify-center gap-1.5 text-sm text-sky-600 mt-4">
                <span>Already have an account?</span>
                <Link to="/auth/login"
                  className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-2 decoration-sky-300 hover:decoration-sky-500 transition">
                  Login
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </div>

              {/* Terms */}
              <p className="mt-4 text-center text-[11px] text-sky-400 leading-relaxed">
                By registering you agree to our{" "}
                <Link to="/terms" className="underline underline-offset-2 hover:text-sky-600 transition">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="underline underline-offset-2 hover:text-sky-600 transition">Privacy Policy</Link>.
              </p>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}