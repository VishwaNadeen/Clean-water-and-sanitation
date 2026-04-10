import { useEffect, useState } from "react";
import API_BASE_URL from "../../../config/api";
import { getToken } from "../../../utils/auth";
import CreateCategory from "./CreateCategory";

const emptyCategory = { name: "", description: "", subText: "" };
const emptySub = { categoryId: "", name: "", description: "" };

export default function CreateCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [subForm, setSubForm] = useState(emptySub);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/categories/admin`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to load categories.");
      setCategories(data?.data || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const subCategories = categoryForm.subText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((name) => ({ name, description: "", isActive: true }));

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
          subCategories,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create category.");

      setCategoryForm(emptyCategory);
      setSuccessMessage(data?.message || "Category created successfully.");
      await loadCategories();
    } catch (createError) {
      setError(createError.message || "Failed to create category.");
    } finally {
      setSaving(false);
    }
  }

  async function addSubcategory(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/categories/${subForm.categoryId}/subcategories`,
        {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({
            name: subForm.name.trim(),
            description: subForm.description.trim(),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to add subcategory.");

      setSubForm(emptySub);
      setSuccessMessage(data?.message || "Subcategory added successfully.");
      await loadCategories();
    } catch (subError) {
      setError(subError.message || "Failed to add subcategory.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Category</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add new complaint categories and place subcategories under the correct parent.
          </p>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
            Category Setup
          </p>
        </div>

        <CreateCategory
          categoryForm={categoryForm}
          setCategoryForm={setCategoryForm}
          onSubmit={createCategory}
          saving={saving}
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
            Subcategory Setup
          </p>
        </div>

        <form
          onSubmit={addSubcategory}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">Add Subcategory</h3>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Step 2
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-700">Category</span>
              <select
                value={subForm.categoryId}
                onChange={(event) =>
                  setSubForm((prev) => ({ ...prev, categoryId: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
                disabled={loading}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <FormInput
              label="Subcategory name"
              value={subForm.name}
              onChange={(value) => setSubForm((prev) => ({ ...prev, name: value }))}
            />

            <FormTextArea
              label="Description"
              value={subForm.description}
              onChange={(value) =>
                setSubForm((prev) => ({ ...prev, description: value }))
              }
            />
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Subcategory"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormInput({ label, value, onChange }) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        required
      />
    </label>
  );
}

function FormTextArea({ label, value, onChange }) {
  return (
    <label className="space-y-2 md:col-span-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function authHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("Please log in as admin first.");
  }

  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders() {
  return {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
}
