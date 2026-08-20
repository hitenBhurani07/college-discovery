"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { User } from "@supabase/supabase-js";
import { Star, MapPin, IndianRupee, Bookmark, BookmarkCheck, ArrowLeft, Loader2, Calendar, TrendingUp, BookOpen, AlertCircle, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  name: string;
  duration: string;
  fees: number;
}

interface Placement {
  id: string;
  year: number;
  avgPackage: number;
  placementRate: number;
}

interface College {
  id: string;
  name: string;
  location: string;
  rating: number;
  feesMin: number;
  feesMax: number;
  courses: Course[];
  placements: Placement[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CollegeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const supabase = createClient();

  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth and Save states
  const [user, setUser] = useState<User | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Fetch college details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/colleges/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("College not found");
          } else {
            setError("Failed to fetch college details");
          }
          return;
        }
        const data = await res.json();
        setCollege(data);
      } catch (err) {
        console.error("Error fetching college details:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Handle user authentication and initial saved status check
  useEffect(() => {
    const checkUserAndSavedStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const res = await fetch("/api/saved");
          if (res.ok) {
            const savedItems = await res.json();
            // Check if this college ID matches any of the user's saved items
            const found = savedItems.some((item: any) => item.collegeId === id);
            setIsSaved(found);
          }
        } catch (err) {
          console.error("Error fetching saved status:", err);
        }
      }
    };

    checkUserAndSavedStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id, supabase]);

  // Handle Save/Unsave College toggle
  const handleSave = async () => {
    if (!user) {
      setSaveMessage("Log in to save colleges.");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    const wasAlreadySaved = isSaved;
    setIsSaved(!wasAlreadySaved); // optimistic

    try {
      if (wasAlreadySaved) {
        const res = await fetch(`/api/saved/${id}`, { method: "DELETE" });
        if (!res.ok && res.status !== 404) {
          setIsSaved(true); // roll back
          setSaveMessage("Failed to unsave. Try again.");
        } else {
          setSaveMessage("Removed from saved.");
          setTimeout(() => setSaveMessage(null), 2500);
        }
      } else {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: id }),
        });
        if (!res.ok) {
          setIsSaved(false); // roll back
          const errData = await res.json();
          setSaveMessage(errData.error || "Failed to save.");
        } else {
          setSaveMessage("Saved!");
          setTimeout(() => setSaveMessage(null), 2500);
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      setIsSaved(wasAlreadySaved); // roll back
      setSaveMessage("Error connecting to server.");
    } finally {
      setSaving(false);
    }
  };

  const formatINR = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm font-medium text-gray-500">Loading college details...</p>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">{error || "College not found"}</h2>
        <p className="mt-2 text-gray-500">
          We couldn't retrieve information for this college. It might have been removed or the URL is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>
        </div>
      </div>

      {/* College Info Hero Header */}
      <section className="bg-white border-b border-gray-100 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Title & Metadata */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Accredited Institution
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {college.rating.toFixed(1)} Rating
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                {college.name}
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <MapPin className="h-4 w-4 text-indigo-500" />
                {college.location}, India
              </p>
            </div>

            {/* Action Save button */}
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center md:flex-col md:items-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold shadow-sm transition-all duration-200 border ${
                  isSaved
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-50 hover:bg-red-50 hover:border-red-100 hover:text-red-600"
                    : "bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-md"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSaved ? "Removing..." : "Saving..."}
                  </>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Save College
                  </>
                )}
              </button>

              {/* Status notifications */}
              {saveMessage && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  saveMessage === "Saved!" 
                    ? "text-emerald-600 bg-emerald-50/50" 
                    : "text-amber-700 bg-amber-50"
                }`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Layout (Two columns) */}
      <main className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Courses Offered List (Takes 2 cols) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Available Courses & Fees
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse text-left text-sm text-gray-500">
                  <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Course Name</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3 rounded-r-xl text-right">Annual/Total Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {college.courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-4 py-4 font-semibold text-gray-900">{course.name}</td>
                        <td className="px-4 py-4 font-medium text-gray-500">{course.duration}</td>
                        <td className="px-4 py-4 font-bold text-gray-800 text-right">
                          {formatINR(course.fees)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Historical Placements (Takes 1 col) */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-full">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Placement Records
              </h2>

              <div className="mt-6 flex flex-col gap-6">
                {college.placements.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No historical placement data available.</p>
                ) : (
                  college.placements.map((placement) => (
                    <div
                      key={placement.id}
                      className="relative rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:border-indigo-50 transition-all duration-200"
                    >
                      {/* Year badge */}
                      <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-sm shadow-indigo-100">
                        <Calendar className="h-3 w-3" />
                        {placement.year}
                      </div>

                      {/* Stats grid */}
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Avg Package
                          </p>
                          <p className="mt-1 text-base font-extrabold text-gray-900">
                            {formatINR(placement.avgPackage)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Placement Rate
                          </p>
                          <p className="mt-1 text-base font-extrabold text-emerald-600">
                            {placement.placementRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
