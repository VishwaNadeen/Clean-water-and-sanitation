import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileLayout from "../../components/profile/ProfileLayout";
import useProfileData from "../../hooks/useProfileData";
import {
  removeMyProfileImage,
  uploadMyProfileImage,
} from "../../services/profileService";
import { updateStoredUser } from "../../utils/auth";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { profile, setProfile, loading, pageError, setPageError, storedUser, token } =
    useProfileData();
  const profileBasePath = location.pathname.startsWith("/staff/profile")
    ? "/staff/profile"
    : "/profile";

  const profileImageSrc = profile?.profileImageUrl || "";
  const profileImageInitial = String(
    profile?.firstName || storedUser?.fullName || storedUser?.email || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  async function handleProfileImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      setPageError("");

      const updatedProfile = await uploadMyProfileImage(file);
      setProfile(updatedProfile);
      updateStoredUser({
        profileImageUrl: updatedProfile.profileImageUrl || "",
      });
    } catch (error) {
      setPageError(error.message || "Failed to upload profile image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleRemoveProfileImage() {
    const shouldRemove = window.confirm("Do you want to remove your profile photo?");

    if (!shouldRemove) {
      return;
    }

    try {
      setUploadingImage(true);
      setPageError("");

      const updatedProfile = await removeMyProfileImage();
      setProfile(updatedProfile);
      updateStoredUser({
        profileImageUrl: "",
      });
    } catch (error) {
      setPageError(error.message || "Failed to remove profile image.");
    } finally {
      setUploadingImage(false);
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
      title="Profile Details"
      subtitle="View your account information here."
      token={token}
      profile={profile}
      storedUser={storedUser}
    >
      {pageError ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-sky-200 bg-sky-50/60 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {profileImageSrc ? (
            <img
              src={profileImageSrc}
              alt="Profile"
              className="h-24 w-24 rounded-3xl border border-sky-200 object-cover shadow-[0_10px_24px_rgba(56,189,248,0.14)]"
            />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-100 to-blue-100 text-4xl font-semibold text-sky-900 shadow-[0_10px_24px_rgba(56,189,248,0.14)]">
              {profileImageInitial}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-500">Profile photo</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="rounded-xl border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploadingImage ? "Working..." : profileImageSrc ? "Change" : "Upload"}
          </button>
          {profileImageSrc ? (
            <button
              type="button"
              onClick={handleRemoveProfileImage}
              disabled={uploadingImage}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Personal information
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            Keep your profile details updated
          </p>
        </div>

        <button
          onClick={() => navigate(`${profileBasePath}/edit`)}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
        >
          <span>✏️</span>
          <span>Edit</span>
        </button>
        <button
          onClick={() => navigate(`${profileBasePath}/delete`)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          <span>Delete</span>
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
            First Name
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {profile?.firstName || "-"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
            Last Name
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {profile?.lastName || "-"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
            Email
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {profile?.email || storedUser?.email || "-"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
            Phone
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {profile?.phone || "-"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
            Gender
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {profile?.gender || "-"}
          </p>
        </div>
      </div>
    </ProfileLayout>
  );
}
