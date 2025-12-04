"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sign-in", label: "Sign in" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            F2F
          </div>
          <span className="hidden text-lg sm:inline">Field2Fridge</span>
        </Link>
        <nav className="flex items-center gap-3">
          <ul className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                    pathname === item.href && "bg-muted text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="md:hidden">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <ConnectButton accountStatus="avatar" showBalance={false} />
          </div>
        </nav>
      </div>
    </header>
  );
}
