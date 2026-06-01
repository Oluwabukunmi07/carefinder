import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="font-bold text-blue-700">
          Carefinder
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
          >
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
