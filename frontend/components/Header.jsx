function Header() {
  return (
    <header className="relative m-5 grid grid-cols-1 items-center gap-4 overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 via-orange-50 to-stone-100 p-4 shadow-[0_10px_30px_rgba(19,36,58,0.1)] md:grid-cols-[auto_1fr_auto] md:gap-4">
      <div
        className="pointer-events-none absolute -right-6 -top-7 h-28 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,122,24,0.34),transparent_66%)]"
        aria-hidden="true"
      ></div>

      <div className="relative z-10">
        <span className="font-serif text-2xl font-bold tracking-wide text-slate-900">
          Talksy
        </span>
      </div>

      <nav
        className="relative z-10 inline-flex items-center justify-self-center gap-2 rounded-full border border-slate-900/10 bg-white/60 p-1"
        aria-label="Primary"
      >
        <button
          className="rounded-full bg-orange-200 px-4 py-2 text-sm font-semibold text-amber-950 shadow-[inset_0_0_0_1px_rgba(255,122,24,0.28)] transition duration-200 hover:-translate-y-px"
          type="button"
        >
          General
        </button>
        <button
          className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-px hover:bg-amber-100"
          type="button"
        >
          Interview
        </button>
      </nav>

      <div className="relative z-10 inline-flex flex-wrap items-center justify-center gap-2 md:justify-end">
        <button
          className="rounded-full border border-slate-900/15 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-px"
          type="button"
        >
          Login / Sign up
        </button>
        <button
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_7px_20px_rgba(19,36,58,0.22)] transition duration-200 hover:-translate-y-px"
          type="button"
        >
          Profile
        </button>
      </div>
    </header>
  );
}

export default Header;
