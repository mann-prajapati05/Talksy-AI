import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { setUserData } from "../src/redux/userSlice";

const EXPERIENCE_OPTIONS = ["Fresher", "1-3 years", "3+ years"];
const INTERVIEW_MODES = ["Technical", "HR", "Mixed"];

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

function SectionLabel({ title, hint }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
        {title}
      </p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function OptionButton({ active, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
        active
          ? "border-cyan-300/50 bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-[0_10px_28px_rgba(34,211,238,0.2)]"
          : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/35 hover:bg-white/10"
      }`}
    >
      {label}
    </motion.button>
  );
}

function Step1Setup({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const result = await axios.post(
        "http://localhost:8010/interview/resume-analyze",
        formData,
        {
          withCredentials: true,
        },
      );

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
    } catch (err) {
      console.error("Resume analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setResumeFile(file);
    setAnalysisDone(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    if (!file) return;
    setResumeFile(file);
    setAnalysisDone(false);
  };

  const canStart =
    Boolean(role.trim()) && Boolean(experience.trim()) && !analyzing;

  const handleStartInterview = async () => {
    if (!canStart || loading) return;
    setLoading(true);

    try {
      const result = await axios.post(
        "http://localhost:8010/interview/generate-questions",
        {
          role: role.trim(),
          experience,
          mode,
          projects,
          skills,
          resumeText,
        },
        {
          withCredentials: true,
        },
      );
      console.log(result.data);

      if (userData) {
        dispatch(setUserData({ ...user, credits: result.data.creditsLeft }));
      }
      setLoading(false);
      onStart(result.data);
    } catch (err) {
      console.log("Error while Start Interview..", err);
      setLoading(false);
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 px-4 py-10 text-slate-100 sm:px-6"
    >
      <div className="pointer-events-none absolute -top-14 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-28 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-4xl">
        <motion.header variants={sectionVariants} className="mb-8 text-center">
          <p className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1 text-xs font-medium tracking-[0.08em] text-cyan-200">
            Step 1 of 3
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-100 sm:text-4xl">
            Setup Your Mock Interview
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Configure your target role, interview focus, and optionally let AI
            read your resume to personalize the session.
          </p>
        </motion.header>

        <motion.div
          variants={sectionVariants}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_26px_70px_rgba(2,6,23,0.5)] backdrop-blur-xl sm:p-8"
        >
          <div className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_70%)]" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 space-y-7"
          >
            <motion.div variants={sectionVariants}>
              <SectionLabel title="Role" hint="Job profile you are targeting" />
              <input
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/20"
              />
            </motion.div>

            <motion.div variants={sectionVariants}>
              <SectionLabel title="Experience" hint="Pick the closest level" />
              <div className="flex flex-wrap gap-3">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <OptionButton
                    key={option}
                    label={option}
                    active={experience === option}
                    onClick={() => setExperience(option)}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div variants={sectionVariants}>
              <SectionLabel
                title="Interview Mode"
                hint="Choose your practice style"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {INTERVIEW_MODES.map((option) => (
                  <OptionButton
                    key={option}
                    label={option}
                    active={mode === option}
                    onClick={() => setMode(option)}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              className="rounded-2xl border border-white/10 bg-slate-900/35 p-4 sm:p-5"
            >
              <SectionLabel
                title="Resume Analysis"
                hint="Upload once, personalize instantly"
              />

              <label
                onDragEnter={() => setDragActive(true)}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-7 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-cyan-300/55 bg-cyan-400/10"
                    : "border-white/20 bg-white/5 hover:border-cyan-300/35 hover:bg-white/10"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-sm font-medium text-slate-100">
                  Drop your resume here or click to upload
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Supported formats: PDF, DOC, DOCX, TXT
                </p>
              </label>

              <AnimatePresence>
                {resumeFile ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-sm text-slate-300">
                      Selected:{" "}
                      <span className="font-medium text-cyan-200">
                        {resumeFile.name}
                      </span>
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleUploadResume}
                      disabled={analyzing}
                      className="rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.35)] transition-all duration-300 hover:shadow-[0_16px_34px_rgba(34,211,238,0.28)] disabled:cursor-not-allowed disabled:opacity-65"
                    >
                      {analyzing ? "Analyzing resume..." : "Analyze Resume"}
                    </motion.button>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {analysisDone ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="overflow-hidden rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.09em] text-cyan-200">
                      AI Extracted Profile
                    </p>

                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
                        Skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skills.length ? (
                          skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400">
                            No skills extracted yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
                        Projects
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {projects.length ? (
                          projects.map((project, index) => (
                            <div
                              key={`${project}-${index}`}
                              className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                            >
                              {project}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400">
                            No projects extracted yet.
                          </p>
                        )}
                      </div>
                    </div>

                    {resumeText ? (
                      <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/35 p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-slate-400">
                          Resume Snapshot
                        </p>
                        <p className="mt-2 max-h-24 overflow-hidden text-sm text-slate-300">
                          {resumeText}
                        </p>
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={sectionVariants} className="pt-1">
              <motion.button
                whileHover={{ scale: canStart ? 1.015 : 1 }}
                whileTap={{ scale: canStart ? 0.985 : 1 }}
                type="button"
                onClick={handleStartInterview}
                disabled={!canStart || loading}
                className="w-full rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(99,102,241,0.35)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(34,211,238,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Interview"}
              </motion.button>
              {!canStart ? (
                <p className="mt-2 text-center text-xs text-slate-400">
                  Add your role and experience level to continue.
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Step1Setup;
