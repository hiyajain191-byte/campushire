
"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  message: string;
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "student" | "recruiter";
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data: LoginResponse | { message: string } =
        await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setError(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Invalid email or password."
        );
        return;
      }

      if (!("user" in data) || !data.user || !data.user.role) {
        setError("Login response is missing user information.");
        return;
      }

      // Save JWT
      localStorage.setItem(
        "campushire_token",
        data.access_token
      );

      // Save user information
      localStorage.setItem(
        "campushire_user",
        JSON.stringify(data.user)
      );

      // Redirect according to role
      if (data.user.role === "recruiter") {
        router.push("/recruiter");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-900 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>

          <span className="font-bold text-xl text-slate-900">
            CampusHire
          </span>
        </Link>

        {/* =========================
            LOGIN CARD
        ========================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Log in to continue to CampusHire.
          </p>

          {/* =========================
              FORM
          ========================= */}

          <form
            onSubmit={handleLogin}
            className="space-y-5 mt-7"
          >

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-50"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-700 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-50"
              />
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-900 text-white py-3.5 text-sm font-medium transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

          </form>

          {/* =========================
              REGISTER
          ========================= */}

          <p className="text-sm text-center text-slate-500 mt-7">
            Don't have an account?{" "}

            <Link
              href="/register"
              className="text-purple-900 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>

        {/* =========================
            FOOTER TEXT
        ========================= */}

        <p className="text-xs text-slate-400 text-center mt-6">
          © 2026 CampusHire
        </p>

      </div>
    </main>
  );
}