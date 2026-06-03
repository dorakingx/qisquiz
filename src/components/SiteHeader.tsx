import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/topics", label: "Topics" },
  { href: "/resources", label: "Resources" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-mono text-lg font-bold tracking-tight text-accent">
            Qisquiz
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-zinc-800/60 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
