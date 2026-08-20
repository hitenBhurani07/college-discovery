"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, MapPin, IndianRupee, Bookmark, BookmarkCheck, ChevronRight, Loader2 } from "lucide-react";
import { College } from "@/generated/prisma/client";

interface CollegeCardProps {
  college: College;
  initialSaved?: boolean;
  onUnsave?: (collegeId: string) => void;
}

export default function CollegeCard({ college, initialSaved = false, onUnsave }: CollegeCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const formatFees = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
    return `₹${amount}`;
  };

  const feesDisplay =
    college.feesMin === college.feesMax
      ? formatFees(college.feesMin)
      : `${formatFees(college.feesMin)} - ${formatFees(college.feesMax)}`;

  const handleSaveToggle = async () => {
    if (saving) return;
    setSaving(true);

    // Optimistic update
    const wasAlreadySaved = isSaved;
    setIsSaved(!wasAlreadySaved);

    try {
      if (wasAlreadySaved) {
        // Unsave — DELETE
        const res = await fetch(`/api/saved/${college.id}`, { method: "DELETE" });
        if (!res.ok && res.status !== 404) {
          // Roll back optimistic update on unexpected error
          setIsSaved(true);
        } else {
          // Notify parent (e.g. saved page) to remove this card
          onUnsave?.(college.id);
        }
      } else {
        // Save — POST
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: college.id }),
        });
        if (res.status === 401) {
          // Not logged in — show toast then redirect
          setIsSaved(false);
          setToast("Log in to save colleges");
          setTimeout(() => {
            setToast(null);
            window.location.href = "/login";
          }, 1500);
          return;
        }
        if (!res.ok) {
          setIsSaved(false);
        }
      }
    } catch {
      // Network error — revert
      setIsSaved(wasAlreadySaved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/30">
      {/* Toast notification for unauthenticated save attempt */}
      {toast && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center rounded-b-2xl bg-slate-900/95 px-4 py-3 text-xs font-semibold text-white animate-in slide-in-from-bottom duration-200">
          {toast} — <span className="ml-1 underline">redirecting&hellip;</span>
        </div>
      )}
      {/* Header: Location & Rating */}
      <div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-indigo-600 stroke-[2.5]" />
            {college.location}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/40 px-2.5 py-0.5 font-bold text-amber-700 shadow-sm shadow-amber-100/10">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {college.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-3.5 text-lg font-bold tracking-tight text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
          {college.name}
        </h3>

        {/* Fee Range */}
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200/50 px-3.5 py-2.5">
          <div className="rounded-lg bg-white p-1.5 shadow-sm border border-slate-200/60">
            <IndianRupee className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Estimated Fees</p>
            <p className="text-sm font-extrabold text-slate-800 leading-none mt-0.5">{feesDisplay}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-5 flex items-center gap-3">
        <Link
          href={`/colleges/${college.id}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-100 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
        >
          View Details
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Bookmark button — wired to POST/DELETE /api/saved */}
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          className={`inline-flex items-center justify-center rounded-xl border p-2.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] shadow-sm ${
            isSaved
              ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/80"
              : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600"
          }`}
          title={isSaved ? "Unsave College" : "Save College"}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : isSaved ? (
            <BookmarkCheck className="h-5 w-5 stroke-[2.5]" />
          ) : (
            <Bookmark className="h-5 w-5 stroke-[2]" />
          )}
        </button>
      </div>
    </div>
  );
}
