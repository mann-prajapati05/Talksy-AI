import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({ ...errors, email: "" });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors({ ...errors, password: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Login attempt:", { email, password });
    try {
      await axios.post("http://localhost:8010/auth/login", { email, password });
    } catch (err) {
      console.log("error while login : ", err);
    }
    navigate("/");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl"></div>
      <div className="pointer-events-none absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1 text-xs font-medium tracking-[0.08em] text-cyan-200">
            TALKSY.AI
          </span>
          <h1 className="mt-4 text-4xl font-semibold text-slate-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-300 text-base">
            Sign in to your Talksy account
          </p>
        </div>

        {/* Login Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-slate-400"
              >
                Email Address
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-slate-900/40 px-4 py-3 pl-11 font-medium text-slate-100 placeholder:text-slate-500 transition-all duration-300 focus:outline-none ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-cyan-400/35"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-2.687-2.687a1 1 0 00-1.414 1.414l4.1 4.1a1 1 0 001.414 0l8.1-8.1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-slate-400"
              >
                Password
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-slate-900/40 px-4 py-3 pl-11 font-medium text-slate-100 placeholder:text-slate-500 transition-all duration-300 focus:outline-none ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-cyan-400/35"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-2.687-2.687a1 1 0 00-1.414 1.414l4.1 4.1a1 1 0 001.414 0l8.1-8.1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm font-medium text-indigo-300 transition-colors hover:text-cyan-300"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(34,211,238,0.28)]"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/30 text-slate-500">or</span>
            </div>
          </div>

          {/* Signup Link Section */}
          <div className="text-center">
            <p className="text-slate-300 text-sm">
              Don't have an account?{" "}
              <Link to="/signup">
                <span className="cursor-pointer font-semibold text-indigo-300 transition-colors hover:text-cyan-300">
                  Create an account
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="text-indigo-300 hover:text-cyan-300 hover:underline"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-indigo-300 hover:text-cyan-300 hover:underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
