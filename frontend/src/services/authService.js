import API_BASE_URL from "../config/api";

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Login failed.");
  }

  return data;
}

export async function logoutUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Logout failed.");
  }

  return data;
}

export async function requestPasswordResetOtp(email) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to send reset OTP.");
  }

  return data;
}

export async function verifyPasswordResetOtp({ email, otp }) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "OTP verification failed.");
  }

  return data;
}

export async function resetPasswordWithOtp({
  email,
  otp,
  newPassword,
  confirmPassword,
}) {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      otp,
      newPassword,
      confirmPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Password reset failed.");
  }

  return data;
}