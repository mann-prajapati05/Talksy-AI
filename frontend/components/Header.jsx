import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Header({ onProfileClick }) {
  const userData = useSelector((state) => state.user.userData);
  const userName = userData?.name?.trim() || "";
  const userCredits = Number(userData?.credits ?? 0);
  const isLoggedIn = Boolean(userData);

  const profileInitial = useMemo(() => {
    if (!userName) {
      return "P";
    }
    return userName.charAt(0).toUpperCase();
  }, [userName]);

  return (
    <header className="relative mx-5 mb-5 grid grid-cols-1 items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.35)] backdrop-blur-xl md:grid-cols-[auto_1fr_auto] md:gap-4">
      <div
        className="pointer-events-none absolute -right-12 -top-14 h-48 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.22),transparent_68%)]"
        aria-hidden="true"
      ></div>
      <div
        className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.24),transparent_70%)]"
        aria-hidden="true"
      ></div>

      <div className="relative z-10">
        <Link to="/">
          <span className="text-2xl font-semibold tracking-[0.04em] text-slate-100">
            Talksy
          </span>
        </Link>
      </div>

      <div className="relative z-10 inline-flex flex-wrap items-center justify-center gap-2 md:justify-end">
        {!isLoggedIn ? (
          <>
            <Link to="/login">
              <button
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-300 hover:-translate-y-px hover:border-cyan-300/35 hover:bg-white/15"
                type="button"
              >
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button
                className="rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(34,211,238,0.28)]"
                type="button"
              >
                Sign up
              </button>
            </Link>
          </>
        ) : (
          <>
            <div className="group inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 shadow-[0_8px_20px_rgba(6,182,212,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-cyan-300/35 hover:text-cyan-100 hover:shadow-[0_10px_26px_rgba(34,211,238,0.24)]">
              <span className="text-sm leading-none text-cyan-300 transition-colors duration-300 group-hover:text-cyan-200">
                ⚡
              </span>
              <span className="whitespace-nowrap">{userCredits} Credits</span>
            </div>

            <button
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-cyan-300/40 bg-linear-to-br from-indigo-600 to-violet-600 text-base font-semibold text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(34,211,238,0.28)]"
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
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
