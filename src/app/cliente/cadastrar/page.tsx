"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClientSignupForm } from "@/components/forms/ClientSignupForm";

function CadastrarContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cliente/dashboard";
  const redirectTo = next;

  return (
    <>
      <div className="mx-auto mb-8 max-w-xl text-center">
        <h1 className="text-2xl font-bold text-primary-900">Crie sua conta gratuita</h1>
        <p className="mt-2 text-sm text-slate-500">
          Você vai usar essa conta pra acompanhar o andamento do seu caso.
        </p>
      </div>
      <ClientSignupForm redirectTo={redirectTo} />
      <p className="mx-auto mt-4 max-w-xl text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link
          href={`/cliente/entrar?next=${encodeURIComponent(next)}`}
          className="font-semibold text-accent-600 underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}

export default function CadastrarPage() {
  return (
    <main className="min-h-screen bg-surface-muted px-6 py-16">
      <Suspense>
        <CadastrarContent />
      </Suspense>
    </main>
  );
}
