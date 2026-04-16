import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Step3Report from "../components/Step3Report";
import { serverUrl } from "../routes/App";

function interviewReport() {
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
    return <div> Loading report..</div>;
  }

  return <Step3Report report={report} />;
}

export default interviewReport;
