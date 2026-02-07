const Footer = () => {
  return (
    <footer className="mt-12 border-t border-slate-200/70 pt-6 text-sm text-slate-500">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="font-semibold text-slate-600">Built by Anurag Verma</div>
        <div className="flex items-center justify-center gap-3 text-xs">
          <a
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            href="mailto:anuragverma7354@gmail.com"
            aria-label="Email"
            title="Email"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm9 7L4.5 7.5v9h15v-9L12 12zm7.5-5.5L12 11 4.5 6.5H19.5z"
              />
            </svg>
          </a>
          <a
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            href="https://github.com/anuragvermaitis"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 7.1c.85 0 1.71.12 2.51.35 1.9-1.33 2.75-1.05 2.75-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.82-4.58 5.08.36.32.69.95.69 1.92 0 1.38-.01 2.49-.01 2.83 0 .26.18.58.69.48 3.96-1.36 6.82-5.17 6.82-9.67C22 6.58 17.52 2 12 2z"
              />
            </svg>
          </a>
          <a
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            href="https://www.linkedin.com/in/anuragvermaitis/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 8.98h3.96V21H3V8.98zM9.5 8.98h3.8v1.64h.06c.53-1 1.82-2.06 3.75-2.06 4 0 4.74 2.7 4.74 6.2V21h-3.96v-4.86c0-1.16-.02-2.66-1.62-2.66-1.62 0-1.87 1.27-1.87 2.58V21H9.5V8.98z"
              />
            </svg>
          </a>
          <a
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            href="https://x.com/Anuragvermaitis"
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            title="X"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.24 2H21l-6.3 7.2L22 22h-6.83l-4.2-5.64L5.7 22H3l6.78-7.75L2 2h6.92l3.8 5.2L18.24 2zm-1.2 18h1.9L8.02 4H6.02l10.02 16z"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
