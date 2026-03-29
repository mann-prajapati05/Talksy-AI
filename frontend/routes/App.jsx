import "../src/App.css";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../src/redux/userSlice";
import Profile from "./Profile";
function App() {
  const dispatch = useDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
