import EditCategory from "./EditCategory";

export default function CategoryList({
  categories,
  editingId,
  editingForm,
  setEditingForm,
  saving,
  startEdit,
  updateCategory,
  deleteCategory,
  deleteSubcategory,
  setEditingId,
}) {
  return (
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
              <tr
                key={category._id}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
