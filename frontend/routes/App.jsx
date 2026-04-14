import "../src/App.css";
import Header from "../components/Header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../src/redux/userSlice";
import Profile from "./Profile";
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
        const res = await axios.get(
          "http://localhost:8010/users/current-user",
          { withCredentials: true },
        );
        dispatch(setUserData(res.data));
        console.log(res.data);
      } catch (err) {
        console.log("Error while getting user", err);
        dispatch(setUserData(null));
      }
    };
    getUser();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 font-sans text-slate-100">
        <Header onProfileClick={() => setIsProfileOpen(true)}></Header>
        {showLowCreditBanner && (
          <section className="mx-5 mb-4 rounded-2xl border border-amber-300/25 bg-linear-to-r from-amber-500/20 via-orange-400/12 to-cyan-400/10 p-4 shadow-[0_16px_40px_rgba(251,191,36,0.15)] backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-100 sm:text-base">
                  Unlock MockHire with more credits
                </p>
                <p className="mt-1 text-xs text-slate-200 sm:text-sm">
                  You have {userCredits} credits. You need at least 20 credits
                  to access MockHire interviews.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/pricing")}
                className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_12px_26px_rgba(251,146,60,0.3)] transition-all duration-300 hover:-translate-y-px hover:brightness-105"
              >
                Get Credits Now
              </button>
            </div>
          </section>
        )}
        <Outlet />
        <Profile
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </main>
    </>
  );
}

export default App;
