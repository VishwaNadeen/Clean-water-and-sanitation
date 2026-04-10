export default function EditProfile({
  editForm,
  setEditForm,
  handleEditSave,
  savingModal,
  closeModal,
  inputClass,
  roleOptions,
  statusOptions,
  provinceDistrictMap,
  countryDropdownRef,
  countryOpen,
  setCountryOpen,
  countrySearch,
  setCountrySearch,
  selectedCountry,
  filteredCountries,
  CountryFlag,
  ChevronIcon,
}) {
  const districtOptions = provinceDistrictMap[editForm.baseProvince] || [];

  return (
    <form onSubmit={handleEditSave} className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Personal Information
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">NIC</label>
            <input
              type="text"
              value={editForm.nic}
              onChange={(e) => setEditForm((prev) => ({ ...prev, nic: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Country Code</label>
            <div ref={countryDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen((prev) => !prev)}
                className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CountryFlag src={selectedCountry.flagUrl} alt={`${selectedCountry.name} flag`} />
                  <span className="truncate font-medium text-slate-800">{selectedCountry.dialCode}</span>
                </span>
                <span className="ml-auto text-slate-500">
                  <ChevronIcon />
                </span>
              </button>

              {countryOpen ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 p-3">
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search country"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto p-2">
                    {filteredCountries.map((country) => (
                      <button
                        key={`${country.code}-${country.dialCode}`}
                        type="button"
                        onClick={() => {
                          setEditForm((prev) => ({ ...prev, countryCode: country.dialCode }));
                          setCountryOpen(false);
                          setCountrySearch("");
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <CountryFlag src={country.flagUrl} alt={`${country.name} flag`} />
                          <span className="truncate text-sm text-slate-700">{country.name}</span>
                        </span>
                        <span className="ml-3 text-sm font-medium text-slate-500">{country.dialCode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Gender</label>
            <select
              value={editForm.gender}
              onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select gender</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Date of Birth</label>
            <input
              type="date"
              value={editForm.dob}
              onChange={(e) => setEditForm((prev) => ({ ...prev, dob: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Work Information
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              className={inputClass}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
              className={inputClass}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Base Province</label>
            <select
              value={editForm.baseProvince}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  baseProvince: e.target.value,
                  baseDistrict: "",
                }))
              }
              className={inputClass}
            >
              <option value="">Select province</option>
              {Object.keys(provinceDistrictMap).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Base District</label>
            <select
              value={editForm.baseDistrict}
              onChange={(e) => setEditForm((prev) => ({ ...prev, baseDistrict: e.target.value }))}
              className={inputClass}
              disabled={!editForm.baseProvince}
            >
              <option value="">Select district</option>
              {districtOptions.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Join Date</label>
            <input
              type="date"
              value={editForm.joinDate}
              onChange={(e) => setEditForm((prev) => ({ ...prev, joinDate: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Address
        </p>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Full Address</label>
          <textarea
            rows="4"
            value={editForm.address}
            onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
            className={inputClass}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={savingModal}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
        >
          {savingModal ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={closeModal}
          className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}