import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

function Header({ onProfileClick }) {
  const userData = useSelector((state) => state.user.userData);
  const userName = userData?.name?.trim() || "";
  const userCredits = Number(userData?.credits ?? 0);
  const isLoggedIn = Boolean(userData);

  const profileInitial = useMemo(() => {
    if (!userName) return "P";
    return userName.charAt(0).toUpperCase();
  }, [userName]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <div>
          <Link to="/">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block text-xl font-bold tracking-tight text-slate-900"
            >
              Talksy
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">.</span>
            </motion.span>
          </Link>
        </div>

        <div className="inline-flex items-center gap-2.5">
          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                  type="button"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200"
                  type="button"
                >
                  Sign up
                </motion.button>
              </Link>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-sm"
              >
                <span className="text-sm leading-none">⚡</span>
                <span className="whitespace-nowrap">{userCredits} Credits</span>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white shadow-md ring-2 ring-white transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200"
                type="button"
                onClick={onProfileClick}
                aria-label="Profile"
                title={userName || "Profile"}
              >
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profileInitial
                )}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
