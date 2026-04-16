import React, { useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  CalendarDays, CheckCircle2, Download, ChevronDown, CircleAlert,
  Clock3, MessageSquareQuote, ShieldCheck, Sparkles, Star, Target, TrendingUp, Trophy,
} from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SAFE_SCORE_MIN = 0;
const SAFE_SCORE_MAX = 10;
const clampScore = (v) => { const n = Number(v); if (Number.isNaN(n)) return 0; return Math.min(SAFE_SCORE_MAX, Math.max(SAFE_SCORE_MIN, n)); };
const toTitle = (v) => { const t = String(v || "").trim(); if (!t) return "Not available"; return t.charAt(0).toUpperCase() + t.slice(1); };
const formatDate = (d) => { if (!d) return "Not available"; const date = new Date(d); if (Number.isNaN(date.getTime())) return "Not available"; return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date); };
const formatDuration = (m) => { const n = Number(m); if (!Number.isFinite(n) || n <= 0) return "Not recorded"; if (n < 60) return `${Math.round(n)} mins`; return `${Math.floor(n / 60)}h ${Math.round(n % 60)}m`; };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const getScoreMeta = (score) => {
  const s = clampScore(score);
  if (s >= 7.5) return { label: "Strong", badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700", textClass: "text-emerald-600", fillClass: "bg-emerald-500", icon: CheckCircle2 };
  if (s >= 5) return { label: "Average", badgeClass: "border-amber-200 bg-amber-50 text-amber-700", textClass: "text-amber-600", fillClass: "bg-amber-500", icon: CircleAlert };
  return { label: "Needs improvement", badgeClass: "border-red-200 bg-red-50 text-red-700", textClass: "text-red-600", fillClass: "bg-red-500", icon: CircleAlert };
};

const getPerformanceCopy = (score) => {
  const s = clampScore(score);
  if (s > 8) return { line: "Outstanding Performance", tagline: "Excellent quality with strong consistency.", className: "text-emerald-600" };
  if (s > 5) return { line: "Good Performance", tagline: "Solid baseline with room to improve.", className: "text-amber-600" };
  return { line: "Needs Improvement", tagline: "Focus on fundamentals in your next practice.", className: "text-red-600" };
};

function SkeletonReport() {
  return (
    <section className="mx-auto mt-6 max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="h-30 rounded-2xl border border-slate-200/60 shimmer" />
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="h-36 rounded-xl shimmer lg:col-span-2" />
        <div className="h-36 rounded-xl shimmer" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[0,1,2].map((i) => <div key={i} className="h-34 rounded-xl shimmer" />)}
      </div>
      <div className="mt-5 h-82 rounded-2xl shimmer" />
    </section>
  );
}

function HeaderCard({ candidateName, role, dateLabel, durationLabel, finalScore }) {
  const meta = getScoreMeta(finalScore);
  const perf = getPerformanceCopy(finalScore);
  const Icon = meta.icon;

  return (
    <motion.header variants={fadeUp} className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-200/40 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />Interview Report
          </p>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">{candidateName}</h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">{role}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-3 py-1.5 shadow-sm"><CalendarDays className="h-4 w-4 text-indigo-500" />{dateLabel}</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-3 py-1.5 shadow-sm"><Clock3 className="h-4 w-4 text-indigo-500" />{durationLabel}</span>
          </div>
        </div>
        <div className="min-w-50 rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Final Score</p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{clampScore(finalScore).toFixed(1)}</p>
            <p className="text-sm text-slate-400">/ 10</p>
          </div>
          <span className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}><Icon className="h-4 w-4" />{meta.label}</span>
          <div className="mt-3 rounded-lg border border-slate-200/60 bg-white/80 p-3">
            <p className={`text-sm font-semibold ${perf.className}`}>{perf.line}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{perf.tagline}</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function SkillCard({ title, icon: Icon, score }) {
  const s = clampScore(score);
  const meta = getScoreMeta(s);
  const w = `${(s / SAFE_SCORE_MAX) * 100}%`;
  return (
    <motion.article variants={fadeUp} whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
      className="gradient-border rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-indigo-100/40">
      <div className="flex items-center justify-between gap-3">
        <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 sm:text-base"><Icon className="h-5 w-5 text-indigo-500" />{title}</h4>
        <span className={`text-sm font-semibold ${meta.textClass}`}>{s.toFixed(1)} / 10</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div initial={{ width: 0 }} animate={{ width: w }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full ${meta.fillClass}`} />
      </div>
      <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${meta.badgeClass}`}>{meta.label}</span>
    </motion.article>
  );
}

function PerformanceChart({ data }) {
  return (
    <motion.section variants={fadeUp} className="glass-card rounded-2xl p-5 shadow-lg shadow-slate-200/40 sm:p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><TrendingUp className="h-5 w-5 text-indigo-500" />Question Score Trend</h3>
      <div className="mt-5 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
            <YAxis domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
            <Tooltip cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeOpacity: 0.3 }} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }} formatter={(v) => [`${Number(v).toFixed(1)} / 10`, "Score"]} />
            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.2} fill="url(#scoreFill)" activeDot={{ r: 5, fill: "#6366f1", stroke: "#c7d2fe", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

function QuestionCard({ question, index }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const score = clampScore(question?.score);
  const meta = getScoreMeta(score);
  const Icon = meta.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-indigo-200/60"
    >
      <button type="button" onClick={() => setIsOpen((p) => !p)} className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Question {index + 1}</p>
          <h4 className="mt-1 text-sm leading-6 text-slate-900 sm:text-base">{question?.question || "Not available"}</h4>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badgeClass}`}><Icon className="h-3.5 w-3.5" />{score.toFixed(1)}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
            <div className="border-t border-slate-200/60 px-4 pb-4 pt-3 sm:px-5 sm:pt-4">
              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Candidate Answer</p>
                  <p className="mt-2 leading-6 text-slate-700">{question?.answer?.trim() || "Not submitted"}</p>
                </div>
                <div className="rounded-lg border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Feedback</p>
                  <p className="mt-2 leading-6 text-slate-700">{question?.feedback?.trim() || "Not available"}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-slate-200/60 bg-slate-50 px-3 py-1 text-slate-500">Difficulty: {toTitle(question?.difficulty)}</span>
                <span className="rounded-full border border-slate-200/60 bg-slate-50 px-3 py-1 text-slate-500">Type: {toTitle(question?.questionType)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function AdditionalInsights({ averageScore, bestQuestion, weakestQuestion }) {
  const cards = [
    { label: "Average Score", icon: Target, value: clampScore(averageScore).toFixed(1), color: "from-indigo-50 to-violet-50/50", border: "border-indigo-200", text: "text-indigo-700", sub: "text-indigo-600" },
    { label: "Best Question", icon: Trophy, value: bestQuestion?.question || "No data", score: clampScore(bestQuestion?.score).toFixed(1), color: "from-emerald-50 to-green-50/50", border: "border-emerald-200", text: "text-emerald-800", sub: "text-emerald-600" },
    { label: "Weakest Question", icon: ShieldCheck, value: weakestQuestion?.question || "No data", score: clampScore(weakestQuestion?.score).toFixed(1), color: "from-amber-50 to-orange-50/50", border: "border-amber-200", text: "text-amber-800", sub: "text-amber-600" },
  ];

  return (
    <motion.section variants={containerVariants} className="grid gap-4 md:grid-cols-3">
      {cards.map((c, i) => (
        <motion.article key={c.label} variants={fadeUp} whileHover={{ scale: 1.02, y: -3 }}
          className={`rounded-xl border ${c.border} bg-gradient-to-br ${c.color} p-5 shadow-sm transition-shadow hover:shadow-md`}>
          <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${c.sub}`}><c.icon className="h-4 w-4" />{c.label}</p>
          {c.score ? (
            <>
              <p className={`mt-2 text-sm leading-6 ${c.text}`}>{c.value}</p>
              <p className={`mt-2 text-sm font-semibold ${c.sub}`}>Score: {c.score} / 10</p>
            </>
          ) : (
            <p className={`mt-2 text-3xl font-bold ${c.text}`}>{c.value}</p>
          )}
        </motion.article>
      ))}
    </motion.section>
  );
}

function Step3Report({ report }) {
  const reduxUserName = useSelector((state) => String(state?.user?.userData?.name || "").trim());

  const normalized = useMemo(() => {
    if (!report || typeof report !== "object") return null;
    const qList = Array.isArray(report?.questionWiseScore) ? report.questionWiseScore : [];
    const chartData = qList.map((item, i) => ({ label: `Q${i + 1}`, score: clampScore(item?.score), question: item?.question || `Q${i + 1}` }));
    const avg = chartData.length ? chartData.reduce((s, i) => s + i.score, 0) / chartData.length : 0;
    const sorted = [...qList].sort((a, b) => clampScore(b?.score) - clampScore(a?.score));
    const durFromQ = qList.reduce((s, i) => { const t = Number(i?.timeTaken || 0); return s + (Number.isFinite(t) ? t : 0); }, 0);
    return {
      candidateName: reduxUserName || report?.candidateName || report?.candidate?.name || report?.userName || "Candidate",
      role: report?.role || report?.position || "Interview Role",
      createdAt: report?.createdAt,
      durationLabel: formatDuration(report?.durationMinutes || report?.duration || report?.metadata?.durationMinutes || durFromQ / 60),
      finalScore: clampScore(report?.finalScore), communication: clampScore(report?.communication),
      correctness: clampScore(report?.correctness), confidence: clampScore(report?.confidence),
      questionList: qList, chartData, averageScore: avg, bestQuestion: sorted[0] || null, weakestQuestion: sorted[sorted.length - 1] || null,
    };
  }, [report, reduxUserName]);

  if (!normalized) return <SkeletonReport />;

  const { candidateName, role, createdAt, durationLabel, finalScore, communication, correctness, confidence, questionList, chartData, averageScore, bestQuestion, weakestQuestion } = normalized;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 14;
    const sc = candidateName || "Candidate"; const sr = role || "Interview Role"; const sd = formatDate(createdAt);
    const sdu = durationLabel || "Not recorded"; const sf = clampScore(finalScore).toFixed(1);
    const bs = clampScore(bestQuestion?.score).toFixed(1); const ws = clampScore(weakestQuestion?.score).toFixed(1);
    const remark = (v) => { const s = clampScore(v); if (s >= 8) return "Excellent"; if (s >= 6) return "Good"; if (s >= 4) return "Average"; return "Needs improvement"; };
    let y = 18;
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(15, 23, 42);
    doc.text("Interview Evaluation Report", pw / 2, y, { align: "center" });
    y += 4; doc.setDrawColor(148, 163, 184); doc.setLineWidth(0.5); doc.line(m, y + 1, pw - m, y + 1); y += 8;
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(30, 41, 59); doc.text("Candidate & Interview Info", m, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(51, 65, 85);
    autoTable(doc, { startY: y, margin: { left: m, right: m }, theme: "grid", body: [["Candidate Name", sc], ["Role / Position", sr], ["Date", sd], ["Duration", sdu], ["Final Score", `${sf} / 10`]], styles: { font: "helvetica", fontSize: 10, cellPadding: 2.6, textColor: [51, 65, 85] }, columnStyles: { 0: { cellWidth: 42, fontStyle: "bold", textColor: [15, 23, 42] }, 1: { cellWidth: "auto" } }, didParseCell: (h) => { if (h.section === "body" && h.row.index === 4 && h.column.index === 1) { h.cell.styles.textColor = [37, 99, 235]; h.cell.styles.fontStyle = "bold"; } } });
    y = doc.lastAutoTable.finalY + 8;
    autoTable(doc, { startY: y, margin: { left: m, right: m }, head: [["Skill", "Score", "Remarks"]], body: [["Correctness", `${clampScore(correctness).toFixed(1)} / 10`, remark(correctness)], ["Communication", `${clampScore(communication).toFixed(1)} / 10`, remark(communication)], ["Confidence", `${clampScore(confidence).toFixed(1)} / 10`, remark(confidence)]], theme: "striped", styles: { font: "helvetica", fontSize: 10, cellPadding: 2.8 }, headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] }, columnStyles: { 0: { cellWidth: 46 }, 1: { cellWidth: 30, halign: "center" }, 2: { cellWidth: "auto" } } });
    y = doc.lastAutoTable.finalY + 8;
    if (y > ph - 55) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(30, 41, 59); doc.text("Performance Overview", m, y); y += 5;
    autoTable(doc, { startY: y, margin: { left: m, right: m }, theme: "grid", body: [["Average score", `${clampScore(averageScore).toFixed(1)} / 10`], ["Best question score", `${bs} / 10`], ["Weakest question score", `${ws} / 10`]], styles: { font: "helvetica", fontSize: 10, cellPadding: 2.6 }, columnStyles: { 0: { cellWidth: 58, fontStyle: "bold" }, 1: { cellWidth: "auto" } } });
    y = doc.lastAutoTable.finalY + 8;
    const qRows = (questionList || []).map((item, i) => [`${i + 1}`, String(item?.question || "N/A"), `${clampScore(item?.score).toFixed(1)} / 10`, String(item?.feedback || "N/A")]);
    autoTable(doc, { startY: y, margin: { left: m, right: m }, head: [["#", "Question", "Score", "Feedback"]], body: qRows.length ? qRows : [["-", "No data", "-", "-"]], theme: "grid", styles: { font: "helvetica", fontSize: 9, cellPadding: 2.4, valign: "top", overflow: "linebreak" }, headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] }, columnStyles: { 0: { cellWidth: 22, halign: "center" }, 1: { cellWidth: 72 }, 2: { cellWidth: 24, halign: "center" }, 3: { cellWidth: "auto" } } });
    const gen = new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
    const pc = doc.getNumberOfPages();
    for (let p = 1; p <= pc; p++) { doc.setPage(p); doc.setDrawColor(226, 232, 240); doc.line(m, ph - 15, pw - m, ph - 15); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.text("Generated by AI Interview System", m, ph - 10); doc.text(`Generated: ${gen}`, m, ph - 6); doc.text(`Page ${p} of ${pc}`, pw - m, ph - 8, { align: "right" }); }
    doc.save(`Interview_Report_${sc.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <motion.section variants={containerVariants} initial="hidden" animate="show" className="mx-auto mt-6 max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <motion.div variants={fadeUp} className="flex justify-end">
          <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} type="button" onClick={downloadPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl">
            <Download className="h-4 w-4" />Download Report
          </motion.button>
        </motion.div>

        <HeaderCard candidateName={candidateName} role={role} dateLabel={formatDate(createdAt)} durationLabel={durationLabel} finalScore={finalScore} />

        <motion.section variants={containerVariants} className="grid gap-4 md:grid-cols-3">
          <SkillCard title="Correctness" icon={Target} score={correctness} />
          <SkillCard title="Communication" icon={MessageSquareQuote} score={communication} />
          <SkillCard title="Confidence" icon={Star} score={confidence} />
        </motion.section>

        <PerformanceChart data={chartData} />
        <AdditionalInsights averageScore={averageScore} bestQuestion={bestQuestion} weakestQuestion={weakestQuestion} />

        <motion.section variants={fadeUp} className="glass-card rounded-2xl p-5 shadow-lg shadow-slate-200/40 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900">Question-wise Breakdown</h3>
          <p className="mt-1 text-sm text-slate-400">Expand each card to review answers and AI feedback.</p>
          <div className="mt-5 space-y-3">
            {questionList.length > 0 ? questionList.map((q, i) => <QuestionCard key={`${q?.question || "q"}-${i}`} question={q} index={i} />) : (
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-5 text-sm text-slate-400">No question data available.</div>
            )}
          </div>
        </motion.section>
      </div>
    </motion.section>
  );
}

export default Step3Report;
