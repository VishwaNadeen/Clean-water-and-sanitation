import {
  getPhoneMaxLengthByCountry,
  normalizeAddressInput,
  normalizeNicInput,
  normalizePhoneForCountry,
  validateAddressTyping,
  validateFullNameTyping,
  validateNic,
  validatePhone,
} from "../../../utils/staffFormValidation";

function CountryFlag({ src, alt }) {
  if (!src) {
    return (
      <span className="grid h-5 w-7 place-items-center rounded-[6px] bg-slate-200 text-[10px] font-bold text-slate-500">
        --
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-5 w-7 rounded-[6px] border border-slate-200 object-cover shadow-sm"
      loading="lazy"
    />
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7 5 5 5-5" />
    </svg>
  );
}

export default function EditProfile({
  editForm,
  setEditForm,
  editErrors,
  setEditErrors,
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
}) {
  const districtOptions = provinceDistrictMap[editForm.baseProvince] || [];
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleEditSave} className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Personal Information
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) => {
                const sanitizedName = e.target.value.replace(/[^A-Za-z\s]/g, "");
                const isInvalidTyped = sanitizedName !== e.target.value;
                setEditForm((prev) => ({ ...prev, fullName: sanitizedName }));
                setEditErrors((prev) => ({
                  ...prev,
                  fullName: isInvalidTyped
                    ? "Full name can contain letters and spaces only"
                    : validateFullNameTyping(sanitizedName),
                }));
              }}
              className={inputClass}
            />
            {editErrors.fullName ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.fullName}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              NIC
            </label>
            <input
              type="text"
              value={editForm.nic}
              onChange={(e) => {
                const sanitizedNic = normalizeNicInput(e.target.value);
                const isInvalidTyped =
                  e.target.value.toUpperCase().replace(/\s/g, "") !== sanitizedNic;
                const nicError = isInvalidTyped
                  ? "NIC allows only digits and optional V/X (old) or 12 digits (new)"
                  : sanitizedNic
                  ? validateNic(sanitizedNic)
                  : "";
                setEditForm((prev) => ({
                  ...prev,
                  nic: sanitizedNic,
                }));
                setEditErrors((prev) => ({
                  ...prev,
                  nic: nicError,
                }));
              }}
              maxLength={12}
              className={inputClass}
            />
            {editErrors.nic ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.nic}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              readOnly
              disabled
              className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
            />
            <p className="mt-2 text-xs text-slate-500">Email cannot be edited.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Country Code
            </label>
            <div ref={countryDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen((prev) => !prev)}
                className="flex w-full items-center rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-sm shadow-sm outline-none transition hover:border-blue-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CountryFlag
                    src={selectedCountry.flagUrl}
                    alt={`${selectedCountry.name} flag`}
                  />
                  <span className="truncate font-medium text-slate-800">
                    {selectedCountry.dialCode}
                  </span>
                </span>
                <span className="ml-auto text-slate-500">
                  <ChevronIcon />
                </span>
              </button>

              {countryOpen ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl">
                  <div className="border-b border-blue-100 p-3">
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search country"
                      className="w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-300 focus:bg-white"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto p-2">
                    {filteredCountries.map((country) => (
                      <button
                        key={`${country.code}-${country.dialCode}`}
                        type="button"
                        onClick={() => {
                          const normalizedPhone = normalizePhoneForCountry(
                            country.dialCode,
                            editForm.phone
                          );
                          const phoneError = normalizedPhone
                            ? validatePhone(country.dialCode, normalizedPhone)
                            : "";
                          setEditForm((prev) => ({
                            ...prev,
                            countryCode: country.dialCode,
                            phone: normalizedPhone,
                          }));
                          setEditErrors((prev) => ({
                            ...prev,
                            countryCode: "",
                            phone: phoneError,
                          }));
                          setCountryOpen(false);
                          setCountrySearch("");
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-blue-50"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <CountryFlag
                            src={country.flagUrl}
                            alt={`${country.name} flag`}
                          />
                          <span className="truncate text-sm text-slate-700">
                            {country.name}
                          </span>
                        </span>
                        <span className="ml-3 text-sm font-medium text-slate-500">
                          {country.dialCode}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => {
                const normalizedPhone = normalizePhoneForCountry(
                  editForm.countryCode,
                  e.target.value
                );
                const phoneError = normalizedPhone
                  ? validatePhone(editForm.countryCode, normalizedPhone)
                  : "";
                setEditForm((prev) => ({
                  ...prev,
                  phone: normalizedPhone,
                }));
                setEditErrors((prev) => ({ ...prev, phone: phoneError }));
              }}
              inputMode="numeric"
              maxLength={getPhoneMaxLengthByCountry(editForm.countryCode)}
              className={inputClass}
            />
            {editErrors.phone ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.phone}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Gender
            </label>
            <select
              value={editForm.gender}
              onChange={(e) => {
                setEditForm((prev) => ({ ...prev, gender: e.target.value }));
                setEditErrors((prev) => ({ ...prev, gender: "" }));
              }}
              className={inputClass}
            >
              <option value="">Select gender</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
            {editErrors.gender ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.gender}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date of Birth
            </label>
            <input
              type="date"
              value={editForm.dob}
              readOnly
              disabled
              className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
            />
            <p className="mt-2 text-xs text-slate-500">Date of birth cannot be edited.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Work Information
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              value={editForm.role}
              onChange={(e) => {
                setEditForm((prev) => ({ ...prev, role: e.target.value }));
                setEditErrors((prev) => ({ ...prev, role: "" }));
              }}
              className={inputClass}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {editErrors.role ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.role}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) => {
                setEditForm((prev) => ({ ...prev, status: e.target.value }));
                setEditErrors((prev) => ({ ...prev, status: "" }));
              }}
              className={inputClass}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {editErrors.status ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.status}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Base Province
            </label>
            <select
              value={editForm.baseProvince}
              onChange={(e) => {
                setEditForm((prev) => ({
                  ...prev,
                  baseProvince: e.target.value,
                  baseDistrict: "",
                }));
                setEditErrors((prev) => ({ ...prev, baseProvince: "", baseDistrict: "" }));
              }}
              className={inputClass}
            >
              <option value="">Select province</option>
              {Object.keys(provinceDistrictMap).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {editErrors.baseProvince ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.baseProvince}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Base District
            </label>
            <select
              value={editForm.baseDistrict}
              onChange={(e) => {
                setEditForm((prev) => ({ ...prev, baseDistrict: e.target.value }));
                setEditErrors((prev) => ({ ...prev, baseDistrict: "" }));
              }}
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
            {editErrors.baseDistrict ? (
              <p className="mt-1 text-xs text-rose-600">{editErrors.baseDistrict}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Join Date
            </label>
            <input
              type="date"
              value={editForm.joinDate}
              readOnly
              disabled
              className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
            />
            <p className="mt-2 text-xs text-slate-500">Join date cannot be edited.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Address
        </p>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Full Address
          </label>
          <textarea
            rows="4"
            value={editForm.address}
            onChange={(e) => {
              const normalizedAddress = normalizeAddressInput(e.target.value);
              const addressError =
                normalizedAddress !== e.target.value
                  ? "Address contains unsupported characters"
                  : validateAddressTyping(e.target.value);
              setEditForm((prev) => ({ ...prev, address: normalizedAddress }));
              setEditErrors((prev) => ({ ...prev, address: addressError }));
            }}
            className={inputClass}
          />
          {editErrors.address ? (
            <p className="mt-1 text-xs text-rose-600">{editErrors.address}</p>
          ) : null}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={savingModal}
          className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {savingModal ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={closeModal}
          className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
