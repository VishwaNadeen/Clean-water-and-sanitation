import { Navigate, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
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
  <Route
    element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }
  >
    <Route
      path="/profile"
      element={
        <UserOnlyProfile fallbackPath="/staff/profile">
          <Profile />
        </UserOnlyProfile>
      }
    />
    <Route
      path="/profile/edit"
      element={
        <UserOnlyProfile fallbackPath="/staff/profile/edit">
          <EditProfile />
        </UserOnlyProfile>
      }
    />
    <Route
      path="/profile/password"
      element={
        <UserOnlyProfile fallbackPath="/staff/profile/password">
          <ChangePassword />
        </UserOnlyProfile>
      }
    />
    <Route
      path="/profile/delete"
      element={
        <UserOnlyProfile fallbackPath="/staff/profile/delete">
          <DeleteProfile />
        </UserOnlyProfile>
      }
    />
  </Route>
);

export default ProfileRoutes;
