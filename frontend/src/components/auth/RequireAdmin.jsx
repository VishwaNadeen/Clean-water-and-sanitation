import { Navigate, useLocation } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (String(user.role || "").toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}