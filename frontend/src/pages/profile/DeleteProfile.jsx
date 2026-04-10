import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileLayout from "../../components/profile/ProfileLayout";
import useProfileData from "../../hooks/useProfileData";
import { deleteMyProfile } from "../../services/profileService";
import { clearAuthSession } from "../../utils/auth";

export default function DeleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading, pageError, setPageError, storedUser, token } =
    useProfileData();
  const profileBasePath = location.pathname.startsWith("/staff/profile")
    ? "/staff/profile"
    : "/profile";

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-160px)] px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-sky-200 bg-white/95 p-6">
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout
      title="Delete Account"
      subtitle="This action is permanent and cannot be undone."
      token={token}
      profile={profile}
      storedUser={storedUser}
    >
      {pageError ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <h3 className="text-lg font-semibold text-red-700">
          Delete your account permanently
        </h3>
        <p className="mt-2 text-sm leading-6 text-red-600">
          All account access will be removed. To continue, enter your password
          and type <span className="font-semibold">delete</span> in the
          confirmation field.
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
    </ProfileLayout>
  );
}
