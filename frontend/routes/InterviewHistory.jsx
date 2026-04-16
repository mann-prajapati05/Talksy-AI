import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../routes/App";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: index * 0.05,
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
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (normalized === "incompleted" || normalized === "incomplete") {
    return {
      label: "Incomplete",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (normalized === "in progress") {
    return {
      label: "In progress",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  return {
    label: status || "Unknown",
    className: "border-slate-200 bg-slate-50 text-slate-600",
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
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-semibold tracking-wide text-indigo-600">
            Interview History
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Review every session and jump back into a report instantly.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Your interviews are sorted from newest to oldest so you can quickly
            revisit the latest performance, score, and status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
        >
          Back to home
        </button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total sessions
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.total}
          </p>
          <p className="mt-2 text-sm text-slate-500">All interviews loaded</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
            Completed
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {stats.completed}
          </p>
          <p className="mt-2 text-sm text-emerald-600">Finished interviews</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-600">
            Incomplete
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {stats.incomplete}
          </p>
          <p className="mt-2 text-sm text-amber-600">Still in progress</p>
        </article>
        <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
            Average score
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-700">
            {stats.averageScore.toFixed(1)}
          </p>
          <p className="mt-2 text-sm text-indigo-600">Across all interviews</p>
        </article>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="h-4 w-24 rounded-full bg-slate-200"></div>
              <div className="mt-5 h-6 w-3/4 rounded-full bg-slate-200"></div>
              <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-200"></div>
              <div className="mt-8 flex gap-3">
                <div className="h-8 w-24 rounded-full bg-slate-200"></div>
                <div className="h-8 w-20 rounded-full bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-bold text-red-800">
            Could not load history
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600">
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
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No interviews yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Once you finish an interview, it will appear here with its score,
            status, and creation time.
          </p>
          <button
            type="button"
            onClick={() => navigate("/mock-hire")}
            className="mt-6 inline-flex rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md"
          >
            Start a mock interview
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
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
                className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        {interview?.mode || "Mode not set"}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
                        {interview?.role || "Untitled role"}
                      </h2>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        {interview?.experience || "Experience not provided"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>{formatDate(interview?.createdAt)}</span>
                      <span>{formatTime(interview?.createdAt)}</span>
                      <span>
                        ID: {String(interview?._id || "-").slice(-6)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-center">
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-wider text-indigo-500">
                          Score
                        </div>
                        <div className="text-lg font-bold text-indigo-700">
                          {score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Open report
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        View detailed breakdown
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Session snapshot
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      Tap to open the report and review the full scoring
                      details.
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-500">
                    <svg
                      className="h-4 w-4"
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
