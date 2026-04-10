function TextInput({ label, value, onChange, placeholder = "", required = true }) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="space-y-2">
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

export default function CreateCategory({
  categoryForm,
  setCategoryForm,
  onSubmit,
  saving,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
            Main Category
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Step 1
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <TextInput
          label="Category name"
          value={categoryForm.name}
          onChange={(value) =>
            setCategoryForm((prev) => ({ ...prev, name: value }))
          }
        />
        <TextArea
          label="Description"
          value={categoryForm.description}
          onChange={(value) =>
            setCategoryForm((prev) => ({ ...prev, description: value }))
          }
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm font-medium text-slate-700">Optional starter subcategories</p>

          <div className="mt-3">
            <TextInput
              label="Items"
              value={categoryForm.subText}
              placeholder="Pipe Leak, Drain Block, Bad Smell"
              required={false}
              onChange={(value) =>
                setCategoryForm((prev) => ({ ...prev, subText: value }))
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Create Category"}
        </button>
      </div>
    </form>
  );
}
