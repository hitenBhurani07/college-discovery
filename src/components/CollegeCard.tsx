"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, MapPin, IndianRupee, Bookmark, BookmarkCheck, ChevronRight, Loader2 } from "lucide-react";
import { College } from "@/generated/prisma/client";

interface CollegeCardProps {
  college: College;
  initialSaved?: boolean;
}

export default function CollegeCard({ college, initialSaved = false }: CollegeCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

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
        }
      } else {
        // Save — POST
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: college.id }),
        });
        if (res.status === 401) {
          // Not logged in — revert and let user know via URL
          setIsSaved(false);
          window.location.href = "/login";
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
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/50">
      {/* Header: Location & Rating */}
      <div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-indigo-500 stroke-[2]" />
            {college.location}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {college.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
          {college.name}
        </h3>

        {/* Fee Range */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50/80 px-3 py-2.5">
          <div className="rounded-lg bg-white p-1 shadow-sm border border-gray-100/50">
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Estimated Fees</p>
            <p className="text-sm font-bold text-gray-700">{feesDisplay}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-5 flex items-center gap-3">
        <Link
          href={`/colleges/${college.id}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-100 hover:bg-indigo-700 transition-all group-hover:shadow-md group-hover:shadow-indigo-200"
        >
          View Details
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Bookmark button — wired to POST/DELETE /api/saved */}
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          className={`inline-flex items-center justify-center rounded-xl border p-2.5 transition-all ${
            isSaved
              ? "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              : "border-gray-100 bg-white text-gray-400 hover:bg-gray-50 hover:border-gray-200 hover:text-indigo-600"
          }`}
          title={isSaved ? "Unsave College" : "Save College"}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isSaved ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
