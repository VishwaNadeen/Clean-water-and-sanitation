const sriLankaNicRegex = /^(?:\d{9}[VvXx]|\d{12})$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const countryCodeRegex = /^\+\d{1,4}$/;
const fullNameRegex = /^[A-Za-z\s]+$/;

function isFutureDate(value) {
  const date = new Date(value);
  const now = new Date();
  if (Number.isNaN(date.getTime())) return false;
  return date > now;
}

function isPastDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const inputDay = new Date(date);
  inputDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDay < today;
}

export function sanitizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

export function normalizeNicInput(value) {
  const raw = String(value || "").toUpperCase().replace(/\s/g, "");
  const digits = raw.replace(/\D/g, "");
  const letterMatch = raw.match(/[VX]/);

  if (letterMatch) {
    return `${digits.slice(0, 9)}${letterMatch[0]}`;
  }

  return digits.slice(0, 12);
}

export function validateFullNameTyping(value) {
  const fullName = String(value || "");
  if (!fullName) return "";
  if (!fullNameRegex.test(fullName)) {
    return "Full name can contain letters and spaces only";
  }
  return "";
}

export function normalizeEmailInput(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[^a-z0-9@._+-]/g, "");
}

export function validateEmailTyping(rawValue) {
  const raw = String(rawValue || "");
  if (!raw) return "";
  const normalized = normalizeEmailInput(raw);
  if (normalized !== raw) {
    return "Email can contain letters, numbers, and @ . _ + - only";
  }
  return "";
}

export function normalizeAddressInput(value) {
  return String(value || "").replace(/[^A-Za-z0-9\s,./#-]/g, "");
}

export function splitAddressLines(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return { addressLine1: "", addressLine2: "" };
  }

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      addressLine1: parts[0],
      addressLine2: parts.slice(1).join(", "),
    };
  }

  return {
    addressLine1: normalized,
    addressLine2: "",
  };
}

export function combineAddressLines(addressLine1, addressLine2) {
  return [addressLine1, addressLine2]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");
}

export function validateAddressTyping(rawValue) {
  const raw = String(rawValue || "");
  if (!raw) return "";
  const normalized = normalizeAddressInput(raw);
  if (normalized !== raw) {
    return "Address contains unsupported characters";
  }
  return "";
}

export function getPhoneMaxLengthByCountry(countryCode) {
  const code = String(countryCode || "").trim();
  return code === "+94" ? 9 : 15;
}

export function normalizePhoneForCountry(countryCode, phone) {
  const digits = sanitizePhone(phone);
  const maxLength = getPhoneMaxLengthByCountry(countryCode);
  return digits.slice(0, maxLength);
}

export function validatePhone(countryCode, phone) {
  const code = String(countryCode || "").trim();
  const digits = sanitizePhone(phone);

  if (!digits) return "Phone number is required";

  if (code === "+94") {
    if (!/^\d{9}$/.test(digits)) {
      return "Sri Lanka phone number must be exactly 9 digits with +94";
    }
    return "";
  }

  if (digits.length < 6 || digits.length > 15) {
    return "Phone number must be 6 to 15 digits";
  }

  return "";
}

export function validateNic(value) {
  const nic = String(value || "").trim();
  if (!nic) return "NIC is required";
  if (!sriLankaNicRegex.test(nic)) {
    return "NIC must be old format (123456789V) or new format (12 digits)";
  }
  return "";
}

export function validateFullName(value) {
  const fullName = String(value || "").trim();
  if (!fullName) return "Full name is required";
  if (fullName.length < 2) return "Full name is too short";
  if (!fullNameRegex.test(fullName)) {
    return "Full name can contain letters and spaces only";
  }
  return "";
}

export function validateStaffForm(
  data,
  { requireEmail = true, validateJoinDate = true } = {}
) {
  const errors = {};

  const fullNameError = validateFullName(data.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const nicError = validateNic(data.nic);
  if (nicError) errors.nic = nicError;

  if (!String(data.countryCode || "").trim()) {
    errors.countryCode = "Country code is required";
  } else if (!countryCodeRegex.test(String(data.countryCode).trim())) {
    errors.countryCode = "Country code must be like +94";
  }

  const phoneError = validatePhone(data.countryCode, data.phone);
  if (phoneError) errors.phone = phoneError;

  if (requireEmail) {
    if (!String(data.email || "").trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(String(data.email).trim().toLowerCase())) {
      errors.email = "Enter a valid email address";
    }
  }

  if (!String(data.role || "").trim()) errors.role = "Role is required";
  if (!String(data.gender || "").trim()) errors.gender = "Gender is required";
  if (!String(data.status || "").trim()) errors.status = "Status is required";
  if (!String(data.baseProvince || "").trim()) errors.baseProvince = "Province is required";
  if (!String(data.baseDistrict || "").trim()) errors.baseDistrict = "District is required";

  if (Object.prototype.hasOwnProperty.call(data, "addressLine1")) {
    if (!String(data.addressLine1 || "").trim()) {
      errors.addressLine1 = "Address Line 1 is required";
    }
  } else if (!String(data.address || "").trim()) {
    errors.address = "Address is required";
  }

  if (!String(data.dob || "").trim()) {
    errors.dob = "Date of birth is required";
  } else if (Number.isNaN(new Date(data.dob).getTime())) {
    errors.dob = "Invalid date of birth";
  } else if (isFutureDate(data.dob)) {
    errors.dob = "Date of birth cannot be in the future";
  }

  if (validateJoinDate && String(data.joinDate || "").trim()) {
    if (Number.isNaN(new Date(data.joinDate).getTime())) {
      errors.joinDate = "Invalid join date";
    } else if (isPastDate(data.joinDate)) {
      errors.joinDate = "Join date cannot be in the past";
    }
  }

  return errors;
}
