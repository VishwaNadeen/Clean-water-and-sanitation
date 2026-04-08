import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Outlet />
    </div>
  );
}