import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { changeMyPassword } from "../../services/profileService";
import { updateStoredUser } from "../../utils/auth";

export default function ChangePassword() {
  const navigate = useNavigate();

  const { setPageError, profileBasePath } = useOutletContext();

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

return (
  <div className="flex justify-center">
    <div className="w-full max-w-2xl">

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Change Password
        </h2>
      </div>

      {successMessage && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
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
            className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
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
            className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white"
          >
            {saving ? "Saving..." : "Change Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate(profileBasePath)}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);
}