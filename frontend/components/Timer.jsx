import React from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/style.css";

function Timer({ timeLeft, totalTime }) {
  const percentage = (timeLeft * 100) / totalTime;
  return (
    <div>
      <CircularProgressbar value={percentage} text={`${timeLeft}s`} />
    </div>
  );
}

export default Timer;
