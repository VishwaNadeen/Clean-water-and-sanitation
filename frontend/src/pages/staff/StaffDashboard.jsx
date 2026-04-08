export default function StaffDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">
        Staff Dashboard
      </h1>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Appointments</p>
          <h2 className="text-2xl font-bold">32</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Patients</p>
          <h2 className="text-2xl font-bold">120</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Today Sessions</p>
          <h2 className="text-2xl font-bold">8</h2>
        </div>
      </div>
    </div>
  );
}