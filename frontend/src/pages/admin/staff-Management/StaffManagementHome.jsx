import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FloatingToast from "../../../components/common/FloatingToast";
import API_BASE_URL from "../../../config/api";
import staffApi, {
  getAllSchedules,
  getManagerStaff,
  getStaffProfile,
} from "../../../services/staffManagementService";

const overviewCardStyles = {
  total: "from-sky-500 to-blue-500",
  active: "from-emerald-500 to-green-500",
  busy: "from-amber-500 to-orange-500",
  offDuty: "from-slate-500 to-slate-700",
  tasks: "from-indigo-500 to-blue-600",
  issues: "from-rose-500 to-red-500",
};
const TOAST_DURATION_MS = 5000;

function formatStaffStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "onleave") return "On Leave";
  if (normalized === "inactive") return "Inactive";
  if (normalized === "active") return "Active";
  return status || "Unknown";
}

export default function StaffManagementHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const loadDashboardData = useCallback(async ({ showPartialErrorToast = true } = {}) => {
    try {
      setLoading(true);

      const [staffResult, scheduleResult, issueResult] = await Promise.allSettled([
        getManagerStaff(),
        getAllSchedules(),
        staffApi.get("/issues"),
      ]);

      const nextStaff =
        staffResult.status === "fulfilled" && Array.isArray(staffResult.value)
          ? staffResult.value
          : [];

      const nextSchedules =
        scheduleResult.status === "fulfilled" && Array.isArray(scheduleResult.value)
          ? scheduleResult.value
          : [];

      const nextIssues =
        issueResult.status === "fulfilled" &&
        Array.isArray(issueResult.value?.data?.data)
          ? issueResult.value.data.data
          : [];

      setStaffMembers(nextStaff);
      setSchedules(nextSchedules);
      setIssues(nextIssues);

      if (staffResult.status === "rejected") {
        setToast({
          type: "error",
          text:
            staffResult.reason?.response?.data?.message ||
            staffResult.reason?.message ||
            "Failed to load staff members from database.",
        });
      } else if (
        showPartialErrorToast &&
        (scheduleResult.status === "rejected" || issueResult.status === "rejected")
      ) {
        setToast({
          type: "error",
          text: "Some dashboard sections could not be loaded, but staff data is shown.",
        });
      }
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
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    loadDashboardData();

    const handleRefresh = () => {
      loadDashboardData({ showPartialErrorToast: false });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData({ showPartialErrorToast: false });
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
  }, [loadDashboardData]);

  const staffRows = useMemo(() => {
    return staffMembers.map((staff) => {
      const staffSchedules = schedules.filter((item) => {
        const assignedId =
          typeof item.staffId === "object" ? item.staffId?._id : item.staffId;
        return assignedId === staff._id;
      });

      const assignedTasksCount = staffSchedules.filter(
        (item) => item.status !== "Cancelled"
      ).length;

      const inProgressAssignment =
        staffSchedules.find((item) => item.status === "InProgress") || null;

      const currentAssignment =
        staffSchedules.find(
          (item) => item.status === "InProgress" || item.status === "Assigned"
        ) || null;

      const normalizedStatus = String(staff.status || "").toLowerCase();
      const activityStatus =
        normalizedStatus === "onleave"
          ? "On Leave"
          : normalizedStatus === "inactive"
            ? "Inactive"
            : inProgressAssignment
              ? "Busy"
              : normalizedStatus === "active"
                ? "Active"
                : formatStaffStatus(staff.status);

      return {
        ...staff,
        assignedTasksCount,
        currentAssignment,
        activityStatus,
      };
    });
  }, [staffMembers, schedules]);

  const filteredStaff = useMemo(() => {
    return staffRows.filter((staff) => {
      const keyword = search.trim().toLowerCase();
      const matchesSearch = !keyword
        ? true
        : [
            staff.fullName,
            staff.name,
            staff.email,
            staff.phone,
            staff.role,
            staff.activityStatus,
          ].some((value) => String(value || "").toLowerCase().includes(keyword));

      const matchesRole =
        roleFilter === "All" || String(staff.role || "") === roleFilter;
      const matchesStatus =
        statusFilter === "All" || staff.activityStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffRows, search, roleFilter, statusFilter]);

  const pendingIssuesCount = useMemo(() => {
    return issues.filter((issue) => {
      const status = String(issue.status || "").toLowerCase();
      return !["resolved", "closed", "completed"].includes(status);
    }).length;
  }, [issues]);

  const pendingReviewCount = useMemo(() => {
    return schedules.filter((item) => item.status === "Completed").length;
  }, [schedules]);

  const overviewStats = useMemo(() => {
    const totalStaff = staffRows.length;
    const activeStaff = staffRows.filter(
      (staff) => staff.activityStatus === "Active"
    ).length;
    const busyStaff = staffRows.filter(
      (staff) => staff.activityStatus === "Busy"
    ).length;
    const offDutyStaff = staffRows.filter((staff) =>
      ["On Leave", "Inactive"].includes(staff.activityStatus)
    ).length;
    const totalAssignedTasks = schedules.filter(
      (item) => item.status !== "Cancelled"
    ).length;
    return [
      {
        key: "total",
        label: "Total Staff",
        value: totalStaff,
        note: "All registered staff members",
      },
      {
        key: "active",
        label: "Active Staff",
        value: activeStaff,
        note: "Available to receive work",
      },
      {
        key: "busy",
        label: "Busy Staff",
        value: busyStaff,
        note: "Currently assigned to work",
      },
      {
        key: "offDuty",
        label: "Unavailable Staff",
        value: offDutyStaff,
        note: "On leave or inactive",
      },
      {
        key: "tasks",
        label: "Total Assigned Tasks",
        value: totalAssignedTasks,
        note: "Tasks across all staff",
      },
      {
        key: "issues",
        label: "Delete Requests",
        value: staffRows.filter((staff) => Boolean(staff.deleteRequest?.requested)).length,
        note: "Staff delete requests waiting approval",
      },
    ];
  }, [schedules, staffRows]);

  const roleOptions = useMemo(() => {
    const values = [...new Set(staffRows.map((staff) => staff.role).filter(Boolean))];
    return ["All", ...values];
  }, [staffRows]);

  const statusOptions = ["All", "Active", "Busy", "On Leave", "Inactive", "Unknown"];
  const pendingDeleteRequestsCount = staffRows.filter(
    (staff) => Boolean(staff.deleteRequest?.requested)
  ).length;

  return (
    <div className="space-y-6">
      <StaffActionModal
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />
     
      {toast ? <FloatingToast toast={toast} onClose={() => setToast(null)} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overviewStats.map((item) => (
          <article
            key={item.key}
            className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div
              className={`inline-flex rounded-full bg-gradient-to-r ${overviewCardStyles[item.key]} px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white`}
            >
              {item.label}
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,1))] p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Quick Actions
            </p>
           
          </div>

          <span className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            4 Actions
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            to="/admin/staff/schedules?mode=assign"
            title="Assign New Work"
            note="Create schedules and assign tasks to staff members."
          />
          <QuickLink
            to="/admin/staff/issues"
            title="Assign Reported Issues"
            note="Send open issues to the correct staff member."
            badgeCount={pendingIssuesCount}
            badgeTone="rose"
          />
          <QuickLink
            to="/admin/staff/schedules?mode=reviews"
            title="Review Completed Work"
            note="Approve or reject tasks after staff proof upload."
            badgeCount={pendingReviewCount}
            badgeTone="rose"
          />
          <QuickLink
            to="/admin/staff/delete-requests"
            title="Delete Requests"
            note="Review staff profile deletion requests waiting admin approval."
            badgeCount={pendingDeleteRequestsCount}
            badgeTone="rose"
          />
        </div>
      </section>

      <section>
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                placeholder="Search by staff name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border-2 border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 md:w-72"
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border-2 border-blue-200 bg-blue-50/60 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role === "All" ? "All Roles" : role}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border-2 border-blue-200 bg-blue-50/60 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Status" : status}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center bg-white p-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                  <p className="mt-4 text-sm text-slate-500">
                    Loading staff members...
                  </p>
                </div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center bg-white p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-800">
                    No staff found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try changing the current search or filter.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Staff Name
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Role
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Email / Phone
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Assigned Tasks
                      </th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                        Current Assignment
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredStaff.map((staff) => (
                      <tr
                        key={staff._id}
                        onClick={() => setSelectedStaff(staff)}
                        className={`align-top transition hover:bg-slate-50/70 cursor-pointer ${
                          selectedStaff?._id === staff._id ? "bg-blue-50/70" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <StaffAvatar staff={staff} sizeClass="h-11 w-11" textClass="text-base" />
                            <p className="font-semibold text-slate-900">
                              {staff.fullName || staff.name || "Unnamed staff"}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                            {staff.role || "Staff"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          <p>{staff.email || "No email"}</p>
                          <p className="mt-1">{staff.phone || "No phone"}</p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusPill status={staff.activityStatus} />
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {staff.assignedTasksCount}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {staff.currentAssignment ? (
                            <div>
                              <p className="font-semibold text-slate-800">
                                {staff.currentAssignment.title}
                              </p>
                              <p className="mt-1">
                                {staff.currentAssignment.taskType || "Task"} -{" "}
                                {staff.currentAssignment.restroomLabel || "No location"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">No current assignment</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
  const [openingAction, setOpeningAction] = useState("");

  const resolvedProfile = profile || staff || {};
  const displayStatus =
    staff?.activityStatus ||
    resolvedProfile.activityStatus ||
    formatStaffStatus(resolvedProfile.status);
  const normalizedStatus = String(
    resolvedProfile.status || staff?.status || ""
  ).toLowerCase();
  const isOnLeave =
    normalizedStatus === "onleave" || String(displayStatus).toLowerCase() === "on leave";
  const isInactive =
    normalizedStatus === "inactive" || String(displayStatus).toLowerCase() === "inactive";
  const canAssignActions = !isOnLeave && !isInactive;
  const unavailableAssignMessage = isOnLeave
    ? "Cannot assign: this staff member is On Leave."
    : "Cannot assign: this staff member is Inactive.";
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
    setOpeningAction("");

    if (staff?._id) {
      handleViewProfile();
    }
  }, [staff?._id]);

  useEffect(() => {
    if (!profileToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setProfileToast(null);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [profileToast]);

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
                    {canAssignActions ? (
                      <Link
                        to="/admin/staff/schedules"
                        state={{
                          preselectedStaff: {
                            _id: resolvedProfile._id || staff._id,
                            fullName:
                              resolvedProfile.fullName ||
                              resolvedProfile.name ||
                              staff.fullName ||
                              staff.name ||
                              "Staff member",
                            role: resolvedProfile.role || staff.role || "",
                            email: resolvedProfile.email || staff.email || "",
                            phone: resolvedProfile.phone || staff.phone || "",
                            status: resolvedProfile.status || staff.status || "",
                          },
                        }}
                        onClick={() => {
                          setOpeningAction("work");
                          onClose();
                        }}
                        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <span className="inline-flex items-center gap-2">
                          Assign Work
                          {openingAction === "work" ? <LoadingIcon /> : null}
                        </span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setProfileToast({
                            type: "error",
                            text: unavailableAssignMessage,
                          })
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-sm font-semibold text-slate-500"
                      >
                        Assign Work
                      </button>
                    )}
                    {canAssignActions ? (
                      <Link
                        to="/admin/staff/issues"
                        onClick={() => {
                          setOpeningAction("issue");
                          onClose();
                        }}
                        className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                      >
                        <span className="inline-flex items-center gap-2">
                          Assign Issue
                          {openingAction === "issue" ? <LoadingIcon /> : null}
                        </span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setProfileToast({
                            type: "error",
                            text: unavailableAssignMessage,
                          })
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-sm font-semibold text-slate-500"
                      >
                        Assign Issue
                      </button>
                    )}
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
        : status === "On Leave"
          ? "bg-purple-50 text-purple-700"
          : status === "Inactive"
          ? "bg-slate-100 text-slate-600"
          : "bg-blue-50 text-blue-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${tone}`}>
      {status}
    </span>
  );
}

function LoadingIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
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
