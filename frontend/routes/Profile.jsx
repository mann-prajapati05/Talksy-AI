import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../src/redux/userSlice";
import axios from "axios";
import { serverUrl } from "../routes/App";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: "easeInOut" } },
};

const panelVariants = {
  hidden: { x: "100%", opacity: 0.98, scale: 0.985 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.36, ease: "easeInOut" },
  },
  exit: {
    x: "100%",
    opacity: 0.98,
    scale: 0.99,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const Profile = ({ isOpen = false, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userData);
  const userCredits = Number(userData?.credits ?? 0);

  const { initials, completion } = useMemo(() => {
    const rawName = userData?.name?.trim() || "";
    const letters = rawName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    const fields = [
      userData?.name,
      userData?.email,
      userData?.gender,
      userData?.profilePicture,
    ];
    const filledCount = fields.filter(
      (field) => String(field || "").trim() !== "",
    ).length;

    return {
      initials: letters || "U",
      completion: Math.round((filledCount / fields.length) * 100),
    };
  }, [userData]);

  const handleLogout = async () => {
    await axios.get(`${serverUrl}/auth/logout`, {
      withCredentials: true,
    });
    dispatch(setUserData(null));
    navigate("/login");
  };

  const handleOpenHistory = () => {
    onClose();
    navigate("/interview-history");
  };
  const handleBuyCredits = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-80 bg-black/40 backdrop-blur-[2px]"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.aside
            className="ml-auto flex h-full w-full max-w-100 flex-col overflow-hidden rounded-l-2xl border-l border-white/10 bg-linear-to-b from-slate-900 to-slate-800 shadow-[-24px_0_60px_rgba(2,6,23,0.6)]"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex h-full flex-col bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <div className="pointer-events-none absolute -top-12 -right-8 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl"></div>
              <div className="pointer-events-none absolute top-1/3 -left-14 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl"></div>

              <div className="relative z-10 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">
                  Profile
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition-all duration-300 hover:rotate-90 hover:border-cyan-300/45 hover:bg-white/10 hover:text-white"
                  aria-label="Close profile panel"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative z-10 mt-6 flex-1 overflow-y-auto pr-1">
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                  <div className="flex flex-col items-center text-center">
                    {userData?.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={`${userData?.name || "User"} profile`}
                        className="h-24 w-24 rounded-full border-2 border-white/30 object-cover shadow-[0_10px_26px_rgba(6,182,212,0.25)]"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-300/45 bg-linear-to-br from-indigo-600 to-violet-600 text-3xl font-semibold text-white shadow-[0_10px_26px_rgba(99,102,241,0.35)]">
                        {initials}
                      </div>
                    )}

                    <div className="mt-5 w-full space-y-3 text-left">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                          Name
                        </p>
                        <p className="mt-1 text-base font-medium text-slate-100">
                          {userData?.name || "Not provided"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                          Email
                        </p>
                        <p className="mt-1 break-all text-sm font-medium text-slate-100">
                          {userData?.email || "Not provided"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                          Gender
                        </p>
                        <p className="mt-1 text-sm font-medium capitalize text-slate-100">
                          {userData?.gender || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="my-5 h-px w-full bg-white/10"></div>

                  {userData && (
                    <article className="mb-5 rounded-xl border border-cyan-300/20 bg-white/5 p-4 shadow-[0_10px_30px_rgba(34,211,238,0.12)] backdrop-blur-md">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-cyan-200/80">
                        Available Credits
                      </p>
                      <p className="mt-2 text-3xl font-semibold leading-none text-cyan-200">
                        {userCredits}
                      </p>
                      <p className="mt-2 text-xs text-slate-300">
                        Use credits for interviews
                      </p>
                      <button
                        type="button"
                        onClick={handleBuyCredits}
                        className="mt-3 w-full rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition-all duration-300 hover:scale-[1.01] hover:border-cyan-200/50 hover:bg-cyan-400/15 hover:shadow-[0_12px_26px_rgba(34,211,238,0.2)]"
                      >
                        Buy Credits
                      </button>
                    </article>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenHistory}
                    className="group mb-5 flex w-full items-center justify-between rounded-2xl border border-cyan-300/20 bg-linear-to-r from-cyan-400/10 via-white/5 to-indigo-500/10 px-4 py-4 text-left transition-all duration-300 hover:border-cyan-200/40 hover:shadow-[0_14px_34px_rgba(6,182,212,0.16)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 transition-transform duration-300 group-hover:scale-105">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          Interview History
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-300">
                          Open your reports and session archive
                        </p>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-cyan-200 transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14m0 0-6-6m6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
                        Completion
                      </p>
                      <p className="mt-1 text-xl font-semibold text-cyan-300">
                        {completion}%
                      </p>
                    </article>
                    <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
                        Sessions
                      </p>
                      <p className="mt-1 text-xl font-semibold text-cyan-300">
                        0
                      </p>
                    </article>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-4 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-rose-300/25 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-100 transition-all duration-300 hover:scale-[1.01] hover:border-rose-300/40 hover:bg-rose-500/15 hover:shadow-[0_14px_30px_rgba(244,63,94,0.2)] focus:outline-none focus:ring-2 focus:ring-rose-300/35"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Profile;
