import { useEffect, useMemo, useRef, useState } from "react";
import FloatingToast from "../../../components/common/FloatingToast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import useProfileData from "../../../hooks/useProfileData";
import { fetchCountries } from "../../../services/countryService";
import {
  changeMyPassword,
  requestMyDeleteProfile,
  updateMyProfile,
  removeMyProfileImage,
  uploadMyProfileImage,
} from "../../../services/profileService";
import { updateStoredUser } from "../../../utils/auth";
import {
  combineAddressLines,
  splitAddressLines,
  validateStaffForm,
} from "../../../utils/staffFormValidation";

import EditProfile from "./EditProfile";
import PasswordProfile from "./PasswordProfile";
import DeleteRequestProfile from "./DeleteRequestProfile";

const roleOptions = ["Cleaner", "Supervisor", "Technician"];
const statusOptions = ["Active", "Inactive", "OnLeave"];

const provinceDistrictMap = {
  Western: ["Colombo", "Gampaha", "Kalutara"],
  Central: ["Kandy", "Matale", "Nuwara Eliya"],
  Southern: ["Galle", "Matara", "Hambantota"],
  Northern: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  Eastern: ["Trincomalee", "Batticaloa", "Ampara"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  Uva: ["Badulla", "Monaragala"],
  Sabaragamuwa: ["Ratnapura", "Kegalle"],
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

function DetailCard({ label, value, tone = "slate" }) {
  const toneClass =
    tone === "blue"
      ? "border-blue-100 bg-blue-50/70"
      : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7 5 5 5-5" />
    </svg>
  );
}

function CountryFlag({ src, alt }) {
  if (!src) {
    return (
      <span className="grid h-5 w-7 place-items-center rounded-[6px] bg-slate-200 text-[10px] font-bold text-slate-500">
        --
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-5 w-7 rounded-[6px] border border-slate-200 object-cover shadow-sm"
      loading="lazy"
    />
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.7 10s3-5 8.3-5 8.3 5 8.3 5-3 5-8.3 5-8.3-5-8.3-5Z" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 2l16 16" />
      <path d="M8.8 4.9A9.8 9.8 0 0 1 10 4.8c5.3 0 8.3 5.2 8.3 5.2a13.7 13.7 0 0 1-2.8 3.4" />
      <path d="M5.2 5.3A14.3 14.3 0 0 0 1.7 10s3 5.2 8.3 5.2a8.9 8.9 0 0 0 3-.5" />
      <path d="M8.6 8.6A2 2 0 0 0 8 10a2 2 0 0 0 2 2c.5 0 1-.2 1.4-.6" />
    </svg>
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

export default function StaffProfile() {
  const fileInputRef = useRef(null);
  const countryDropdownRef = useRef(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState(null);
  const [showRemovePhotoConfirm, setShowRemovePhotoConfirm] = useState(false);
  const [openingAction, setOpeningAction] = useState("");
  const [activeModal, setActiveModal] = useState("");
  const [savingModal, setSavingModal] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [editForm, setEditForm] = useState({
    fullName: "",
    nic: "",
    countryCode: "+94",
    phone: "",
    email: "",
    role: "Cleaner",
    gender: "",
    status: "Active",
    baseProvince: "",
    baseDistrict: "",
    addressLine1: "",
    addressLine2: "",
    dob: "",
    joinDate: "",
  });

  const [countries, setCountries] = useState([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [deleteForm, setDeleteForm] = useState({
    reason: "",
  });

  const { profile, setProfile , storedUser } = useProfileData();

  const staff = profile?.originalData || {};

  const displayName =
    staff.fullName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    storedUser?.fullName ||
    "Staff Member";

  const profileImageSrc =
    profile?.profileImageUrl ||
    profile?.originalData?.profileImageUrl ||
    storedUser?.profileImageUrl ||
    "";
  const profileImageInitial = String(displayName || "S").trim().charAt(0).toUpperCase();
  const locationLabel = [staff.baseDistrict, staff.baseProvince].filter(Boolean).join(", ");
  const phoneLabel = [staff.countryCode, staff.phone].filter(Boolean).join(" ");
  const mustChangePassword = Boolean(profile?.mustChangePassword || staff.mustChangePassword);
  const deleteRequest = staff.deleteRequest || {};
  const isDeleteRequestPending =
    Boolean(deleteRequest.requested) || deleteRequest.status === "pending";
  const hasDeleteRequestResponse =
    deleteRequest.status === "rejected" && Boolean(deleteRequest.adminResponse);

  const selectedCountry = useMemo(() => {
    return (
      countries.find((item) => item.dialCode === editForm.countryCode) || {
        name: "Select country",
        flagUrl: "",
        dialCode: editForm.countryCode || "",
      }
    );
  }, [countries, editForm.countryCode]);

  const filteredCountries = useMemo(() => {
    const keyword = countrySearch.trim().toLowerCase();

    if (!keyword) return countries;

    return countries.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.dialCode.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword)
      );
    });
  }, [countries, countrySearch]);

  const staffSummary = useMemo(() => {
    return [
      { label: "Role", value: staff.role || "Staff", tone: "blue" },
      { label: "Status", value: staff.status || "Active", tone: "blue" },
      { label: "NIC", value: staff.nic || "-" },
      { label: "Join Date", value: formatDate(staff.joinDate) },
    ];
  }, [staff.joinDate, staff.nic, staff.role, staff.status]);

  const showToast = (type, text) => {
    setToast({ type, text });
    window.setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  useEffect(() => {
    const { addressLine1, addressLine2 } = splitAddressLines(staff.address);

    setEditForm({
      fullName: staff.fullName || displayName || "",
      nic: staff.nic || "",
      countryCode: staff.countryCode || "+94",
      phone: staff.phone ? String(staff.phone) : "",
      email: staff.email || storedUser?.email || "",
      role: staff.role || "Cleaner",
      gender: staff.gender || "",
      status: staff.status || "Active",
      baseProvince: staff.baseProvince || "",
      baseDistrict: staff.baseDistrict || "",
      addressLine1,
      addressLine2,
      dob: staff.dob ? String(staff.dob).split("T")[0] : "",
      joinDate: staff.joinDate ? String(staff.joinDate).split("T")[0] : "",
    });
  }, [
    displayName,
    staff.address,
    staff.baseDistrict,
    staff.baseProvince,
    staff.countryCode,
    staff.dob,
    staff.email,
    staff.fullName,
    staff.gender,
    staff.joinDate,
    staff.nic,
    staff.phone,
    staff.role,
    staff.status,
    storedUser?.email,
  ]);

  useEffect(() => {
    let mounted = true;

    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        if (mounted) setCountries(data);
      } catch {
        if (mounted) showToast("error", "Unable to load country list.");
      }
    };

    loadCountries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!activeModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeModal]);

  const closeModal = () => {
    setActiveModal("");
    setSavingModal(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });

    setDeleteForm({ reason: "" });
    setCountryOpen(false);
    setCountrySearch("");
    setEditErrors({});
    setOpeningAction("");
  };

  const openProfileAction = (modalKey) => {
    setOpeningAction(modalKey);
    window.setTimeout(() => {
      setActiveModal(modalKey);
      setOpeningAction("");
    }, 120);
  };

  async function handleProfileImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const updatedProfile = await uploadMyProfileImage(file);
      setProfile(updatedProfile);
      updateStoredUser({
        profileImageUrl: updatedProfile.profileImageUrl || "",
      });
      showToast("success", "Profile photo updated successfully");
    } catch (error) {
      showToast("error", error.message || "Failed to upload profile image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleRemoveProfileImage() {
    setShowRemovePhotoConfirm(true);
  }

  async function confirmRemoveProfileImage() {
    if (uploadingImage) return;

    try {
      setUploadingImage(true);
      const updatedProfile = await removeMyProfileImage();
      setProfile(updatedProfile);
      updateStoredUser({ profileImageUrl: "" });
      showToast("success", "Profile photo removed successfully");
    } catch (error) {
      showToast("error", error.message || "Failed to remove profile image.");
    } finally {
      setUploadingImage(false);
      setShowRemovePhotoConfirm(false);
    }
  }

  async function handleEditSave(event) {
    event.preventDefault();
    const combinedAddress = combineAddressLines(
      editForm.addressLine1,
      editForm.addressLine2
    );
    const errors = validateStaffForm(
      {
        ...editForm,
        address: combinedAddress,
      },
      { requireEmail: false, validateJoinDate: false }
    );

    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast("error", Object.values(errors)[0] || "Please fix the form errors.");
      return;
    }

    try {
      setSavingModal(true);

      const updatedProfile = await updateMyProfile({
        fullName: editForm.fullName.trim(),
        nic: editForm.nic.trim(),
        countryCode: editForm.countryCode.trim(),
        phone: editForm.phone.trim(),
        gender: editForm.gender,
        status: editForm.status,
        baseProvince: editForm.baseProvince.trim(),
        baseDistrict: editForm.baseDistrict.trim(),
        address: combinedAddress,
      });

      setProfile(updatedProfile);

      updateStoredUser({
        fullName:
          updatedProfile.originalData?.fullName ||
          updatedProfile.firstName ||
          storedUser?.fullName ||
          "",
        email: updatedProfile.email || storedUser?.email || "",
      });

      closeModal();
      showToast("success", "Staff profile updated successfully");
    } catch (error) {
      showToast("error", error.message || "Failed to update staff profile.");
      setSavingModal(false);
    }
  }

  async function handlePasswordSave(event) {
    event.preventDefault();

    const trimmedNewPassword = passwordForm.newPassword.trim();
    const passwordRule = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;
    const nextErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      if (!passwordForm.currentPassword) {
        nextErrors.currentPassword = "Current password is required.";
      }
      if (!passwordForm.newPassword) {
        nextErrors.newPassword = "New password is required.";
      }
    }

    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    }

    if (passwordForm.newPassword && !passwordRule.test(trimmedNewPassword)) {
      nextErrors.newPassword =
        "Use at least 6 characters with one uppercase letter and one special character.";
    }

    if (
      passwordForm.newPassword &&
      passwordForm.confirmPassword &&
      trimmedNewPassword !== passwordForm.confirmPassword.trim()
    ) {
      nextErrors.confirmPassword = "New password and confirm new password do not match.";
    }

    if (nextErrors.currentPassword || nextErrors.newPassword || nextErrors.confirmPassword) {
      setPasswordErrors(nextErrors);
      return;
    }

    try {
      setSavingModal(true);
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: trimmedNewPassword,
      });

      updateStoredUser({ mustChangePassword: false });

      setProfile((prev) => ({
        ...prev,
        mustChangePassword: false,
        originalData: {
          ...(prev?.originalData || {}),
          mustChangePassword: false,
        },
      }));

      closeModal();
      showToast("success", "Password changed successfully");
    } catch (error) {
      showToast("error", error.message || "Failed to change password.");
      setSavingModal(false);
    }
  }

  async function handleDeleteRequest(event) {
    event.preventDefault();

    try {
      setSavingModal(true);
      const data = await requestMyDeleteProfile(deleteForm.reason.trim());
      closeModal();
      showToast("success", data?.message || "Delete request submitted successfully");
    } catch (error) {
      showToast("error", error.message || "Failed to submit delete request.");
      setSavingModal(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 pb-6 pt-2 md:px-6 md:pb-8 md:pt-3">
      <div className="mx-auto max-w-7xl">
        <ConfirmDialog
          open={showRemovePhotoConfirm}
          title="Remove profile photo?"
          message="This will remove your current profile photo from your account."
          confirmText={uploadingImage ? "Removing..." : "Remove Photo"}
          cancelText="Keep Photo"
          tone="danger"
          onCancel={() => {
            if (!uploadingImage) setShowRemovePhotoConfirm(false);
          }}
          onConfirm={confirmRemoveProfileImage}
        />

        {toast && !activeModal ? (
          <FloatingToast toast={toast} onClose={() => setToast(null)} />
        ) : null}

        <div>
          <section className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
            {mustChangePassword ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      First login security reminder
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      You are using your temporary password. Please change it now to secure your staff account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal("password")}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            ) : null}

            {isDeleteRequestPending ? (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-rose-800">
                    Delete request sent to admin
                  </p>
                  <p className="text-sm text-rose-700">
                    Your profile deletion request is waiting for admin review.
                  </p>
                  <p className="text-sm text-rose-700">
                    Requested on:{" "}
                    {deleteRequest.requestedAt
                      ? formatDate(deleteRequest.requestedAt)
                      : "Recently submitted"}
                  </p>
                  {deleteRequest.reason ? (
                    <p className="text-sm text-rose-700">
                      Reason: {deleteRequest.reason}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {hasDeleteRequestResponse ? (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-blue-800">
                    Admin response for your delete request
                  </p>
                  <p className="text-sm text-blue-700">{deleteRequest.adminResponse}</p>
                  <p className="text-sm text-blue-700">
                    Reviewed on:{" "}
                    {deleteRequest.reviewedAt
                      ? formatDate(deleteRequest.reviewedAt)
                      : "Recently updated"}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mb-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/60 p-5 md:p-6">
              <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="mx-auto lg:mx-0">
                  {profileImageSrc ? (
                    <img
                      src={profileImageSrc}
                      alt={displayName}
                      className="h-28 w-28 rounded-3xl border border-blue-200 object-cover shadow-[0_12px_28px_rgba(37,99,235,0.14)]"
                    />
                  ) : (
                    <div className="grid h-28 w-28 place-items-center rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-100 to-sky-100 text-4xl font-semibold text-blue-900 shadow-[0_12px_28px_rgba(37,99,235,0.14)]">
                      {profileImageInitial}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    Staff Profile Photo
                  </p>
                  <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900">
                    {displayName}
                  </h2>
                  <p className="mt-2 break-all text-base text-slate-600">
                    {staff.email || storedUser?.email || "-"}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {staff.role || "Staff"}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      {staff.status || "Active"}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[230px]">
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
                    className="rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {uploadingImage ? "Working..." : profileImageSrc ? "Change Photo" : "Upload Photo"}
                  </button>
                  {profileImageSrc ? (
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      disabled={uploadingImage}
                      className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Remove Photo
                    </button>
                  ) : null}
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {profileImageSrc
                  ? "You can change or remove your uploaded photo at any time."
                  : "Upload a profile photo now. After upload, a remove option will appear here."}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {staffSummary.map((item) => (
                <DetailCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  tone={item.tone}
                />
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Profile Actions
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openProfileAction("edit")}
                className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <span className="inline-flex items-center gap-2">
                  Edit Staff Profile
                  {openingAction === "edit" ? <LoadingIcon /> : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => openProfileAction("password")}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                <span className="inline-flex items-center gap-2">
                  Change Password
                  {openingAction === "password" ? <LoadingIcon /> : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => openProfileAction("delete")}
                disabled={isDeleteRequestPending}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <span className="inline-flex items-center gap-2">
                  {isDeleteRequestPending ? "Request Sent" : "Delete Request"}
                  {openingAction === "delete" ? <LoadingIcon /> : null}
                </span>
              </button>
              </div>
            </div>

            <section className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Staff Details
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Work and contact information
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This section includes role, assigned base area, and work identity details.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Phone Number
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {phoneLabel || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Gender
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {staff.gender || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Base Location
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {locationLabel || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Date of Birth
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatDate(staff.dob)}
                  </p>
                </div>

                <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Address
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {staff.address || "-"}
                  </p>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>

      {activeModal ? (
        <div className="fixed inset-0 z-50 bg-slate-900/45 p-4">
          {toast ? <FloatingToast toast={toast} onClose={() => setToast(null)} /> : null}
          <div className="flex h-full items-start justify-center overflow-y-auto py-6">
            <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {activeModal === "edit"
                      ? "Edit Staff Profile"
                      : activeModal === "password"
                      ? "Change Password"
                      : "Delete Request"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeModal === "edit"
                      ? "Update your staff member details here."
                      : activeModal === "password"
                      ? "Change your account password securely."
                      : "Request profile deletion for admin review."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
                {activeModal === "edit" ? (
                  <EditProfile
                    editForm={editForm}
                    setEditForm={setEditForm}
                    editErrors={editErrors}
                    setEditErrors={setEditErrors}
                    handleEditSave={handleEditSave}
                    savingModal={savingModal}
                    closeModal={closeModal}
                    inputClass={inputClass}
                    roleOptions={roleOptions}
                    statusOptions={statusOptions}
                    provinceDistrictMap={provinceDistrictMap}
                    countryDropdownRef={countryDropdownRef}
                    countryOpen={countryOpen}
                    setCountryOpen={setCountryOpen}
                    countrySearch={countrySearch}
                    setCountrySearch={setCountrySearch}
                    selectedCountry={selectedCountry}
                    filteredCountries={filteredCountries}
                    CountryFlag={CountryFlag}
                    ChevronIcon={ChevronIcon}
                  />
                ) : null}

                {activeModal === "password" ? (
                  <PasswordProfile
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    passwordErrors={passwordErrors}
                    setPasswordErrors={setPasswordErrors}
                    passwordVisibility={passwordVisibility}
                    setPasswordVisibility={setPasswordVisibility}
                    handlePasswordSave={handlePasswordSave}
                    savingModal={savingModal}
                    closeModal={closeModal}
                    EyeIcon={EyeIcon}
                    EyeOffIcon={EyeOffIcon}
                  />
                ) : null}

                {activeModal === "delete" ? (
                  <DeleteRequestProfile
                    deleteForm={deleteForm}
                    setDeleteForm={setDeleteForm}
                    handleDeleteRequest={handleDeleteRequest}
                    savingModal={savingModal}
                    closeModal={closeModal}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
