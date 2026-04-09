export default function PasswordProfile({
  passwordForm,
  setPasswordForm,
  passwordVisibility,
  setPasswordVisibility,
  handlePasswordSave,
  savingModal,
  closeModal,
  EyeIcon,
  EyeOffIcon,
}) {
  return (
    <form onSubmit={handlePasswordSave} className="mx-auto max-w-xl space-y-3">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Current Password
        </label>
        <div className="relative">
          <input
            type={passwordVisibility.currentPassword ? "text" : "password"}
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 text-sm outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />
          <button
            type="button"
            onClick={() =>
              setPasswordVisibility((prev) => ({
                ...prev,
                currentPassword: !prev.currentPassword,
              }))
            }
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-amber-600"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-50">
              {passwordVisibility.currentPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          New Password
        </label>
        <div className="relative">
          <input
            type={passwordVisibility.newPassword ? "text" : "password"}
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 text-sm outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />
          <button
            type="button"
            onClick={() =>
              setPasswordVisibility((prev) => ({
                ...prev,
                newPassword: !prev.newPassword,
              }))
            }
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-amber-600"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-50">
              {passwordVisibility.newPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={passwordVisibility.confirmPassword ? "text" : "password"}
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 text-sm outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
          />
          <button
            type="button"
            onClick={() =>
              setPasswordVisibility((prev) => ({
                ...prev,
                confirmPassword: !prev.confirmPassword,
              }))
            }
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-amber-600"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-50">
              {passwordVisibility.confirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={savingModal}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
        >
          {savingModal ? "Saving..." : "Change Password"}
        </button>

        <button
          type="button"
          onClick={closeModal}
          className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}