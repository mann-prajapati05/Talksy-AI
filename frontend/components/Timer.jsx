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
          ? {
              scale: [1, 1.05, 1],
              filter: [
                "drop-shadow(0 0 0 rgba(248,113,113,0))",
                "drop-shadow(0 0 10px rgba(248,113,113,0.4))",
                "drop-shadow(0 0 0 rgba(248,113,113,0))",
              ],
            }
          : { scale: 1, filter: "drop-shadow(0 0 10px rgba(34,211,238,0.2))" }
      }
      transition={
        isLowTime
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4, ease: "easeOut" }
      }
      className="rounded-full border border-white/10 bg-slate-900/55 p-2"
    >
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          pathColor: isLowTime ? "#fb7185" : "#22d3ee",
          trailColor: "rgba(255,255,255,0.12)",
          textColor: isLowTime ? "#fecaca" : "#e2e8f0",
          textSize: "22px",
          strokeLinecap: "round",
          pathTransitionDuration: 0.35,
        })}
      />
    </motion.div>
  );
}

export default Timer;
