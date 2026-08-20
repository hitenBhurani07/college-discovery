"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { User } from "@supabase/supabase-js";
import { GraduationCap, Bookmark, LogIn, LogOut, Menu, X } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 transition-colors hover:text-indigo-700">
            <GraduationCap className="h-8 w-8 stroke-[1.75]" />
            <span className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Colleges<span className="text-indigo-600">IN</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
            Browse Colleges
          </Link>
          {user && (
            <Link
              href="/saved"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Bookmark className="h-4 w-4" />
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
                  <span className="text-sm text-gray-500 max-w-[200px] truncate">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium shadow-sm shadow-indigo-100 transition-all hover:shadow-md hover:shadow-indigo-200"
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
            className="inline-flex items-center justify-center rounded-xl p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors py-2"
            >
              Browse Colleges
            </Link>
            {user && (
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-base font-medium text-gray-600 hover:text-indigo-600 transition-colors py-2"
              >
                <Bookmark className="h-5 w-5" />
                Saved Colleges
              </Link>
            )}
            
            <hr className="border-gray-100" />
            
            {!loading && (
              <div className="pt-2">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm text-gray-400 truncate px-1">
                      Logged in as: {user.email}
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 py-3 text-sm font-medium transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm font-medium shadow-sm transition-all"
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
