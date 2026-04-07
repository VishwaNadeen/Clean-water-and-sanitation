import { useNavigate } from "react-router-dom";
import ProfileLayout from "../../components/profile/ProfileLayout";
import useProfileData from "../../hooks/useProfileData";

export default function Profile() {
  const navigate = useNavigate();
  const { profile, loading, pageError, storedUser, token } = useProfileData();

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
          onClick={() => navigate("/profile/edit")}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
        >
          <span>✏️</span>
          <span>Edit</span>
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