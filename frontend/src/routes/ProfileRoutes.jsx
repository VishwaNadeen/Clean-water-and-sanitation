import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import Profile from "../pages/profile/Profile.jsx";
import EditProfile from "../pages/profile/EditProfile.jsx";
import ChangePassword from "../pages/profile/ChangePassword.jsx";
import DeleteProfile from "../pages/profile/DeleteProfile.jsx";

const ProfileRoutes = (
  <Route
    element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }
  >
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/edit" element={<EditProfile />} />
    <Route path="/profile/password" element={<ChangePassword />} />
    <Route path="/profile/delete" element={<DeleteProfile />} />
  </Route>
);

export default ProfileRoutes;