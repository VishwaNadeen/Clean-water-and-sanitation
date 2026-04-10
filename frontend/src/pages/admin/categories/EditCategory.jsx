export default function EditCategory({ onSave, onCancel, saving }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Cancel
      </button>
    </div>
  );
}
