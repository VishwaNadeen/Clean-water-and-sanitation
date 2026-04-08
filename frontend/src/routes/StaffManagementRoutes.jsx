import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import StaffList from "../pages/admin/StaffList.jsx";
import Schedules from "../pages/admin/Schedule.jsx";
import Issues from "../pages/admin/Issues.jsx";
import StaffDashboard from "../pages/staff/Dashboard.jsx";
import MySchedules from "../pages/staff/MySchedules.jsx";

const staffManagementRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AdminDashboard />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/staff-list",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StaffList />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/schedules",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Schedules />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/issues",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Issues />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StaffDashboard />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff/my-schedules",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MySchedules />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
];

export default staffManagementRoutes;
