import { useNavigate } from "react-router-dom";

function ActionCard({ title, description, cta, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_22px_48px_rgba(6,182,212,0.15)] focus:outline-none focus:ring-2 focus:ring-cyan-300/35"
    >
      <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl"></div>
      <div className="relative z-10">
        <span className="inline-flex rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-2 text-cyan-200">
          {icon}
        </span>
        <h3 className="mt-5 text-2xl font-semibold text-slate-100">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        <span className="mt-6 inline-flex rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-medium text-white shadow-[0_12px_28px_rgba(99,102,241,0.35)] transition-all duration-300 group-hover:-translate-y-px group-hover:shadow-[0_14px_32px_rgba(34,211,238,0.28)]">
          {cta}
        </span>
      </div>
    </button>
  );
}

function Home() {
  const navigate = useNavigate();

  const handleInterviewStart = () => {
    navigate("/mock-hire");
  };

  return (
    <section className="relative mx-auto mt-4 max-w-5xl px-5 pb-16 pt-8">
      <div className="pointer-events-none absolute -top-14 right-10 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl"></div>
      <div className="pointer-events-none absolute -left-14 top-44 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl"></div>

      <header className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1 text-xs font-medium tracking-[0.08em] text-cyan-200">
          TALKSY.AI
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-100 sm:text-5xl">
          Speak Better. Get Hired Faster.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
          Practice real conversations and AI-powered mock interviews.
        </p>
      </header>

      <div className="relative z-10 mt-10 grid gap-5 md:grid-cols-2">
        <ActionCard
          title="MockHire"
          description="Simulate real job interviews based on your resume"
          cta="Start Interview"
          onClick={handleInterviewStart}
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H9l-4 4v10a2 2 0 002 2z"
              />
            </svg>
          }
        />

        <ActionCard
          title="Interview History"
          description="Review your past sessions, scores, and reports in one place"
          cta="Open History"
          onClick={() => navigate("/interview-history")}
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
      </div>

      <p className="relative z-10 mt-8 text-center text-sm text-slate-400">
        Built for students, job seekers, and professionals.
      </p>
    </section>
  );
}

export default Home;
