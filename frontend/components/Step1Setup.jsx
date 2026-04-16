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

const normalizeExperienceOption = (raw) => {
  const n = String(raw || "").trim().toLowerCase();
  if (!n) return "";
  if (n.includes("fresher")) return "Fresher";
  if (n.includes("1-3") || n.includes("1 to 3")) return "1-3 years";
  if (n.includes("3+") || n.includes("3 plus")) return "3+ years";
  return "";
};

const normalizeExtractedExperience = (raw) => {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.filter(Boolean).map((entry) => {
    if (typeof entry === "string") return { company: "", type: "", mode: "", employment: "", description: entry };
    if (typeof entry === "object") return {
      company: String(entry.company || "").trim(), type: String(entry.type || "").trim(),
      mode: String(entry.mode || "").trim(), employment: String(entry.employment || "").trim(),
      description: String(entry.description || "").trim(),
    };
    return { company: "", type: "", mode: "", employment: "", description: "" };
  });
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function SectionLabel({ title, hint }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function OptionButton({ active, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      type="button" onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700 shadow-sm shadow-indigo-100 ring-1 ring-indigo-200"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
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
    if (userData === null) { navigate("/login"); return; }
    try {
      const result = await axios.post(`${serverUrl}/interview/resume-analyze`, formData, { withCredentials: true });
      const extractedList = normalizeExtractedExperience(result.data?.experience);
      const suggestedExperience = normalizeExperienceOption(extractedList[0]?.description);
      if (!experience && suggestedExperience) setExperience(suggestedExperience);
      setExtractedExperience(extractedList);
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
    } catch (err) { console.error("Resume analysis failed", err); }
    finally { setAnalyzing(false); }
  };

  const handleFileChange = (e) => { setResumeFile(e.target.files?.[0] || null); setAnalysisDone(false); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) { setResumeFile(f); setAnalysisDone(false); } };

  const canStart = Boolean(role.trim()) && Boolean(experience) && Boolean(mode) && Boolean(interviewLength) && !analyzing;

  const handleStartInterview = async () => {
    if (!canStart || loading) return;
    setLoading(true);
    if (userData === null) { setLoading(false); navigate("/login"); return; }
    if (hasInsufficientCredits) { setCreditError("Need at least 20 credits to start MockHire."); setLoading(false); return; }
    setCreditError("");
    try {
      const result = await axios.post(`${serverUrl}/interview/generate-questions`, {
        role: role.trim(), experience, mode, length: interviewLength, projects, skills, resumeText,
      }, { withCredentials: true });
      if (userData) dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }));
      setLoading(false);
      onStart(result.data);
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("credit")) setCreditError("Need at least 20 credits.");
      setLoading(false);
    }
  };

  return (
    <motion.section variants={containerVariants} initial="hidden" animate="show" className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <motion.header variants={fadeUp} className="mb-8 text-center">
          <p className="inline-flex rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-600 shadow-sm">✦ Step 1 of 3</p>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Setup Your <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Mock Interview</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">Configure your target role and optionally upload your resume.</p>
        </motion.header>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 shadow-xl shadow-slate-200/40 sm:p-8">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-7">
            <motion.div variants={fadeUp}>
              <SectionLabel title="Role" hint="Job profile you are targeting" />
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-md focus:shadow-indigo-100 focus:scale-[1.01]" />
            </motion.div>

            <motion.div variants={fadeUp}>
              <SectionLabel title="Experience" hint="Pick the closest level" />
              <div className="flex flex-wrap gap-3">{EXPERIENCE_OPTIONS.map((o) => <OptionButton key={o} label={o} active={experience === o} onClick={() => setExperience(o)} />)}</div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <SectionLabel title="Interview Mode" />
              <div className="grid gap-3 sm:grid-cols-3">{INTERVIEW_MODES.map((o) => <OptionButton key={o} label={o} active={mode === o} onClick={() => setMode(o)} />)}</div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <SectionLabel title="Interview Length" />
              <div className="grid gap-3 sm:grid-cols-3">{INTERVIEW_LENGTH_OPTIONS.map((o) => <OptionButton key={o} label={o} active={interviewLength === o} onClick={() => setInterviewLength(o)} />)}</div>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 sm:p-5">
              <SectionLabel title="Resume Analysis" hint="Personalize with AI" />
              <label
                onDragEnter={() => setDragActive(true)}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-all duration-200 ${
                  dragActive ? "border-indigo-400 bg-indigo-50 shadow-inner" : "border-slate-300 bg-white/80 hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
              >
                <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
                <svg className="h-8 w-8 text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="text-sm font-medium text-slate-600">Drop your resume or <span className="text-indigo-600 font-semibold">click to upload</span></p>
                <p className="mt-1 text-xs text-slate-400">PDF, DOC, DOCX, TXT</p>
              </label>

              <AnimatePresence>
                {resumeFile && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-600">Selected: <span className="font-medium text-slate-900">{resumeFile.name}</span></p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={handleUploadResume} disabled={analyzing}
                      className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      {analyzing ? (<span className="inline-flex items-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing...</span>) : "Analyze Resume"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {analysisDone && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 20 }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">✦ AI Extracted Profile</p>
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Experience</p>
                      <div className="mt-2 space-y-2">
                        {extractedExperience.length ? extractedExperience.map((item, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="rounded-lg border border-slate-200/60 bg-white/80 p-3 text-sm text-slate-600 shadow-sm">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <p><span className="text-slate-400">Company: </span>{item.company || "N/A"}</p>
                              <p><span className="text-slate-400">Type: </span>{item.type || "N/A"}</p>
                            </div>
                            <p className="mt-2 text-slate-500"><span className="text-slate-400">Description: </span>{item.description || "N/A"}</p>
                          </motion.div>
                        )) : <p className="text-sm text-slate-400">No experience data.</p>}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Skills</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skills.length ? skills.map((s, i) => (
                          <motion.span key={`${s}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                            className="rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm">{s}</motion.span>
                        )) : <p className="text-sm text-slate-400">No skills data.</p>}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Projects</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {projects.length ? projects.map((p, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="rounded-lg border border-slate-200/60 bg-white/80 p-3 text-sm text-slate-600 shadow-sm">{p}</motion.div>
                        )) : <p className="text-sm text-slate-400">No projects data.</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-1">
              {hasInsufficientCredits && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-center shadow-sm">
                  <p className="text-xs font-semibold text-amber-800 sm:text-sm">Need at least 20 credits. You have {userCredits}.</p>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => navigate("/pricing")}
                    className="mt-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg">Buy Credits</motion.button>
                </motion.div>
              )}
              {creditError && !hasInsufficientCredits && <p className="mb-3 text-center text-xs font-medium text-amber-700">{creditError}</p>}
              <motion.button whileHover={{ scale: canStart ? 1.02 : 1, y: canStart ? -1 : 0 }} whileTap={{ scale: canStart ? 0.98 : 1 }}
                type="button" onClick={handleStartInterview} disabled={!canStart || loading || hasInsufficientCredits}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
                {loading ? (<span className="inline-flex items-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Starting...</span>) : "Start Interview →"}
              </motion.button>
              {!canStart && <p className="mt-2 text-center text-xs text-slate-400">Fill all fields to continue.</p>}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Step1Setup;
