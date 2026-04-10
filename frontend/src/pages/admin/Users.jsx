import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load users.");
        }

        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (err) {
        setError(err.message || "Failed to load users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      return (
        String(user.fullName || user.username || "").toLowerCase().includes(keyword) ||
        String(user.email || "").toLowerCase().includes(keyword) ||
        String(user.role || "").toLowerCase().includes(keyword) ||
        String(user.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const activeCount = users.filter(
    (user) => String(user.status || "").toLowerCase() === "active"
  ).length;

  const inactiveCount = users.filter(
    (user) => String(user.status || "").toLowerCase() === "inactive"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                User Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View all registered users from the system.
              </p>
            </div>

            <div className="w-full lg:w-80">
              <input
                type="text"
                placeholder="Search by name, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {users.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Active Users</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {activeCount}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Inactive Users</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {inactiveCount}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Search Results</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {filteredUsers.length}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">Loading users...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                {error}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-800">
                  No users found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  No real user records are available for this filter.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        Name
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        Email
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        Role
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                        Created Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id || user.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">
                            {user.fullName || user.username || "N/A"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.email || "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                            {user.role || "USER"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                              String(user.status || "").toLowerCase() === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.status || "N/A"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 p-4 lg:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id || user.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">
                          {user.fullName || user.username || "N/A"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {user.email || "N/A"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          String(user.status || "").toLowerCase() === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {user.status || "N/A"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {user.role || "USER"}
                      </span>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
