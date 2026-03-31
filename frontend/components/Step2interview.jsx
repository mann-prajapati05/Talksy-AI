import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { finishInterview } from "../../backend/controller/interviewController";
import { time } from "framer-motion";

function Step2interview({ interviewData, onFinish }) {
  const { interviewId, userName, questions } = interviewData;
  const maleVideo = "../public/male-ai.mp4";
  const femaleVideo = "../public/female-ai.mp4";
  const userData = useSelector((state) => state.user);

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recongnitionRef = useRef(null);
  const [isAiPlaying, setIsAiPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState(userData?.gender || "female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  // text to voice function
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
    });
    window.speechSynthesis.cencel(); //cencel out previous voice

    //to add natural pauses after commas and periods
    const humanText = text.replace(/,/g, ", ...").replace(/\./g, ". ... ");

    const utterance = new SpeechSynthesisUtterance(humanText);
    utterance.voice = voiceGender === "male" ? "maleVoice" : "femaleVoice";

    //human like pacing
    utterance.rate = 0.92; //slighhtly slower than normal
    utterance.pitch = 1.05; //small warmth
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsAiPlaying(true);
      stopMic();
      videoRef.current?.play();
    };

    utterance.onend = () => {
      videoRef.current?.pause();
      videoRef.current.currentTime = 0;
      setIsAiPlaying(false);

      if (isMicOn) startMic();

      setTimeout(() => {
        setSubtitle("");
        resolve();
      }, 300);
    };

    setSubtitle(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`
          Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready. 
          `);

        await speakText(`
          I'll ask you some questions. just answer naturally, and take your time. Let's begin.
          `);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));
        if (currentQuestion.questionType.toLowerCase() == "hard") {
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
    if (!("webkitSpeechRecognition" in window)) {
      console.log("we can't speak..");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transript = event.results[event.results.length - 1][0].transript;

      setAnswer((prev) => prev + " " + transript);
    };

    recongnitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recongnitionRef.current && !isAiPlaying) {
      try {
        recongnitionRef.current.start();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const stopMic = () => {
    if (recongnitionRef.current) {
      recongnitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      startMic();
    } else {
      stopMic();
    }
    setIsMicOn(!isMicOn);
  };

  const handleSubmitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        "http://localhost:8010/interview/submit-answer",
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
        "http://localhost:8010/interview/finish",
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

  useEffect(() => {
    return () => {
      if (recongnitionRef.current) {
        recongnitionRef.current.stop();
        recongnitionRef.current.abort();
      }
      window.speechSynthesis.cencel();
    };
  }, []);

  return (
    <div>
      <div>
        {/* left section */}
        <div>
          {/* video section */}
          <div>
            <video
              src={voiceGender == "female" ? femaleVideo : maleVideo}
              muted
              ref={videoRef}
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle area */}
          {subtitle && (
            <div>
              <p>{subtitle}</p>
            </div>
          )}
          {/* timer area */}
          <div>
            <div>
              <span>Interview status</span>
              <span>{isAiPlaying ? "AI speaking" : ""}</span>
            </div>
            {!isIntroPhase && (
              <>
                <div>
                  <Timer
                    timeLeft={timeLeft}
                    totalTime={currentQuestion?.timeLimit || 60}
                  ></Timer>
                </div>
                <div></div>
                <div>
                  <div>
                    <span>{currentIndex + 1}</span>
                    <span>Current Question</span>
                  </div>
                  <div>
                    <span>{questions.length}</span>
                    <span>Total Questions</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right section */}
        <div>
          <h2>AI Smart Interview</h2>
          <div>
            {!isIntroPhase && <div>{currentQuestion?.question}</div>}
            <textarea
              placeholder="Type your answer here.."
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              name="answer"
              id="answer"
            />

            {!feedback ? (
              <div>
                <button onClick={toggleMic}>
                  {/* microphone icon based on isMicOn*/}
                </button>
                <button onClick={handleSubmitAnswer} disabled={isSubmitting}>
                  {" "}
                  {isSubmitting ? "submit answer" : "submitting"}
                </button>
              </div>
            ) : (
              <div>
                <p>{feedback}</p>
                <button onClick={handleNext}>Next Question</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step2interview;
