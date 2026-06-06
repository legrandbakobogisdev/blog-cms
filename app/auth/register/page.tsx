"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GithubIcon, GoogleIcon } from "@/components/icons";

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return score;
}

const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
const strengthLabels = ["Faible", "Moyen", "Bien", "Fort"];

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${firstName} ${lastName}`.trim(), email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Une erreur est survenue.");
    else router.push("/auth/signin");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">

        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center mb-7">
          <div className="w-3.5 h-3.5 bg-white rounded-full" />
        </div>

        <h1 className="text-xl font-medium text-neutral-900 mb-1">Créer un compte</h1>
        <p className="text-sm text-neutral-500 mb-6">Rejoignez-nous en quelques secondes</p>

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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-neutral-500 mb-1.5">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Albert"
                required
                className="w-full h-9 border border-neutral-200 rounded-lg bg-neutral-50 px-3 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1.5">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                className="w-full h-9 border border-neutral-200 rounded-lg bg-neutral-50 px-3 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
              />
            </div>
          </div>
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
              placeholder="Min. 8 caractères"
              required
              minLength={8}
              className="w-full h-9 border border-neutral-200 rounded-lg bg-neutral-50 px-3 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition"
            />
            {password && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-0.5 rounded-full transition-colors ${
                      i < strength ? strengthColors[strength - 1] : "bg-neutral-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-neutral-400 ml-2">{strengthLabels[strength - 1]}</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 disabled:opacity-40 transition mt-1"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-6">
          Déjà un compte ?{" "}
          <Link href="/auth/signin" className="text-neutral-900 underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}