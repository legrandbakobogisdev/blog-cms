"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GithubIcon, GoogleIcon } from "@/components/icons";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Email ou mot de passe incorrect.");
    else { router.push("/"); router.refresh(); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">

        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center mb-7">
          <div className="w-3.5 h-3.5 bg-white rounded-full" />
        </div>

        <h1 className="text-xl font-medium text-neutral-900 mb-1">Bon retour</h1>
        <p className="text-sm text-neutral-500 mb-6">Connectez-vous à votre compte</p>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="flex-1 flex items-center justify-center gap-2 h-9 border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition"
          >
            <GithubIcon /> GitHub
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex-1 flex items-center justify-center gap-2 h-9 border border-neutral-200 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition"
          >
            <GoogleIcon /> Google
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <hr className="flex-1 border-neutral-200" />
          <span className="text-xs text-neutral-400">ou par email</span>
          <hr className="flex-1 border-neutral-200" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              className="w-full h-9 border border-neutral-200 rounded-lg bg-neutral-50 px-3 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-9 border border-neutral-200 rounded-lg bg-neutral-50 px-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
            <Link href="/auth/forgot" className="block text-right text-xs text-neutral-400 hover:text-neutral-700 mt-1.5 transition">
              Mot de passe oublié ?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-40 transition"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-neutral-900 underline underline-offset-2">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}