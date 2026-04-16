import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../routes/App";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" },
  }),
};

const formatDate = (d) => {
  if (!d) return "Unknown date";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const formatTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);
};

const getStatusMeta = (status) => {
  const s = String(status || "").trim().toLowerCase();
  if (s === "completed") return { label: "Completed", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (s === "incompleted" || s === "incomplete") return { label: "Incomplete", className: "border-amber-200 bg-amber-50 text-amber-700" };
  if (s === "in progress") return { label: "In progress", className: "border-blue-200 bg-blue-50 text-blue-700" };
  return { label: status || "Unknown", className: "border-slate-200 bg-slate-50 text-slate-600" };
};

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setIsLoading(true); setError("");
      try {
        const result = await axios.get(`${serverUrl}/interview/my-interviews`, { withCredentials: true });
        setInterviews(result.data);
      } catch (err) { setError("We could not load your interview history right now."); }
      setIsLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = interviews.length;
    const completed = interviews.filter((i) => String(i?.status || "").trim().toLowerCase() === "completed").length;
    const avg = total ? interviews.reduce((s, i) => s + Number(i?.finalScore || 0), 0) / total : 0;
    return { total, completed, incomplete: total - completed, averageScore: avg };
  }, [interviews]);

  const statCards = [
    { label: "Total sessions", value: stats.total, sub: "All interviews", color: "from-slate-50 to-white", border: "border-slate-200" },
    { label: "Completed", value: stats.completed, sub: "Finished", color: "from-emerald-50 to-emerald-50/50", border: "border-emerald-200", text: "text-emerald-700" },
    { label: "Incomplete", value: stats.incomplete, sub: "In progress", color: "from-amber-50 to-amber-50/50", border: "border-amber-200", text: "text-amber-700" },
    { label: "Average score", value: stats.averageScore.toFixed(1), sub: "All interviews", color: "from-indigo-50 to-violet-50/50", border: "border-indigo-200", text: "text-indigo-700" },
  ];

  return (
    <motion.section variants={containerVariants} initial="hidden" animate="show" className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:px-8">
      <motion.header variants={fadeUp} className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-600 shadow-sm">
            ✦ Interview History
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Review every session and{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">jump back into a report</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Sorted newest to oldest for quick access.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => navigate("/")}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:shadow-md">
          Back to home
        </motion.button>
      </motion.header>

      <motion.div variants={containerVariants} className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.article key={s.label} variants={fadeUp} whileHover={{ scale: 1.03, y: -3 }}
            className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.color} p-5 shadow-sm transition-shadow hover:shadow-md`}>
            <p className={`text-xs font-medium uppercase tracking-wider ${s.text || "text-slate-400"}`}>{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.text || "text-slate-900"}`}>{s.value}</p>
            <p className={`mt-2 text-sm ${s.text ? s.text.replace("700", "600") : "text-slate-500"}`}>{s.sub}</p>
          </motion.article>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
              <div className="h-4 w-24 rounded-full shimmer"></div>
              <div className="mt-5 h-6 w-3/4 rounded-full shimmer"></div>
              <div className="mt-3 h-4 w-2/3 rounded-full shimmer"></div>
              <div className="mt-8 flex gap-3">
                <div className="h-8 w-24 rounded-full shimmer"></div>
                <div className="h-8 w-20 rounded-full shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <motion.div variants={fadeUp} className="mt-8 rounded-xl border border-red-200 bg-red-50/80 p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-800">Could not load history</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => window.location.reload()}
            className="mt-5 inline-flex rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:shadow-md">
            Try again
          </motion.button>
        </motion.div>
      ) : interviews.length === 0 ? (
        <motion.div variants={fadeUp} className="mt-8 rounded-xl border border-slate-200/60 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none"><path d="M8 3.75h8A2.25 2.25 0 0 1 18.25 6v12A2.25 2.25 0 0 1 16 20.25H8A2.25 2.25 0 0 1 5.75 18V6A2.25 2.25 0 0 1 8 3.75Z" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8.75h8M8 12h8M8 15.25h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">No interviews yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Once you complete an interview it will appear here.</p>
          <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => navigate("/mock-hire")}
            className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl">
            Start a mock interview
          </motion.button>
        </motion.div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {interviews.map((interview, index) => {
            const statusMeta = getStatusMeta(interview?.status);
            const score = Number(interview?.finalScore || 0);
            return (
              <motion.button
                key={interview?._id || `${index}`} type="button"
                custom={index} variants={cardVariants} initial="hidden" animate="visible"
                whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/report/${interview._id}`)}
                className="gradient-border group rounded-xl bg-white/80 p-5 text-left shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-100/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">{interview?.mode || "Mode not set"}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">{interview?.role || "Untitled role"}</h2>
                      <p className="mt-1.5 text-sm text-slate-500">{interview?.experience || "Experience not provided"}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                      <span>{formatDate(interview?.createdAt)}</span>
                      <span>{formatTime(interview?.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-indigo-50/30 px-4 py-3 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100">
                      <div className="text-center">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-indigo-500">Score</div>
                        <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{score.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-slate-200/60 bg-gradient-to-r from-slate-50 to-white p-3">
                  <p className="text-xs text-slate-400">Tap to open report</p>
                  <div className="rounded-full border border-slate-200 bg-white p-2 text-slate-300 shadow-sm transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-500 group-hover:shadow-md">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

export default InterviewHistory;
