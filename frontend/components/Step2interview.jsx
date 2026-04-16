import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Timer from "./Timer";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { serverUrl } from "../routes/App";

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const questionVariants = {
  initial: { opacity: 0, x: 24, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -16, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

function Step2interview({ interviewData, onFinish }) {
  const { interviewId, userName, questions } = interviewData;
  const maleVideo = "/male-ai.mp4";
  const femaleVideo = "/female-ai.mp4";
  const userData = useSelector((state) => state.user);

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAiPlaying, setIsAiPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState(userData?.gender || "female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);
  const answerInputRef = useRef(null);
  const hasCompletedIntroRef = useRef(false);
  const isRunningIntroRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const getPreferredVoice = () => {
    if (!window.speechSynthesis?.getVoices) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const keywords = voiceGender === "male" ? ["male","david","guy","mark","john","alex"] : ["female","zira","samantha","victoria","aria","eva"];
    const match = voices.find((v) => keywords.some((k) => v.name.toLowerCase().includes(k)));
    if (match) return match;
    return voices.find((v) => v.lang?.toLowerCase().startsWith("en")) || voices[0] || null;
  };

  const waitForVoices = () => new Promise((resolve) => {
    if (!window.speechSynthesis?.getVoices) { resolve(); return; }
    if (window.speechSynthesis.getVoices().length > 0) { resolve(); return; }
    const fn = () => { window.speechSynthesis.removeEventListener("voiceschanged", fn); resolve(); };
    window.speechSynthesis.addEventListener("voiceschanged", fn);
    setTimeout(() => { window.speechSynthesis.removeEventListener("voiceschanged", fn); resolve(); }, 500);
  });

  const speakText = (text) => new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    waitForVoices().then(() => {
      window.speechSynthesis.cancel();
      const clean = (text || "").trim().replace(/\s+/g, " ");
      const human = clean.replace(/,/g, ", ...").replace(/\./g, ". ... ");
      const u = new SpeechSynthesisUtterance(human);
      const v = getPreferredVoice();
      if (v) u.voice = v;
      u.rate = 0.92; u.pitch = 1.05; u.volume = 1;
      u.onstart = () => { setIsAiPlaying(true); stopMic(); videoRef.current?.play(); };
      u.onend = () => { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; setIsAiPlaying(false); if (isMicOn && !isIntroPhase) startMic(); setTimeout(() => { setSubtitle(""); resolve(); }, 300); };
      u.onerror = () => { setIsAiPlaying(false); setSubtitle(""); resolve(); };
      setSubtitle(clean);
      window.speechSynthesis.speak(u);
    });
  });

  useEffect(() => {
    const run = async () => {
      if (isIntroPhase) {
        if (hasCompletedIntroRef.current || isRunningIntroRef.current) return;
        isRunningIntroRef.current = true;
        await new Promise((r) => setTimeout(r, 300));
        await speakText(`Hi ${userName}, great to meet you. I hope you're ready.`);
        await speakText(`I'll ask you some questions. Answer naturally. Let's begin.`);
        hasCompletedIntroRef.current = true; isRunningIntroRef.current = false; setIsIntroPhase(false);
      } else if (currentQuestion) {
        if (!hasCompletedIntroRef.current) return;
        await new Promise((r) => setTimeout(r, 800));
        if (currentQuestion.questionType?.toLowerCase() === "hard") await speakText("Next question might be more challenging...");
        await speakText(currentQuestion.question);
        if (isMicOn) startMic();
      }
    };
    run();
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase || !currentQuestion || isSubmitting) return;
    const t = setInterval(() => { setTimeLeft((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }); }, 1000);
    return () => clearInterval(t);
  }, [isIntroPhase, currentIndex, isSubmitting]);

  useEffect(() => { if (!isIntroPhase && currentQuestion) setTimeLeft(currentQuestion.timeLimit || 60); }, [currentIndex]);
  useEffect(() => { if (!isIntroPhase) answerInputRef.current?.focus(); }, [currentIndex, isIntroPhase]);
  useEffect(() => { if (!browserSupportsSpeechRecognition) return; setAnswer(transcript); }, [transcript, browserSupportsSpeechRecognition]);

  const startMic = () => { if (!isAiPlaying) try { SpeechRecognition.startListening({ continuous: true }); } catch (e) {} };
  const stopMic = () => SpeechRecognition.stopListening();
  const toggleMic = () => { if (isMicOn) stopMic(); else startMic(); setIsMicOn(!isMicOn); };

  const handleSubmitAnswer = async () => {
    if (isSubmitting) return; stopMic(); setIsSubmitting(true);
    try {
      const result = await axios.post(`${serverUrl}/interview/submit-answer`, { interviewId, questionIndex: currentIndex, answer, timeTaken: currentQuestion.timeLimit - timeLeft }, { withCredentials: true });
      setFeedback(result.data.feedback); speakText(result.data.feedback);
    } catch (err) { console.log(err); }
    setIsSubmitting(false);
  };

  const handleNext = async () => {
    setAnswer(""); setFeedback(""); resetTranscript();
    if (currentIndex + 1 >= questions.length) { finishInterview(); return; }
    await speakText("Let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => { if (isMicOn) startMic(); }, 300);
  };

  const finishInterview = async () => {
    stopMic(); setIsMicOn(false);
    try { const r = await axios.post(`${serverUrl}/interview/finish`, { interviewId }, { withCredentials: true }); onFinish(r.data); } catch (e) { console.log(e); }
  };

  useEffect(() => { if (isIntroPhase || !currentQuestion || isSubmitting || feedback) return; if (timeLeft === 0) handleSubmitAnswer(); }, [timeLeft]);

  return (
    <motion.section variants={pageVariants} initial="hidden" animate="show" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* AI Panel */}
        <motion.aside variants={panelVariants} className="glass-card rounded-2xl p-5 shadow-lg shadow-slate-200/40 sm:p-6">
          <div className="flex h-full flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-600 shadow-sm">✦ LIVE AI INTERVIEWER</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <motion.span animate={isAiPlaying ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }}
                  className={`h-2 w-2 rounded-full ${isAiPlaying ? "bg-indigo-500" : "bg-slate-300"}`} />
                <span>{isAiPlaying ? "Speaking" : "Listening"}</span>
              </div>
            </div>

            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }} className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-900 shadow-xl">
                <video src={voiceGender == "female" ? femaleVideo : maleVideo} muted ref={videoRef} playsInline preload="auto" className="h-auto w-full object-cover" />
                {isAiPlaying && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-1.5 rounded-full border border-white/20 bg-slate-900/70 px-3 py-1.5 backdrop-blur-sm">
                    {[0,1,2,3,4].map((b) => (
                      <motion.span key={b} animate={{ height: [6, 16, 8, 14, 6] }} transition={{ duration: 1, repeat: Infinity, delay: b * 0.1, ease: "easeInOut" }} className="w-1 rounded-full bg-indigo-400" />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="min-h-16 rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-3 text-center shadow-sm">
              <AnimatePresence mode="wait">
                {subtitle ? (
                  <motion.p key={subtitle} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-sm leading-relaxed text-slate-700 sm:text-base">{subtitle}</motion.p>
                ) : isAiPlaying && (
                  <motion.p key="dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-indigo-500">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>Thinking...</motion.span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="rounded-xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-400">
                <span>Status</span>
                <span className={isAiPlaying ? "text-indigo-600" : "text-slate-400"}>{isAiPlaying ? "AI speaking" : "Awaiting response"}</span>
              </div>
              {!isIntroPhase && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"><Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} /></div>
                  <div className="grid flex-1 grid-cols-2 gap-3">
                    {[{ v: currentIndex + 1, l: "Current" }, { v: questions.length, l: "Total" }].map((s) => (
                      <div key={s.l} className="rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-3 text-center shadow-sm">
                        <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{s.v}</p>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Answer Panel */}
        <motion.main variants={panelVariants} className="glass-card rounded-2xl p-5 shadow-lg shadow-slate-200/40 sm:p-7">
          <div className="flex h-full flex-col gap-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Step 2 of 3</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">AI Smart <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Interview</span></h2>
              <p className="mt-1 text-sm text-slate-500">Answer clearly and confidently.</p>
            </div>

            <AnimatePresence mode="wait">
              {!isIntroPhase && (
                <motion.div key={currentIndex} variants={questionVariants} initial="initial" animate="animate" exit="exit"
                  className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/50 p-5 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">✦ Current Question</p>
                  <p className="text-base leading-relaxed text-slate-800 sm:text-lg">{currentQuestion?.question}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <textarea ref={answerInputRef} placeholder="Type your answer here..." onChange={(e) => setAnswer(e.target.value)} value={answer}
                disabled={isSubmitting || isIntroPhase}
                className="min-h-44 w-full resize-y rounded-xl border border-slate-200 bg-white/80 p-4 text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-md focus:shadow-indigo-100 focus:scale-[1.005]" />

              {!feedback ? (
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={toggleMic}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isMicOn ? "border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}>
                    <motion.span animate={isMicOn ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }} className={`h-2 w-2 rounded-full ${isMicOn ? "bg-indigo-500" : "bg-slate-400"}`} />
                    {isMicOn ? "Mic On" : "Mic Off"}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !answer.trim() || isIntroPhase}
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/40 hover:shadow-xl disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed">
                    {isSubmitting ? (<span className="inline-flex items-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</span>) : "Submit Answer"}
                  </motion.button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: "auto", scale: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}
                  className="overflow-hidden rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-green-50/50 p-4 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">✦ AI Feedback</p>
                  <p className="text-sm leading-relaxed text-slate-700">{feedback}</p>
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                    className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/40 hover:shadow-xl">
                    Next Question →
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </motion.section>
  );
}

export default Step2interview;
