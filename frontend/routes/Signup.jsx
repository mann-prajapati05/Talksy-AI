import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
axios.defaults.withCredentials = true;

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    console.log("Signup attempt:", {
      name: formData.fullName,
      gender: formData.gender,
      email: formData.email,
      password: formData.password,
    });

    try {
      const res = await axios.post("http://localhost:8010/auth/signup", {
        name: formData.fullName,
        gender: formData.gender,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      dispatch(setUserData(res.data.user));
    } catch (err) {
      console.log("Error while creating new account..", err);
      dispatch(setUserData(null));
    }
    navigate("/");
    setFormData({
      fullName: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength === 0) return "bg-slate-600";
    if (strength === 1) return "bg-rose-500";
    if (strength === 2) return "bg-indigo-500";
    if (strength === 3) return "bg-violet-500";
    return "bg-cyan-400";
  };

  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength === 0) return "";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
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
            Create Account
          </h1>
          <p className="text-slate-300 text-base">
            Join Talksy and start improving your skills
          </p>
        </div>

        {/* Signup Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-slate-400"
              >
                Full Name
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full rounded-xl border bg-slate-900/40 px-4 py-3 pl-11 font-medium text-slate-100 placeholder:text-slate-500 transition-all duration-300 focus:outline-none ${
                    errors.fullName
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-cyan-400/35"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-2">{errors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="genderMale"
                  className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer transition-all ${
                    formData.gender === "male"
                      ? "border-indigo-400 bg-indigo-500/15"
                      : "border-white/10 hover:border-cyan-300/35 hover:bg-white/5"
                  } ${errors.gender ? "border-red-300" : ""}`}
                >
                  <input
                    type="radio"
                    id="genderMale"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-slate-300 text-indigo-500 focus:ring-cyan-400/35"
                  />
                  <span className="text-sm font-medium text-slate-200">
                    Male
                  </span>
                </label>

                <label
                  htmlFor="genderFemale"
                  className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer transition-all ${
                    formData.gender === "female"
                      ? "border-indigo-400 bg-indigo-500/15"
                      : "border-white/10 hover:border-cyan-300/35 hover:bg-white/5"
                  } ${errors.gender ? "border-red-300" : ""}`}
                >
                  <input
                    type="radio"
                    id="genderFemale"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-slate-300 text-indigo-500 focus:ring-cyan-400/35"
                  />
                  <span className="text-sm font-medium text-slate-200">
                    Female
                  </span>
                </label>
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-2">{errors.gender}</p>
              )}
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-slate-900/40 px-4 py-3 pl-11 font-medium text-slate-100 placeholder:text-slate-500 transition-all duration-300 focus:outline-none ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-cyan-400/35"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
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
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-slate-900/40 px-4 py-3 pl-11 pr-11 font-medium text-slate-100 placeholder:text-slate-500 transition-all duration-300 focus:outline-none ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-cyan-400/35"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 transition-colors hover:text-slate-200"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M15.171 13.576l1.473 1.473a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.014 10.014 0 00.458 10c1.274 4.057 5.065 7 9.542 7 2.181 0 4.322-.665 6.171-1.903z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all ${getStrengthColor()}`}
                        style={{
                          width: `${(getPasswordStrength() / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {getStrengthText()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Use 6+ characters, uppercase, and numbers for a strong
                    password
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.08em] text-slate-400"
              >
                Confirm Password
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
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-slate-900/40 px-4 py-3 pl-11 pr-11 font-medium text-slate-100 placeholder:text-slate-500 transition-all duration-300 focus:outline-none ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : formData.confirmPassword &&
                          formData.password === formData.confirmPassword &&
                          !errors.confirmPassword
                        ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        : "border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-cyan-400/35"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 transition-colors hover:text-slate-200"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M15.171 13.576l1.473 1.473a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.014 10.014 0 00.458 10c1.274 4.057 5.065 7 9.542 7 2.181 0 4.322-.665 6.171-1.903z" />
                    </svg>
                  )}
                </button>

                {/* Checkmark for matching passwords */}
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword &&
                  !errors.confirmPassword && (
                    <div className="absolute right-11 top-3.5 text-green-500">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <input
                type="checkbox"
                id="terms"
                defaultChecked
                className="mt-0.5 h-5 w-5 cursor-pointer rounded border-2 border-slate-400 text-indigo-500 focus:ring-2 focus:ring-cyan-400/35"
              />
              <label
                htmlFor="terms"
                className="cursor-pointer text-sm text-slate-300"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-semibold text-indigo-300 hover:text-cyan-300 hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-semibold text-indigo-300 hover:text-cyan-300 hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(34,211,238,0.28)]"
            >
              Create Account
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

          {/* Login Link Section */}
          <div className="text-center">
            <p className="text-sm text-slate-300">
              Already have an account?{" "}
              <span className="cursor-pointer font-semibold text-indigo-300 transition-colors hover:text-cyan-300">
                Sign in
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Join thousands of professionals already using Talksy to master
          interviews
        </p>
      </div>
    </div>
  );
}
