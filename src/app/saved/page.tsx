"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { User } from "@supabase/supabase-js";
import CollegeCard from "@/components/CollegeCard";
import { College } from "@/generated/prisma/client";
import { Bookmark, Lock, Loader2, Compass, AlertCircle } from "lucide-react";

interface SavedCollegeItem {
  collegeId: string;
  userId: string;
  college: College;
}

export default function SavedCollegesPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [savedColleges, setSavedColleges] = useState<SavedCollegeItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch saved colleges if authenticated
  useEffect(() => {
    if (!user) return;

    const fetchSavedColleges = async () => {
      setDataLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/saved");
        if (res.ok) {
          const data = await res.json();
          setSavedColleges(data || []);
        } else {
          setError("Failed to load saved colleges. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching saved colleges:", err);
        setError("An unexpected error occurred while loading your saved colleges.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchSavedColleges();
  }, [user]);

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm font-medium text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated "Access Denied" view
  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center bg-gray-50/50 animate-in fade-in duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 tracking-tight">Access Denied</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Please log in to view and manage your saved colleges.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Header section */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full w-fit">
            <Bookmark className="h-3.5 w-3.5 fill-indigo-100" />
            My Bookmarks
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Saved Colleges
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View, review, and track all your bookmarked academic institutions.
          </p>
        </div>
      </section>

      {/* Main content grid */}
      <main className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        {dataLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="h-4 w-12 rounded bg-gray-200"></div>
                </div>
                <div className="mt-4 h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="mt-2 h-6 w-1/2 rounded bg-gray-200"></div>
                <div className="mt-4 h-12 rounded-xl bg-gray-50"></div>
                <div className="mt-5 flex gap-3">
                  <div className="h-10 flex-1 rounded-xl bg-gray-200"></div>
                  <div className="h-10 w-10 rounded-xl bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-4 text-center">
            <div className="rounded-2xl bg-red-50 p-4 text-red-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">Failed to load bookmarks</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">{error}</p>
          </div>
        ) : savedColleges.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-4 text-center animate-in fade-in duration-300">
            <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
              <Bookmark className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">No saved colleges yet</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Start searching for colleges on the browse feed and tap the bookmark icon to save them to your profile.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
            >
              <Compass className="h-4 w-4" />
              Explore Colleges
            </Link>
          </div>
        ) : (
          /* Bookmarks Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
            {savedColleges.map((item) => (
              <CollegeCard
                key={item.collegeId}
                college={item.college}
                initialSaved={true}
                onUnsave={(collegeId) =>
                  setSavedColleges((prev) =>
                    prev.filter((s) => s.collegeId !== collegeId)
                  )
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
