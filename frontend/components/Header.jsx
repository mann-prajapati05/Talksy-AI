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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <div>
          <Link to="/">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Talksy
            </span>
          </Link>
        </div>

        <div className="inline-flex items-center gap-2.5">
          {!isLoggedIn ? (
            <>
              <Link to="/login">
                <button
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
                  type="button"
                >
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md"
                  type="button"
                >
                  Sign up
                </button>
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <span className="text-sm leading-none">⚡</span>
                <span className="whitespace-nowrap">{userCredits} Credits</span>
              </div>

              <button
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-indigo-500 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
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
      </div>
    </header>
  );
}

export default Header;
