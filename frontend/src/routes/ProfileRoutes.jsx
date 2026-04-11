import { Navigate, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import Dashboard from "../pages/profile/Dashboard.jsx";
import Profile from "../pages/profile/Profile.jsx";
import EditProfile from "../pages/profile/EditProfile.jsx";
import ChangePassword from "../pages/profile/ChangePassword.jsx";
import DeleteProfile from "../pages/profile/DeleteProfile.jsx";
import { getStoredUser } from "../utils/auth";

function UserOnlyProfile({ children, fallbackPath }) {
  const storedUser = getStoredUser();
  const role = String(storedUser?.role || "").toLowerCase();

  if (role === "staff") {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

const ProfileRoutes = (
  <Route element={<ProtectedRoute />}>
    <Route
      path="/profile"
      element={
        <UserOnlyProfile fallbackPath="/staff/profile">
          <Dashboard />
        </UserOnlyProfile>
      }
    >
      <Route index element={<Profile />} />
      <Route path="edit" element={<EditProfile />} />
      <Route path="password" element={<ChangePassword />} />
      <Route path="delete" element={<DeleteProfile />} />
    </Route>
  </Route>
);

export default ProfileRoutes;