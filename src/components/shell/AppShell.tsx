"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PanelLeftClose, PanelLeftOpen, Scale } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { NavGroup } from "./types";

interface AppShellProps {
  brandHref: string;
  navGroups: NavGroup[];
  userName: string;
  userSubtitle?: string;
  walletSlot?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  brandHref,
  navGroups,
  userName,
  userSubtitle,
  walletSlot,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const navContent = (
    <>
      <div className="flex h-16 items-center gap-2 px-4">
        <Link href={brandHref} className="flex items-center gap-2 overflow-hidden">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="size-4" aria-hidden />
          </span>
          {!collapsed && (
            <span className="truncate text-h3 text-foreground">Conecta Direito</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {navGroups.map((group, i) => (
          <div key={i}>
            {group.title && !collapsed && (
              <p className="mb-1.5 px-2.5 text-caption font-medium uppercase tracking-wide text-foreground-muted">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={clsx(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-small font-medium transition-colors duration-150",
                        active
                          ? "bg-primary-subtle text-primary"
                          : "text-foreground-secondary hover:bg-background-secondary hover:text-foreground"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className={clsx("flex items-center gap-2.5", collapsed && "justify-center")}>
          <Avatar name={userName} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-medium text-foreground">{userName}</p>
              {userSubtitle && (
                <p className="truncate text-caption text-foreground-muted">{userSubtitle}</p>
              )}
            </div>
          )}
          {!collapsed && <LogoutButton compact />}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface transition-all duration-150 lg:flex",
          collapsed ? "w-18" : "w-64"
        )}
      >
        {navContent}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center gap-2 border-t border-border px-3 py-2.5 text-small font-medium text-foreground-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="size-4" aria-hidden />
              Recolher
            </>
          )}
        </button>
      </aside>

      {/* Drawer — mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-popover">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="flex size-9 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-secondary"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      {/* Top bar — mobile */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="flex size-9 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-secondary"
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <Link href={brandHref} className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="size-3.5" aria-hidden />
          </span>
          <span className="text-h3 text-foreground">Conecta Direito</span>
        </Link>
        <div>{walletSlot}</div>
      </header>

      <div className={clsx("transition-all duration-150", collapsed ? "lg:pl-18" : "lg:pl-64")}>
        {walletSlot && (
          <div className="hidden justify-end border-b border-border bg-surface px-6 py-3 lg:flex">
            {walletSlot}
          </div>
        )}
        <main className="mx-auto max-w-shell px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
