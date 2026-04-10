import API_BASE_URL from "../config/api";
import { getStoredUser, getToken } from "../utils/auth";

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function getProfileEndpointByRole(role) {
  const safeRole = normalizeRole(role);

  if (safeRole === "staff") {
    return `${API_BASE_URL}/staff/me`;
  }

  if (safeRole === "admin") {
    return `${API_BASE_URL}/admin/me`;
  }

  return `${API_BASE_URL}/users/me`;
}

function normalizeProfileResponse(data, role, storedUser) {
  const safeRole = normalizeRole(role);

  const raw =
    data?.user ||
    data?.staff ||
    data?.admin ||
    data?.profile ||
    data?.data ||
    data;

  if (!raw || typeof raw !== "object") {
    return {
      firstName: "",
      lastName: "",
      email: storedUser?.email || "",
      phone: "",
      gender: "",
      role: storedUser?.role || "",
    };
  }

  if (safeRole === "staff") {
    const fullName =
      raw.fullName ||
      raw.name ||
      raw.staffName ||
      "";

    const splitName = String(fullName).trim().split(" ");

    return {
      firstName: raw.firstName || splitName[0] || "",
      lastName:
        raw.lastName ||
        (splitName.length > 1 ? splitName.slice(1).join(" ") : ""),
      fullName: fullName || [raw.firstName, raw.lastName].filter(Boolean).join(" "),
      email: raw.email || storedUser?.email || "",
      phone: raw.phone || raw.mobile || raw.contactNumber || "",
      gender: raw.gender || "",
      address: raw.address || raw.streetAddress || "",
      city: raw.city || raw.town || "",
      country: raw.country || "",
      provinceState: raw.baseProvince || raw.province || raw.state || "",
      district: raw.baseDistrict || raw.district || "",
      dob: raw.dob || raw.dateOfBirth || raw.birthDate || "",
      role: raw.role || storedUser?.role || "staff",
      profileImageUrl: raw.profileImageUrl || raw.avatarUrl || "",
      mustChangePassword: Boolean(raw.mustChangePassword),
      createdAt: raw.createdAt || raw.created_at || "",
      originalData: raw,
    };
  }

  return {
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    fullName:
      raw.fullName ||
      [raw.firstName, raw.lastName].filter(Boolean).join(" "),
    email: raw.email || storedUser?.email || "",
    phone: raw.phone || "",
    gender: raw.gender || "",
    address: raw.address || raw.streetAddress || "",
    city: raw.city || raw.town || "",
    country: raw.country || "",
    provinceState: raw.province || raw.state || "",
    district: raw.district || "",
    dob: raw.dob || raw.dateOfBirth || raw.birthDate || "",
    role: raw.role || storedUser?.role || "user",
    profileImageUrl: raw.profileImageUrl || raw.avatarUrl || "",
    mustChangePassword: Boolean(raw.mustChangePassword),
    createdAt: raw.createdAt || raw.created_at || "",
    originalData: raw,
  };
}

export async function changeMyPassword(payload) {
  const token = getToken();
  const storedUser = getStoredUser();
  const safeRole = normalizeRole(storedUser?.role);

  if (!token) {
    throw new Error("No auth token found.");
  }

  if (safeRole === "staff") {
    const response = await fetch(`${API_BASE_URL}/staff/me/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to change password.");
    }

    return data;
  }

  return updateMyProfile(payload);
}

export async function getMyProfile() {
  const token = getToken();
  const storedUser = getStoredUser();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const endpoint = getProfileEndpointByRole(storedUser?.role);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  console.log("PROFILE ENDPOINT:", endpoint);
  console.log("PROFILE ROLE:", storedUser?.role);
  console.log("PROFILE RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch profile.");
  }

  return normalizeProfileResponse(data, storedUser?.role, storedUser);
}

export async function updateMyProfile(payload) {
  const token = getToken();
  const storedUser = getStoredUser();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const endpoint = getProfileEndpointByRole(storedUser?.role);

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  console.log("UPDATE PROFILE RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update profile.");
  }

  return normalizeProfileResponse(data, storedUser?.role, storedUser);
}

export async function deleteMyProfile(password) {
  const token = getToken();
  const storedUser = getStoredUser();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const endpoint = getProfileEndpointByRole(storedUser?.role);

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete profile.");
  }

  return data;
}

export async function requestMyDeleteProfile(reason) {
  const token = getToken();
  const storedUser = getStoredUser();
  const safeRole = normalizeRole(storedUser?.role);

  if (!token) {
    throw new Error("No auth token found.");
  }

  if (safeRole !== "staff") {
    throw new Error("Delete request is currently available for staff accounts only.");
  }

  const response = await fetch(`${API_BASE_URL}/staff/me/delete-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to submit delete request.");
  }

  return data;
}

export async function uploadMyProfileImage(file) {
  const token = getToken();
  const storedUser = getStoredUser();

  if (!token) {
    throw new Error("No auth token found.");
  }

  if (normalizeRole(storedUser?.role) !== "staff") {
    throw new Error("Profile image upload is currently available for staff accounts only.");
  }

  const formData = new FormData();
  formData.append("profileImage", file);

  const response = await fetch(`${API_BASE_URL}/staff/me/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to upload profile image.");
  }

  return normalizeProfileResponse(data, storedUser?.role, storedUser);
}

export async function removeMyProfileImage() {
  const token = getToken();
  const storedUser = getStoredUser();

  if (!token) {
    throw new Error("No auth token found.");
  }

  if (normalizeRole(storedUser?.role) !== "staff") {
    throw new Error("Profile image removal is currently available for staff accounts only.");
  }

  const response = await fetch(`${API_BASE_URL}/staff/me/profile-image`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to remove profile image.");
  }

  return normalizeProfileResponse(data, storedUser?.role, storedUser);
}
