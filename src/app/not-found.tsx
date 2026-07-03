import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-6xl font-black tracking-tight">404</p>
      <p className="text-sm text-muted">
        That page has sold out — or never existed.
      </p>
      <Link
        href="/"
        className="border border-ink px-8 py-3.5 text-xs font-bold uppercase tracking-[0.24em] transition-colors hover:bg-ink hover:text-white"
      >
        Back to Home
      </Link>
    </div>
  );
}
