"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClientSignupForm } from "@/components/forms/ClientSignupForm";

function CadastrarContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cliente/dashboard";

  return (
    <>
      <ClientSignupForm redirectTo={next} />
      <p className="mx-auto mt-4 max-w-xl text-center text-small text-foreground-secondary">
        Já tem conta?{" "}
        <Link
          href={`/cliente/entrar?next=${encodeURIComponent(next)}`}
          className="font-semibold text-accent underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}

export default function CadastrarPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 sm:py-16">
      <Suspense>
        <CadastrarContent />
      </Suspense>
    </main>
  );
}
