import { useNavigate } from "react-router-dom";

function ActionCard({ title, description, cta, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      <div>
        <span className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </span>
        <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <span className="mt-6 inline-flex rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 group-hover:bg-indigo-600 group-hover:shadow-md">
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
    <section className="mx-auto mt-4 max-w-5xl px-5 pb-16 pt-8">
      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-semibold tracking-wide text-indigo-600">
          TALKSY.AI
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Speak Better. Get Hired Faster.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
          Practice real conversations and AI-powered mock interviews.
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
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

      <p className="mt-8 text-center text-sm text-slate-500">
        Built for students, job seekers, and professionals.
      </p>
    </section>
  );
}

export default Home;
