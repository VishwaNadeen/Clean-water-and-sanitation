export default function DetailsProfile({
  staff,
  phoneLabel,
  locationLabel,
  formatDate,
}) {
  const detailItems = [
    { label: "Phone Number", value: phoneLabel },
    { label: "Gender", value: staff.gender || "-" },
    { label: "Base Location", value: locationLabel || "-" },
    { label: "Date of Birth", value: formatDate(staff.dob) },
    { label: "Address", value: staff.address || "-", fullWidth: true },
  ];

  return (
    <section className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
        Staff Details
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">
        Work and contact information
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        This section is tailored for staff accounts and includes role, assigned
        base area, and work identity details.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {detailItems.map((item) => (
          <div key={item.label} className={item.fullWidth ? "md:col-span-2" : ""}>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {item.value || "-"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
