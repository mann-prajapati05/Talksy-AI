import { useState } from "react";
import Step1Setup from "../components/Step1Setup";
import Step2interview from "../components/Step2interview";
import Step3Report from "../components/Step3Report";

const MockHire = () => {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <>
      <div>
        {step === 1 && (
          <Step1Setup
            onStart={(data) => {
              setInterviewData(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <Step2interview
            interviewData={interviewData}
            onFinish={(report) => {
              setInterviewData(report);
              setStep(3);
            }}
          />
        )}
        {step === 3 && <Step3Report report={interviewData} />}
      </div>
    </>
  );
};
export default MockHire;
