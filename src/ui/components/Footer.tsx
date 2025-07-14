export function Footer() {
  return (
    <footer className="text-xs text-center text-zinc-500 dark:text-zinc-400 py-2 border-t border-zinc-200 dark:border-zinc-700 mt-auto">
      © {new Date().getFullYear()} Ezequiel Suárez ·{" "}
      <a
        href="https://ezequielsuarez-dev.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Portfolio
      </a>
    </footer>
  );
}
