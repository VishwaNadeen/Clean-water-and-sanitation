import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { deleteMyProfile } from "../../services/profileService";
import { clearAuthSession } from "../../utils/auth";

export default function DeleteProfile() {
  const navigate = useNavigate();

  const { setPageError, profileBasePath } = useOutletContext();

  const [deletePassword, setDeletePassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deletePassword.trim()) {
      setPageError("Password is required.");
      return;
    }

    if (confirmText.trim().toLowerCase() !== "delete") {
      setPageError('Please type "delete" to confirm.');
      return;
    }

    try {
      setDeleting(true);
      setPageError("");

      const data = await deleteMyProfile(deletePassword);
      clearAuthSession();
      alert(data?.message || "Account deleted successfully.");
      navigate("/login");
    } catch (error) {
      setPageError(error.message || "Failed to delete profile.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <h3 className="text-lg font-semibold text-red-700">
        Delete your account permanently
      </h3>
      <p className="mt-2 text-sm leading-6 text-red-600">
        All account access will be removed. To continue, enter your password and
        type <span className="font-semibold">delete</span> in the confirmation
        field.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => {
              setDeletePassword(e.target.value);
              setPageError("");
            }}
            placeholder="Enter password"
            className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Type "delete" to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setPageError("");
            }}
            placeholder='Type "delete"'
            className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="rounded-xl border border-red-200 bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete My Account"}
          </button>

          <button
            type="button"
            onClick={() => navigate(profileBasePath)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}