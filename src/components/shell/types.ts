import { ReactNode } from "react";

// icon é um ReactNode já renderizado (ex: <Briefcase className="size-4.5" />),
// não o componente em si — passar o componente/função de um Server Component
// para este Client Component quebra a serialização do React Server Components.
export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}
