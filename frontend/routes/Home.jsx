function Home() {
  const features = [
    {
      title: "AI Conversations",
      desc: "Practice speaking daily with adaptive prompts that improve clarity, fluency, and confidence.",
      icon: (
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"
          />
        </svg>
      ),
    },
    {
      title: "Mock Interviews",
      desc: "Run realistic interview sessions based on your resume and target role for focused preparation.",
      icon: (
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
      ),
    },
    {
      title: "Real-time Feedback",
      desc: "Get instant feedback on speaking pace, filler words, structure, and delivery quality.",
      icon: (
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
            d="M11 5h2m-1 0v14m-7-7h14"
          />
        </svg>
      ),
    },
    {
      title: "Confidence Building",
      desc: "Track growth over time and build interview confidence with structured AI practice.",
      icon: (
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  const steps = [
    "Upload Resume or Choose Practice Mode",
    "Talk with AI in Real-time",
    "Get Feedback and Improve Faster",
  ];

  const users = ["Students", "Job Seekers", "Professionals"];

  return (
    <section className="relative mx-auto mt-4 max-w-6xl px-5 pb-16">
      <div className="pointer-events-none absolute -top-16 right-10 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl"></div>
      <div className="pointer-events-none absolute top-72 -left-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-16 right-24 h-60 w-60 rounded-full bg-violet-500/15 blur-3xl"></div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1 text-xs font-medium tracking-[0.08em] text-cyan-200">
              AI COMMUNICATION PLATFORM
            </span>

            <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-slate-100 md:text-5xl">
              Master Communication with AI
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Improve speaking through daily AI conversations, simulate
              realistic interviews based on your resume, and build real-world
              confidence for career growth.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(34,211,238,0.28)]">
                Get Started
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:-translate-y-px hover:bg-white/10">
                Try Mock Interview
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur-md">
            <p className="text-xs font-medium tracking-[0.08em] text-cyan-300">
              LIVE AI SESSION
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                <p className="text-slate-400">AI Coach</p>
                <p className="mt-1">
                  Tell me about a challenge you solved as a team.
                </p>
              </div>
              <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/15 p-3 text-xs text-slate-100">
                <p className="text-indigo-200">You</p>
                <p className="mt-1">
                  I led a cross-functional fix by breaking the issue into
                  measurable milestones.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                <p className="text-slate-400">Feedback</p>
                <p className="mt-1">
                  Strong structure. Add a quantified outcome to improve impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/10"
          >
            <div className="mb-4 inline-flex rounded-lg border border-cyan-300/25 bg-cyan-400/10 p-2 text-cyan-200">
              {feature.icon}
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {feature.desc}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-slate-100">How It Works</h3>
          <div className="mt-5 space-y-4">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-indigo-600 to-violet-600 text-xs font-semibold text-white">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-slate-100">Built For</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {users.map((user) => (
              <div
                key={user}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200"
              >
                {user}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h3 className="text-xl font-semibold text-slate-100">
          Trusted by Learners and Professionals
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-2xl font-semibold text-cyan-300">1000+</p>
            <p className="mt-1 text-sm text-slate-300">
              Mock interviews completed
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-2xl font-semibold text-cyan-300">92%</p>
            <p className="mt-1 text-sm text-slate-300">
              Users report better confidence
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-2xl font-semibold text-cyan-300">4.9/5</p>
            <p className="mt-1 text-sm text-slate-300">
              Average learner satisfaction
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-linear-to-r from-indigo-600/25 to-violet-600/20 p-8 shadow-[0_16px_35px_rgba(99,102,241,0.2)] backdrop-blur-xl">
        <h3 className="text-2xl font-semibold text-slate-100 md:text-3xl">
          Start improving your communication today
        </h3>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
          Build confidence, sharpen interview answers, and communicate like a
          professional with AI-guided practice.
        </p>
        <button className="mt-6 rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(34,211,238,0.28)]">
          Get Started
        </button>
      </section>
    </section>
  );
}
export default Home;
