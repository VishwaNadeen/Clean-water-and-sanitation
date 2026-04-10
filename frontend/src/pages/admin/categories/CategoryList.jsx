import { Fragment, useState } from "react";
import EditCategory from "./EditCategory";

export default function CategoryList({
  categories,
  editingId,
  editingForm,
  setEditingForm,
  saving,
  startEdit,
  updateCategory,
  updateSubcategory,
  deleteCategory,
  deleteSubcategory,
  setEditingId,
}) {
  const [expandedCategoryId, setExpandedCategoryId] = useState("");
  const [editingSubKey, setEditingSubKey] = useState("");
  const [editingSubForm, setEditingSubForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  function startSubcategoryEdit(categoryId, subcategory) {
    setExpandedCategoryId(categoryId);
    setEditingSubKey(`${categoryId}:${subcategory._id}`);
    setEditingSubForm({
      name: subcategory.name || "",
      description: subcategory.description || "",
      isActive: Boolean(subcategory.isActive),
    });
  }

  function cancelSubcategoryEdit() {
    setEditingSubKey("");
    setEditingSubForm({
      name: "",
      description: "",
      isActive: true,
    });
  }

  async function handleSaveSubcategory(categoryId, subCategoryId) {
    const success = await updateSubcategory(
      categoryId,
      subCategoryId,
      editingSubForm
    );

    if (success) {
      cancelSubcategoryEdit();
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.3px] text-slate-500">
              <th className="px-5 py-4 font-semibold">Category</th>
              <th className="px-5 py-4 font-semibold">Summary</th>
              <th className="px-5 py-4 font-semibold">Subcategories</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-sm">
            {categories.map((category) => {
              const isExpanded = expandedCategoryId === category._id;

              return (
                <Fragment key={category._id}>
                  <tr
                    className="align-top transition hover:bg-slate-50/70"
                  >
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-900">{category.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Created category record
                          </p>
                        </div>
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      ) : (
                        <p className="max-w-md leading-6 text-slate-600">
                          {category.description || "No description added yet."}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCategoryId((prev) =>
                              prev === category._id ? "" : category._id
                            )
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {isExpanded ? "Hide Details" : "Manage Subcategories"}
                        </button>
                      </div>
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                        <EditCategory
                          onSave={() => updateCategory(category._id)}
                          onCancel={() => setEditingId("")}
                          saving={saving}
                        />
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

                  {isExpanded ? (
                    <tr className="bg-slate-50/60">
                      <td colSpan="5" className="px-5 py-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <h3 className="text-base font-semibold text-slate-800">
                                Subcategory Management
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Edit or remove subcategories under {category.name}.
                              </p>
                            </div>
                          </div>

                          {category.subCategories?.length ? (
                            <div className="mt-4 grid gap-3">
                              {category.subCategories.map((subcategory) => {
                                const subKey = `${category._id}:${subcategory._id}`;
                                const isEditingSub = editingSubKey === subKey;

                                return (
                                  <div
                                    key={subcategory._id}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                  >
                                    {isEditingSub ? (
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <label className="space-y-2">
                                          <span className="block text-sm font-medium text-slate-700">
                                            Subcategory name
                                          </span>
                                          <input
                                            type="text"
                                            value={editingSubForm.name}
                                            onChange={(event) =>
                                              setEditingSubForm((prev) => ({
                                                ...prev,
                                                name: event.target.value,
                                              }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                          />
                                        </label>

                                        <label className="space-y-2">
                                          <span className="block text-sm font-medium text-slate-700">
                                            Status
                                          </span>
                                          <select
                                            value={String(editingSubForm.isActive)}
                                            onChange={(event) =>
                                              setEditingSubForm((prev) => ({
                                                ...prev,
                                                isActive: event.target.value === "true",
                                              }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                          >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                          </select>
                                        </label>

                                        <label className="space-y-2 md:col-span-2">
                                          <span className="block text-sm font-medium text-slate-700">
                                            Description
                                          </span>
                                          <textarea
                                            value={editingSubForm.description}
                                            onChange={(event) =>
                                              setEditingSubForm((prev) => ({
                                                ...prev,
                                                description: event.target.value,
                                              }))
                                            }
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                          />
                                        </label>

                                        <div className="flex gap-2 md:col-span-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleSaveSubcategory(
                                                category._id,
                                                subcategory._id
                                              )
                                            }
                                            disabled={saving}
                                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            Save
                                          </button>
                                          <button
                                            type="button"
                                            onClick={cancelSubcategoryEdit}
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-900">
                                              {subcategory.name}
                                            </p>
                                            <span
                                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                subcategory.isActive
                                                  ? "bg-green-50 text-green-700"
                                                  : "bg-slate-100 text-slate-700"
                                              }`}
                                            >
                                              {subcategory.isActive ? "Active" : "Inactive"}
                                            </span>
                                          </div>
                                          <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {subcategory.description || "No description added yet."}
                                          </p>
                                        </div>

                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              startSubcategoryEdit(category._id, subcategory)
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              deleteSubcategory(category._id, subcategory._id)
                                            }
                                            disabled={saving}
                                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                              No subcategories added yet.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
