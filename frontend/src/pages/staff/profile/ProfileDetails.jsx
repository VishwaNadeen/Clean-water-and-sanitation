export default function DetailsProfile({
  staff,
  phoneLabel,
  locationLabel,
  formatDate,
  DetailCard,
}) {
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

      <div className="mt-6 space-y-4">
        <DetailCard label="Phone Number" value={phoneLabel} />
        <DetailCard label="Gender" value={staff.gender || "-"} />
        <DetailCard label="Base Location" value={locationLabel || "-"} />
        <DetailCard label="Date of Birth" value={formatDate(staff.dob)} />
        <DetailCard label="Address" value={staff.address || "-"} />
      </div>
    </section>
  );
}