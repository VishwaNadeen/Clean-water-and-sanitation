import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";

/* ── Restroom icon ─────────────────────────────────────── */
function RestroomIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-8 w-8"
      stroke="#0369a1"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="14" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M14 13v9M14 22l-4 7M14 22l4 7M10 16h8" />
      <circle cx="34" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M34 13v5" />
      <path d="M28 18h12l-2 11h-8l-2-11Z" fill="rgba(3,105,161,0.15)" />
      <path d="M34 29v6" />
      <line x1="24" y1="4" x2="24" y2="38" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

const labelClass =
  "block mb-1.5 text-xs font-semibold text-sky-800 tracking-wide uppercase";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";
  const [email] = useState(emailFromState);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!emailFromState) {
      setError("Email not found. Please register again.");
    }
  }, [emailFromState]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    setSuccess("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const otpCode = otp.join("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email verification failed.");
      setSuccess("Email verified successfully. Redirecting to login…");
      setTimeout(() => navigate("/auth/login"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Email is required to resend OTP.");
      return;
    }
    try {
      setResendLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/resend-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP.");
      setSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Glass card ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-sky-200/70 rounded-3xl shadow-xl shadow-sky-100/40">

          {/* Card header */}
          <div className="bg-white/90 backdrop-blur-md border-b border-sky-100 rounded-t-3xl px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100/80 border border-sky-200">
                <RestroomIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-sky-900 leading-tight">
                  Email Verification
                </h2>
                <p className="mt-0.5 text-xs text-sky-400">
                  Enter the OTP sent to your email address
                </p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="px-8 py-8 space-y-6">

            {/* Error banner */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l4 4 6-7" />
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleVerify} noValidate className="space-y-6">

              {/* Email (read-only) */}
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-3 pr-12 text-sm text-sky-700 outline-none cursor-not-allowed select-none"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100/60 text-sky-400">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2.5" y="7" width="11" height="8" rx="1.5" />
                        <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* OTP inputs */}
              <div>
                <label className={labelClass}>Enter 6-digit OTP</label>
                <p className="mb-4 text-[11.5px] text-sky-500">
                  Check your inbox — the code expires in 10 minutes. You can paste it directly.
                </p>

                <div
                  className="flex justify-center gap-2 sm:gap-3"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`h-14 w-11 sm:w-12 rounded-xl border text-center text-xl font-bold text-sky-900 outline-none transition-all duration-150 focus:ring-4 focus:ring-sky-100 ${
                        digit
                          ? "border-sky-400 bg-sky-50 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]"
                          : "border-sky-200 bg-sky-50/70 focus:border-sky-400 focus:bg-white"
                      }`}
                    />
                  ))}
                </div>

                {/* Progress bars */}
                <div className="mt-4 flex justify-center gap-1.5">
                  {otp.map((digit, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-all duration-200 ${
                        digit ? "bg-sky-400" : "bg-sky-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8l4 4 6-7" />
                    </svg>
                    Verify Email
                  </span>
                )}
              </button>

              {/* Resend button */}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Sending OTP…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.5 2.5l-19 19M21.5 2.5L14 21.5l-3.5-7.5L3 10.5l18.5-8z" />
                    </svg>
                    Resend OTP
                  </span>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-sky-100" />
              <span className="text-xs text-sky-300">or</span>
              <div className="flex-1 h-px bg-sky-100" />
            </div>

            {/* Login link */}
            <div className="flex items-center justify-center gap-1.5 text-sm text-sky-600">
              <span>Already verified?</span>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 underline underline-offset-2 decoration-sky-300 hover:decoration-sky-500 transition"
              >
                Go to login
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}