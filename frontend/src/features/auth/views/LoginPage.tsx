import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      login(
        { id: data.user.id, email: data.user.email },
        data.access_token
      );

      navigate("/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-slate-50 overflow-hidden">

      {/* BACKGROUND GRADIENTS */}
      <div className="pointer-events-none absolute -inset-40 -z-10 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_55%,_#000_100%)]" />
      <div className="pointer-events-none absolute -left-40 top-20 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-40 -z-10 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />

      {/* CARD */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_24px_80px_rgba(15,23,42,0.95)]">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-2 ring-white/10 shadow-xl">
            <span className="text-lg font-semibold text-fuchsia-300">M</span>
          </div>
          <h1 className="mt-3 text-lg font-semibold tracking-tight">Mindloop</h1>
          <p className="text-[11px] text-slate-400">AI Project Meeting Engine</p>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-center mb-6">Connexion</h2>

        {error && (
          <div className="text-red-400 text-sm text-center mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-slate-200 
                       placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 transition"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-slate-200
                       placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition"
          />

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-50 text-black font-semibold py-3 mt-2 shadow-[0_0_40px_rgba(250,250,250,0.25)] 
                       hover:bg-slate-200 transition active:scale-[0.98]"
          >
            Se connecter
          </button>
          <p className="mt-4 text-center text-sm text-slate-400">
            Pas encore de compte ?{" "}
            <a href="/register" className="text-slate-200 hover:underline">
              Créer un compte
            </a>
          </p>

        </form>
      </div>
      {/* BACK BUTTON LOGO */}
      <a
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-slate-50 transition"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <span className="text-sm font-semibold text-fuchsia-300">M</span>
        </div>
        <span className="text-xs font-medium tracking-tight hidden sm:inline">Mindloop</span>
      </a>
    </div>
  );
}
