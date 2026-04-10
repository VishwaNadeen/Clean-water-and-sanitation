import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FloatingToast from "../../../components/common/FloatingToast";
import API_BASE_URL from "../../../config/api";
import {
  approveStaffDeleteRequest,
  getManagerStaff,
  getStaffProfile,
  rejectStaffDeleteRequest,
} from "../../../services/staffManagementService";

const TOAST_DURATION_MS = 5000;

export default function DeleteRequests() {
  const location = useLocation();
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteActionId, setDeleteActionId] = useState("");

  const loadDeleteRequests = useCallback(async () => {
    try {
      setLoading(true);
      const staff = await getManagerStaff();
      setStaffMembers(Array.isArray(staff) ? staff : []);
    } catch (error) {
      setToast({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load delete requests.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const nextToast = location.state?.toast;

    if (!nextToast) {
      return;
    }

    setToast(nextToast);

    const timer = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    navigate(location.pathname, { replace: true, state: {} });

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    loadDeleteRequests();

    const handleRefresh = () => {
      loadDeleteRequests();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDeleteRequests();
      }
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("auth-changed", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("auth-changed", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadDeleteRequests]);

  const pendingDeleteRequests = useMemo(() => {
    return staffMembers
      .filter((staff) => Boolean(staff.deleteRequest?.requested))
      .sort((left, right) => {
        const leftDate = new Date(left.deleteRequest?.requestedAt || 0).getTime();
        const rightDate = new Date(right.deleteRequest?.requestedAt || 0).getTime();
        return rightDate - leftDate;
      });
  }, [staffMembers]);

  const handleApproveDeleteRequest = async (staff) => {
    const displayName = staff.fullName || staff.name || "this staff member";
    const confirmed = window.confirm(`Delete ${displayName} permanently? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      setDeleteActionId(staff._id);
      const result = await approveStaffDeleteRequest(staff._id);
      setStaffMembers((prev) => prev.filter((item) => item._id !== staff._id));
      setSelectedStaff((prev) => (prev?._id === staff._id ? null : prev));
      setToast({
        type: "success",
        text: result?.message || "Staff member deleted successfully.",
      });
    } catch (error) {
      setToast({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to approve delete request.",
      });
    } finally {
      setDeleteActionId("");
    }
  };

  const handleRejectDeleteRequest = async (staff) => {
    try {
      setDeleteActionId(staff._id);
      const result = await rejectStaffDeleteRequest(staff._id);
      const nextStaff =
        result?.staff && typeof result.staff === "object"
          ? result.staff
          : {
              ...staff,
              deleteRequest: {
                requested: false,
                status: "rejected",
                reason: staff.deleteRequest?.reason || "",
                requestedAt: staff.deleteRequest?.requestedAt || "",
                requestedBy: staff.deleteRequest?.requestedBy || "",
                adminResponse: "Your profile deletion request was reviewed and rejected by admin.",
                reviewedAt: new Date().toISOString(),
              },
            };

      setStaffMembers((prev) =>
        prev.map((item) => (item._id === staff._id ? { ...item, ...nextStaff } : item))
      );
      setSelectedStaff((prev) =>
        prev?._id === staff._id ? { ...prev, ...nextStaff } : prev
      );
      setToast({
        type: "success",
        text: result?.message || "Delete request rejected successfully.",
      });
    } catch (error) {
      setToast({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to reject delete request.",
      });
    } finally {
      setDeleteActionId("");
    }
  };

  return (
    <div className="space-y-6">
      <StaffActionModal
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />

      {toast ? <FloatingToast toast={toast} onClose={() => setToast(null)} /> : null}

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
              Pending Delete Requests
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Profile deletion review
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Review staff members who asked to remove their profile. You can approve permanent deletion or reject the request.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex w-fit rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              {pendingDeleteRequests.length} Pending
            </span>
            <Link
              to="/admin/staff"
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Back to Staff
            </Link>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
              <p className="mt-4 text-sm text-slate-500">Loading delete requests...</p>
            </div>
          ) : pendingDeleteRequests.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <p className="text-lg font-semibold text-slate-800">No pending delete requests</p>
              <p className="mt-2 text-sm text-slate-500">
                Staff profile delete requests will appear here when submitted.
              </p>
            </div>
          ) : (
            pendingDeleteRequests.map((staff) => (
              <article
                key={staff._id}
                className="rounded-[24px] border border-rose-100 bg-[linear-gradient(180deg,rgba(255,241,242,0.45),rgba(255,255,255,1))] p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-3">
                        <StaffAvatar staff={staff} sizeClass="h-12 w-12" textClass="text-lg" />
                        <h3 className="text-xl font-bold text-slate-900">
                          {staff.fullName || staff.name || "Staff member"}
                        </h3>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        {staff.role || "Staff"}
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <RequestInfo label="Email" value={staff.email || "No email"} />
                      <RequestInfo label="Phone" value={staff.phone || "No phone"} />
                      <RequestInfo
                        label="Requested On"
                        value={
                          staff.deleteRequest?.requestedAt
                            ? new Date(staff.deleteRequest.requestedAt).toLocaleString()
                            : "Unknown"
                        }
                      />
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                        Staff Reason
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {staff.deleteRequest?.reason || "No reason provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-[220px] flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      View Staff Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectDeleteRequest(staff)}
                      disabled={deleteActionId === staff._id}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteActionId === staff._id ? "Working..." : "Reject Request"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveDeleteRequest(staff)}
                      disabled={deleteActionId === staff._id}
                      className="rounded-2xl border border-rose-200 bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteActionId === staff._id ? "Working..." : "Approve Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StaffActionModal({ staff, onClose }) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileToast, setProfileToast] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedProfile = profile || staff || {};
  const displayStatus =
    staff?.activityStatus || resolvedProfile.activityStatus || resolvedProfile.status || "Unknown";
  const profileImageSrc = imageFailed
    ? ""
    : getProfileImageSrc(profile?.profileImageUrl || staff?.profileImageUrl);

  const handleViewProfile = async () => {
    if (!staff?._id) {
      return;
    }

    try {
      setProfileLoading(true);
      setProfileToast(null);
      const data = await getStaffProfile(staff._id);
      setProfile(data);
    } catch (error) {
      setProfileToast({
        type: "error",
        text:
          error?.response?.data?.message || error?.message || "Failed to load staff profile.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    setProfile(null);
    setProfileLoading(false);
    setProfileToast(null);
    setImageFailed(false);

    if (staff?._id) {
      handleViewProfile();
    }
  }, [staff?._id]);

  if (!staff) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 p-4 backdrop-blur-[2px]">
      <div className="flex h-full items-start justify-center overflow-y-auto py-6">
        <div className="w-full max-w-4xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.88),rgba(255,255,255,1))] px-6 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                {profileImageSrc ? (
                  <img
                    src={profileImageSrc}
                    alt={resolvedProfile.fullName || resolvedProfile.name || "Staff"}
                    className="h-20 w-20 rounded-[24px] border border-slate-200 object-cover shadow-sm"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-[24px] border border-slate-200 bg-blue-50 text-3xl font-bold text-blue-700 shadow-sm">
                    {String(
                      resolvedProfile.fullName || resolvedProfile.name || "S"
                    ).charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                    Staff Profile
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                    {resolvedProfile.fullName || resolvedProfile.name || "Staff member"}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill status={displayStatus} />
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {resolvedProfile.role || "Staff"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-6">
            {profileToast ? (
              <FloatingToast toast={profileToast} onClose={() => setProfileToast(null)} />
            ) : null}

            {profileLoading ? (
              <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="rounded-2xl border border-white bg-white px-4 py-4">
                        <div className="h-3 w-24 rounded bg-slate-200" />
                        <div className="mt-3 h-5 w-32 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-14 rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {!profileLoading ? (
              <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProfileTile label="Full Name" value={resolvedProfile.fullName || resolvedProfile.name} />
                    <ProfileTile label="Email" value={resolvedProfile.email} />
                    <ProfileTile label="Role" value={resolvedProfile.role} />
                    <ProfileTile label="Phone" value={resolvedProfile.phone} />
                    <ProfileTile label="NIC" value={resolvedProfile.nic} />
                    <ProfileTile label="Gender" value={resolvedProfile.gender} />
                    <ProfileTile
                      label="Join Date"
                      value={
                        resolvedProfile.joinDate
                          ? new Date(resolvedProfile.joinDate).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <ProfileTile label="Status" value={displayStatus} />
                    <ProfileTile label="Province" value={resolvedProfile.baseProvince} />
                    <ProfileTile label="District" value={resolvedProfile.baseDistrict} />
                    <ProfileTile
                      label="Date of Birth"
                      value={
                        resolvedProfile.dob
                          ? new Date(resolvedProfile.dob).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <div className="sm:col-span-2">
                      <ProfileTile label="Address" value={resolvedProfile.address} />
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Actions
                  </p>
                  <h4 className="mt-2 text-xl font-bold text-slate-900">Choose next step</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Review this profile, then continue with assignment or management actions.
                  </p>

                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      onClick={handleViewProfile}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Refresh Profile
                    </button>
                    <Link
                      to="/admin/staff/schedules"
                      onClick={onClose}
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Assign Work
                    </Link>
                    <Link
                      to="/admin/staff/issues"
                      onClick={onClose}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Assign Issue
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function getProfileImageSrc(imagePath) {
  if (!imagePath) {
    return "";
  }

  if (/^(https?:\/\/|data:|blob:)/i.test(imagePath)) {
    return imagePath;
  }

  const normalizedBase = String(API_BASE_URL || "").replace(/\/api\/?$/, "");
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${normalizedBase}${normalizedPath}`;
}

function ProfileTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value || "N/A"}</p>
    </div>
  );
}

function QuickLink({ to, title, note, onClick, badgeCount = 0, badgeTone = "blue" }) {
  const badgeToneClass =
    badgeTone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-700 group-hover:bg-rose-100"
      : "border-blue-200 bg-blue-50 text-blue-700 group-hover:bg-blue-100";

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          {badgeCount > 0 && badgeTone !== "rose" ? (
            <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-bold text-white shadow-sm">
              {badgeCount}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-7 text-slate-500">{note}</p>
      </div>
      {badgeTone === "rose" ? (
        <span className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 text-sm font-bold text-rose-700 transition group-hover:bg-rose-100">
          {badgeCount}
        </span>
      ) : (
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${badgeToneClass}`}>
          Open
        </span>
      )}
    </div>
  );

  const sharedClassName =
    "group rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md";

  if (to) {
    return (
      <Link to={to} className={sharedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={sharedClassName}>
      {content}
    </button>
  );
}

function StatusPill({ status }) {
  const tone =
    status === "Busy"
      ? "bg-amber-50 text-amber-700"
      : status === "Active"
        ? "bg-emerald-50 text-emerald-700"
        : status === "Off Duty"
          ? "bg-slate-100 text-slate-600"
          : "bg-blue-50 text-blue-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${tone}`}>
      {status}
    </span>
  );
}

function RequestInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value || "N/A"}</p>
    </div>
  );
}

function StaffAvatar({
  staff,
  sizeClass = "h-12 w-12",
  textClass = "text-lg",
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? "" : getProfileImageSrc(staff?.profileImageUrl);
  const label = staff?.fullName || staff?.name || "Staff";

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={label}
        className={`${sizeClass} rounded-full border border-slate-200 object-cover shadow-sm`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} grid place-items-center rounded-full border border-slate-200 bg-blue-50 font-bold text-blue-700 shadow-sm ${textClass}`}
    >
      {String(label).charAt(0).toUpperCase()}
    </div>
  );
}
