import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: "Please log in first to continue.",
          redirect: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return children;
}
