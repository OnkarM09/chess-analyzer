import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 font-bold">
            <span className="text-xl">ChessCoach</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/games" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Games
            </Link>
            <Link href="/profile" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Profile
            </Link>
            <Link href="/training" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Training
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
