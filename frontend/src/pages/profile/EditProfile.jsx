import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  fetchWorldCitiesByDistrict,
  fetchWorldCities,
  fetchWorldCountries,
  fetchWorldDistricts,
  fetchWorldStates,
} from "../../services/worldLocationService";
import { updateMyProfile } from "../../services/profileService";

const SRI_LANKA_NAME = "Sri Lanka";

function formatDateForInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
}

function splitAddress(value) {
  if (!value) {
    return { addressLine1: "", addressLine2: "", addressLine3: "" };
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return { addressLine1: "", addressLine2: "", addressLine3: "" };
  }

  const [addressLine1 = "", addressLine2 = "", addressLine3 = ""] = normalized
    .split(/\n|,/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    addressLine1,
    addressLine2,
    addressLine3,
  };
}

function withCurrentOption(options, currentValue) {
  if (!currentValue) return options;
  return options.includes(currentValue) ? options : [currentValue, ...options];
}

export default function EditProfile() {
  const navigate = useNavigate();

  const { profile, storedUser, setProfile, setPageError, profileBasePath } =
    useOutletContext();

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
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
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const { addressLine1, addressLine2, addressLine3 } = splitAddress(
      profile?.address
    );

    setEditForm({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
      gender: profile?.gender || "",
      addressLine1,
      addressLine2,
      addressLine3,
      city: profile?.city || "",
      district: profile?.district || "",
      provinceState: profile?.provinceState || "",
      country: profile?.country || "",
      dob: formatDateForInput(profile?.dob),
    });
  }, [profile]);

  useEffect(() => {
    let mounted = true;

    async function loadCountries() {
      try {
        const data = await fetchWorldCountries();
        if (mounted) {
          setCountries(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) {
          setCountries([]);
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

  const fullName = useMemo(() => {
    return (
      `${editForm.firstName || ""} ${editForm.lastName || ""}`.trim() ||
      storedUser?.fullName ||
      "User"
    );
  }, [editForm.firstName, editForm.lastName, storedUser]);

  const countryOptions = useMemo(() => {
    return withCurrentOption(countries, editForm.country);
  }, [countries, editForm.country]);

  const provinceOptions = useMemo(() => {
    return withCurrentOption(states, editForm.provinceState);
  }, [states, editForm.provinceState]);

  const districtOptions = useMemo(() => {
    return withCurrentOption(districts, editForm.district);
  }, [districts, editForm.district]);

  const cityOptions = useMemo(() => {
    return withCurrentOption(cities, editForm.city);
  }, [cities, editForm.city]);

  function handleChange(event) {
    const { name, value } = event.target;

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

    setPageError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setPageError("First name and last name are required.");
      return;
    }

    try {
      setSaving(true);
      setPageError("");

      const combinedAddress = [
        editForm.addressLine1,
        editForm.addressLine2,
        editForm.addressLine3,
      ]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(", ");

      const updatedProfile = await updateMyProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        gender: editForm.gender,
        address: combinedAddress,
        city: editForm.city,
        district: editForm.district,
        provinceState: editForm.provinceState,
        country: editForm.country,
        dob: editForm.dob,
      });

      if (updatedProfile && typeof setProfile === "function") {
        setProfile(updatedProfile);
      }

      navigate(profileBasePath);
    } catch (error) {
      setPageError(error.message || "Failed to update profile.");
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

        <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
          {fullName}
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
          />
          <InputCard
            label="Last Name"
            name="lastName"
            value={editForm.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputCard
            label="Phone Number"
            name="phone"
            value={editForm.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          <SelectCard
            label="Gender"
            name="gender"
            value={editForm.gender}
            onChange={handleChange}
            placeholder="Select gender"
            options={["Male", "Female", "Other"]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputCard
            label="Date of Birth"
            name="dob"
            type="date"
            value={editForm.dob}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-4">
          <InputCard
            label="Address Line 1"
            name="addressLine1"
            value={editForm.addressLine1}
            onChange={handleChange}
            placeholder="Enter address line 1"
            className="md:col-span-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputCard
            label="Address Line 2"
            name="addressLine2"
            value={editForm.addressLine2}
            onChange={handleChange}
            placeholder="Enter address line 2"
          />
          <InputCard
            label="Address Line 3"
            name="addressLine3"
            value={editForm.addressLine3}
            onChange={handleChange}
            placeholder="Enter address line 3"
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
          />

          <SelectCard
            label="Province / State"
            name="provinceState"
            value={editForm.provinceState}
            onChange={handleChange}
            options={provinceOptions}
            placeholder="Select province or state"
            disabled={!editForm.country}
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
            />
          ) : (
            <InputCard
              label="District"
              name="district"
              value={editForm.district}
              onChange={handleChange}
              placeholder="Enter district"
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
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  className = "",
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition focus-within:border-sky-200 focus-within:bg-white">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-transparent text-sm font-semibold outline-none ${
            disabled
              ? "cursor-not-allowed text-slate-400"
              : "text-slate-900 placeholder:text-slate-400"
          }`}
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
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition focus-within:border-sky-200 focus-within:bg-white">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-transparent text-sm font-semibold outline-none ${
            disabled
              ? "cursor-not-allowed text-slate-400"
              : "text-slate-900"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}