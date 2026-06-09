export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-400">
        <span>
          <span className="font-semibold text-emerald-600">Care</span>finder ©{" "}
          {new Date().getFullYear()}
        </span>
        <span>find hospitals, find hope</span>
      </div>
    </footer>
  );
}
