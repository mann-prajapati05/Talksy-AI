import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { setUserData } from "../src/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../routes/App";

const EXPERIENCE_OPTIONS = ["Fresher", "1-3 years", "3+ years"];
const INTERVIEW_MODES = ["Technical", "HR", "Mixed"];
const INTERVIEW_LENGTH_OPTIONS = ["short", "medium", "long"];

const normalizeExperienceOption = (rawExperience) => {
  const normalized = String(rawExperience || "")
    .trim()
    .toLowerCase();

  if (!normalized) return "";
  if (normalized.includes("fresher")) return "Fresher";
  if (normalized.includes("1-3") || normalized.includes("1 to 3")) {
    return "1-3 years";
  }
  if (normalized.includes("3+") || normalized.includes("3 plus")) {
    return "3+ years";
  }

  return "";
};

const normalizeExtractedExperience = (rawExperience) => {
  const list = Array.isArray(rawExperience)
    ? rawExperience
    : rawExperience
      ? [rawExperience]
      : [];

  return list.filter(Boolean).map((entry) => {
    if (typeof entry === "string") {
      return {
        company: "",
        type: "",
        mode: "",
        employment: "",
        description: entry,
      };
    }

    if (typeof entry === "object") {
      return {
        company: String(entry.company || "").trim(),
        type: String(entry.type || "").trim(),
        mode: String(entry.mode || "").trim(),
        employment: String(entry.employment || "").trim(),
        description: String(entry.description || "").trim(),
      };
    }

    return {
      company: "",
      type: "",
      mode: "",
      employment: "",
      description: "",
    };
  });
};

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

function SectionLabel({ title, hint }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function OptionButton({ active, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
      }`}
    >
      {label}
    </motion.button>
  );
}

function Step1Setup({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("");
  const [interviewLength, setInterviewLength] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedExperience, setExtractedExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [creditError, setCreditError] = useState("");

  const userCredits = Number(userData?.credits ?? 0);
  const hasInsufficientCredits = Boolean(userData) && userCredits < 20;

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    if (userData === null) {
      navigate("/login");
      return;
    }
    try {
      const result = await axios.post(
        `${serverUrl}/interview/resume-analyze`,
        formData,
        {
          withCredentials: true,
        },
      );

      const extractedList = normalizeExtractedExperience(
        result.data?.experience,
      );
      const suggestedExperience = normalizeExperienceOption(
        extractedList[0]?.description,
      );

      if (!experience && suggestedExperience) {
        setExperience(suggestedExperience);
      }

      setExtractedExperience(extractedList);
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
    Boolean(role.trim()) &&
    Boolean(experience.trim()) &&
    Boolean(mode.trim()) &&
    Boolean(interviewLength.trim()) &&
    !analyzing;

  const handleStartInterview = async () => {
    if (!canStart || loading) return;
    setLoading(true);
    console.log(userData);
    if (userData === null) {
      setLoading(false);
      navigate("/login");
      return;
    }

    if (hasInsufficientCredits) {
      setCreditError(
        "Need at least 20 credits to start MockHire. Buy credits to continue.",
      );
      setLoading(false);
      return;
    }

    setCreditError("");

    try {
      const result = await axios.post(
        `${serverUrl}/interview/generate-questions`,
        {
          role: role.trim(),
          experience,
          mode,
          length: interviewLength,
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
        dispatch(
          setUserData({ ...userData, credits: result.data.creditsLeft }),
        );
      }
      setLoading(false);
      onStart(result.data);
    } catch (err) {
      console.log("Error while Start Interview..", err);
      const backendMessage = err?.response?.data?.message || "";
      if (backendMessage.toLowerCase().includes("credit")) {
        setCreditError(
          "Need at least 20 credits to start MockHire. Buy credits to continue.",
        );
      }
      setLoading(false);
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6"
    >
      <div className="mx-auto w-full max-w-4xl">
        <motion.header variants={sectionVariants} className="mb-8 text-center">
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-semibold tracking-wide text-indigo-600">
            Step 1 of 3
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Setup Your Mock Interview
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Configure your target role, interview focus, and optionally let AI
            read your resume to personalize the session.
          </p>
        </motion.header>

        <motion.div
          variants={sectionVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-7"
          >
            <motion.div variants={sectionVariants}>
              <SectionLabel title="Role" hint="Job profile you are targeting" />
              <input
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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

            <motion.div variants={sectionVariants}>
              <SectionLabel
                title="Interview Length"
                hint="Choose question depth"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {INTERVIEW_LENGTH_OPTIONS.map((option) => (
                  <OptionButton
                    key={option}
                    label={option}
                    active={interviewLength === option}
                    onClick={() => setInterviewLength(option)}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
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
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-7 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-sm font-medium text-slate-700">
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
                    <p className="text-sm text-slate-600">
                      Selected:{" "}
                      <span className="font-medium text-slate-900">
                        {resumeFile.name}
                      </span>
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={handleUploadResume}
                      disabled={analyzing}
                      className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50/50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      AI Extracted Profile
                    </p>

                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Experience
                      </p>
                      <div className="mt-2 space-y-2">
                        {extractedExperience.length ? (
                          extractedExperience.map((item, index) => (
                            <div
                              key={`experience-${index}`}
                              className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
                            >
                              <div className="grid gap-2 sm:grid-cols-2">
                                <p>
                                  <span className="text-slate-500">
                                    Company:{" "}
                                  </span>
                                  {item.company || "Not specified"}
                                </p>
                                <p>
                                  <span className="text-slate-500">Type: </span>
                                  {item.type || "Not specified"}
                                </p>
                                <p>
                                  <span className="text-slate-500">Mode: </span>
                                  {item.mode || "Not specified"}
                                </p>
                                <p>
                                  <span className="text-slate-500">
                                    Employment:{" "}
                                  </span>
                                  {item.employment || "Not specified"}
                                </p>
                              </div>
                              <p className="mt-2 text-slate-600">
                                <span className="text-slate-500">
                                  Description:{" "}
                                </span>
                                {item.description || "Not specified"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400">
                            No experience extracted yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skills.length ? (
                          skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
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
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Projects
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {projects.length ? (
                          projects.map((project, index) => (
                            <div
                              key={`${project}-${index}`}
                              className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
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
                      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          Resume Snapshot
                        </p>
                        <p className="mt-2 max-h-24 overflow-hidden text-sm text-slate-600">
                          {resumeText}
                        </p>
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={sectionVariants} className="pt-1">
              {hasInsufficientCredits && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-amber-800 sm:text-sm">
                    Need at least 20 credits to start interview. You currently
                    have {userCredits}.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/pricing")}
                    className="mt-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-600"
                  >
                    Buy Credits
                  </button>
                </div>
              )}

              {creditError && !hasInsufficientCredits ? (
                <p className="mb-3 text-center text-xs font-medium text-amber-700">
                  {creditError}
                </p>
              ) : null}

              <motion.button
                whileHover={{ scale: canStart ? 1.01 : 1 }}
                whileTap={{ scale: canStart ? 0.99 : 1 }}
                type="button"
                onClick={handleStartInterview}
                disabled={!canStart || loading || hasInsufficientCredits}
                className="w-full rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Interview"}
              </motion.button>
              {!canStart ? (
                <p className="mt-2 text-center text-xs text-slate-400">
                  Fill role, experience, interview mode, and interview length to
                  continue.
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
