import "../src/App.css";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
function App() {
  return (
    <>
      <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 font-sans text-slate-100">
        <Header></Header>
        <Outlet />
      </main>
    </>
  );
}

export default App;
