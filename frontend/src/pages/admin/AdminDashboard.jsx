export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">
        Dashboard Overview
      </h1>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <p>Total Users</p>
          <h2 className="text-2xl font-bold">120</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p>Total Staff</p>
          <h2 className="text-2xl font-bold">24</h2>
        </div>
      </div>
    </div>
  );
}