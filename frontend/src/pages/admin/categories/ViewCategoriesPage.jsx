import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../../config/api";
import { getToken } from "../../../utils/auth";
import CategoryList from "./CategoryList";

export default function ViewCategoriesPage() {
  const [categories, setCategories] = useState([]);
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
            <h1 className="text-2xl font-bold text-slate-800">View Categories</h1>
            <p className="mt-1 text-sm text-slate-500">
              Search, review, edit, and remove existing categories and subcategories.
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
        <StatCard label="Subcategories" value={stats.subcategories} color="text-blue-600" />
        <StatCard label="Search Results" value={stats.filtered} color="text-blue-600" />
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
            Category List
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-800">View And Manage</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep the category list clean by editing records and removing items that are no longer needed.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-800">Category Management</h2>
            <button
              type="button"
              onClick={loadCategories}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
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
