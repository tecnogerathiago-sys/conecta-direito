"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-slate-500 hover:text-primary-900"
    >
      Sair
    </button>
  );
}
