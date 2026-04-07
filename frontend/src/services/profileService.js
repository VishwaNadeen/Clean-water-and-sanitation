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
      email: raw.email || storedUser?.email || "",
      phone: raw.phone || raw.mobile || raw.contactNumber || "",
      gender: raw.gender || "",
      role: raw.role || storedUser?.role || "staff",
      originalData: raw,
    };
  }

  return {
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    email: raw.email || storedUser?.email || "",
    phone: raw.phone || "",
    gender: raw.gender || "",
    role: raw.role || storedUser?.role || "user",
    originalData: raw,
  };
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