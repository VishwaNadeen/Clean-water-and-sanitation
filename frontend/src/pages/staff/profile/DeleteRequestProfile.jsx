export default function DeleteRequestProfile({
  deleteForm,
  setDeleteForm,
  handleDeleteRequest,
  savingModal,
  closeModal,
}) {
  return (
    <form onSubmit={handleDeleteRequest} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Reason
        </label>
        <textarea
          rows="4"
          value={deleteForm.reason}
          onChange={(e) => setDeleteForm({ reason: e.target.value })}
          placeholder="Why do you want to request deletion?"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={savingModal}
          className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {savingModal ? "Submitting..." : "Send Delete Request"}
        </button>

        <button
          type="button"
          onClick={closeModal}
          className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
