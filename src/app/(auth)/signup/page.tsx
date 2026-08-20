"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { UserPlus, Mail, Lock, Loader2, AlertCircle, CheckCircle, GraduationCap } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
    } else {
      setMessage("Signup successful. Check your email to confirm your account.");
      setEmail("");
      setPassword("");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-200">
        {/* Brand / Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-indigo-200 bg-white text-indigo-600">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Join CollegesIN to search, filter, and bookmark India&apos;s top colleges in one place.
          </p>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200/50 p-4 text-sm text-emerald-700 animate-in fade-in duration-200">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="font-semibold">{message}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/50 p-4 text-sm text-red-700 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4.5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative mt-1.5 rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="name@example.com"
                  className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="relative mt-1.5 rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  minLength={6}
                  className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-slate-400">Must be at least 6 characters.</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-100 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 active:scale-[0.98] disabled:bg-indigo-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <div className="text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
