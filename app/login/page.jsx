"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

async function handleLogin(e) {
  e.preventDefault();
  setError("");

  const u = user.trim();
  const p = pass.trim();

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: u, pass: p }),
    });
    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }
    router.push("/admin");
  } catch {
    setError("Login failed");
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wm-leather via-wm-accent to-wm-amber p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Week in Music Logo"
            width={80}
            height={80}
            className="mb-3"
          />
          <h1 className="text-2xl font-bold text-wm-ink">Week in Music Admin</h1>
          <p className="text-neutral-600 text-sm mt-1">Sign in to manage listings</p>
        </div>

<form onSubmit={handleLogin} className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-neutral-700">Username</label>
    <input
      type="text"
      name="username"
      autoComplete="username"
      spellCheck={false}
      value={user}
      onChange={(e) => setUser(e.target.value)}
      onBlur={(e) => setUser(e.target.value.trim())}
      className="mt-1 w-full border rounded-xl px-3 py-2"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-neutral-700">Password</label>
    <input
      type="password"
      name="password"
      autoComplete="current-password"
      value={pass}
      onChange={(e) => setPass(e.target.value)}
      onBlur={(e) => setPass(e.target.value.trim())}
      className="mt-1 w-full border rounded-xl px-3 py-2"
      required
    />
  </div>

  {/* optional: show the error */}
  {error && <p className="text-red-600 text-sm">{error}</p>}

  <button
    type="submit"
    className="w-full bg-wm-ink text-white py-2 rounded-xl hover:opacity-90 transition"
  >
    Sign In
  </button>
</form>

        <footer className="text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Week in Music
        </footer>
      </div>
    </main>
  );
}
