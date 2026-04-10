import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { getToken } from "../../utils/auth";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function UpdateIssue() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [status, setStatus] = useState("");

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();
        if (!token) {
          throw new Error("Please log in first to update an issue.");
        }

        const [issueRes, categoryRes, provinceRes] = await Promise.all([
          fetch(`${API_BASE_URL}/issues/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/categories/dropdown`),
          fetch(`${API_BASE_URL}/locations/provinces`),
        ]);

        const [issueData, categoryData, provinceData] = await Promise.all([
          issueRes.json(),
          categoryRes.json(),
          provinceRes.json(),
        ]);

        if (!issueRes.ok) {
          throw new Error(issueData?.message || "Failed to load issue.");
        }

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

        const issue = issueData?.data;
        setCategories(categoryData?.data || []);
        setProvinces(Array.isArray(provinceData) ? provinceData : provinceData?.data || []);
        setExistingImages(issue?.images || []);
        setStatus(issue?.status || "");

        setFormData({
          categoryId: issue?.categoryId?._id || "",
          subCategoryId:
            typeof issue?.subCategoryId === "object"
              ? issue?.subCategoryId?._id || ""
              : issue?.subCategoryId || "",
          provinceId: issue?.provinceId?._id || "",
          districtId: issue?.districtId?._id || "",
          cityId: issue?.cityId?._id || "",
          restroomId: issue?.restroomId?._id || "",
          title: issue?.title || "",
          description: issue?.description || "",
          priority: issue?.priority || "MEDIUM",
        });
      } catch (loadError) {
        setError(loadError.message || "Failed to load issue data.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [id]);

  useEffect(() => {
    if (!formData.provinceId) {
      setDistricts([]);
      setCities([]);
      setRestrooms([]);
      return;
    }

    async function loadDistricts() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/locations/districts?provinceId=${formData.provinceId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load districts.");
        }

        setDistricts(Array.isArray(data) ? data : data?.data || []);
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
        const response = await fetch(
          `${API_BASE_URL}/locations/cities?districtId=${formData.districtId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load cities.");
        }

        setCities(Array.isArray(data) ? data : data?.data || []);
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

      return {
        ...prev,
        [name]: value,
      };
    });
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
        throw new Error("Please log in first to update an issue.");
      }

      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          subCategoryId: formData.subCategoryId,
          provinceId: formData.provinceId,
          districtId: formData.districtId,
          cityId: formData.cityId,
          restroomId: formData.restroomId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update issue.");
      }

      const successText = data?.message || "Issue updated successfully.";
      setSuccessMessage(successText);

      navigate(`/issues/me/${id}`, {
        state: {
          successMessage: successText,
        },
      });
    } catch (submitError) {
      setError(submitError.message || "Failed to update issue.");
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
          <h1 className="text-3xl font-bold text-slate-900">Update Issue</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            Edit your issue details using the same category, location, and
            restroom structure used when the issue was created.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-sm text-slate-500">
            Loading issue details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {status && status !== "OPEN" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                This issue cannot be edited because its current status is{" "}
                <span className="font-semibold">{status}</span>. Only OPEN
                issues stay editable by the reporter.
              </div>
            )}

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
                  disabled={status !== "OPEN"}
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
                  disabled={!selectedCategory || status !== "OPEN"}
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
                  disabled={status !== "OPEN"}
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
                  disabled={!formData.provinceId || status !== "OPEN"}
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
                  disabled={!formData.districtId || status !== "OPEN"}
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
                  disabled={!formData.cityId || status !== "OPEN"}
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
                  disabled={status !== "OPEN"}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
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
                  disabled={status !== "OPEN"}
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
                  disabled={status !== "OPEN"}
                  required
                />
              </Field>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-800">
                Existing Images
              </p>
              {existingImages.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {existingImages.map((image, index) => (
                    <a
                      key={image.publicId || image.url || index}
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-2xl border border-sky-100 bg-white"
                    >
                      <img
                        src={image.url}
                        alt={`Issue upload ${index + 1}`}
                        className="h-48 w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  No issue images were uploaded for this record.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-sky-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(`/issues/me/${id}`)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || status !== "OPEN"}
                className="rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Updating..." : "Update Issue"}
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
