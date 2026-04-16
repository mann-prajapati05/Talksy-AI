import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Step3Report from "../components/Step3Report";
import { serverUrl } from "./App";

function InterviewReport() {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/interview/report/${interviewId}`,
          { withCredentials: true },
        );
        setReport(result.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReport();
  }, []);

  if (!report) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading report...</p>
        </div>
      </div>
    );
  }

  return <Step3Report report={report} />;
}

export default InterviewReport;
