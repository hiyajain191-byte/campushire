
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<
    "student" | "recruiter"
  >("student");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            age: 18,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.message)) {
          setError(data.message.join(", "));
        } else {
          setError(
            data.message || "Registration failed."
          );
        }

        return;
      }

      console.log(
        "Registration successful:",
        data
      );

      // =================================================
      // SAVE LOGIN DATA
      // =================================================

      if (data.token) {
        localStorage.setItem(
          "campushire_token",
          data.token
        );
      }

      if (data.user) {
        localStorage.setItem(
          "campushire_user",
          JSON.stringify(data.user)
        );
      } else {
        // Fallback if backend does not return user
        const userData = {
          name: name.trim(),
          email: email.trim(),
          role,
        };

        localStorage.setItem(
          "campushire_user",
          JSON.stringify(userData)
        );
      }

      // =================================================
      // DIRECT REDIRECT
      // =================================================

      if (role === "recruiter") {
        router.push("/recruiter");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-5"
        >
          <div className="w-8 h-8 bg-purple-900 flex items-center justify-center rounded-md">
            <Briefcase className="w-4 h-4 text-white" />
          </div>

          <span className="font-bold text-lg text-slate-900">
            CampusHire
          </span>
        </Link>

        {/* Register Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">

          {/* Heading */}
          <h1 className="text-xl font-semibold text-slate-900">
            Create your account
          </h1>

          <p className="text-xs text-slate-500 mt-1.5">
            Choose how you want to use CampusHire.
          </p>

          {/* Role Selection */}
          <div className="mt-5">

            <label className="text-xs font-medium text-slate-900">
              I am a
            </label>

            <div className="grid grid-cols-2 gap-2.5 mt-2">

              {/* Student */}
              <button
                type="button"
                onClick={() =>
                  setRole("student")
                }
                disabled={loading}
                className={`border rounded-md p-3 text-left transition ${
                  role === "student"
                    ? "border-purple-900 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <GraduationCap
                  className={`w-4 h-4 ${
                    role === "student"
                      ? "text-purple-900"
                      : "text-slate-400"
                  }`}
                />

                <p className="text-xs font-medium mt-1.5 text-slate-900">
                  Student
                </p>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  Find jobs & apply
                </p>
              </button>

              {/* Recruiter */}
              <button
                type="button"
                onClick={() =>
                  setRole("recruiter")
                }
                disabled={loading}
                className={`border rounded-md p-3 text-left transition ${
                  role === "recruiter"
                    ? "border-purple-900 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <Building2
                  className={`w-4 h-4 ${
                    role === "recruiter"
                      ? "text-purple-900"
                      : "text-slate-400"
                  }`}
                />

                <p className="text-xs font-medium mt-1.5 text-slate-900">
                  Recruiter
                </p>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  Post jobs & hire
                </p>
              </button>

            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleRegister}
            className="mt-5 space-y-3"
          >

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-900">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                disabled={loading}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none focus:border-purple-900 focus:ring-1 focus:ring-purple-900/10 disabled:bg-slate-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-900">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                disabled={loading}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none focus:border-purple-900 focus:ring-1 focus:ring-purple-900/10 disabled:bg-slate-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-slate-900">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                disabled={loading}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none focus:border-purple-900 focus:ring-1 focus:ring-purple-900/10 disabled:bg-slate-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-md">
                {error}
              </div>
            )}

            {/* Create Account */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-purple-950 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login */}
          <p className="text-xs text-center text-slate-500 mt-4">
            Already have an account?{" "}

            <Link
              href="/login"
              className="text-purple-900 font-medium hover:text-purple-950 hover:underline"
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

