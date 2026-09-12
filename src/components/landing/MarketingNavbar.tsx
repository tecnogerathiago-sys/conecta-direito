"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-shell items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="size-4" aria-hidden />
          </span>
          <span className="text-h3 text-foreground">Conecta Direito</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#como-funciona"
            className="text-small font-medium text-foreground-secondary transition-colors duration-150 hover:text-foreground"
          >
            Como funciona
          </Link>
          <Link
            href="/para-advogados"
            className="text-small font-medium text-foreground-secondary transition-colors duration-150 hover:text-foreground"
          >
            Para advogados
          </Link>
          <Link
            href="/cliente/entrar"
            className="text-small font-medium text-foreground-secondary transition-colors duration-150 hover:text-foreground"
          >
            Entrar
          </Link>
        </nav>

        <div className="hidden md:block">
          <Link href="/solicitar">
            <Button variant="success" size="sm">
              Abrir meu caso
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex size-10 items-center justify-center rounded-md text-foreground md:hidden"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/#como-funciona" onClick={() => setOpen(false)} className="text-body font-medium text-foreground">
              Como funciona
            </Link>
            <Link href="/para-advogados" onClick={() => setOpen(false)} className="text-body font-medium text-foreground">
              Para advogados
            </Link>
            <Link href="/cliente/entrar" onClick={() => setOpen(false)} className="text-body font-medium text-foreground">
              Entrar
            </Link>
            <Link href="/solicitar" onClick={() => setOpen(false)}>
              <Button variant="success" fullWidth>
                Abrir meu caso
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
