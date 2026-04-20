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

function getRegisterEndpointByRole(role) {
  const safeRole = normalizeRole(role);

  if (safeRole === "staff") {
    return `${API_BASE_URL}/staff`;
  }

  if (safeRole === "admin") {
    return `${API_BASE_URL}/admin`;
  }

  return `${API_BASE_URL}/users`;
}

function getAuthHeaders(isFormData = false) {
  const token = getToken();
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function normalizeProfile(user) {
  if (!user || typeof user !== "object") return null;

  const fullName =
    user.fullName ||
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ");

  const splitName = String(fullName || "")
    .trim()
    .split(" ")
    .filter(Boolean);

  return {
    id: user.id || user._id || "",
    firstName: user.firstName || splitName[0] || "",
    lastName:
      user.lastName ||
      (splitName.length > 1 ? splitName.slice(1).join(" ") : ""),
    fullName:
      fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" "),
    email: user.email || "",
    countryCode: user.countryCode || "",
    phone: user.phone || user.mobile || user.contactNumber || "",
    gender: user.gender || "",
    status: user.status || "",
    role: user.role || "",
    isEmailVerified: Boolean(user.isEmailVerified),
    lastLoginAt: user.lastLoginAt || null,

    profilePhotoUrl:
      user.profilePhotoUrl || user.profileImageUrl || user.avatarUrl || "",
    profilePhotoPublicId:
      user.profilePhotoPublicId || user.profileImagePublicId || "",

    dob: user.dob || user.dateOfBirth || user.birthDate || "",

    addressLine1: user.address?.line1 || user.addressLine1 || "",
    addressLine2: user.address?.line2 || user.addressLine2 || "",
    addressLine3: user.address?.line3 || user.addressLine3 || "",

    address:
      user.address && typeof user.address === "string" ? user.address : "",

    country: user.country || "",
    provinceState:
      user.provinceState ||
      user.province ||
      user.state ||
      user.baseProvince ||
      "",
    district: user.district || user.baseDistrict || "",
    city: user.city || user.town || "",

    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: user.createdAt || user.created_at || null,
    updatedAt: user.updatedAt || user.updated_at || null,

    originalData: user,
  };
}

function extractProfilePayload(data) {
  return (
    data?.user ||
    data?.staff ||
    data?.admin ||
    data?.profile ||
    data?.data ||
    data
  );
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed.");
    error.fieldErrors = data?.fieldErrors || {};
    throw error;
  }

  return data;
}

export async function getMyProfile() {
  const storedUser = getStoredUser();
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const response = await fetch(getProfileEndpointByRole(storedUser?.role), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return normalizeProfile(extractProfilePayload(data));
}

export async function updateMyProfile(payload) {
  const storedUser = getStoredUser();
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const hasFile =
    payload?.profilePhoto instanceof File ||
    payload?.profileImage instanceof File;

  let body;
  let isFormData = false;

  if (hasFile) {
    isFormData = true;
    body = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "profilePhoto" || key === "profileImage") {
        if (value instanceof File) {
          body.append(key, value);
        }
        return;
      }

      body.append(key, value);
    });
  } else {
    body = JSON.stringify(payload || {});
  }

  const method = normalizeRole(storedUser?.role) === "staff" ? "PATCH" : "PUT";

  const response = await fetch(getProfileEndpointByRole(storedUser?.role), {
    method,
    headers: getAuthHeaders(isFormData),
    body,
  });

  const data = await handleResponse(response);

  return {
    message: data.message,
    user: normalizeProfile(extractProfilePayload(data)),
  };
}

export async function registerUser(payload, role = "user") {
  const hasFile =
    payload?.profilePhoto instanceof File ||
    payload?.profileImage instanceof File;

  let body;
  let headers = {};

  if (hasFile) {
    const formData = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;

      if (key === "profilePhoto" || key === "profileImage") {
        if (value instanceof File) {
          formData.append(key, value);
        }
        return;
      }

      formData.append(key, value);
    });

    body = formData;
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload || {});
  }

  const response = await fetch(getRegisterEndpointByRole(role), {
    method: "POST",
    headers,
    body,
  });

  const data = await handleResponse(response);

  return {
    message: data.message,
    user: normalizeProfile(extractProfilePayload(data)),
  };
}

export async function changeMyPassword(payload) {
  const storedUser = getStoredUser();
  const token = getToken();
  const safeRole = normalizeRole(storedUser?.role);

  if (!token) {
    throw new Error("No auth token found.");
  }

  if (safeRole === "staff") {
    const response = await fetch(`${API_BASE_URL}/staff/me/password`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  }

  const response = await fetch(getProfileEndpointByRole(storedUser?.role), {
    method: safeRole === "admin" ? "PATCH" : "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteMyProfile(payload) {
  const storedUser = getStoredUser();
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const response = await fetch(getProfileEndpointByRole(storedUser?.role), {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload || {}),
  });

  return handleResponse(response);
}

export async function requestMyDeleteProfile(reason) {
  const storedUser = getStoredUser();
  const token = getToken();
  const safeRole = normalizeRole(storedUser?.role);

  if (!token) {
    throw new Error("No auth token found.");
  }

  if (safeRole !== "staff") {
    throw new Error("Delete request is currently available for staff accounts only.");
  }

  const response = await fetch(`${API_BASE_URL}/staff/me/delete-request`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });

  return handleResponse(response);
}

export async function uploadMyProfileImage(file) {
  const storedUser = getStoredUser();
  const token = getToken();

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

  const data = await handleResponse(response);
  return normalizeProfile(extractProfilePayload(data));
}

export async function removeMyProfileImage() {
  const storedUser = getStoredUser();
  const token = getToken();

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

  const data = await handleResponse(response);
  return normalizeProfile(extractProfilePayload(data));
}