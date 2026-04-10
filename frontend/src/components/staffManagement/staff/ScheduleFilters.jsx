import React from "react";

const ScheduleFilters = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  timeFilter,
  setTimeFilter,
  onRefresh,
}) => {
  const timeTabs = ["Today", "This Week", "This Month", "All"];

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Schedules</h2>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your work assignments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {timeTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTimeFilter(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                timeFilter === tab
                  ? "bg-blue-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, task, restroom..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 md:w-80"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Status</option>
            <option value="Assigned">Assigned</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={onRefresh}
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilters;
