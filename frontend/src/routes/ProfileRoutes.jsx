import Profile from "../pages/profile/Profile.jsx";
import EditProfile from "../pages/profile/EditProfile.jsx";
import ChangePassword from "../pages/profile/ChangePassword.jsx";
import DeleteProfile from "../pages/profile/DeleteProfile.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";

const profileRoutes = [
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/edit",
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/password",
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/delete",
    element: (
      <ProtectedRoute>
        <DeleteProfile />
      </ProtectedRoute>
    ),
  },
];

export default profileRoutes;