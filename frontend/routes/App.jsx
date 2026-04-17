import "../src/App.css";
import Header from "../components/Header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../src/redux/userSlice";
import Profile from "./Profile";
import { AnimatePresence, motion } from "framer-motion";
import {
  applySessionAuthHeader,
  clearSessionToken,
} from "../src/utils/authSession";

export const serverUrl = "https://talksy-ai.onrender.com";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((state) => state.user.userData);
  const userCredits = Number(userData?.credits ?? 0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const showLowCreditBanner =
    Boolean(userData) && userCredits < 20 && location.pathname === "/";

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`${serverUrl}/users/current-user`, {
          withCredentials: true,
        });
        dispatch(setUserData(res.data));
        console.log(res.data);
      } catch (err) {
        console.log("Error while getting user", err);
        clearSessionToken();
        applySessionAuthHeader("");
        dispatch(setUserData(null));
      }
    };
    getUser();
  }, []);

  return (
    <>
      <main className="relative min-h-screen bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/30 font-sans text-slate-900 overflow-x-hidden">
        {/* Ambient background blobs */}
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />

        <div className="relative z-10">
          <Header onProfileClick={() => setIsProfileOpen(true)} />

          <AnimatePresence mode="wait">
            {showLowCreditBanner && (
              <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mx-auto mb-6 max-w-5xl px-5"
              >
                <div className="glass-card rounded-xl p-4 shadow-md sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-900 sm:text-base">
                        ⚡ Unlock MockHire with more credits
                      </p>
                      <p className="mt-1 text-xs text-amber-700 sm:text-sm">
                        You have {userCredits} credits. You need at least 20
                        credits to access MockHire interviews.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => navigate("/pricing")}
                      className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow duration-200 hover:shadow-lg"
                    >
                      Get Credits Now
                    </motion.button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          <Profile
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </main>
    </>
  );
}

export default App;
