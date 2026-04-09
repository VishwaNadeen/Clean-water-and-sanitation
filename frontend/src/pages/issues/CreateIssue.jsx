import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { getToken } from "../../utils/auth";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function CreateIssue() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    categoryId: "",
    subCategoryId: "",
    provinceId: "",
    districtId: "",
    cityId: "",
    restroomId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  });
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [restrooms, setRestrooms] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category._id === formData.categoryId),
    [categories, formData.categoryId]
  );

  const selectedProvince = useMemo(
    () => provinces.find((province) => province._id === formData.provinceId),
    [provinces, formData.provinceId]
  );

  const selectedDistrict = useMemo(
    () => districts.find((district) => district._id === formData.districtId),
    [districts, formData.districtId]
  );

  const selectedCity = useMemo(
    () => cities.find((city) => city._id === formData.cityId),
    [cities, formData.cityId]
  );

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");

        const [categoryRes, provinceRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories/dropdown`),
          fetch(`${API_BASE_URL}/locations/provinces`),
        ]);

        const [categoryData, provinceData] = await Promise.all([
          categoryRes.json(),
          provinceRes.json(),
        ]);

        if (!categoryRes.ok) {
          throw new Error(
            categoryData?.message || "Failed to load issue categories."
          );
        }

        if (!provinceRes.ok) {
          throw new Error(
            provinceData?.message || "Failed to load provinces."
          );
        }

        setCategories(categoryData?.data || []);
        setProvinces(provinceData?.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load form data.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!formData.provinceId) {
      setDistricts([]);
      setCities([]);
      setRestrooms([]);
      return;
    }

    async function loadDistricts() {
      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/locations/provinces/${formData.provinceId}/districts`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load districts.");
        }

        setDistricts(data?.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load districts.");
        setDistricts([]);
      }
    }

    loadDistricts();
  }, [formData.provinceId]);

  useEffect(() => {
    if (!formData.districtId) {
      setCities([]);
      setRestrooms([]);
      return;
    }

    async function loadCities() {
      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/locations/districts/${formData.districtId}/cities`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load cities.");
        }

        setCities(data?.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load cities.");
        setCities([]);
      }
    }

    loadCities();
  }, [formData.districtId]);

  useEffect(() => {
    if (!selectedProvince || !selectedDistrict || !selectedCity) {
      setRestrooms([]);
      return;
    }

    async function loadRestrooms() {
      try {
        setError("");

        const params = new URLSearchParams({
          province: selectedProvince.name,
          district: selectedDistrict.name,
          city: selectedCity.name,
        });

        const response = await fetch(
          `${API_BASE_URL}/restrooms?${params.toString()}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load restrooms.");
        }

        setRestrooms(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load restrooms.");
        setRestrooms([]);
      }
    }

    loadRestrooms();
  }, [selectedProvince, selectedDistrict, selectedCity]);

  function handleChange(event) {
    const { name, value } = event.target;

    setSuccessMessage("");
    setError("");

    setFormData((prev) => {
      if (name === "categoryId") {
        return {
          ...prev,
          categoryId: value,
          subCategoryId: "",
        };
      }

      if (name === "provinceId") {
        return {
          ...prev,
          provinceId: value,
          districtId: "",
          cityId: "",
          restroomId: "",
        };
      }

      if (name === "districtId") {
        return {
          ...prev,
          districtId: value,
          cityId: "",
          restroomId: "",
        };
      }

      if (name === "cityId") {
        return {
          ...prev,
          cityId: value,
          restroomId: "",
        };
      }

      if (name === "restroomId") {
        return {
          ...prev,
          restroomId: value,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    setImages(selectedFiles);
    setSuccessMessage("");
    setError("");
  }

  function validateForm() {
    if (!formData.categoryId) return "Please select a category.";
    if (!formData.subCategoryId) return "Please select a subcategory.";
    if (!formData.provinceId) return "Please select a province.";
    if (!formData.districtId) return "Please select a district.";
    if (!formData.cityId) return "Please select a city.";
    if (!formData.restroomId) return "Please select a restroom.";
    if (!formData.title.trim()) return "Issue title is required.";
    if (formData.description.trim().length < 5) {
      return "Description must be at least 5 characters.";
    }
    if (images.length > 5) return "You can upload up to 5 images only.";

    const fileTooLarge = images.some((file) => file.size > 5 * 1024 * 1024);
    if (fileTooLarge) return "Each image must be less than 5MB.";

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Please log in first to report an issue.");
      }

      const payload = new FormData();
      payload.append("categoryId", formData.categoryId);
      payload.append("subCategoryId", formData.subCategoryId);
      payload.append("provinceId", formData.provinceId);
      payload.append("districtId", formData.districtId);
      payload.append("cityId", formData.cityId);
      payload.append("restroomId", formData.restroomId);
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("priority", formData.priority);

      images.forEach((file) => {
        payload.append("images", file);
      });

      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create issue.");
      }

      const successText = data?.message || "Issue created successfully.";
      setSuccessMessage(successText);
      setFormData({
        categoryId: "",
        subCategoryId: "",
        provinceId: "",
        districtId: "",
        cityId: "",
        restroomId: "",
        title: "",
        description: "",
        priority: "MEDIUM",
      });
      setDistricts([]);
      setCities([]);
      setRestrooms([]);
      setImages([]);

      const issueId = data?.data?._id;
      if (issueId) {
        navigate(`/issues/me/${issueId}`, {
          state: {
            successMessage: successText,
          },
        });
      }
    } catch (submitError) {
      setError(submitError.message || "Failed to create issue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-[0_16px_50px_rgba(56,189,248,0.12)] md:p-8">
        <div className="flex flex-col gap-3 border-b border-sky-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3px] text-sky-600">
            Issue Reporting
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Create Issue</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            Report a sanitation or water-related issue using the admin-managed
            category list, your seeded location data, and the existing restroom
            records.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-sm text-slate-500">
            Loading issue form data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Category">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={inputClassName}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subcategory">
                <select
                  name="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={!selectedCategory}
                  required
                >
                  <option value="">Select subcategory</option>
                  {(selectedCategory?.subCategories || []).map((subCategory) => (
                    <option key={subCategory._id} value={subCategory._id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Province">
                <select
                  name="provinceId"
                  value={formData.provinceId}
                  onChange={handleChange}
                  className={inputClassName}
                  required
                >
                  <option value="">Select province</option>
                  {provinces.map((province) => (
                    <option key={province._id} value={province._id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="District">
                <select
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={!formData.provinceId}
                  required
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="City">
                <select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={!formData.districtId}
                  required
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Restroom">
                <select
                  name="restroomId"
                  value={formData.restroomId}
                  onChange={handleChange}
                  className={inputClassName}
                  disabled={!formData.cityId}
                  required
                >
                  <option value="">Select restroom</option>
                  {restrooms.map((restroom) => (
                    <option key={restroom._id} value={restroom._id}>
                      {restroom.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Priority">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Images">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className={fileInputClassName}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Upload up to 5 images. Each file must be under 5MB.
                </p>
              </Field>
            </div>

            <div className="grid gap-5">
              <Field label="Issue Title">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a short issue title"
                  className={inputClassName}
                  required
                />
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue clearly so the team can resolve it faster"
                  className={`${inputClassName} min-h-36 resize-y`}
                  required
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 border-t border-sky-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/issues/me")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Create Issue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70";

const fileInputClassName =
  "block w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-200";
