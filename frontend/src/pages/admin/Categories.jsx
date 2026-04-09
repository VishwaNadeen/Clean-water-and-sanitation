import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";
import { getToken } from "../../utils/auth";

const emptyCategory = { name: "", description: "", subText: "" };
const emptySub = { categoryId: "", name: "", description: "" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [subForm, setSubForm] = useState(emptySub);
  const [editingId, setEditingId] = useState("");
  const [editingForm, setEditingForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
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

  async function updateCategory(categoryId) {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(editingForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to update category.");

      setEditingId("");
      setSuccessMessage(data?.message || "Category updated successfully.");
      await loadCategories();
    } catch (updateError) {
      setError(updateError.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(categoryId) {
    if (!window.confirm("Do you want to delete this category?")) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to delete category.");

      setSuccessMessage(data?.message || "Category deleted successfully.");
      await loadCategories();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete category.");
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

  async function deleteSubcategory(categoryId, subCategoryId) {
    if (!window.confirm("Do you want to delete this subcategory?")) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/categories/${categoryId}/subcategories/${subCategoryId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to delete subcategory.");

      setSuccessMessage(data?.message || "Subcategory deleted successfully.");
      await loadCategories();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete subcategory.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category) {
    setEditingId(category._id);
    setEditingForm({
      name: category.name || "",
      description: category.description || "",
      isActive: Boolean(category.isActive),
    });
  }

  const stats = useMemo(() => {
    const subCount = categories.reduce(
      (total, category) => total + (category.subCategories?.length || 0),
      0
    );

    return {
      total: categories.length,
      active: categories.filter((category) => category.isActive).length,
      subcategories: subCount,
    };
  }, [categories]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">Categories</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Manage complaint categories and subcategories used by the issue reporting dropdowns.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="All Categories" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Subcategories" value={stats.subcategories} />
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

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={createCategory} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Create Category</h2>
          <div className="mt-5 grid gap-4">
            <TextInput label="Category name" value={categoryForm.name} onChange={(value) => setCategoryForm((prev) => ({ ...prev, name: value }))} />
            <TextArea label="Description" value={categoryForm.description} onChange={(value) => setCategoryForm((prev) => ({ ...prev, description: value }))} />
            <TextInput label="Subcategories" value={categoryForm.subText} placeholder="Pipe Leak, Drain Block" required={false} onChange={(value) => setCategoryForm((prev) => ({ ...prev, subText: value }))} />
          </div>
          <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving..." : "Create Category"}
          </button>
        </form>

        <form onSubmit={addSubcategory} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Add Subcategory</h2>
          <div className="mt-5 grid gap-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Category
              <select value={subForm.categoryId} onChange={(event) => setSubForm((prev) => ({ ...prev, categoryId: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <TextInput label="Subcategory name" value={subForm.name} onChange={(value) => setSubForm((prev) => ({ ...prev, name: value }))} />
            <TextArea label="Description" value={subForm.description} onChange={(value) => setSubForm((prev) => ({ ...prev, description: value }))} />
          </div>
          <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? "Saving..." : "Add Subcategory"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800">Category Management</h2>
          <button type="button" onClick={loadCategories} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-500">
            No categories have been created yet.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-[0.3px] text-slate-500">
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Description</th>
                    <th className="px-5 py-4 font-semibold">Subcategories</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {categories.map((category) => (
                    <tr key={category._id} className="align-top transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        {editingId === category._id ? (
                          <input
                            type="text"
                            value={editingForm.name}
                            onChange={(event) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        ) : (
                          <p className="font-semibold text-slate-900">{category.name}</p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {editingId === category._id ? (
                          <textarea
                            value={editingForm.description}
                            onChange={(event) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        ) : (
                          <p className="max-w-md text-slate-600">
                            {category.description || "No description added yet."}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {category.subCategories?.length ? (
                          <div className="space-y-2">
                            {category.subCategories.map((subcategory) => (
                              <div
                                key={subcategory._id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                              >
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {subcategory.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {subcategory.isActive ? "Active" : "Inactive"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteSubcategory(category._id, subcategory._id)
                                  }
                                  disabled={saving}
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500">No subcategories added yet.</p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {editingId === category._id ? (
                          <select
                            value={String(editingForm.isActive)}
                            onChange={(event) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                isActive: event.target.value === "true",
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              category.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {editingId === category._id ? (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => updateCategory(category._id)}
                              disabled={saving}
                              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId("")}
                              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(category)}
                              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCategory(category._id)}
                              disabled={saving}
                              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-800">{value}</h2>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder = "", required = true }) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
