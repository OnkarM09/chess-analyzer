import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4 sm:px-8">
        <p className="text-center text-sm leading-loose text-zinc-500 md:text-left dark:text-zinc-400">
          Built for chess players to improve their game. Not affiliated with Chess.com.
        </p>
        <div className="flex items-center space-x-4 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/licenses" className="hover:underline">
            Licenses
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
