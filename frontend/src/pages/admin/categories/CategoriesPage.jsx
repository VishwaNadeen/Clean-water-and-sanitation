import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../../config/api";
import { getToken } from "../../../utils/auth";
import CreateCategory from "./CreateCategory";
import CategoryList from "./CategoryList";

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
  const [search, setSearch] = useState("");

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

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter((category) => {
      const categoryName = String(category.name || "").toLowerCase();
      const categoryDescription = String(category.description || "").toLowerCase();
      const subcategoryNames = (category.subCategories || [])
        .map((item) => String(item.name || "").toLowerCase())
        .join(" ");

      return (
        categoryName.includes(keyword) ||
        categoryDescription.includes(keyword) ||
        subcategoryNames.includes(keyword)
      );
    });
  }, [categories, search]);

  const stats = useMemo(() => {
    const subCount = categories.reduce(
      (total, category) => total + (category.subCategories?.length || 0),
      0
    );

    return {
      total: categories.length,
      active: categories.filter((category) => category.isActive).length,
      subcategories: subCount,
      filtered: filteredCategories.length,
    };
  }, [categories, filteredCategories.length]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Category Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, update, and organize complaint categories and subcategories.
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by category or subcategory..."
            className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-80"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={stats.total} color="text-slate-800" />
        <StatCard label="Active" value={stats.active} color="text-green-600" />
        <StatCard
          label="Subcategories"
          value={stats.subcategories}
          color="text-blue-600"
        />
        <StatCard
          label="Search Results"
          value={stats.filtered}
          color="text-blue-600"
        />
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
          <h2 className="mt-1 text-xl font-semibold text-slate-800">
            Create And Organize
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add new categories first, then place subcategories under the correct parent.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <CreateCategory
            categoryForm={categoryForm}
            setCategoryForm={setCategoryForm}
            onSubmit={createCategory}
            saving={saving}
          />

          <form
            onSubmit={addSubcategory}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
              Subcategory
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800">
              Add Subcategory
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Choose an existing category and attach a new subcategory under it.
            </p>

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
              <FormInput label="Subcategory name" value={subForm.name} onChange={(value) => setSubForm((prev) => ({ ...prev, name: value }))} />
              <FormTextArea label="Description" value={subForm.description} onChange={(value) => setSubForm((prev) => ({ ...prev, description: value }))} />
            </div>

            <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving..." : "Add Subcategory"}
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
            Category List
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-800">
            View And Manage
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review all categories, edit details, and remove unwanted categories or subcategories.
          </p>
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
          ) : filteredCategories.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-500">
              No categories found for the current search.
            </div>
          ) : (
            <CategoryList
              categories={filteredCategories}
              editingId={editingId}
              editingForm={editingForm}
              setEditingForm={setEditingForm}
              saving={saving}
              startEdit={startEdit}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              deleteSubcategory={deleteSubcategory}
              setEditingId={setEditingId}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, color = "text-slate-800" }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function FormInput({ label, value, onChange }) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        required
      />
    </label>
  );
}

function FormTextArea({ label, value, onChange }) {
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
