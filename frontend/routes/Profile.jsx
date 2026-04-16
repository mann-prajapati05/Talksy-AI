import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../src/redux/userSlice";
import axios from "axios";
import { serverUrl } from "../routes/App";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } },
};

const panelVariants = {
  hidden: { x: "100%", opacity: 0.98 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } },
  exit: { x: "100%", opacity: 0.98, transition: { duration: 0.25, ease: "easeInOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.04, duration: 0.3, ease: "easeOut" } }),
};

const Profile = ({ isOpen = false, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userData);
  const userCredits = Number(userData?.credits ?? 0);

  const { initials, completion } = useMemo(() => {
    const rawName = userData?.name?.trim() || "";
    const letters = rawName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    const fields = [userData?.name, userData?.email, userData?.gender, userData?.profilePicture];
    const filledCount = fields.filter((f) => String(f || "").trim() !== "").length;
    return { initials: letters || "U", completion: Math.round((filledCount / fields.length) * 100) };
  }, [userData]);

  const handleLogout = async () => {
    await axios.get(`${serverUrl}/auth/logout`, { withCredentials: true });
    dispatch(setUserData(null));
    navigate("/login");
  };

  const handleOpenHistory = () => { onClose(); navigate("/interview-history"); };
  const handleBuyCredits = () => { onClose(); navigate("/pricing"); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-80 bg-black/20 backdrop-blur-sm"
          variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={onClose}
        >
          <motion.aside
            className="ml-auto flex h-full w-full max-w-100 flex-col border-l border-slate-200/60 bg-white/90 shadow-2xl backdrop-blur-xl"
            variants={panelVariants} initial="hidden" animate="visible" exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Profile</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button" onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-600"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </motion.button>
              </div>

              <div className="mt-6 flex-1 overflow-y-auto pr-1 space-y-5">
                {/* Avatar & Info */}
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible" className="rounded-xl border border-slate-200/60 bg-white/80 p-5 backdrop-blur-sm shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    {userData?.profilePicture ? (
                      <img src={userData.profilePicture} alt="Profile" className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg ring-2 ring-indigo-100" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white shadow-lg ring-2 ring-white">{initials}</div>
                    )}

                    <div className="mt-5 w-full space-y-3 text-left">
                      {[
                        { label: "Name", value: userData?.name },
                        { label: "Email", value: userData?.email, breakAll: true },
                        { label: "Gender", value: userData?.gender, capitalize: true },
                      ].map((field, i) => (
                        <motion.div key={field.label} custom={i + 1} variants={itemVariants} initial="hidden" animate="visible"
                          className="rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-3">
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{field.label}</p>
                          <p className={`mt-1 text-sm font-medium text-slate-900 ${field.breakAll ? "break-all" : ""} ${field.capitalize ? "capitalize" : ""}`}>
                            {field.value || "Not provided"}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Credits */}
                {userData && (
                  <motion.article custom={4} variants={itemVariants} initial="hidden" animate="visible"
                    className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/50 p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-indigo-500">Available Credits</p>
                    <p className="mt-2 text-3xl font-bold leading-none text-indigo-700">{userCredits}</p>
                    <p className="mt-2 text-xs text-slate-500">Use credits for interviews</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleBuyCredits}
                      className="mt-3 w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg">
                      Buy Credits
                    </motion.button>
                  </motion.article>
                )}

                {/* History Link */}
                <motion.button custom={5} variants={itemVariants} initial="hidden" animate="visible"
                  whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                  type="button" onClick={handleOpenHistory}
                  className="gradient-border group flex w-full items-center justify-between rounded-xl bg-white/80 px-4 py-4 text-left shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 ring-1 ring-indigo-100 transition-transform duration-200 group-hover:scale-110">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Interview History</p>
                      <p className="mt-0.5 text-xs text-slate-400">View reports and archives</p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-indigo-400" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.button>

                {/* Stats */}
                <motion.div custom={6} variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Completion", value: `${completion}%` },
                    { label: "Sessions", value: "0" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
                      <p className="mt-1 text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{stat.value}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="mt-4 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="button" onClick={handleLogout}
                  className="w-full rounded-xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition-all duration-200 hover:bg-red-100 hover:shadow-md">
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Profile;
