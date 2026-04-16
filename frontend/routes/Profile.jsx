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
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    x: "100%",
    opacity: 0.98,
    transition: { duration: 0.25, ease: "easeInOut" },
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
          className="fixed inset-0 z-80 bg-black/30 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.aside
            className="ml-auto flex h-full w-full max-w-100 flex-col border-l border-slate-200 bg-white shadow-2xl"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Profile
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-700"
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

              <div className="mt-6 flex-1 overflow-y-auto pr-1">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col items-center text-center">
                    {userData?.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={`${userData?.name || "User"} profile`}
                        className="h-20 w-20 rounded-full border-2 border-slate-200 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold text-white shadow-sm">
                        {initials}
                      </div>
                    )}

                    <div className="mt-5 w-full space-y-3 text-left">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Name
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {userData?.name || "Not provided"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Email
                        </p>
                        <p className="mt-1 break-all text-sm font-medium text-slate-900">
                          {userData?.email || "Not provided"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Gender
                        </p>
                        <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                          {userData?.gender || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="my-5 h-px w-full bg-slate-200"></div>

                  {userData && (
                    <article className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-indigo-500">
                        Available Credits
                      </p>
                      <p className="mt-2 text-3xl font-bold leading-none text-indigo-700">
                        {userCredits}
                      </p>
                      <p className="mt-2 text-xs text-slate-600">
                        Use credits for interviews
                      </p>
                      <button
                        type="button"
                        onClick={handleBuyCredits}
                        className="mt-3 w-full rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md"
                      >
                        Buy Credits
                      </button>
                    </article>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenHistory}
                    className="group mb-5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-all duration-200 hover:border-indigo-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-transform duration-200 group-hover:scale-105">
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
                        <p className="text-sm font-semibold text-slate-900">
                          Interview History
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Open your reports and session archive
                        </p>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1"
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
                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Completion
                      </p>
                      <p className="mt-1 text-xl font-bold text-indigo-600">
                        {completion}%
                      </p>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Sessions
                      </p>
                      <p className="mt-1 text-xl font-bold text-indigo-600">
                        0
                      </p>
                    </article>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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
