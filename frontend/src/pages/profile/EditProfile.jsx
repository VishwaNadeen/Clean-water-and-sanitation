import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useProfileData from "../../hooks/useProfileData";
import {
  fetchWorldCitiesByDistrict,
  fetchWorldCities,
  fetchWorldCountries,
  fetchWorldDistricts,
  fetchWorldStates,
} from "../../services/worldLocationService";
import { updateMyProfile } from "../../services/profileService";
import Dashboard from "./Dashboard";

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
  const location = useLocation();

  const {
    profile,
    loading,
    pageError,
    setPageError,
    storedUser,
    token,
  } = useProfileData();

  const profileBasePath = location.pathname.startsWith("/staff/profile")
    ? "/staff/profile"
    : "/profile";

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
    if (profile || storedUser) {
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
    }
  }, [profile]);

  useEffect(() => {
    let mounted = true;

    async function loadCountries() {
      try {
        const data = await fetchWorldCountries();
        if (mounted) {
          setCountries(data);
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

        const data = await fetchWorldCities(editForm.country, editForm.provinceState);
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
  }, [editForm.country, editForm.district, editForm.provinceState]);

  const fullName = useMemo(() => {
    return (
      `${editForm.firstName || ""} ${editForm.lastName || ""}`.trim() ||
      storedUser?.fullName ||
      "User"
    );
  }, [editForm.firstName, editForm.lastName, storedUser]);

  const countryOptions = useMemo(
    () =>
      withCurrentOption(
        countries,
        editForm.country
      ),
    [countries, editForm.country]
  );

  const provinceOptions = useMemo(() => {
    const options = states;
    return withCurrentOption(options, editForm.provinceState);
  }, [editForm.provinceState, states]);

  const cityOptions = useMemo(() => {
    const options = cities;
    return withCurrentOption(options, editForm.city);
  }, [cities, editForm.city]);

  const districtOptions = useMemo(() => {
    const options = districts;
    return withCurrentOption(options, editForm.district);
  }, [districts, editForm.district]);

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

    if (pageError) {
      setPageError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

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

      await updateMyProfile({
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

      navigate(profileBasePath);
    } catch (error) {
      setPageError(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-160px)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="h-32 animate-pulse bg-slate-100" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end gap-4">
                <div className="h-20 w-20 rounded-[24px] bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-56 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="h-24 rounded-[24px] bg-slate-100" />
                <div className="h-24 rounded-[24px] bg-slate-100" />
                <div className="h-24 rounded-[24px] bg-slate-100" />
                <div className="h-24 rounded-[24px] bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      title="Edit Profile"
      subtitle="Update your account information and personal details."
      token={token}
      profile={profile}
      storedUser={storedUser}
      alerts={
        pageError ? (
          <div className="profile-section-enter rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
            {pageError}
          </div>
        ) : null
      }
      showHero
      heroTitle={fullName}
      heroSubtitle="Update your profile information"
    >
      <section className="profile-section-enter-delayed rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            Profile Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Edit your personal information and save the latest details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Personal Information
              </h4>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="First Name"
                name="firstName"
                value={editForm.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
              />

              <FormField
                label="Last Name"
                name="lastName"
                value={editForm.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Phone Number"
                name="phone"
                value={editForm.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Date of Birth"
                name="dob"
                type="date"
                value={editForm.dob}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Address Information
              </h4>
            </div>

            <div className="grid gap-4">
              <FormField
                label="Address Line 1"
                name="addressLine1"
                value={editForm.addressLine1}
                onChange={handleChange}
                placeholder="Enter address line 1"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Address Line 2"
                name="addressLine2"
                value={editForm.addressLine2}
                onChange={handleChange}
                placeholder="Enter address line 2"
              />

              <FormField
                label="Address Line 3"
                name="addressLine3"
                value={editForm.addressLine3}
                onChange={handleChange}
                placeholder="Enter address line 3"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Country"
                name="country"
                value={editForm.country}
                onChange={handleChange}
                options={countryOptions}
                placeholder="Select country"
              />

              <SelectField
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
                <SelectField
                  label="District"
                  name="district"
                  value={editForm.district}
                  onChange={handleChange}
                  options={districtOptions}
                  placeholder="Select district"
                  disabled={!editForm.provinceState}
                />
              ) : (
                <FormField
                  label="District"
                  name="district"
                  value={editForm.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                />
              )}

              <SelectField
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
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate(profileBasePath)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </Dashboard>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : "border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        }`}
      />
    </div>
  );
}

function SelectField({
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : "border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
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
  );
}
