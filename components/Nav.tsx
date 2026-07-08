import Link from "next/link";

export default function Nav() {
  return (
    <nav className="w-full max-w-5xl mx-auto px-6 pt-8 flex items-center gap-6">
      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        Dashboard
      </Link>
      <Link
        href="/case-study"
        className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        Case Study
      </Link>
    </nav>
  );
}
