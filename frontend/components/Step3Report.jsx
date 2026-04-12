import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SAFE_SCORE_MIN = 0;
const SAFE_SCORE_MAX = 10;

const clampScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(SAFE_SCORE_MAX, Math.max(SAFE_SCORE_MIN, num));
};

const toTitle = (value) => {
  const text = String(value || "").trim();
  if (!text) return "Not available";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Not available";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDuration = (minutes) => {
  const numericMinutes = Number(minutes);
  if (!Number.isFinite(numericMinutes) || numericMinutes <= 0) {
    return "Not recorded";
  }
  if (numericMinutes < 60) return `${Math.round(numericMinutes)} mins`;
  const hours = Math.floor(numericMinutes / 60);
  const remainingMins = Math.round(numericMinutes % 60);
  return `${hours}h ${remainingMins}m`;
};

const getScoreMeta = (score) => {
  const safe = clampScore(score);
  if (safe >= 7.5) {
    return {
      label: "Strong",
      badgeClass: "border-emerald-300/30 bg-emerald-400/15 text-emerald-100",
      textClass: "text-emerald-300",
      fillClass: "bg-emerald-400",
      icon: CheckCircle2,
    };
  }

  if (safe >= 5) {
    return {
      label: "Average",
      badgeClass: "border-amber-300/30 bg-amber-400/15 text-amber-100",
      textClass: "text-amber-300",
      fillClass: "bg-amber-400",
      icon: CircleAlert,
    };
  }

  return {
    label: "Needs improvement",
    badgeClass: "border-rose-300/30 bg-rose-400/15 text-rose-100",
    textClass: "text-rose-300",
    fillClass: "bg-rose-400",
    icon: CircleAlert,
  };
};

const getPerformanceCopy = (score) => {
  const safe = clampScore(score);

  if (safe > 8) {
    return {
      line: "Outstanding Performance",
      tagline:
        "Excellent interview quality with strong consistency across answers.",
      className: "text-emerald-300",
    };
  }

  if (safe > 5 && safe < 8) {
    return {
      line: "Good Performance",
      tagline: "Solid baseline with room to sharpen depth and clarity.",
      className: "text-amber-300",
    };
  }

  return {
    line: "Needs Improvement",
    tagline:
      "Focus on fundamentals and structured responses in your next practice.",
    className: "text-rose-300",
  };
};

function SkeletonReport() {
  return (
    <section className="mx-auto mt-6 max-w-6xl animate-pulse px-4 pb-14 sm:px-6 lg:px-8">
      <div className="h-30 rounded-3xl border border-white/10 bg-white/5" />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="h-36 rounded-2xl border border-white/10 bg-white/5 lg:col-span-2" />
        <div className="h-36 rounded-2xl border border-white/10 bg-white/5" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="h-34 rounded-2xl border border-white/10 bg-white/5" />
        <div className="h-34 rounded-2xl border border-white/10 bg-white/5" />
        <div className="h-34 rounded-2xl border border-white/10 bg-white/5" />
      </div>
      <div className="mt-5 h-82 rounded-3xl border border-white/10 bg-white/5" />
    </section>
  );
}

function HeaderCard({
  candidateName,
  role,
  dateLabel,
  durationLabel,
  finalScore,
}) {
  const scoreMeta = getScoreMeta(finalScore);
  const performanceCopy = getPerformanceCopy(finalScore);
  const ScoreIcon = scoreMeta.icon;

  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/90 via-slate-900/75 to-cyan-950/45 p-6 shadow-[0_24px_65px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-14 h-40 w-40 rounded-full bg-violet-500/18 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Interview Report
          </p>

          <h2 className="mt-4 text-2xl font-semibold text-slate-100 sm:text-3xl">
            {candidateName}
          </h2>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">{role}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300 sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <CalendarDays className="h-4 w-4 text-cyan-300" />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Clock3 className="h-4 w-4 text-cyan-300" />
              {durationLabel}
            </span>
          </div>
        </div>

        <div className="min-w-50 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
            Final Score
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-5xl font-semibold text-slate-100">
              {clampScore(finalScore).toFixed(1)}
            </p>
            <p className="text-sm text-slate-400">/ 10</p>
          </div>
          <span
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${scoreMeta.badgeClass}`}
          >
            <ScoreIcon className="h-4 w-4" />
            {scoreMeta.label}
          </span>

          <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/45 p-3">
            <p className={`text-sm font-semibold ${performanceCopy.className}`}>
              {performanceCopy.line}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              {performanceCopy.tagline}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function SkillCard({ title, icon: Icon, score }) {
  const safeScore = clampScore(score);
  const scoreMeta = getScoreMeta(safeScore);
  const progressWidth = `${(safeScore / SAFE_SCORE_MAX) * 100}%`;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100 sm:text-base">
          <Icon className="h-5 w-5 text-cyan-300" />
          {title}
        </h4>
        <span className={`text-sm font-semibold ${scoreMeta.textClass}`}>
          {safeScore.toFixed(1)} / 10
        </span>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${scoreMeta.fillClass} transition-all duration-700`}
          style={{ width: progressWidth }}
        />
      </div>

      <span
        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${scoreMeta.badgeClass}`}
      >
        {scoreMeta.label}
      </span>
    </article>
  );
}

function PerformanceChart({ data }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
        <TrendingUp className="h-5 w-5 text-cyan-300" />
        Question Score Trend
      </h3>

      <div className="mt-5 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.22)"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(148,163,184,0.25)" }}
            />
            <Tooltip
              cursor={{ stroke: "rgba(56,189,248,0.4)", strokeWidth: 1 }}
              contentStyle={{
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148,163,184,0.22)",
                borderRadius: "12px",
                color: "#e2e8f0",
              }}
              formatter={(value) => [
                `${Number(value).toFixed(1)} / 10`,
                "Score",
              ]}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22d3ee"
              strokeWidth={2.2}
              fill="url(#scoreFill)"
              activeDot={{
                r: 5,
                fill: "#06b6d4",
                stroke: "#cffafe",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function QuestionCard({ question, index }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const score = clampScore(question?.score);
  const scoreMeta = getScoreMeta(score);
  const ScoreIcon = scoreMeta.icon;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/25">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            Question {index + 1}
          </p>
          <h4 className="mt-1 text-sm leading-6 text-slate-100 sm:text-base">
            {question?.question || "Question text not available"}
          </h4>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreMeta.badgeClass}`}
          >
            <ScoreIcon className="h-3.5 w-3.5" />
            {score.toFixed(1)}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-300" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-300" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 sm:px-5 sm:pt-4">
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Candidate Answer
              </p>
              <p className="mt-2 leading-6 text-slate-200">
                {question?.answer?.trim() || "Answer not submitted"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                AI Feedback
              </p>
              <p className="mt-2 leading-6 text-slate-200">
                {question?.feedback?.trim() || "Feedback not available"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              Difficulty: {toTitle(question?.difficulty)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              Type: {toTitle(question?.questionType)}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}

function AdditionalInsights({ averageScore, bestQuestion, weakestQuestion }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5 backdrop-blur-xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100/90">
          <Target className="h-4 w-4" />
          Average Score
        </p>
        <p className="mt-2 text-3xl font-semibold text-cyan-100">
          {clampScore(averageScore).toFixed(1)}
        </p>
      </article>

      <article className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur-xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-100/90">
          <Trophy className="h-4 w-4" />
          Best Question
        </p>
        <p className="mt-2 text-sm leading-6 text-emerald-50">
          {bestQuestion?.question || "Not enough data"}
        </p>
        <p className="mt-2 text-sm font-semibold text-emerald-100">
          Score: {clampScore(bestQuestion?.score).toFixed(1)} / 10
        </p>
      </article>

      <article className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-5 backdrop-blur-xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-amber-100/90">
          <ShieldCheck className="h-4 w-4" />
          Weakest Question
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-50">
          {weakestQuestion?.question || "Not enough data"}
        </p>
        <p className="mt-2 text-sm font-semibold text-amber-100">
          Score: {clampScore(weakestQuestion?.score).toFixed(1)} / 10
        </p>
      </article>
    </section>
  );
}

function Step3Report({ report }) {
  const reduxUserName = useSelector((state) =>
    String(state?.user?.userData?.name || "").trim(),
  );

  const normalized = useMemo(() => {
    if (!report || typeof report !== "object") {
      return null;
    }

    const questionList = Array.isArray(report?.questionWiseScore)
      ? report.questionWiseScore
      : [];

    const chartData = questionList.map((item, index) => ({
      label: `Q${index + 1}`,
      score: clampScore(item?.score),
      question: item?.question || `Question ${index + 1}`,
    }));

    const avgQuestionScore = chartData.length
      ? chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length
      : 0;

    const sortedByScore = [...questionList].sort(
      (a, b) => clampScore(b?.score) - clampScore(a?.score),
    );

    const bestQuestion = sortedByScore[0] || null;
    const weakestQuestion = sortedByScore[sortedByScore.length - 1] || null;

    const durationFromQuestions = questionList.reduce((sum, item) => {
      const timeTaken = Number(item?.timeTaken || 0);
      return sum + (Number.isFinite(timeTaken) ? timeTaken : 0);
    }, 0);

    return {
      candidateName:
        reduxUserName ||
        report?.candidateName ||
        report?.candidate?.name ||
        report?.userName ||
        "Candidate",
      role: report?.role || report?.position || "Interview Role",
      createdAt: report?.createdAt,
      durationLabel: formatDuration(
        report?.durationMinutes ||
          report?.duration ||
          report?.metadata?.durationMinutes ||
          durationFromQuestions / 60,
      ),
      finalScore: clampScore(report?.finalScore),
      communication: clampScore(report?.communication),
      correctness: clampScore(report?.correctness),
      confidence: clampScore(report?.confidence),
      questionList,
      chartData,
      averageScore: avgQuestionScore,
      bestQuestion,
      weakestQuestion,
    };
  }, [report, reduxUserName]);

  if (!normalized) {
    return <SkeletonReport />;
  }

  const {
    candidateName,
    role,
    createdAt,
    durationLabel,
    finalScore,
    communication,
    correctness,
    confidence,
    questionList,
    chartData,
    averageScore,
    bestQuestion,
    weakestQuestion,
  } = normalized;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const safeCandidate = candidateName || "Candidate";
    const safeRole = role || "Interview Role";
    const safeDate = formatDate(createdAt);
    const safeDuration = durationLabel || "Not recorded";
    const safeFinalScore = clampScore(finalScore).toFixed(1);
    const bestScore = clampScore(bestQuestion?.score).toFixed(1);
    const weakestScore = clampScore(weakestQuestion?.score).toFixed(1);

    const getSkillRemark = (scoreValue) => {
      const safeScoreValue = clampScore(scoreValue);
      if (safeScoreValue >= 8) return "Excellent";
      if (safeScoreValue >= 6) return "Good";
      if (safeScoreValue >= 4) return "Average";
      return "Needs improvement";
    };

    let currentY = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("Interview Evaluation Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 4;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1);
    currentY += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Candidate & Interview Info", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    const infoRows = [
      ["Candidate Name", safeCandidate],
      ["Role / Position", safeRole],
      ["Date", safeDate],
      ["Duration", safeDuration],
      ["Final Score", `${safeFinalScore} / 10`],
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: "grid",
      body: infoRows,
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 2.6,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: "bold", textColor: [15, 23, 42] },
        1: { cellWidth: "auto" },
      },
      didParseCell: (hookData) => {
        if (
          hookData.section === "body" &&
          hookData.row.index === 4 &&
          hookData.column.index === 1
        ) {
          hookData.cell.styles.textColor = [37, 99, 235];
          hookData.cell.styles.fontStyle = "bold";
        }
      },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Skill", "Score", "Remarks"]],
      body: [
        [
          "Correctness",
          `${clampScore(correctness).toFixed(1)} / 10`,
          getSkillRemark(correctness),
        ],
        [
          "Communication",
          `${clampScore(communication).toFixed(1)} / 10`,
          getSkillRemark(communication),
        ],
        [
          "Confidence",
          `${clampScore(confidence).toFixed(1)} / 10`,
          getSkillRemark(confidence),
        ],
      ],
      theme: "striped",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 2.8,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 46 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: "auto" },
      },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Performance Overview", margin, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: "grid",
      body: [
        ["Average score", `${clampScore(averageScore).toFixed(1)} / 10`],
        ["Best question score", `${bestScore} / 10`],
        ["Weakest question score", `${weakestScore} / 10`],
      ],
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 2.6,
      },
      columnStyles: {
        0: { cellWidth: 58, fontStyle: "bold" },
        1: { cellWidth: "auto" },
      },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    const questionRows = (questionList || []).map((item, index) => [
      `${index + 1}`,
      String(item?.question || "Not available"),
      `${clampScore(item?.score).toFixed(1)} / 10`,
      String(item?.feedback || "Feedback not available"),
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Question No", "Question", "Score", "Feedback"]],
      body: questionRows.length
        ? questionRows
        : [["-", "Question data not available", "-", "-"]],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2.4,
        valign: "top",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 22, halign: "center" },
        1: { cellWidth: 72 },
        2: { cellWidth: 24, halign: "center" },
        3: { cellWidth: "auto" },
      },
    });

    const generatedAt = new Date();
    const generatedTimeText = new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(generatedAt);

    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Generated by AI Interview System", margin, pageHeight - 10);
      doc.text(`Generated: ${generatedTimeText}`, margin, pageHeight - 6);
      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 8,
        {
          align: "right",
        },
      );
    }

    const safeFileName = `Interview_Report_${safeCandidate.replace(/\s+/g, "_")}.pdf`;
    doc.save(safeFileName);
  };

  return (
    <section className="relative mx-auto mt-6 max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-14 right-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-52 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />

      <div className="relative z-10 space-y-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.28)] transition-all duration-300 hover:translate-y-px hover:shadow-[0_16px_34px_rgba(59,130,246,0.35)]"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        <HeaderCard
          candidateName={candidateName}
          role={role}
          dateLabel={formatDate(createdAt)}
          durationLabel={durationLabel}
          finalScore={finalScore}
        />

        <section className="grid gap-4 md:grid-cols-3">
          <SkillCard title="Correctness" icon={Target} score={correctness} />
          <SkillCard
            title="Communication"
            icon={MessageSquareQuote}
            score={communication}
          />
          <SkillCard title="Confidence" icon={Star} score={confidence} />
        </section>

        <PerformanceChart data={chartData} />

        <AdditionalInsights
          averageScore={averageScore}
          bestQuestion={bestQuestion}
          weakestQuestion={weakestQuestion}
        />

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
          <h3 className="text-lg font-semibold text-slate-100">
            Question-wise Breakdown
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Expand each card to review answer quality and actionable AI
            feedback.
          </p>

          <div className="mt-5 space-y-3">
            {questionList.length > 0 ? (
              questionList.map((question, index) => (
                <QuestionCard
                  key={`${question?.question || "question"}-${index}`}
                  question={question}
                  index={index}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 text-sm text-slate-300">
                Question-level data is not available for this report.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Step3Report;
