import "../src/App.css";
import Header from "../components/Header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../src/redux/userSlice";
import Profile from "./Profile";

export const serverUrl = "https://talksy-ai.onrender.com";

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
        dispatch(setUserData(null));
      }
    };
    getUser();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white font-sans text-slate-900">
        <Header onProfileClick={() => setIsProfileOpen(true)}></Header>
        {showLowCreditBanner && (
          <section className="mx-auto mb-6 max-w-5xl px-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-900 sm:text-base">
                    Unlock MockHire with more credits
                  </p>
                  <p className="mt-1 text-xs text-amber-700 sm:text-sm">
                    You have {userCredits} credits. You need at least 20 credits
                    to access MockHire interviews.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/pricing")}
                  className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-600 hover:shadow-md"
                >
                  Get Credits Now
                </button>
              </div>
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
