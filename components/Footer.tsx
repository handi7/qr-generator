import Link from "next/link";
import BrandMark from "./brand-mark";

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-foreground/10 bg-background/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandMark size={32} className="rounded-lg shadow-sm shadow-primary/20" />
            <span>
              <strong className="block text-sm leading-none">GaweQR</strong>
              <span className="text-xs text-foreground/70">Design and download instantly</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/75">
            <Link href="/studio" className="transition-colors hover:text-foreground">
              Studio
            </Link>
            <Link href="/templates" className="transition-colors hover:text-foreground">
              Templates
            </Link>
            <a
              href="https://github.com/handi7/qr-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <GithubIcon size={14} />
              GitHub
            </a>
          </nav>
        </div>

        <p className="text-xs text-foreground/60">
          © 2025 GaweQR. Free QR code generator — no sign-up required.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
