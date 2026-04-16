import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../src/redux/userSlice";
import { motion } from "framer-motion";
axios.defaults.withCredentials = true;
import { serverUrl } from "../routes/App";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: "", gender: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2) newErrors.fullName = "Name must be at least 2 characters";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/auth/signup`, {
        name: formData.fullName, gender: formData.gender,
        email: formData.email, password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      dispatch(setUserData(res.data.user));
    } catch (err) {
      console.log("Error while creating new account..", err);
      dispatch(setUserData(null));
    }
    setIsLoading(false);
    navigate("/");
    setFormData({ fullName: "", gender: "", email: "", password: "", confirmPassword: "" });
  };

  const getPasswordStrength = () => {
    let s = 0;
    if (formData.password.length >= 8) s++;
    if (/[A-Z]/.test(formData.password)) s++;
    if (/[0-9]/.test(formData.password)) s++;
    if (/[^A-Za-z0-9]/.test(formData.password)) s++;
    return s;
  };

  const strengthConfig = [
    { color: "bg-slate-200", text: "" },
    { color: "bg-red-400", text: "Weak" },
    { color: "bg-amber-400", text: "Fair" },
    { color: "bg-indigo-400", text: "Good" },
    { color: "bg-emerald-400", text: "Strong" },
  ];
  const strength = getPasswordStrength();

  const inputClass = (error) =>
    `w-full rounded-xl border bg-white/80 px-4 py-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:scale-[1.01] ${
      error
        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-md focus:shadow-indigo-100"
    }`;

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-10">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-md">
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <span className="inline-flex rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-600 shadow-sm">✦ TALKSY.AI</span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 text-base">Join Talksy and start improving your skills</p>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <motion.div variants={fadeUp}>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" className={inputClass(errors.fullName)} />
              </div>
              {errors.fullName && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-sm mt-2">{errors.fullName}</motion.p>}
            </motion.div>

            {/* Gender */}
            <motion.div variants={fadeUp}>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: "male", label: "Male" }, { value: "female", label: "Female" }].map((g) => (
                  <motion.label
                    key={g.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    htmlFor={`gender-${g.value}`}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all duration-200 ${
                      formData.gender === g.value
                        ? "border-indigo-500 bg-indigo-50/80 shadow-sm shadow-indigo-100"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    } ${errors.gender ? "border-red-300" : ""}`}
                  >
                    <input type="radio" id={`gender-${g.value}`} name="gender" value={g.value} checked={formData.gender === g.value} onChange={handleInputChange} className="h-4 w-4 border-slate-300 text-indigo-500 focus:ring-indigo-500/20" />
                    <span className="text-sm font-medium text-slate-700">{g.label}</span>
                  </motion.label>
                ))}
              </div>
              {errors.gender && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-sm mt-2">{errors.gender}</motion.p>}
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeUp}>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className={inputClass(errors.email)} />
              </div>
              {errors.email && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-sm mt-2">{errors.email}</motion.p>}
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeUp}>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={`${inputClass(errors.password)} pr-11`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 transition-colors hover:text-slate-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                </button>
              </div>
              {formData.password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(strength / 4) * 100}%` }} transition={{ duration: 0.4 }} className={`h-full rounded-full ${strengthConfig[strength].color}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{strengthConfig[strength].text}</span>
                  </div>
                </motion.div>
              )}
              {errors.password && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-sm mt-2">{errors.password}</motion.p>}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={fadeUp}>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" className={`${inputClass(errors.confirmPassword)} pr-11`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400 transition-colors hover:text-slate-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-11 top-3.5 text-emerald-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </motion.div>
                )}
              </div>
              {errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-sm mt-2">{errors.confirmPassword}</motion.p>}
            </motion.div>

            {/* Terms */}
            <motion.div variants={fadeUp} className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-slate-50/80 p-4">
              <input type="checkbox" id="terms" defaultChecked className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
              <label htmlFor="terms" className="cursor-pointer text-sm text-slate-500">
                I agree to the <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Terms</a> and <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Privacy Policy</a>
              </label>
            </motion.div>

            {/* Submit */}
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200/70 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating...</span>
              ) : "Create Account"}
            </motion.button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/60"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white/70 text-slate-400 backdrop-blur-sm">or</span></div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">Already have an account?{" "}<Link to="/login"><span className="cursor-pointer font-semibold text-indigo-600 transition-colors hover:text-indigo-700">Sign in</span></Link></p>
          </div>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-8 text-center text-xs text-slate-400">
          Join thousands of professionals already using Talksy
        </motion.p>
      </motion.div>
    </div>
  );
}
