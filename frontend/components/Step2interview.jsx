import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Timer from "./Timer";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { serverUrl } from "../routes/App";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const questionVariants = {
  initial: { opacity: 0, x: 24 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2, ease: "easeIn" } },
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
  const [questionPulse, setQuestionPulse] = useState(false);

  const videoRef = useRef(null);
  const answerInputRef = useRef(null);
  const hasCompletedIntroRef = useRef(false);
  const isRunningIntroRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const getPreferredVoice = () => {
    if (!window.speechSynthesis?.getVoices) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const preferredKeywords =
      voiceGender === "male"
        ? ["male", "david", "guy", "mark", "john", "alex"]
        : ["female", "zira", "samantha", "victoria", "aria", "eva"];

    const keywordMatch = voices.find((voice) => {
      const normalizedName = voice.name.toLowerCase();
      return preferredKeywords.some((keyword) =>
        normalizedName.includes(keyword),
      );
    });

    if (keywordMatch) return keywordMatch;

    const englishVoice = voices.find((voice) =>
      voice.lang?.toLowerCase().startsWith("en"),
    );

    return englishVoice || voices[0] || null;
  };

  const waitForVoices = () => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis?.getVoices) {
        resolve();
        return;
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        resolve();
        return;
      }

      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          onVoicesChanged,
        );
        resolve();
      };

      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);

      setTimeout(() => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          onVoicesChanged,
        );
        resolve();
      }, 500);
    });
  };

  // text to voice function
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      waitForVoices().then(() => {
        window.speechSynthesis.cancel(); // cancel previous voice

        const cleanText = (text || "").trim().replace(/\s+/g, " ");

        //to add natural pauses after commas and periods
        const humanText = cleanText
          .replace(/,/g, ", ...")
          .replace(/\./g, ". ... ");

        const utterance = new SpeechSynthesisUtterance(humanText);
        const selectedVoice = getPreferredVoice();
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        //human like pacing
        utterance.rate = 0.92; //slightly slower than normal
        utterance.pitch = 1.05; //small warmth
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsAiPlaying(true);
          stopMic();
          videoRef.current?.play();
        };

        utterance.onend = () => {
          videoRef.current?.pause();
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
          }
          setIsAiPlaying(false);

          if (isMicOn && !isIntroPhase) startMic();

          setTimeout(() => {
            setSubtitle("");
            resolve();
          }, 300);
        };

        utterance.onerror = () => {
          setIsAiPlaying(false);
          setSubtitle("");
          resolve();
        };

        setSubtitle(cleanText);
        window.speechSynthesis.speak(utterance);
      });
    });
  };

  useEffect(() => {
    const runIntro = async () => {
      if (isIntroPhase) {
        if (hasCompletedIntroRef.current || isRunningIntroRef.current) {
          return;
        }

        isRunningIntroRef.current = true;
        await new Promise((r) => setTimeout(r, 300));

        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          `I'll ask you some questions. Just answer naturally, and take your time. Let's begin.`,
        );

        hasCompletedIntroRef.current = true;
        isRunningIntroRef.current = false;
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        if (!hasCompletedIntroRef.current) {
          return;
        }

        await new Promise((r) => setTimeout(r, 800));
        if (currentQuestion.questionType?.toLowerCase() === "hard") {
          await speakText("Next Question might be more challenging...");
        }
        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    };
    runIntro();
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase || !currentQuestion || isSubmitting) {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isIntroPhase) {
      answerInputRef.current?.focus();
      setQuestionPulse(true);
      const timeout = setTimeout(() => setQuestionPulse(false), 900);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, isIntroPhase]);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.log("we can't speak..");
      return;
    }
    setAnswer(transcript);
  }, [transcript, browserSupportsSpeechRecognition]);

  const startMic = () => {
    if (!isAiPlaying) {
      try {
        SpeechRecognition.startListening({ continuous: true });
      } catch (err) {
        console.log(err);
      }
    }
  };

  const stopMic = () => {
    SpeechRecognition.stopListening();
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const handleSubmitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        `${serverUrl}/interview/submit-answer`,
        {
          interviewId,
          questionIndex: currentIndex,
          answer: answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (err) {
      console.log(err);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    resetTranscript();

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright , let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 300);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);

    try {
      const result = await axios.post(
        `${serverUrl}/interview/finish`,
        {
          interviewId,
        },
        { withCredentials: true },
      );
      console.log(result.data);
      onFinish(result.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      handleSubmitAnswer();
    }
  }, [timeLeft]);

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_1fr]">
        <motion.aside
          variants={panelVariants}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex h-full flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-600">
                LIVE AI INTERVIEWER
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isAiPlaying
                      ? "bg-indigo-500 shadow-sm"
                      : "bg-slate-300"
                  }`}
                />
                <span>{isAiPlaying ? "Speaking" : "Listening"}</span>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                repeat: Infinity,
                duration: 5.2,
                ease: "easeInOut",
              }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
                <video
                  src={voiceGender == "female" ? femaleVideo : maleVideo}
                  muted
                  ref={videoRef}
                  playsInline
                  preload="auto"
                  className="h-auto w-full object-cover"
                />

                {isAiPlaying && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-1.5 rounded-full border border-white/20 bg-slate-900/70 px-3 py-1.5 backdrop-blur-sm">
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <motion.span
                        key={bar}
                        animate={{ height: [6, 16, 8, 14, 6] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: bar * 0.1,
                          ease: "easeInOut",
                        }}
                        className="w-1 rounded-full bg-indigo-400"
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="min-h-16 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <AnimatePresence mode="wait">
                {subtitle ? (
                  <motion.p
                    key={subtitle}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="text-sm leading-relaxed text-slate-700 sm:text-base"
                  >
                    {subtitle}
                  </motion.p>
                ) : (
                  isAiPlaying && (
                    <motion.p
                      key="thinking"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm text-indigo-600"
                    >
                      Thinking...
                    </motion.p>
                  )
                )}
              </AnimatePresence>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-400">
                <span>Interview Status</span>
                <span
                  className={isAiPlaying ? "text-indigo-600" : "text-slate-400"}
                >
                  {isAiPlaying ? "AI speaking" : "Awaiting response"}
                </span>
              </div>

              {!isIntroPhase && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                    <Timer
                      timeLeft={timeLeft}
                      totalTime={currentQuestion?.timeLimit || 60}
                    ></Timer>
                  </div>

                  <div className="grid flex-1 grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className="text-xl font-bold text-slate-900">
                        {currentIndex + 1}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Current
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className="text-xl font-bold text-slate-900">
                        {questions.length}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Total
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        <motion.main
          variants={panelVariants}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="show"
            className="flex h-full flex-col gap-5"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Step 2 of 3
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                AI Smart Interview
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Answer clearly and confidently. Your response will be reviewed
                in real-time.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isIntroPhase && (
                <motion.div
                  key={currentIndex}
                  variants={questionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="rounded-xl border border-indigo-200 bg-indigo-50 p-5"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Current Question
                  </p>
                  <p className="text-base leading-relaxed text-slate-800 sm:text-lg">
                    {currentQuestion?.question}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <textarea
                ref={answerInputRef}
                placeholder="Type your answer here..."
                onChange={(e) => setAnswer(e.target.value)}
                value={answer}
                name="answer"
                id="answer"
                disabled={isSubmitting || isIntroPhase}
                className="min-h-44 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />

              {!feedback ? (
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleMic}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isMicOn
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {isMicOn ? "Mic On" : "Mic Off"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !answer.trim() || isIntroPhase}
                    className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                  </motion.button>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.98 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      AI Feedback
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {feedback}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleNext}
                      className="mt-4 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md"
                    >
                      Next Question
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.main>
      </div>
    </motion.section>
  );
}

export default Step2interview;
