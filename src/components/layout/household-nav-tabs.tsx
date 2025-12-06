"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const householdTabs = [
  { slug: "/household/pantry", label: "Pantry" },
  { slug: "/household/cart", label: "Cart" },
  { slug: "/household/controls", label: "Safety" },
];

export function HouseholdNavTabs() {
  const pathname = usePathname();
  const current = householdTabs.find((tab) => pathname.startsWith(tab.slug))?.slug ?? "/household/pantry";

  return (
    <Tabs value={current} className="w-full">
      <TabsList className="w-fit">
        {householdTabs.map((tab) => (
          <TabsTrigger key={tab.slug} value={tab.slug} asChild>
            <Link href={tab.slug}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
