import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../src/utils/firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../src/redux/userSlice";
import { motion } from "framer-motion";
import { serverUrl } from "../routes/App";
import {
  applySessionAuthHeader,
  clearSessionToken,
  setSessionToken,
} from "../src/utils/authSession";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/auth/login`, {
        email,
        password,
      });
      setSessionToken(res.data?.token);
      applySessionAuthHeader(res.data?.token);
      dispatch(setUserData(res.data.user));
      navigate("/");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.log("error while login : ", err);
      clearSessionToken();
      applySessionAuthHeader("");
      dispatch(setUserData(null));
      setErrors((prev) => ({
        ...prev,
        form: err?.response?.data?.message || "Login failed. Please try again.",
      }));
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await axios.post(`${serverUrl}/auth/google`, {
        name: result.user.displayName,
        email: result.user.email,
      });
      setSessionToken(res.data?.token);
      applySessionAuthHeader(res.data?.token);
      dispatch(setUserData(res.data.user));
      navigate("/");
    } catch (err) {
      console.log("error while google login : ", err);
      clearSessionToken();
      applySessionAuthHeader("");
      dispatch(setUserData(null));
      setErrors((prev) => ({
        ...prev,
        form:
          err?.response?.data?.message ||
          "Google login failed. Please try again.",
      }));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <span className="inline-flex rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-600 shadow-sm">
            ✦ TALKSY.AI
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-base">
            Sign in to your Talksy account
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          variants={fadeUp}
          className="glass-card rounded-2xl p-8 shadow-xl shadow-slate-200/50"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div variants={fadeUp}>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
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
                  className={`w-full rounded-xl border bg-white/80 px-4 py-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:scale-[1.01] ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-md focus:shadow-indigo-100"
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-2"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={fadeUp}>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
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
                  className={`w-full rounded-xl border bg-white/80 px-4 py-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:scale-[1.01] ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-md focus:shadow-indigo-100"
                  }`}
                />
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-2"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200/70 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
            {errors.form && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm text-center"
              >
                {errors.form}
              </motion.p>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/60"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/70 text-slate-400 backdrop-blur-sm">
                or
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.92h5.45c-.24 1.26-.95 2.33-2.01 3.05l3.25 2.52c1.89-1.74 2.98-4.29 2.98-7.31 0-.72-.06-1.41-.19-2.09H12z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.25-2.52c-.9.6-2.05.96-3.36.96-2.58 0-4.77-1.74-5.55-4.08H3.1v2.57A9.99 9.99 0 0012 22z"
              />
              <path
                fill="#4A90E2"
                d="M6.45 13.92A5.98 5.98 0 016.12 12c0-.67.12-1.31.33-1.92V7.51H3.1A9.99 9.99 0 002 12c0 1.61.39 3.13 1.1 4.49l3.35-2.57z"
              />
              <path
                fill="#FBBC05"
                d="M12 5.95c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.94 14.69 2 12 2A9.99 9.99 0 003.1 7.51l3.35 2.57C7.23 7.74 9.42 5.95 12 5.95z"
              />
            </svg>
            Continue with Google
          </motion.button>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link to="/signup">
                <span className="cursor-pointer font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
                  Create an account
                </span>
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mt-8 text-center text-xs text-slate-400"
        >
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Privacy Policy
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
