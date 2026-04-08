import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);
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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email verification failed.");
      }

      setSuccess("Email verified successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP.");
      }

      setSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(to_bottom_right,_#eff6ff,_#ffffff,_#e0f2fe)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1fr_1.05fr]">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-sky-600 via-blue-700 to-slate-900 p-10 text-white">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium">
                Smart Healthcare
              </div>

              <h1 className="mt-8 text-4xl font-bold leading-tight">
                Verify your email to activate your account.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
                We sent a one-time password to your email address. Enter the code
                below to complete your registration securely.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">Email protection</p>
                <p className="mt-1 text-sm text-blue-100">
                  Helps confirm that the account belongs to the real owner.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">Fast verification</p>
                <p className="mt-1 text-sm text-blue-100">
                  Enter the 6-digit OTP and continue to login.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-xl">
              <div className="lg:hidden">
                <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                  Smart Healthcare
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Email Verification
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter the OTP sent to your email address.
              </p>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerify} className="mt-8 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Enter OTP
                  </label>

                  <div className="flex flex-wrap justify-center gap-3" onPaste={handleOtpPaste}>
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
                        className="h-14 w-12 rounded-2xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendLoading ? "Sending OTP..." : "Resend OTP"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already verified?{" "}
                <Link
                  to="/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Go to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
