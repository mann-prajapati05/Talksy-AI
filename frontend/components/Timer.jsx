import React from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function Timer({ timeLeft, totalTime }) {
  const percentage = (timeLeft * 100) / totalTime;
  const isLowTime = timeLeft <= Math.max(10, Math.floor(totalTime * 0.2));

  return (
    <motion.div
      animate={
        isLowTime
          ? { scale: [1, 1.04, 1] }
          : { scale: 1 }
      }
      transition={
        isLowTime
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3, ease: "easeOut" }
      }
      className="rounded-full border border-slate-200/60 bg-white/80 p-2 shadow-lg shadow-slate-200/40 backdrop-blur-sm"
    >
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          pathColor: isLowTime ? "#ef4444" : "#6366f1",
          trailColor: "#e2e8f0",
          textColor: isLowTime ? "#dc2626" : "#0f172a",
          textSize: "22px",
          strokeLinecap: "round",
          pathTransitionDuration: 0.35,
        })}
      />
    </motion.div>
  );
}

export default Timer;
