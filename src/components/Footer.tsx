export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-6 mt-12">
      <p className="text-center text-sm text-slate-400">
        Carefinder © {new Date().getFullYear()} — find hospitals, find hope
      </p>
    </footer>
  );
}
