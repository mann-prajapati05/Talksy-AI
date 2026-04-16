import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../routes/App";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: index * 0.06,
      ease: "easeOut",
    },
  }),
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Unknown date";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getStatusMeta = (status) => {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  if (normalized === "completed") {
    return {
      label: "Completed",
      className: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (normalized === "incompleted" || normalized === "incomplete") {
    return {
      label: "Incomplete",
      className: "border-amber-300/25 bg-amber-400/10 text-amber-200",
    };
  }

  if (normalized === "in progress") {
    return {
      label: "In progress",
      className: "border-cyan-300/25 bg-cyan-400/10 text-cyan-200",
    };
  }

  return {
    label: status || "Unknown",
    className: "border-white/10 bg-white/5 text-slate-200",
  };
};

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await axios.get(`${serverUrl}/interview/my-interviews`, {
          withCredentials: true,
        });
        setInterviews(result.data);
      } catch (err) {
        setError("We could not load your interview history right now.");
      }

      setIsLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = interviews.length;
    const completed = interviews.filter((item) => {
      const normalized = String(item?.status || "")
        .trim()
        .toLowerCase();
      return normalized === "completed";
    }).length;
    const incomplete = total - completed;
    const averageScore = total
      ? interviews.reduce(
          (sum, item) => sum + Number(item?.finalScore || 0),
          0,
        ) / total
      : 0;

    return {
      total,
      completed,
      incomplete,
      averageScore,
    };
  }, [interviews]);

  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-12 right-8 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl"></div>
      <div className="pointer-events-none absolute left-0 top-40 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl"></div>

      <header className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1 text-xs font-medium tracking-[0.08em] text-cyan-200">
            Interview History
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-100 sm:text-4xl">
            Review every session and jump back into a report instantly.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Your interviews are sorted from newest to oldest so you can quickly
            revisit the latest performance, score, and status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/10 hover:text-white"
        >
          Back to home
        </button>
      </header>

      <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
            Total sessions
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">
            {stats.total}
          </p>
          <p className="mt-2 text-sm text-slate-400">All interviews loaded</p>
        </article>
        <article className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-100/80">
            Completed
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-100">
            {stats.completed}
          </p>
          <p className="mt-2 text-sm text-emerald-50/75">Finished interviews</p>
        </article>
        <article className="rounded-2xl border border-amber-300/15 bg-amber-400/10 p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.12em] text-amber-100/80">
            Incomplete
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-100">
            {stats.incomplete}
          </p>
          <p className="mt-2 text-sm text-amber-50/75">Still in progress</p>
        </article>
        <article className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-5 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-100/80">
            Average score
          </p>
          <p className="mt-2 text-3xl font-semibold text-cyan-100">
            {stats.averageScore.toFixed(1)}
          </p>
          <p className="mt-2 text-sm text-cyan-50/75">Across all interviews</p>
        </article>
      </div>

      {isLoading ? (
        <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="h-4 w-24 rounded-full bg-white/10"></div>
              <div className="mt-5 h-6 w-3/4 rounded-full bg-white/10"></div>
              <div className="mt-3 h-4 w-2/3 rounded-full bg-white/10"></div>
              <div className="mt-8 flex gap-3">
                <div className="h-8 w-24 rounded-full bg-white/10"></div>
                <div className="h-8 w-20 rounded-full bg-white/10"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="relative z-10 mt-8 rounded-3xl border border-rose-300/20 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-rose-100">
            Could not load history
          </h2>
          <p className="mt-2 text-sm text-rose-100/80">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex rounded-xl border border-rose-200/30 bg-rose-400/15 px-4 py-2 text-sm font-medium text-rose-50 transition-all duration-300 hover:bg-rose-400/20"
          >
            Try again
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="relative z-10 mt-8 rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 3.75h8A2.25 2.25 0 0 1 18.25 6v12A2.25 2.25 0 0 1 16 20.25H8A2.25 2.25 0 0 1 5.75 18V6A2.25 2.25 0 0 1 8 3.75Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 8.75h8M8 12h8M8 15.25h5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-100">
            No interviews yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
            Once you finish an interview, it will appear here with its score,
            status, and creation time.
          </p>
          <button
            type="button"
            onClick={() => navigate("/mock-hire")}
            className="mt-6 inline-flex rounded-xl bg-linear-to-r from-indigo-600 to-cyan-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_32px_rgba(34,211,238,0.22)] transition-all duration-300 hover:translate-y-px"
          >
            Start a mock interview
          </button>
        </div>
      ) : (
        <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-2">
          {interviews.map((interview, index) => {
            const statusMeta = getStatusMeta(interview?.status);
            const score = Number(interview?.finalScore || 0);

            return (
              <motion.button
                key={interview?._id || `${index}`}
                type="button"
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => navigate(`/report/${interview._id}`)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/8 to-white/4 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_24px_60px_rgba(2,132,199,0.18)] focus:outline-none focus:ring-2 focus:ring-cyan-300/35 sm:p-6"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100"></div>

                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                        {interview?.mode || "Mode not set"}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-slate-100 transition-colors duration-300 group-hover:text-cyan-100">
                        {interview?.role || "Untitled role"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {interview?.experience || "Experience not provided"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                      <span>{formatDate(interview?.createdAt)}</span>
                      <span>{formatTime(interview?.createdAt)}</span>
                      <span className="capitalize">
                        ID: {String(interview?._id || "-").slice(-6)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-linear-to-br from-cyan-400/15 to-indigo-500/15 text-center">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/70">
                          Score
                        </div>
                        <div className="text-xl font-semibold text-cyan-100">
                          {score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        Open report
                      </p>
                      <p className="mt-1 text-sm text-slate-200">
                        View a detailed breakdown
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
                      Session snapshot
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      Tap to open the report and review the full scoring
                      details.
                    </p>
                  </div>
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-100 transition-transform duration-300 group-hover:translate-x-1">
                    <svg
                      className="h-5 w-5"
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
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default InterviewHistory;
