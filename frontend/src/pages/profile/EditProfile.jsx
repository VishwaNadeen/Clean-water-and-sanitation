import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchCountries } from "../../services/countryService";
import {
  fetchWorldCitiesByDistrict,
  fetchWorldCities,
  fetchWorldCountries,
  fetchWorldDistricts,
  fetchWorldStates,
} from "../../services/worldLocationService";
import { updateMyProfile } from "../../services/profileService";
import { updateStoredUser } from "../../utils/auth";
import {
  getPhoneMaxLengthByCountry,
  normalizePhoneForCountry,
  validatePhone,
} from "../../utils/staffFormValidation";

const SRI_LANKA_NAME = "Sri Lanka";
const NAME_MAX_LENGTH = 50;

function validateName(value) {
  const name = String(value || "").trim();

  if (name.length < 2) return "Must be at least 2 characters.";
  if (name.length > NAME_MAX_LENGTH) return "Must be at most 50 characters.";
  if (!/^[A-Za-z\s.'-]+$/.test(name)) {
    return "Only letters and basic punctuation allowed.";
  }

  return "";
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

function formatDateForInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
}

function getMaxAllowedDob() {
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function withCurrentOption(options, currentValue) {
  if (!currentValue) return options;
  return options.includes(currentValue) ? options : [currentValue, ...options];
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
      className="h-5 w-7 rounded-[6px] object-cover shadow-sm"
    />
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

function LocationIcon() {
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
      <path d="M10 17s5-4.4 5-9a5 5 0 1 0-10 0c0 4.6 5 9 5 9Z" />
      <circle cx="10" cy="8" r="1.8" />
    </svg>
  );
}

function HomeIcon() {
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
      <path d="M3.5 8.5 10 3l6.5 5.5V16a1 1 0 0 1-1 1h-3.5v-4h-4v4H4.5a1 1 0 0 1-1-1V8.5Z" />
    </svg>
  );
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
        className={`flex w-full items-center rounded-2xl border bg-white px-5 py-4 pr-12 text-left text-sm font-semibold text-slate-900 outline-none transition ${
          isOpen
            ? "border-sky-400 ring-4 ring-sky-100"
            : "border-sky-200 hover:border-sky-300"
        }`}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {formatDobDisplay(value)}
        </span>
      </button>

      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80 text-sky-500">
          <CalendarIcon />
        </span>
      </div>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-sky-200 bg-white p-4 shadow-xl shadow-sky-100/40">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">
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
                        ? "text-slate-900 hover:bg-sky-50"
                        : "text-slate-300 hover:bg-sky-50"
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

export default function EditProfile() {
  const navigate = useNavigate();

  const { profile, storedUser, setProfile, setPageError, profileBasePath } =
    useOutletContext();

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+94",
    phone: "",
    gender: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    district: "",
    provinceState: "",
    country: "",
    dob: "",
  });

  const [saving, setSaving] = useState(false);
  const [locationCountries, setLocationCountries] = useState([]);
  const [dialCodeCountries, setDialCodeCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [countryCodeError, setCountryCodeError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [dobOpen, setDobOpen] = useState(false);
  const maxAllowedDob = useMemo(() => getMaxAllowedDob(), []);
  const maxAllowedDobDate = useMemo(() => {
    const [year, month, day] = maxAllowedDob.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [maxAllowedDob]);
  const [dobViewDate, setDobViewDate] = useState(maxAllowedDobDate);
  const countryDropdownRef = useRef(null);
  const dobDropdownRef = useRef(null);

  useEffect(() => {
    setEditForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      countryCode: profile?.countryCode || "+94",
      phone: profile?.phone || "",
      gender: profile?.gender || "",
      addressLine1: profile?.addressLine1 || "",
      addressLine2: profile?.addressLine2 || "",
      addressLine3: profile?.addressLine3 || "",
      city: profile?.city || "",
      district: profile?.district || "",
      provinceState: profile?.provinceState || "",
      country: profile?.country || "",
      dob: formatDateForInput(profile?.dob),
    });
    setFirstNameError("");
    setLastNameError("");
    setCountryCodeError("");
    setPhoneError("");
  }, [profile]);

  useEffect(() => {
    if (!editForm.dob) {
      setDobViewDate(maxAllowedDobDate);
      return;
    }

    const [year, month, day] = String(editForm.dob).split("-").map(Number);
    if (!year || !month || !day) return;

    setDobViewDate(new Date(year, month - 1, day));
  }, [editForm.dob, maxAllowedDobDate]);

  useEffect(() => {
    let mounted = true;

    async function loadCountries() {
      try {
        const data = await fetchWorldCountries();
        if (mounted) {
          setLocationCountries(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) {
          setLocationCountries([]);
        }
      }
    }

    loadCountries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDialCodeCountries() {
      try {
        const data = await fetchCountries();
        if (mounted) {
          setDialCodeCountries(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) {
          setDialCodeCountries([]);
        }
      }
    }

    loadDialCodeCountries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!countryOpen && !dobOpen) return undefined;

    function handleClickOutside(event) {
      if (!countryDropdownRef.current?.contains(event.target)) {
        setCountryOpen(false);
      }

      if (!dobDropdownRef.current?.contains(event.target)) {
        setDobOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryOpen, dobOpen]);

  useEffect(() => {
    let mounted = true;

    if (!editForm.country) {
      setStates([]);
      setDistricts([]);
      setCities([]);
      return () => {
        mounted = false;
      };
    }

    async function loadStates() {
      try {
        const data = await fetchWorldStates(editForm.country);
        if (mounted) {
          setStates(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) {
          setStates([]);
        }
      }
    }

    loadStates();

    return () => {
      mounted = false;
    };
  }, [editForm.country]);

  useEffect(() => {
    let mounted = true;

    if (!editForm.country || !editForm.provinceState) {
      setDistricts([]);
      setCities([]);
      return () => {
        mounted = false;
      };
    }

    async function loadLocationChildren() {
      try {
        if (editForm.country === SRI_LANKA_NAME) {
          const [districtData, cityData] = await Promise.all([
            fetchWorldDistricts(editForm.country, editForm.provinceState),
            editForm.district
              ? fetchWorldCitiesByDistrict(
                  editForm.country,
                  editForm.provinceState,
                  editForm.district
                )
              : Promise.resolve([]),
          ]);

          if (mounted) {
            setDistricts(Array.isArray(districtData) ? districtData : []);
            setCities(Array.isArray(cityData) ? cityData : []);
          }

          return;
        }

        const data = await fetchWorldCities(
          editForm.country,
          editForm.provinceState
        );

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
    }

    loadLocationChildren();

    return () => {
      mounted = false;
    };
  }, [editForm.country, editForm.provinceState, editForm.district]);

  const countryOptions = useMemo(() => {
    return withCurrentOption(locationCountries, editForm.country);
  }, [locationCountries, editForm.country]);

  const provinceOptions = useMemo(() => {
    return withCurrentOption(states, editForm.provinceState);
  }, [states, editForm.provinceState]);

  const districtOptions = useMemo(() => {
    return withCurrentOption(districts, editForm.district);
  }, [districts, editForm.district]);

  const cityOptions = useMemo(() => {
    return withCurrentOption(cities, editForm.city);
  }, [cities, editForm.city]);

  const selectedCountryCode = useMemo(() => {
    return (
      dialCodeCountries.find((item) => item.dialCode === editForm.countryCode) || {
        name: "Select",
        flagUrl: "",
        dialCode: editForm.countryCode || "",
      }
    );
  }, [dialCodeCountries, editForm.countryCode]);

  const filteredDialCodeCountries = useMemo(() => {
    const keyword = countrySearch.trim().toLowerCase();
    if (!keyword) return dialCodeCountries;

    return dialCodeCountries.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.dialCode.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword)
    );
  }, [dialCodeCountries, countrySearch]);

  function handleChange(event) {
    const { name } = event.target;
    const value =
      name === "phone"
        ? normalizePhoneForCountry(editForm.countryCode, event.target.value)
        : event.target.value;

    setEditForm((prev) => {
      if (name === "country") {
        return {
          ...prev,
          country: value,
          provinceState: "",
          district: "",
          city: "",
        };
      }

      if (name === "provinceState") {
        return {
          ...prev,
          provinceState: value,
          district: "",
          city: "",
        };
      }

      if (name === "district") {
        return {
          ...prev,
          district: value,
          city: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    if (name === "phone") {
      setPhoneError(validatePhone(editForm.countryCode, value));
    }

    if (name === "firstName") {
      setFirstNameError(validateName(value));
    }

    if (name === "lastName") {
      setLastNameError(validateName(value));
    }

    setPageError("");
  }

  function handleCountryCodeSelect(country) {
    const normalizedPhone = normalizePhoneForCountry(country.dialCode, editForm.phone);
    const nextPhoneError = normalizedPhone
      ? validatePhone(country.dialCode, normalizedPhone)
      : "";

    setEditForm((prev) => ({
      ...prev,
      countryCode: country.dialCode,
      phone: normalizedPhone,
    }));
    setCountryCodeError("");
    setPhoneError(nextPhoneError);
    setCountryOpen(false);
    setCountrySearch("");
    setPageError("");
  }

  function handleDobSelect(value) {
    setEditForm((prev) => ({
      ...prev,
      dob: value,
    }));
    setDobOpen(false);
    setPageError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextFirstNameError = validateName(editForm.firstName);
    const nextLastNameError = validateName(editForm.lastName);
    if (nextFirstNameError || nextLastNameError) {
      setFirstNameError(nextFirstNameError);
      setLastNameError(nextLastNameError);
      setPageError(nextFirstNameError || nextLastNameError);
      return;
    }

    if (!editForm.countryCode.trim()) {
      setCountryCodeError("Country code is required");
      setPageError("Country code is required");
      return;
    }

    const nextPhoneError = validatePhone(editForm.countryCode, editForm.phone);
    if (nextPhoneError) {
      setCountryCodeError("");
      setPhoneError(nextPhoneError);
      setPageError(nextPhoneError);
      return;
    }

    if (editForm.dob && editForm.dob > maxAllowedDob) {
      setPageError("Date of birth must be before today.");
      return;
    }

    try {
      setSaving(true);
      setPageError("");

      const response = await updateMyProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        countryCode: editForm.countryCode,
        phone: editForm.phone,
        gender: editForm.gender,
        addressLine1: editForm.addressLine1,
        addressLine2: editForm.addressLine2,
        addressLine3: editForm.addressLine3,
        city: editForm.city,
        district: editForm.district,
        provinceState: editForm.provinceState,
        country: editForm.country,
        dob: editForm.dob,
      });

      const updatedProfile = response?.user || response;

      if (updatedProfile && typeof setProfile === "function") {
        setProfile(updatedProfile);
      }

      updateStoredUser({
        fullName:
          updatedProfile?.fullName ||
          [updatedProfile?.firstName, updatedProfile?.lastName]
            .filter(Boolean)
            .join(" ") ||
          `${editForm.firstName} ${editForm.lastName}`.trim(),
        firstName: updatedProfile?.firstName || editForm.firstName,
        lastName: updatedProfile?.lastName || editForm.lastName,
        email: updatedProfile?.email || storedUser?.email || "",
      });

      navigate(profileBasePath);
    } catch (error) {
      const backendFirstNameError = error?.fieldErrors?.firstName;
      const backendLastNameError = error?.fieldErrors?.lastName;
      const backendCountryCodeError = error?.fieldErrors?.countryCode;
      const backendPhoneError = error?.fieldErrors?.phone;
      if (backendFirstNameError) {
        setFirstNameError(backendFirstNameError);
      }
      if (backendLastNameError) {
        setLastNameError(backendLastNameError);
      }
      if (backendCountryCodeError) {
        setCountryCodeError(backendCountryCodeError);
      }
      if (backendPhoneError) {
        setPhoneError(backendPhoneError);
      }
      setPageError(
        backendFirstNameError ||
          backendLastNameError ||
          backendCountryCodeError ||
          backendPhoneError ||
          error.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 21V7.875A1.875 1.875 0 0 1 6.375 6h8.379a1.875 1.875 0 0 1 1.326.549l1.371 1.371A1.875 1.875 0 0 1 18 9.246V21m-13.5 0h13.5M9 12h6m-6 3h6"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Edit Profile
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Update your personal information and save the latest details.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex-1 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <InputCard
            label="First Name"
            name="firstName"
            value={editForm.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            maxLength={NAME_MAX_LENGTH}
            error={firstNameError}
            icon={<UserIcon />}
          />
          <InputCard
            label="Last Name"
            name="lastName"
            value={editForm.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            maxLength={NAME_MAX_LENGTH}
            error={lastNameError}
            icon={<UserIcon />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PhoneField
            countryDropdownRef={countryDropdownRef}
            countryOpen={countryOpen}
            setCountryOpen={setCountryOpen}
            countrySearch={countrySearch}
            setCountrySearch={setCountrySearch}
            selectedCountry={selectedCountryCode}
            filteredCountries={filteredDialCodeCountries}
            onCountrySelect={handleCountryCodeSelect}
            phoneValue={formatPhoneForDisplay(editForm.countryCode, editForm.phone)}
            onPhoneChange={handleChange}
            phoneMaxLength={getPhoneMaxLengthByCountry(editForm.countryCode)}
            countryCodeError={countryCodeError}
            phoneError={phoneError}
            phoneIcon={<PhoneIcon />}
          />

          <SelectCard
            label="Gender"
            name="gender"
            value={editForm.gender}
            onChange={handleChange}
            placeholder="Select gender"
            options={["MALE", "FEMALE", "OTHER"]}
            searchable={false}
            icon={<GenderIcon />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div ref={dobDropdownRef}>
            <p className="mb-2 text-sm font-medium text-slate-700">Date of Birth</p>
            <DobCalendar
              value={editForm.dob}
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
                    maxAllowedDobDate.getFullYear(),
                    maxAllowedDobDate.getMonth(),
                    1
                  );
                  return next > limit ? prev : next;
                })
              }
              viewDate={dobViewDate}
              maxDate={maxAllowedDobDate}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <InputCard
            label="Address Line 1"
            name="addressLine1"
            value={editForm.addressLine1}
            onChange={handleChange}
            placeholder="Enter address line 1"
            className="md:col-span-2"
            icon={<HomeIcon />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputCard
            label="Address Line 2"
            name="addressLine2"
            value={editForm.addressLine2}
            onChange={handleChange}
            placeholder="Enter address line 2"
            icon={<HomeIcon />}
          />
          <InputCard
            label="Address Line 3"
            name="addressLine3"
            value={editForm.addressLine3}
            onChange={handleChange}
            placeholder="Enter address line 3"
            icon={<HomeIcon />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectCard
            label="Country"
            name="country"
            value={editForm.country}
            onChange={handleChange}
            options={countryOptions}
            placeholder="Select country"
            preferOpenUpward
            icon={<LocationIcon />}
          />

          <SelectCard
            label="Province / State"
            name="provinceState"
            value={editForm.provinceState}
            onChange={handleChange}
            options={provinceOptions}
            placeholder="Select province or state"
            disabled={!editForm.country}
            preferOpenUpward
            icon={<LocationIcon />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {editForm.country === SRI_LANKA_NAME ? (
            <SelectCard
              label="District"
              name="district"
              value={editForm.district}
              onChange={handleChange}
              options={districtOptions}
              placeholder="Select district"
              disabled={!editForm.provinceState}
              preferOpenUpward
              icon={<LocationIcon />}
            />
          ) : (
            <InputCard
              label="District"
              name="district"
              value={editForm.district}
              onChange={handleChange}
              placeholder="Enter district"
              icon={<LocationIcon />}
            />
          )}

          <SelectCard
            label="City"
            name="city"
            value={editForm.city}
            onChange={handleChange}
            options={cityOptions}
            placeholder="Select city"
            disabled={
              !editForm.provinceState ||
              (editForm.country === SRI_LANKA_NAME && !editForm.district)
            }
            preferOpenUpward
            icon={<LocationIcon />}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-70"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate(profileBasePath)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

function InputCard({
  label = "",
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  className = "",
  max,
  maxLength,
  error = "",
  icon = null,
}) {
  return (
    <div className={className}>
      {label ? <p className="mb-2 text-sm font-medium text-slate-700">{label}</p> : null}
      <div className="relative rounded-2xl border border-sky-200 bg-white px-5 py-4 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          max={max}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-transparent text-sm font-semibold outline-none ${
            disabled
              ? "cursor-not-allowed text-slate-400"
              : "text-slate-900 placeholder:text-slate-400"
          } ${icon ? "pr-10" : ""}`}
        />
        {icon ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80 text-sky-500">
              {icon}
            </span>
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

function PhoneField({
  countryDropdownRef,
  countryOpen,
  setCountryOpen,
  countrySearch,
  setCountrySearch,
  selectedCountry,
  filteredCountries,
  onCountrySelect,
  phoneValue,
  onPhoneChange,
  phoneMaxLength,
  countryCodeError,
  phoneError,
  phoneIcon,
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Phone Number</p>
      <div className="grid gap-3 sm:grid-cols-[170px_1fr]">
        <div ref={countryDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setCountryOpen((prev) => !prev)}
            className="flex w-full items-center rounded-2xl border border-sky-200 bg-white px-4 py-4 text-left text-sm font-semibold text-slate-900 outline-none transition hover:border-sky-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <span className="flex min-w-0 items-center gap-2">
              <CountryFlag
                src={selectedCountry.flagUrl}
                alt={`${selectedCountry.name} flag`}
              />
              <span className="truncate">{selectedCountry.dialCode}</span>
            </span>
            <span className="ml-auto text-sky-500">
              <ChevronIcon />
            </span>
          </button>

          {countryOpen ? (
            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl">
              <div className="border-b border-sky-100 p-3">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(event) => setCountrySearch(event.target.value)}
                  placeholder="Search country"
                  className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div className="max-h-56 overflow-y-auto p-2">
                {filteredCountries.length ? (
                  filteredCountries.map((country) => (
                    <button
                      key={`${country.code}-${country.dialCode}`}
                      type="button"
                      onClick={() => onCountrySelect(country)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-sky-50"
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
                ) : (
                  <div className="px-3 py-4 text-sm text-slate-500">
                    No matching countries found.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {countryCodeError ? (
            <p className="mt-2 text-xs text-rose-600">{countryCodeError}</p>
          ) : null}
        </div>

        <InputCard
          name="phone"
          value={phoneValue}
          onChange={onPhoneChange}
          placeholder="768 448 517"
          maxLength={phoneMaxLength}
          error={phoneError}
          icon={phoneIcon}
        />
      </div>
    </div>
  );
}

function SelectCard({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  preferOpenUpward = false,
  searchable = true,
  icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(320);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      String(option).toLowerCase().includes(normalizedSearch)
    );
  }, [options, searchTerm]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function updateDropdownPlacement() {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const nextOpensUpward =
        preferOpenUpward || (spaceBelow < 280 && spaceAbove > spaceBelow);
      const availableSpace = nextOpensUpward ? spaceAbove - 24 : spaceBelow - 24;

      setOpensUpward(nextOpensUpward);
      setMenuMaxHeight(Math.max(180, Math.min(320, availableSpace)));
    }

    updateDropdownPlacement();
    setSearchTerm("");

    window.addEventListener("resize", updateDropdownPlacement);
    window.addEventListener("scroll", updateDropdownPlacement, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPlacement);
      window.removeEventListener("scroll", updateDropdownPlacement, true);
    };
  }, [isOpen, preferOpenUpward]);

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  function handleSelect(nextValue) {
    onChange({
      target: {
        name,
        value: nextValue,
      },
    });
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-2xl border bg-white px-5 py-4 text-left text-sm font-semibold outline-none transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 text-slate-400"
            : isOpen
              ? "border-sky-400 text-slate-900 ring-4 ring-sky-100"
              : "cursor-pointer border-sky-200 text-slate-900"
        }`}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <span className="ml-3 flex shrink-0 items-center gap-2">
          {icon ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80 text-sky-500">
              {icon}
            </span>
          ) : null}
          <svg
            className={`h-4 w-4 transition ${
              disabled
                ? "text-slate-300"
                : isOpen
                  ? "rotate-180 text-sky-500"
                  : "text-sky-500"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </span>
      </button>

      {!disabled && isOpen ? (
        <div
          className={`absolute left-0 right-0 z-30 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-[0_18px_45px_rgba(14,116,144,0.16)] ${
            opensUpward ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]"
          }`}
        >
          {searchable ? (
            <div className="border-b border-sky-100 p-3">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
                placeholder={`Search ${label.toLowerCase()}`}
                className="w-full rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>
          ) : null}

          <div className="overflow-y-auto py-2" style={{ maxHeight: menuMaxHeight }}>
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`block w-full px-5 py-3 text-left text-sm transition ${
                value
                  ? "text-slate-500 hover:bg-sky-50 hover:text-sky-700"
                  : "bg-sky-600 font-semibold text-white"
              }`}
            >
              {placeholder}
            </button>

            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`block w-full px-5 py-3 text-left text-sm transition ${
                    value === option
                      ? "bg-sky-600 font-semibold text-white"
                      : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-5 py-4 text-sm text-slate-500">
                No matching options found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
