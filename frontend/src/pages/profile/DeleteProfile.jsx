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
  <div className="flex justify-center">
    <div className="w-full max-w-2xl">
      
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Delete Account
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          This action is permanent. Enter your password and type{" "}
          <span className="font-semibold text-red-600">delete</span> to confirm.
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-6">
        
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">
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
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">
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
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete My Account"}
          </button>

          <button
            type="button"
            onClick={() => navigate(profileBasePath)}
            className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);
}