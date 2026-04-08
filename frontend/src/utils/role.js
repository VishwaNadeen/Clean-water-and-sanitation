import { getStoredUser } from "./auth";

export function getCurrentUserRole() {
  const user = getStoredUser();
  return String(user?.role || "").toUpperCase();
}

export function isManagerRole() {
  return getCurrentUserRole() === "ADMIN";
}

export function isStaffRole() {
  return getCurrentUserRole() === "STAFF";
}