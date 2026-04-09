import React from "react";

const SummaryStatCard = ({ title, value, subtitle }) => {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-blue-600">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
};

export default SummaryStatCard;