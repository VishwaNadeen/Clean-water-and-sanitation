import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchCountries } from "../../services/countryService";
import {
  fetchWorldCitiesByDistrict,
  fetchWorldCities,
  fetchWorldCountries,
  fetchWorldDistricts,
  fetchWorldStates,
} from "../../services/worldLocationService";
import API_BASE_URL from "../../config/api";
import {
  getPhoneMaxLengthByCountry,
  normalizePhoneForCountry,
} from "../../utils/staffFormValidation";

/* ── Icons ────────────────────────────────────────────────────────── */

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
      <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M4.5 17a5.5 5.5 0 0 1 11 0" />
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

function GenderIcon() {
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
      <circle cx="10" cy="7" r="3.5" />
      <path d="M10 10.5v6M7.5 14h5" />
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

function ChevronIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
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

function LockIcon() {
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
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function RestroomIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-8 w-8"
      stroke="#0369a1"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="14" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M14 13v9M14 22l-4 7M14 22l4 7M10 16h8" />
      <circle cx="34" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M34 13v5" />
      <path
        d="M28 18h12l-2 11h-8l-2-11Z"
        fill="rgba(3,105,161,0.15)"
      />
      <path d="M34 29v6" />
      <line
        x1="24"
        y1="4"
        x2="24"
        y2="38"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function PhotoIcon() {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function CountryFlag({ src, alt }) {
  if (!src) {
    return (
      <span className="grid h-5 w-7 place-items-center rounded bg-sky-100 text-[10px] font-bold text-sky-500">
        --
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-5 w-7 rounded border border-sky-100 object-cover"
      loading="lazy"
    />
  );
}

/* ── Shared tokens ─────────────────────────────────────────────────── */

const fieldClass =
  "w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 pr-12 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

const dropdownBtnClass =
  "flex w-full items-center rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 pr-12 text-left text-sm text-sky-900 outline-none transition hover:border-sky-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-800";

const sectionHeadingClass =
  "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-400";

function FieldIcon({ children }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80 text-sky-500">
        {children}
      </span>
    </div>
  );
}

function formatPhoneForDisplay(countryCode, value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "";

  if (countryCode === "+94") {
    return digits.match(/.{1,3}/g)?.join(" ") || digits;
  }

  if (digits.length <= 6) {
    return digits.match(/.{1,3}/g)?.join(" ") || digits;
  }

  const groups = [];
  let cursor = 0;

  while (digits.length - cursor > 4) {
    groups.push(digits.slice(cursor, cursor + 3));
    cursor += 3;
  }

  groups.push(digits.slice(cursor));
  return groups.filter(Boolean).join(" ");
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getMaxDobDate() {
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

function formatDobDisplay(value) {
  if (!value) return "mm/dd/yyyy";

  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return "mm/dd/yyyy";

  return `${String(month).padStart(2, "0")}/${String(day).padStart(
    2,
    "0"
  )}/${year}`;
}

function createDobValue(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function isSameMonth(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildCalendarDays(viewDate) {
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const firstGridDay = new Date(firstDay);
  firstGridDay.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);
    return date;
  });
}

function CalendarIcon() {
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
      <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
      <path d="M6.5 2.75v3.5M13.5 2.75v3.5M3.5 8.25h13" />
    </svg>
  );
}

function isPasswordValidationMessage(message) {
  return [
    "Password is required.",
    "Please confirm your password.",
    "Password must be 6–12 characters and include uppercase, lowercase, number, and special character.",
    "Password must include uppercase, lowercase, number, and special character.",
    "Passwords do not match.",
  ].includes(message);
}

/* ── Searchable dropdown list ──────────────────────────────────────── */

function DropdownList({
  items,
  loading,
  onSelect,
  searchValue,
  onSearchChange,
  placeholder = "Search…",
  renderItem,
}) {
  return (
    <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl shadow-sky-100/40">
      <div className="border-b border-sky-100 p-3">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 placeholder:text-sky-300 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div className="max-h-52 overflow-y-auto p-2">
        {loading ? (
          <p className="px-3 py-2 text-sm text-sky-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-3 py-2 text-sm text-sky-400">No results.</p>
        ) : (
          items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-center rounded-xl px-3 py-2 text-left transition hover:bg-sky-50"
            >
              {renderItem ? (
                renderItem(item)
              ) : (
                <span className="text-sm text-sky-800">{item}</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function DobCalendar({
  value,
  isOpen,
  onToggle,
  onSelect,
  onPrevMonth,
  onNextMonth,
  viewDate,
  maxDate,
}) {
  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const [year, month, day] = String(value).split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }, [value]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`${dropdownBtnClass} ${
          isOpen ? "border-sky-400 bg-white ring-4 ring-sky-100" : ""
        }`}
      >
        <span className={value ? "text-sky-900" : "text-sky-300"}>
          {formatDobDisplay(value)}
        </span>
      </button>

      <FieldIcon>
        <CalendarIcon />
      </FieldIcon>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-sky-200 bg-white p-4 shadow-xl shadow-sky-100/40">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold text-sky-900">
              {viewDate.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevMonth}
                className="grid h-9 w-9 place-items-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-300 hover:bg-sky-100"
                aria-label="Previous month"
              >
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
                  <path d="m12.5 5-5 5 5 5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onNextMonth}
                disabled={
                  viewDate.getFullYear() === maxDate.getFullYear() &&
                  viewDate.getMonth() === maxDate.getMonth()
                }
                className="grid h-9 w-9 place-items-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next month"
              >
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
                  <path d="m7.5 5 5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-sky-500">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const inMonth = isSameMonth(day, viewDate);
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isDisabled = day > maxDate;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() =>
                    !isDisabled &&
                    onSelect(
                      createDobValue(day.getFullYear(), day.getMonth(), day.getDate())
                    )
                  }
                  disabled={isDisabled}
                  className={`grid h-10 w-full place-items-center rounded-xl text-sm transition ${
                    isSelected
                      ? "bg-sky-600 font-semibold text-white shadow-sm"
                      : inMonth
                        ? "text-sky-900 hover:bg-sky-50"
                        : "text-sky-300 hover:bg-sky-50"
                  } ${isDisabled ? "cursor-not-allowed text-slate-300 hover:bg-transparent" : ""}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onSelect("")}
              className="text-sm font-medium text-sky-600 transition hover:text-sky-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() =>
                onSelect(
                  createDobValue(
                    maxDate.getFullYear(),
                    maxDate.getMonth(),
                    maxDate.getDate()
                  )
                )
              }
              className="text-sm font-medium text-sky-600 transition hover:text-sky-800"
            >
              Yesterday
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const SRI_LANKA_NAME = "Sri Lanka";

/* ── Component ─────────────────────────────────────────────────────── */

export default function Register() {
  const navigate = useNavigate();

  const photoInputRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const genderDropdownRef = useRef(null);
  const dobDropdownRef = useRef(null);
  const countryFieldDropdownRef = useRef(null);
  const provinceDropdownRef = useRef(null);
  const districtDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+94",
    phone: "",
    gender: "MALE",
    password: "",
    confirmPassword: "",
    dob: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    country: "",
    provinceState: "",
    district: "",
    city: "",
    profilePhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  /* dial-code countries */
  const [countries, setCountries] = useState([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [countryError, setCountryError] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  /* gender */
  const [genderOpen, setGenderOpen] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const [dobViewDate, setDobViewDate] = useState(() => getMaxDobDate());

  /* password visibility */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* submit state */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /* world location */
  const [worldCountries, setWorldCountries] = useState([]);
  const [worldCountriesLoading, setWorldCountriesLoading] = useState(true);
  const [countryFieldOpen, setCountryFieldOpen] = useState(false);
  const [countryFieldSearch, setCountryFieldSearch] = useState("");

  const [states, setStates] = useState([]);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState("");

  const [districts, setDistricts] = useState([]);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");

  const [cities, setCities] = useState([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const passwordRule =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,12}$/;
  const maxDobDate = useMemo(() => getMaxDobDate(), []);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  /* Load dial-code countries */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await fetchCountries();
        if (!mounted) return;

        setCountries(data);
        const lk = data.find((c) => c.dialCode === "+94");
        if (lk) {
          setForm((prev) => ({ ...prev, countryCode: lk.dialCode }));
        }
      } catch {
        if (mounted) setCountryError("Unable to load country list.");
      } finally {
        if (mounted) setCountryLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* Load world countries */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await fetchWorldCountries();
        if (mounted) setWorldCountries(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setWorldCountries([]);
      } finally {
        if (mounted) setWorldCountriesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* Load states when country changes */
  useEffect(() => {
    let mounted = true;

    if (!form.country) {
      setStates([]);
      setDistricts([]);
      setCities([]);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      try {
        const data = await fetchWorldStates(form.country);
        if (mounted) setStates(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setStates([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [form.country]);

  /* Load districts/cities when province changes */
  useEffect(() => {
    let mounted = true;

    if (!form.country || !form.provinceState) {
      setDistricts([]);
      setCities([]);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      try {
        if (form.country === SRI_LANKA_NAME) {
          const [districtData, cityData] = await Promise.all([
            fetchWorldDistricts(form.country, form.provinceState),
            form.district
              ? fetchWorldCitiesByDistrict(
                  form.country,
                  form.provinceState,
                  form.district
                )
              : Promise.resolve([]),
          ]);

          if (mounted) {
            setDistricts(Array.isArray(districtData) ? districtData : []);
            setCities(Array.isArray(cityData) ? cityData : []);
          }
          return;
        }

        const data = await fetchWorldCities(form.country, form.provinceState);
        if (mounted) {
          setDistricts([]);
          setCities(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) {
          setDistricts([]);
          setCities([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [form.country, form.provinceState, form.district]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      ) {
        setCountryOpen(false);
      }

      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(e.target)
      ) {
        setGenderOpen(false);
      }

      if (dobDropdownRef.current && !dobDropdownRef.current.contains(e.target)) {
        setDobOpen(false);
      }

      if (
        countryFieldDropdownRef.current &&
        !countryFieldDropdownRef.current.contains(e.target)
      ) {
        setCountryFieldOpen(false);
      }

      if (
        provinceDropdownRef.current &&
        !provinceDropdownRef.current.contains(e.target)
      ) {
        setProvinceOpen(false);
      }

      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(e.target)
      ) {
        setDistrictOpen(false);
      }

      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Derived values */
  const selectedCountry = useMemo(
    () =>
      countries.find((c) => c.dialCode === form.countryCode) || {
        name: "Select",
        flagUrl: "",
        dialCode: form.countryCode,
      },
    [countries, form.countryCode]
  );

  const filteredCountries = useMemo(() => {
    const kw = countrySearch.trim().toLowerCase();
    if (!kw) return countries;

    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(kw) ||
        c.dialCode.includes(kw) ||
        c.code.toLowerCase().includes(kw)
    );
  }, [countries, countrySearch]);

  const genderOptions = useMemo(
    () => [
      { value: "MALE", label: "Male" },
      { value: "FEMALE", label: "Female" },
      { value: "OTHER", label: "Other" },
    ],
    []
  );

  const selectedGender = useMemo(
    () => genderOptions.find((o) => o.value === form.gender) || genderOptions[0],
    [form.gender, genderOptions]
  );

  useEffect(() => {
    if (!form.dob) {
      setDobViewDate(maxDobDate);
      return;
    }

    const [year, month, day] = String(form.dob).split("-").map(Number);
    if (!year || !month || !day) return;
    setDobViewDate(new Date(year, month - 1, day));
  }, [form.dob, maxDobDate]);

  const filteredWorldCountries = useMemo(() => {
    const kw = countryFieldSearch.trim().toLowerCase();
    return kw
      ? worldCountries.filter((c) => String(c).toLowerCase().includes(kw))
      : worldCountries;
  }, [worldCountries, countryFieldSearch]);

  const filteredStates = useMemo(() => {
    const kw = provinceSearch.trim().toLowerCase();
    return kw ? states.filter((s) => String(s).toLowerCase().includes(kw)) : states;
  }, [states, provinceSearch]);

  const filteredDistricts = useMemo(() => {
    const kw = districtSearch.trim().toLowerCase();
    return kw
      ? districts.filter((d) => String(d).toLowerCase().includes(kw))
      : districts;
  }, [districts, districtSearch]);

  const filteredCities = useMemo(() => {
    const kw = citySearch.trim().toLowerCase();
    return kw ? cities.filter((c) => String(c).toLowerCase().includes(kw)) : cities;
  }, [cities, citySearch]);

  /* Handlers */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["password", "confirmPassword"].includes(name)) {
      setPasswordError("");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handlePhoneChange = (e) => {
    setForm((prev) => ({
      ...prev,
      phone: normalizePhoneForCountry(prev.countryCode, e.target.value),
    }));
  };

  const handleCountrySelect = (country) => {
    setForm((prev) => ({
      ...prev,
      countryCode: country.dialCode,
      phone: normalizePhoneForCountry(country.dialCode, prev.phone),
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

  const handleDobSelect = (value) => {
    setForm((prev) => ({
      ...prev,
      dob: value,
    }));
    setDobOpen(false);
    setError("");
  };

  const handleWorldCountrySelect = (value) => {
    setForm((prev) => ({
      ...prev,
      country: value,
      provinceState: "",
      district: "",
      city: "",
    }));
    setCountryFieldOpen(false);
    setCountryFieldSearch("");
  };

  const handleProvinceSelect = (value) => {
    setForm((prev) => ({
      ...prev,
      provinceState: value,
      district: "",
      city: "",
    }));
    setProvinceOpen(false);
    setProvinceSearch("");
  };

  const handleDistrictSelect = (value) => {
    setForm((prev) => ({
      ...prev,
      district: value,
      city: "",
    }));
    setDistrictOpen(false);
    setDistrictSearch("");
  };

  const handleCitySelect = (value) => {
    setForm((prev) => ({
      ...prev,
      city: value,
    }));
    setCityOpen(false);
    setCitySearch("");
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setForm((prev) => ({ ...prev, profilePhoto: null }));
      setPhotoPreview(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, or GIF images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setError("Profile photo must be smaller than 5MB.");
      e.target.value = "";
      return;
    }

    setError("");

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      profilePhoto: file,
    }));
    setPhotoPreview(previewUrl);
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(null);
    setForm((prev) => ({
      ...prev,
      profilePhoto: null,
    }));

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
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
      const message =
        "Password must be 6–12 characters and include uppercase, lowercase, number, and special character.";
      setPasswordError(message);
      return message;
    }

    if (!passwordRule.test(form.password)) {
      const message =
        "Password must include uppercase, lowercase, number, and special character.";
      setPasswordError(message);
      return message;
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
      if (!isPasswordValidationMessage(validationError)) {
        setError(validationError);
      }
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("firstName", form.firstName.trim());
      payload.append("lastName", form.lastName.trim());
      payload.append("email", form.email.trim().toLowerCase());
      payload.append("countryCode", form.countryCode.trim());
      payload.append("phone", form.phone.trim());
      payload.append("gender", form.gender);
      payload.append("password", form.password);

      if (form.dob) payload.append("dob", form.dob);
      if (form.addressLine1.trim())
        payload.append("addressLine1", form.addressLine1.trim());
      if (form.addressLine2.trim())
        payload.append("addressLine2", form.addressLine2.trim());
      if (form.addressLine3.trim())
        payload.append("addressLine3", form.addressLine3.trim());
      if (form.country.trim()) payload.append("country", form.country.trim());
      if (form.provinceState.trim())
        payload.append("provinceState", form.provinceState.trim());
      if (form.district.trim()) payload.append("district", form.district.trim());
      if (form.city.trim()) payload.append("city", form.city.trim());
      if (form.profilePhoto instanceof File) {
        payload.append("profilePhoto", form.profilePhoto);
      }

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/auth/verify-email", {
        state: { email: form.email.trim().toLowerCase() },
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const photoMetaText = useMemo(() => {
    if (!form.profilePhoto) return "JPG, PNG or GIF — optional";

    const sizeInKb = form.profilePhoto.size / 1024;
    return `${form.profilePhoto.name} • ${sizeInKb.toFixed(1)} KB`;
  }, [form.profilePhoto]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100/80">
            <RestroomIcon />
          </div>

          <h1 className="whitespace-nowrap text-2xl font-bold text-sky-900 sm:text-3xl">
            Create your profile
          </h1>

        </div>

        <div className="overflow-hidden rounded-3xl border border-sky-200/70 bg-white/75 shadow-xl shadow-sky-100/40 backdrop-blur-xl">
          <div className="h-1 w-full bg-sky-100">
            <div className="h-1 w-1/3 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="px-5 pb-6 pt-8 sm:px-8 lg:px-10">
              <div className={`${sectionHeadingClass} mb-6`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-[10px] font-bold text-sky-600">
                  1
                </span>
                Personal information
                <div className="h-px flex-1 bg-sky-100" />
              </div>

              <div className="mb-8 rounded-2xl border border-sky-100 bg-sky-50/40 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-sky-200 bg-sky-50/80 transition hover:border-sky-300 hover:bg-sky-100/80 sm:h-24 sm:w-24"
                      aria-label="Upload profile photo"
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sky-300">
                          <PhotoIcon />
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-white transition hover:bg-sky-600"
                      aria-label="Upload profile photo"
                    >
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 3v10M3 8h10" />
                      </svg>
                    </button>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white transition hover:bg-red-600"
                        aria-label="Remove profile photo"
                      >
                        ×
                      </button>
                    )}

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-sky-900">
                      Profile photo
                    </p>

                    <p className="mt-0.5 break-all text-xs text-sky-400">
                      {form.profilePhoto ? (
                        <span className="font-medium text-sky-600">
                          {photoMetaText}
                        </span>
                      ) : (
                        "JPG, PNG or GIF — optional"
                      )}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-xs font-semibold text-red-500 underline underline-offset-2 transition hover:text-red-600"
                        >
                          Remove photo
                        </button>
                      )}
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-sky-500">
                      Use a clear image for better profile identification. Max
                      size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    First name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="First name"
                      className={fieldClass}
                    />
                    <FieldIcon>
                      <UserIcon />
                    </FieldIcon>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Last name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Last name"
                      className={fieldClass}
                    />
                    <FieldIcon>
                      <UserIcon />
                    </FieldIcon>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>
                  Email address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                  <FieldIcon>
                    <MailIcon />
                  </FieldIcon>
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>
                  Phone number <span className="text-red-400">*</span>
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[170px_1fr]">
                  <div ref={countryDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryOpen((prev) => !prev)}
                      className={dropdownBtnClass}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <CountryFlag
                          src={selectedCountry.flagUrl}
                          alt={`${selectedCountry.name} flag`}
                        />
                        <span className="truncate text-sm font-medium text-sky-800">
                          {selectedCountry.dialCode}
                        </span>
                      </span>
                    </button>

                    <FieldIcon>
                      <ChevronIcon open={countryOpen} />
                    </FieldIcon>

                    {countryOpen && (
                      <DropdownList
                        items={filteredCountries}
                        loading={countryLoading}
                        searchValue={countrySearch}
                        onSearchChange={setCountrySearch}
                        placeholder="Search country…"
                        onSelect={handleCountrySelect}
                        renderItem={(country) => (
                          <span className="flex w-full items-center justify-between">
                            <span className="flex min-w-0 items-center gap-2">
                              <CountryFlag
                                src={country.flagUrl}
                                alt={`${country.name} flag`}
                              />
                              <span className="truncate text-sm text-sky-800">
                                {country.name}
                              </span>
                            </span>
                            <span className="ml-2 text-xs font-medium text-sky-500">
                              {country.dialCode}
                            </span>
                          </span>
                        )}
                      />
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formatPhoneForDisplay(form.countryCode, form.phone)}
                      onChange={handlePhoneChange}
                      required
                      placeholder="768 448 517"
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                      maxLength={Math.max(
                        getPhoneMaxLengthByCountry(form.countryCode),
                        formatPhoneForDisplay(
                          form.countryCode,
                          "9".repeat(getPhoneMaxLengthByCountry(form.countryCode))
                        ).length
                      )}
                      className={fieldClass}
                    />
                    <FieldIcon>
                      <PhoneIcon />
                    </FieldIcon>
                  </div>
                </div>

                {countryError && (
                  <p className="mt-2 text-xs text-red-500">{countryError}</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Gender <span className="text-red-400">*</span>
                  </label>

                  <div ref={genderDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setGenderOpen((prev) => !prev)}
                      className={`${dropdownBtnClass} ${
                        genderOpen
                          ? "border-sky-400 bg-white ring-4 ring-sky-100"
                          : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100/80 text-sky-500">
                          <GenderIcon />
                        </span>
                        <span className="leading-5">{selectedGender.label}</span>
                      </span>
                    </button>

                    <FieldIcon>
                      <ChevronIcon open={genderOpen} />
                    </FieldIcon>

                    {genderOpen && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl shadow-sky-100/40">
                        <div className="p-2">
                          {genderOptions.map((option) => {
                            const active = option.value === form.gender;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleGenderSelect(option.value)}
                                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                                  active
                                    ? "bg-gradient-to-r from-sky-400 to-blue-500 font-semibold text-white"
                                    : "text-sky-800 hover:bg-sky-50"
                                }`}
                              >
                                <span>{option.label}</span>

                                {active && (
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
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

                <div>
                  <label className={labelClass}>Date of birth</label>
                  <div ref={dobDropdownRef}>
                    <DobCalendar
                      value={form.dob}
                      isOpen={dobOpen}
                      onToggle={() => setDobOpen((prev) => !prev)}
                      onSelect={handleDobSelect}
                      onPrevMonth={() =>
                        setDobViewDate(
                          (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                        )
                      }
                      onNextMonth={() =>
                        setDobViewDate((prev) => {
                          const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
                          const limit = new Date(
                            maxDobDate.getFullYear(),
                            maxDobDate.getMonth(),
                            1
                          );
                          return next > limit ? prev : next;
                        })
                      }
                      viewDate={dobViewDate}
                      maxDate={maxDobDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-5 h-px bg-sky-50 sm:mx-8 lg:mx-10" />

            <div className="px-5 pb-6 pt-6 sm:px-8 lg:px-10">
              <div className={`${sectionHeadingClass} mb-5`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-[10px] font-bold text-sky-600">
                  2
                </span>
                Address{" "}
                <span className="normal-case tracking-normal text-[10px] font-normal text-sky-300">
                  — optional
                </span>
                <div className="h-px flex-1 bg-sky-100" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Address line 1</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Address line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={form.addressLine2}
                      onChange={handleChange}
                      placeholder="Apt, suite, etc."
                      className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Address line 3</label>
                    <input
                      type="text"
                      name="addressLine3"
                      value={form.addressLine3}
                      onChange={handleChange}
                      placeholder="Building, floor, etc."
                      className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Country</label>
                  <div ref={countryFieldDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryFieldOpen((prev) => !prev)}
                      className={`${dropdownBtnClass} ${
                        countryFieldOpen
                          ? "border-sky-400 bg-white ring-4 ring-sky-100"
                          : ""
                      }`}
                    >
                      <span
                        className={form.country ? "text-sky-900" : "text-sky-300"}
                      >
                        {form.country || "Select country"}
                      </span>
                    </button>

                    <FieldIcon>
                      <ChevronIcon open={countryFieldOpen} />
                    </FieldIcon>

                    {countryFieldOpen && (
                      <DropdownList
                        items={filteredWorldCountries}
                        loading={worldCountriesLoading}
                        searchValue={countryFieldSearch}
                        onSearchChange={setCountryFieldSearch}
                        placeholder="Search country…"
                        onSelect={handleWorldCountrySelect}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Province / State</label>
                    <div ref={provinceDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => form.country && setProvinceOpen((prev) => !prev)}
                        className={`${dropdownBtnClass} ${
                          provinceOpen
                            ? "border-sky-400 bg-white ring-4 ring-sky-100"
                            : ""
                        } ${!form.country ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        <span
                          className={
                            form.provinceState ? "text-sky-900" : "text-sky-300"
                          }
                        >
                          {form.provinceState || "Select province"}
                        </span>
                      </button>

                      <FieldIcon>
                        <ChevronIcon open={provinceOpen} />
                      </FieldIcon>

                      {provinceOpen && form.country && (
                        <DropdownList
                          items={filteredStates}
                          loading={false}
                          searchValue={provinceSearch}
                          onSearchChange={setProvinceSearch}
                          placeholder="Search province…"
                          onSelect={handleProvinceSelect}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>District</label>

                    {form.country === SRI_LANKA_NAME ? (
                      <div ref={districtDropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            form.provinceState && setDistrictOpen((prev) => !prev)
                          }
                          className={`${dropdownBtnClass} ${
                            districtOpen
                              ? "border-sky-400 bg-white ring-4 ring-sky-100"
                              : ""
                          } ${
                            !form.provinceState
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                        >
                          <span
                            className={
                              form.district ? "text-sky-900" : "text-sky-300"
                            }
                          >
                            {form.district || "Select district"}
                          </span>
                        </button>

                        <FieldIcon>
                          <ChevronIcon open={districtOpen} />
                        </FieldIcon>

                        {districtOpen && form.provinceState && (
                          <DropdownList
                            items={filteredDistricts}
                            loading={false}
                            searchValue={districtSearch}
                            onSearchChange={setDistrictSearch}
                            placeholder="Search district…"
                            onSelect={handleDistrictSelect}
                          />
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                        placeholder="District"
                        className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 placeholder:text-sky-300 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>City</label>
                  <div ref={cityDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const canOpen =
                          form.provinceState &&
                          (form.country !== SRI_LANKA_NAME || form.district);

                        if (canOpen) {
                          setCityOpen((prev) => !prev);
                        }
                      }}
                      className={`${dropdownBtnClass} ${
                        cityOpen
                          ? "border-sky-400 bg-white ring-4 ring-sky-100"
                          : ""
                      } ${
                        !form.provinceState ||
                        (form.country === SRI_LANKA_NAME && !form.district)
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <span className={form.city ? "text-sky-900" : "text-sky-300"}>
                        {form.city || "Select city"}
                      </span>
                    </button>

                    <FieldIcon>
                      <ChevronIcon open={cityOpen} />
                    </FieldIcon>

                    {cityOpen &&
                      form.provinceState &&
                      (form.country !== SRI_LANKA_NAME || form.district) && (
                        <DropdownList
                          items={filteredCities}
                          loading={false}
                          searchValue={citySearch}
                          onSearchChange={setCitySearch}
                          placeholder="Search city…"
                          onSelect={handleCitySelect}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-5 h-px bg-sky-50 sm:mx-8 lg:mx-10" />

            <div className="px-5 pb-8 pt-6 sm:px-8 lg:px-10">
              <div className={`${sectionHeadingClass} mb-5`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-[10px] font-bold text-sky-600">
                  3
                </span>
                Security
                <div className="h-px flex-1 bg-sky-100" />
              </div>

              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3">
                <span className="mt-0.5 flex-shrink-0 text-sky-400">
                  <LockIcon />
                </span>
                <p className="text-[11.5px] leading-5 text-sky-600">
                  Password must be <span className="font-semibold">6–12 characters</span>{" "}
                  and include at least one uppercase letter, lowercase letter,
                  number, and special character.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Password <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                      className={`${fieldClass} hide-native-password-toggle`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-sky-400 transition hover:text-sky-600"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Confirm password <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter password"
                      className={`${fieldClass} hide-native-password-toggle`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-sky-400 transition hover:text-sky-600"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80">
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 text-red-600">
                  {passwordError}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Create profile"
                )}
              </button>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-sky-100" />
                <span className="text-xs text-sky-300">or</span>
                <div className="h-px flex-1 bg-sky-100" />
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-sky-600">
                <span>Already have an account?</span>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1 font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-900 hover:decoration-sky-500"
                >
                  Login
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </div>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-sky-400">
                By registering you agree to our{" "}
                <Link
                  to="/terms"
                  className="underline underline-offset-2 transition hover:text-sky-600"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="underline underline-offset-2 transition hover:text-sky-600"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .hide-native-password-toggle::-ms-reveal,
        .hide-native-password-toggle::-ms-clear {
          display: none;
        }
      `}</style>
    </div>
  );
}
