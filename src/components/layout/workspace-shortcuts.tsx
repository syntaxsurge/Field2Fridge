"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

type Shortcut = { href: string; label: string };

type Props = {
  label?: string;
  links: Shortcut[];
};

export function WorkspaceShortcuts({ label = "Quick navigation", links }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Button key={link.href} asChild size="sm" variant="ghost" className="h-8 px-3">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
