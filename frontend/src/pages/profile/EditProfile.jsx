import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileLayout from "../../components/profile/ProfileLayout";
import useProfileData from "../../hooks/useProfileData";
import { updateMyProfile } from "../../services/profileService";

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, loading, pageError, setPageError, storedUser, token } =
    useProfileData();

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        phone: profile?.phone || "",
        gender: profile?.gender || "",
      });
    }
  }, [profile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPageError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setPageError("");

      await updateMyProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        gender: editForm.gender,
      });

      navigate("/profile");
    } catch (error) {
      setPageError(error.message || "Failed to update profile.");
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
      title="Edit Profile"
      subtitle="Update your basic account information."
      token={token}
      profile={profile}
      storedUser={storedUser}
    >
      {pageError ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={editForm.firstName}
            onChange={handleChange}
            className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={editForm.lastName}
            onChange={handleChange}
            className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={editForm.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-sky-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Gender
          </label>
          <input
            type="text"
            name="gender"
            value={editForm.gender}
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
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </ProfileLayout>
  );
}