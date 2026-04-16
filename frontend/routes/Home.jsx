import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function ActionCard({ title, description, cta, icon, onClick }) {
  return (
    <motion.button
      variants={fadeUp}
      whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className="gradient-border group w-full rounded-2xl bg-white/80 p-6 text-left shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-indigo-100/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    >
      <div>
        <motion.span
          whileHover={{ rotate: -6, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="inline-flex rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-3 text-indigo-600 shadow-sm ring-1 ring-indigo-100"
        >
          {icon}
        </motion.span>
        <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <span className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:shadow-indigo-200">
          {cta}
          <svg className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </span>
      </div>
    </motion.button>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto mt-4 max-w-5xl px-5 pb-16 pt-8"
    >
      <motion.header variants={fadeUp} className="mx-auto max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-600 shadow-sm"
        >
          ✦ TALKSY.AI
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl"
        >
          Speak Better.{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Get Hired Faster.
          </span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-2xl text-base text-slate-500 sm:text-lg"
        >
          Practice real conversations and AI-powered mock interviews.
        </motion.p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        className="mt-12 grid gap-6 md:grid-cols-2"
      >
        <ActionCard
          title="MockHire"
          description="Simulate real job interviews based on your resume and target role."
          cta="Start Interview"
          onClick={() => navigate("/mock-hire")}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H9l-4 4v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <ActionCard
          title="Interview History"
          description="Review past sessions, scores, and detailed reports in one place."
          cta="Open History"
          onClick={() => navigate("/interview-history")}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
      </motion.div>

      <motion.p variants={fadeUp} className="mt-10 text-center text-sm text-slate-400">
        Built for students, job seekers, and professionals.
      </motion.p>
    </motion.section>
  );
}

export default Home;
