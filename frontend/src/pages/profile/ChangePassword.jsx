import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileLayout from "../../components/profile/ProfileLayout";
import useProfileData from "../../hooks/useProfileData";
import { changeMyPassword } from "../../services/profileService";
import { updateStoredUser } from "../../utils/auth";

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading, pageError, setPageError, storedUser, token } =
    useProfileData();
  const profileBasePath = location.pathname.startsWith("/staff/profile")
    ? "/staff/profile"
    : "/profile";

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPageError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.currentPassword || !formData.newPassword) {
      setPageError("Current password and new password are required.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPageError("New password and confirm password do not match.");
      return;
    }

    try {
      setSaving(true);
      setPageError("");
      setSuccessMessage("");

      await changeMyPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      updateStoredUser({ mustChangePassword: false });

      setSuccessMessage("Password changed successfully.");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate(profileBasePath);
      }, 900);
    } catch (error) {
      setPageError(error.message || "Failed to change password.");
    } finally {
      setSaving(false);
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
      title="Change Password"
      subtitle="Update your account password securely."
      token={token}
      profile={profile}
      storedUser={storedUser}
    >
      {pageError ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {saving ? "Saving..." : "Change Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate(profileBasePath)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </ProfileLayout>
  );
}
