"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface Props {
  compact?: boolean;
}

export function LogoutButton({ compact }: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      aria-label={compact ? "Sair" : undefined}
      title={compact ? "Sair" : undefined}
      className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-small font-medium text-foreground-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-foreground"
    >
      <LogOut className="size-4" aria-hidden />
      {!compact && "Sair"}
    </button>
  );
}
