import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 bg-emerald-600 rounded-md">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M1 7h12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Carefinder
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/admin/login"
            className="bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
