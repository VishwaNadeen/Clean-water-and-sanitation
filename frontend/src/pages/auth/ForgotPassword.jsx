import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
} from "../../services/authService";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v6c0 4.5-2.9 7.9-7 9-4.1-1.1-7-4.5-7-9V6l7-3z" />
      <path d="m9.5 12 1.7 1.7L14.8 10" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.7 10s3-5 8.3-5 8.3 5 8.3 5-3 5-8.3 5-8.3-5-8.3-5Z" />
      <circle cx="10" cy="10" r="2.4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 2l16 16" />
      <path d="M8.8 4.9A9.8 9.8 0 0 1 10 4.8c5.3 0 8.3 5.2 8.3 5.2a13.7 13.7 0 0 1-2.8 3.4" />
      <path d="M5.2 5.3A14.3 14.3 0 0 0 1.7 10s3 5.2 8.3 5.2a8.9 8.9 0 0 0 3-.5" />
      <path d="M8.6 8.6A2 2 0 0 0 8 10a2 2 0 0 0 2 2c.5 0 1-.2 1.4-.6" />
    </svg>
  );
}

const initialForm = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
    setSuccessMessage("");
  }

  function validateEmailStep() {
    const nextErrors = {};
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }
    return nextErrors;
  }

  function validateOtpStep() {
    const nextErrors = {};
    if (!formData.otp.trim()) {
      nextErrors.otp = "OTP is required.";
    } else if (!/^\d{6}$/.test(formData.otp.trim())) {
      nextErrors.otp = "OTP must be 6 digits.";
    }
    return nextErrors;
  }

  function validateResetStep() {
    const nextErrors = {};

    if (!formData.newPassword.trim()) {
      nextErrors.newPassword = "New password is required.";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your password.";
    }

    if (
      formData.newPassword.trim() &&
      formData.confirmPassword.trim() &&
      formData.newPassword !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    const validationErrors = validateEmailStep();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");
      setSuccessMessage("");

      const data = await requestPasswordResetOtp(formData.email.trim().toLowerCase());

      setSuccessMessage(data?.message || "OTP sent successfully.");
      setStep(2);
    } catch (error) {
      setSubmitError(error.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    const validationErrors = validateOtpStep();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setVerifyingOtp(true);
      setSubmitError("");
      setSuccessMessage("");

      const data = await verifyPasswordResetOtp({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
      });

      setSuccessMessage(data?.message || "OTP verified successfully.");
      setStep(3);
    } catch (error) {
      setSubmitError(error.message || "OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    const validationErrors = validateResetStep();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setResettingPassword(true);
      setSubmitError("");
      setSuccessMessage("");

      const data = await resetPasswordWithOtp({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: data?.message || "Password reset successful. Please log in.",
        },
      });
    } catch (error) {
      setSubmitError(error.message || "Password reset failed.");
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleResendOtp() {
    try {
      setLoading(true);
      setSubmitError("");
      setSuccessMessage("");

      const data = await requestPasswordResetOtp(formData.email.trim().toLowerCase());

      setSuccessMessage(data?.message || "OTP resent successfully.");
      if (step < 2) setStep(2);
    } catch (error) {
      setSubmitError(error.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200 px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div className="hidden md:flex flex-col">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100/70 text-sky-700">
            <ShieldIcon />
          </div>

          <h1 className="text-4xl font-bold leading-tight text-sky-900">
            Reset your password securely
          </h1>

          <p className="mt-4 max-w-sm text-[15px] leading-7 text-sky-700">
            Enter your account email, verify the OTP sent to your inbox, and set
            a new password to access your account again.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80 text-sky-700">
                <MailIcon />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-900">Step 1</p>
                <p className="text-xs leading-relaxed text-sky-600">
                  Send a password reset OTP to your email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80 text-sky-700">
                <ShieldIcon />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-900">Step 2</p>
                <p className="text-xs leading-relaxed text-sky-600">
                  Verify your 6-digit OTP.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80 text-sky-700">
                <LockIcon />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-900">Step 3</p>
                <p className="text-xs leading-relaxed text-sky-600">
                  Set your new password and return to login.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-sky-200/70 bg-white/75 p-8 shadow-xl shadow-sky-100/40 backdrop-blur-xl">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100/80 text-sky-700">
              {step === 1 ? <MailIcon /> : step === 2 ? <ShieldIcon /> : <LockIcon />}
            </div>

            <h2 className="text-2xl font-bold text-sky-900">
              {step === 1 && "Forgot password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Create new password"}
            </h2>

            <p className="mt-1 text-sm text-sky-500">
              {step === 1 && "Enter your email to receive a reset OTP"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Choose a new password for your account"}
            </p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`h-2.5 rounded-full transition-all ${
                  item === step
                    ? "w-10 bg-sky-500"
                    : item < step
                    ? "w-8 bg-sky-300"
                    : "w-8 bg-sky-100"
                }`}
              />
            ))}
          </div>

          {successMessage && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {submitError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} noValidate className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-800">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 outline-none transition placeholder:text-sky-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send reset OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-800">
                  Email address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-xl border border-sky-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-800">
                  OTP code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm tracking-[0.3em] text-sky-900 outline-none transition placeholder:tracking-normal placeholder:text-sky-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
                {errors.otp && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.otp}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifyingOtp ? "Verifying OTP..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} noValidate className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-800">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 pr-12 text-sm text-sky-900 outline-none transition placeholder:text-sky-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex h-full w-8 items-center justify-center text-sky-400 transition hover:text-sky-600"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80">
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-800">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 pr-12 text-sm text-sky-900 outline-none transition placeholder:text-sky-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex h-full w-8 items-center justify-center text-sky-400 transition hover:text-sky-600"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80">
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={resettingPassword}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resettingPassword ? "Resetting password..." : "Reset password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-sky-600 transition hover:text-sky-800 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}