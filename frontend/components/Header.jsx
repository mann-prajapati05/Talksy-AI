import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="relative mx-5 mb-5 grid grid-cols-1 items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.35)] backdrop-blur-xl md:grid-cols-[auto_1fr_auto] md:gap-4">
      <div
        className="pointer-events-none absolute -right-12 -top-14 h-48 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.22),transparent_68%)]"
        aria-hidden="true"
      ></div>
      <div
        className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-60 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.24),transparent_70%)]"
        aria-hidden="true"
      ></div>

      <div className="relative z-10">
        <span className="text-2xl font-semibold tracking-[0.04em] text-slate-100">
          Talksy
        </span>
      </div>

      <nav
        className="relative z-10 inline-flex items-center justify-self-center gap-2 rounded-full border border-white/10 bg-slate-900/40 p-1"
        aria-label="Primary"
      >
        <button
          className="rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_24px_rgba(79,70,229,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(99,102,241,0.45)]"
          type="button"
        >
          General
        </button>
        <button
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-white"
          type="button"
        >
          Interview
        </button>
      </nav>

      <div className="relative z-10 inline-flex flex-wrap items-center justify-center gap-2 md:justify-end">
        <Link to="/login">
          <button
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:-translate-y-px hover:border-cyan-300/35 hover:bg-white/15"
            type="button"
          >
            Login / Sign up
          </button>
        </Link>
        <button
          className="rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(34,211,238,0.28)]"
          type="button"
        >
          Profile
        </button>
      </div>
    </header>
  );
}

export default Header;
