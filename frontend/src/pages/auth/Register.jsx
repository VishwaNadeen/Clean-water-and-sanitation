import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchCountries } from "../../services/countryService";
import API_BASE_URL from "../../config/api";

function FieldIcon({ children }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-100/80 text-slate-600 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 10a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
      <path d="M4.5 16a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path d="m4.5 6.5 5.5 4 5.5-4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.3 3.8h2.1l1 3-1.5 1.5a11 11 0 0 0 3.8 3.8l1.5-1.5 3 1v2.1a1.6 1.6 0 0 1-1.8 1.6A12.9 12.9 0 0 1 4.7 5.6a1.6 1.6 0 0 1 1.6-1.8Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.7 10s3-5 8.3-5 8.3 5 8.3 5-3 5-8.3 5-8.3-5-8.3-5Z" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 2l16 16" />
      <path d="M8.8 4.9A9.8 9.8 0 0 1 10 4.8c5.3 0 8.3 5.2 8.3 5.2a13.7 13.7 0 0 1-2.8 3.4" />
      <path d="M5.2 5.3A14.3 14.3 0 0 0 1.7 10s3 5.2 8.3 5.2a8.9 8.9 0 0 0 3-.5" />
      <path d="M8.6 8.6A2 2 0 0 0 8 10a2 2 0 0 0 2 2c.5 0 1-.2 1.4-.6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7 5 5 5-5" />
    </svg>
  );
}

function CountryFlag({ src, alt }) {
  if (!src) {
    return (
      <span className="grid h-5 w-7 place-items-center rounded-[6px] bg-slate-200 text-[10px] font-bold text-slate-500">
        --
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-5 w-7 rounded-[6px] border border-slate-200 object-cover shadow-sm"
      loading="lazy"
    />
  );
}

export default function Register() {
  const navigate = useNavigate();
  const countryDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);
  const fieldClass =
    "w-full rounded-2xl border border-slate-300 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
  const dropdownButtonClass =
    "flex w-full items-center rounded-2xl border border-slate-300 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-3 pr-12 text-left shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+94",
    phone: "",
    gender: "MALE",
    password: "",
    confirmPassword: "",
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

  const passwordRule =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,12}$/;

  useEffect(() => {
    let mounted = true;

    const loadCountries = async () => {
      try {
        setCountryLoading(true);
        setCountryError("");

        const data = await fetchCountries();

        if (!mounted) return;

        setCountries(data);

        const sriLanka = data.find((item) => item.dialCode === "+94");
        if (sriLanka) {
          setForm((prev) => ({
            ...prev,
            countryCode: sriLanka.dialCode,
          }));
        }
      } catch (err) {
        if (!mounted) return;
        setCountryError("Unable to load country list.");
      } finally {
        if (mounted) {
          setCountryLoading(false);
        }
      }
    };

    loadCountries();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedCountry = useMemo(() => {
    return (
      countries.find((item) => item.dialCode === form.countryCode) || {
        name: "Select country",
        flagUrl: "",
        dialCode: form.countryCode || "",
      }
    );
  }, [countries, form.countryCode]);

  const filteredCountries = useMemo(() => {
    const keyword = countrySearch.trim().toLowerCase();

    if (!keyword) return countries;

    return countries.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.dialCode.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword)
      );
    });
  }, [countries, countrySearch]);

  const genderOptions = useMemo(
    () => [
      { value: "MALE", label: "Male" },
      { value: "FEMALE", label: "Female" },
    ],
    []
  );

  const selectedGender = useMemo(() => {
    return (
      genderOptions.find((option) => option.value === form.gender) ||
      genderOptions[0]
    );
  }, [form.gender, genderOptions]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setCountryOpen(false);
      }

      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target)
      ) {
        setGenderOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setPasswordError("");
    }

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");

    setForm((prev) => ({
      ...prev,
      phone: numericValue,
    }));
  };

  const handleCountrySelect = (country) => {
    setForm((prev) => ({
      ...prev,
      countryCode: country.dialCode,
    }));
    setCountryOpen(false);
    setCountrySearch("");
  };

  const handleGenderSelect = (value) => {
    setForm((prev) => ({
      ...prev,
      gender: value,
    }));
    setGenderOpen(false);
  };

  const validateForm = () => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.countryCode.trim()) return "Country code is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.password) {
      setPasswordError("Password is required.");
      return "Password is required.";
    }
    if (!form.confirmPassword) {
      setPasswordError("Please confirm your password.");
      return "Please confirm your password.";
    }
    if (form.password.length < 6 || form.password.length > 12) {
      setPasswordError(
        "Password must be 6 to 12 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return "Password must be 6 to 12 characters long.";
    }
    if (!passwordRule.test(form.password)) {
      setPasswordError(
        "Password must be 6 to 12 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return "Password must include uppercase, lowercase, number, and special character.";
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return "Passwords do not match.";
    }
    setPasswordError("");
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        countryCode: form.countryCode.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        password: form.password,
      };

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/auth/verify-email", {
        state: { email: payload.email },
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(to_bottom_right,_#eff6ff,_#ffffff,_#e0f2fe)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1fr_1.1fr]">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-sky-600 via-blue-700 to-slate-900 p-10 text-white">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium">
                Smart Healthcare
              </div>

              <h1 className="mt-8 text-4xl font-bold leading-tight">
                Create your patient account with a clean and secure experience.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
                Register once to manage appointments, telemedicine sessions,
                prescriptions, and your healthcare activity in one place.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">Professional onboarding</p>
                <p className="mt-1 text-sm text-blue-100">
                  Structured form fields, country picker, and password
                  confirmation.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">User-only registration</p>
                <p className="mt-1 text-sm text-blue-100">
                  This registration page is focused only on patient users.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-xl">
              <div className="lg:hidden">
                <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                  Smart Healthcare
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your details below to register your account.
              </p>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Enter first name"
                        className={fieldClass}
                      />
                      <FieldIcon>
                        <UserIcon />
                      </FieldIcon>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Enter last name"
                        className={fieldClass}
                      />
                      <FieldIcon>
                        <UserIcon />
                      </FieldIcon>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className={fieldClass}
                    />
                    <FieldIcon>
                      <MailIcon />
                    </FieldIcon>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
                    <div ref={countryDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setCountryOpen((prev) => !prev)}
                        className={dropdownButtonClass}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <CountryFlag
                            src={selectedCountry.flagUrl}
                            alt={`${selectedCountry.name} flag`}
                          />
                          <span className="truncate text-sm font-medium text-slate-800">
                            {selectedCountry.dialCode}
                          </span>
                        </span>
                      </button>

                      <FieldIcon>
                        <ChevronIcon />
                      </FieldIcon>

                      {countryOpen && (
                        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                          <div className="border-b border-slate-100 p-3">
                            <input
                              type="text"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country"
                              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>

                          <div className="max-h-64 overflow-y-auto p-2">
                            {countryLoading ? (
                              <div className="px-3 py-2 text-sm text-slate-500">
                                Loading countries...
                              </div>
                            ) : countryError ? (
                              <div className="px-3 py-2 text-sm text-red-500">
                                {countryError}
                              </div>
                            ) : filteredCountries.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-slate-500">
                                No countries found.
                              </div>
                            ) : (
                              filteredCountries.map((country) => (
                                <button
                                  key={`${country.code}-${country.dialCode}`}
                                  type="button"
                                  onClick={() => handleCountrySelect(country)}
                                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                                >
                                  <span className="flex min-w-0 items-center gap-3">
                                    <CountryFlag
                                      src={country.flagUrl}
                                      alt={`${country.name} flag`}
                                    />
                                    <span className="truncate text-sm text-slate-700">
                                      {country.name}
                                    </span>
                                  </span>
                                  <span className="ml-3 text-sm font-medium text-slate-500">
                                    {country.dialCode}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handlePhoneChange}
                        required
                        placeholder="Enter phone number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={fieldClass}
                      />
                      <FieldIcon>
                        <PhoneIcon />
                      </FieldIcon>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gender
                  </label>
                  <div ref={genderDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setGenderOpen((prev) => !prev)}
                      className={`${dropdownButtonClass} ${
                        genderOpen
                          ? "border-blue-500 bg-white ring-4 ring-blue-100"
                          : ""
                      }`}
                    >
                      <span className="text-slate-900">{selectedGender.label}</span>
                    </button>

                    <FieldIcon>
                      <span
                        className={`transition-transform duration-200 ${
                          genderOpen ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronIcon />
                      </span>
                    </FieldIcon>

                    {genderOpen && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                        <div className="p-2">
                          {genderOptions.map((option) => {
                            const isSelected = option.value === form.gender;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleGenderSelect(option.value)}
                                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                                  isSelected
                                    ? "bg-gradient-to-r from-blue-600 to-sky-500 font-semibold text-white shadow-sm"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span>{option.label}</span>
                                {isSelected && (
                                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                                    Selected
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter password"
                        className={fieldClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-4 flex items-center text-slate-600 transition hover:text-blue-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100/80 shadow-sm">
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Re-enter password"
                        className={fieldClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-4 flex items-center text-slate-600 transition hover:text-blue-600"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100/80 shadow-sm">
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 text-red-600">
                    {passwordError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}