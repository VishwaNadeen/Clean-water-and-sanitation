import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FloatingToast from "../../../components/common/FloatingToast";
import API_BASE_URL from "../../../config/api";
import { fetchCountries } from "../../../services/countryService";
import {
  combineAddressLines,
  getPhoneMaxLengthByCountry,
  normalizeAddressInput,
  normalizeEmailInput,
  normalizeNicInput,
  normalizePhoneForCountry,
  splitAddressLines,
  sanitizePhone,
  validateAddressTyping,
  validateEmailTyping,
  validateFullNameTyping,
  validateNic,
  validatePhone,
  validateStaffForm,
} from "../../../utils/staffFormValidation";

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const initialForm = {
  fullName: "",
  nic: "",
  countryCode: "+94",
  phone: "",
  email: "",
  role: "Cleaner",
  gender: "MALE",
  status: "Active",
  baseProvince: "",
  baseDistrict: "",
  addressLine1: "",
  addressLine2: "",
  dob: "",
  joinDate: getTodayDateString(),
};

const roleOptions = ["Cleaner", "Supervisor", "Technician"];
const genderOptions = ["MALE", "FEMALE"];
const statusOptions = ["Active", "Inactive", "OnLeave"];
const TOAST_DURATION_MS = 5000;

const provinceDistrictMap = {
  "Western": ["Colombo", "Gampaha", "Kalutara"],
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Southern": ["Galle", "Matara", "Hambantota"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  "Eastern": ["Trincomalee", "Batticaloa", "Ampara"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "Uva": ["Badulla", "Monaragala"],
  "Sabaragamuwa": ["Ratnapura", "Kegalle"],
};

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

const StaffRegister = () => {
  const navigate = useNavigate();
  const countryDropdownRef = useRef(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [countryError, setCountryError] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const today = getTodayDateString();

  const districtOptions = provinceDistrictMap[formData.baseProvince] || [];

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
          setFormData((prev) => ({
            ...prev,
            countryCode: sriLanka.dialCode,
          }));
        }
      } catch {
        if (mounted) {
          setCountryError("Unable to load country list.");
          showMessage("error", "Unable to load country list.");
        }
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

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const selectedCountry = useMemo(() => {
    return (
      countries.find((item) => item.dialCode === formData.countryCode) || {
        name: "Select country",
        flagUrl: "",
        dialCode: formData.countryCode || "",
      }
    );
  }, [countries, formData.countryCode]);

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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, TOAST_DURATION_MS);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "baseProvince") {
      setFormData((prev) => ({
        ...prev,
        baseProvince: value,
        baseDistrict: "",
      }));
      setErrors((prev) => ({ ...prev, baseProvince: "", baseDistrict: "" }));
      return;
    }

    if (name === "phone") {
      const normalizedPhone = normalizePhoneForCountry(formData.countryCode, sanitizePhone(value));
      const phoneError = normalizedPhone
        ? validatePhone(formData.countryCode, normalizedPhone)
        : "";
      setFormData((prev) => ({
        ...prev,
        phone: normalizedPhone,
      }));
      setErrors((prev) => ({
        ...prev,
        phone: phoneError,
      }));
      return;
    }

    if (name === "nic") {
      const sanitizedNic = normalizeNicInput(value);
      const isInvalidTyped = value.toUpperCase().replace(/\s/g, "") !== sanitizedNic;
      const nicError = isInvalidTyped
        ? "NIC allows only digits and optional V/X (old) or 12 digits (new)"
        : sanitizedNic
        ? validateNic(sanitizedNic)
        : "";

      setFormData((prev) => ({
        ...prev,
        nic: sanitizedNic,
      }));
      setErrors((prev) => ({
        ...prev,
        nic: nicError,
      }));
      return;
    }

    if (name === "fullName") {
      const sanitizedName = value.replace(/[^A-Za-z\s]/g, "");
      const isInvalidTyped = sanitizedName !== value;
      const fullNameError = isInvalidTyped
        ? "Full name can contain letters and spaces only"
        : validateFullNameTyping(sanitizedName);
      setFormData((prev) => ({
        ...prev,
        fullName: sanitizedName,
      }));
      setErrors((prev) => ({
        ...prev,
        fullName: fullNameError,
      }));
      return;
    }

    if (name === "email") {
      const normalizedEmail = normalizeEmailInput(value);
      const emailError =
        normalizedEmail !== value
          ? "Email can contain letters, numbers, and @ . _ + - only"
          : validateEmailTyping(value);
      setFormData((prev) => ({
        ...prev,
        email: normalizedEmail,
      }));
      setErrors((prev) => ({
        ...prev,
        email: emailError,
      }));
      return;
    }

    if (name === "addressLine1" || name === "addressLine2") {
      const normalizedAddress = normalizeAddressInput(value);
      const addressError =
        normalizedAddress !== value
          ? "Address contains unsupported characters"
          : validateAddressTyping(value);
      setFormData((prev) => ({
        ...prev,
        [name]: normalizedAddress,
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: addressError,
        address: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCountrySelect = (country) => {
    const normalizedPhone = normalizePhoneForCountry(country.dialCode, formData.phone);
    const phoneError = normalizedPhone ? validatePhone(country.dialCode, normalizedPhone) : "";
    setFormData((prev) => ({
      ...prev,
      countryCode: country.dialCode,
      phone: normalizedPhone,
    }));
    setErrors((prev) => ({ ...prev, countryCode: "", phone: phoneError }));
    setCountryOpen(false);
    setCountrySearch("");
  };

  const validateForm = () => {
    const combinedAddress = combineAddressLines(formData.addressLine1, formData.addressLine2);
    const newErrors = validateStaffForm(
      {
        ...formData,
        address: combinedAddress,
      },
      { requireEmail: true }
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormData(initialForm);
    setErrors({});
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      const validationErrors = validateStaffForm(
        {
          ...formData,
          address: combineAddressLines(formData.addressLine1, formData.addressLine2),
        },
        { requireEmail: true }
      );
      showMessage("error", Object.values(validationErrors)[0] || "Please fix the form errors");
      return;
    }

    try {
      setLoading(true);

      const combinedAddress = combineAddressLines(
        formData.addressLine1,
        formData.addressLine2
      );

      const payload = {
        fullName: formData.fullName.trim(),
        nic: formData.nic.trim(),
        countryCode: formData.countryCode.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        gender: formData.gender,
        status: formData.status,
        baseProvince: formData.baseProvince,
        baseDistrict: formData.baseDistrict,
        address: combinedAddress,
        dob: formData.dob,
        joinDate: formData.joinDate || undefined,
      };

      const token = localStorage.getItem("token");

      const { data } = await axios.post(`${API_BASE_URL}/staff`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const successText = data?.emailSent === false
        ? "Staff member registered successfully."
        : data?.message || "Staff member registered successfully.";

      handleReset();
      navigate("/admin/staff", {
        replace: true,
        state: {
          toast: {
            type: "success",
            text: successText,
          },
        },
      });
    } catch (error) {
      showMessage(
        "error",
        error?.response?.data?.message || "Failed to register staff member"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const dropdownButtonClass =
    "flex w-full items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const errorClass = "mt-1 text-xs text-rose-600";

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-100">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Register Staff Member</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
            Add a new staff member with personal, contact, and work details.
          </p>
        </div>

        {message.text ? <FloatingToast toast={message} onClose={() => setMessage({ type: "", text: "" })} /> : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-[32px] border border-blue-100 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className={inputClass}
              />
              {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
            </div>

            <div>
              <label className={labelClass}>NIC</label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="Enter NIC"
                maxLength={12}
                className={inputClass}
              />
              {errors.nic && <p className={errorClass}>{errors.nic}</p>}
              <p className="mt-1 text-xs text-slate-500">
                This NIC will be used as the temporary first-login password.
              </p>
            </div>

            <div>
              <label className={labelClass}>Country Code</label>
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
                  <span className="ml-auto text-slate-500">
                    <ChevronIcon />
                  </span>
                </button>

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
                        <div className="px-3 py-2 text-sm text-rose-600">
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
              {errors.countryCode && <p className={errorClass}>{errors.countryCode}</p>}
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0771234567"
                inputMode="numeric"
                maxLength={getPhoneMaxLengthByCountry(formData.countryCode)}
                className={inputClass}
              />
              {errors.phone && <p className={errorClass}>{errors.phone}</p>}
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="staff@email.com"
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            <div>
              <label className={labelClass}>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputClass}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && <p className={errorClass}>{errors.role}</p>}
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
              {errors.gender && <p className={errorClass}>{errors.gender}</p>}
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {errors.status && <p className={errorClass}>{errors.status}</p>}
            </div>

            <div>
              <label className={labelClass}>Base Province</label>
              <select
                name="baseProvince"
                value={formData.baseProvince}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select province</option>
                {Object.keys(provinceDistrictMap).map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.baseProvince && <p className={errorClass}>{errors.baseProvince}</p>}
            </div>

            <div>
              <label className={labelClass}>Base District</label>
              <select
                name="baseDistrict"
                value={formData.baseDistrict}
                onChange={handleChange}
                className={inputClass}
                disabled={!formData.baseProvince}
              >
                <option value="">Select district</option>
                {districtOptions.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.baseDistrict && <p className={errorClass}>{errors.baseDistrict}</p>}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Enter address line 1"
                className={inputClass}
              />
              {errors.addressLine1 && <p className={errorClass}>{errors.addressLine1}</p>}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Enter address line 2"
                className={inputClass}
              />
              {errors.addressLine2 && <p className={errorClass}>{errors.addressLine2}</p>}
            </div>

            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                max={today}
                onKeyDown={(event) => event.preventDefault()}
                onPaste={(event) => event.preventDefault()}
                onDrop={(event) => event.preventDefault()}
                className={inputClass}
              />
              {errors.dob && <p className={errorClass}>{errors.dob}</p>}
            </div>

            <div>
              <label className={labelClass}>Join Date</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                min={today}
                onKeyDown={(event) => event.preventDefault()}
                onPaste={(event) => event.preventDefault()}
                onDrop={(event) => event.preventDefault()}
                className={inputClass}
              />
              {errors.joinDate && <p className={errorClass}>{errors.joinDate}</p>}
            </div>

          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register Staff Member"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffRegister;
