"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { User } from "@supabase/supabase-js";
import { GraduationCap, Bookmark, LogIn, LogOut, Menu, X, GitCompare } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95">
            <GraduationCap className="h-8 w-8 stroke-[2] text-indigo-600 drop-shadow-sm" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Colleges<span className="text-indigo-600 font-black">IN</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link 
            href="/" 
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200"
          >
            Browse Colleges
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200"
          >
            <GitCompare className="h-4 w-4 stroke-[2]" />
            Compare
          </Link>
          {user && (
            <Link
              href="/saved"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200"
            >
              <Bookmark className="h-4 w-4 stroke-[2]" />
              Saved Colleges
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-500 max-w-[200px] truncate bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95"
                  >
                    <LogOut className="h-4 w-4 text-slate-500" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-bold shadow-sm shadow-indigo-100 hover:shadow-md hover:shadow-indigo-200 transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all py-2"
            >
              Browse Colleges
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-base font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all py-2"
            >
              <GitCompare className="h-5 w-5 stroke-[2]" />
              Compare
            </Link>
            {user && (
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-base font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-all py-2"
              >
                <Bookmark className="h-5 w-5 stroke-[2]" />
                Saved Colleges
              </Link>
            )}
            
            <hr className="border-slate-100 my-1" />
            
            {!loading && (
              <div className="pt-1">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-slate-400 truncate px-3 py-1">
                      Logged in as: {user.email}
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 py-3 text-sm font-bold transition-all active:scale-[0.98]"
                    >
                      <LogOut className="h-4 w-4 text-slate-500" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm font-bold shadow-md transition-all active:scale-[0.98]"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
