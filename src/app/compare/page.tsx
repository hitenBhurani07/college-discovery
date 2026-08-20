"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Star, MapPin, IndianRupee, GitCompare, 
  Search, Trash2, TrendingUp, BookOpen, AlertCircle, Loader2, Sparkles
} from "lucide-react";
import { College, Course, Placement } from "@/generated/prisma/client";
import { removeFromCompare, addToCompare } from "@/lib/compareStore";

interface CollegeWithRelations extends College {
  courses: Course[];
  placements: Placement[];
}

function getLatestPlacement(college: CollegeWithRelations) {
  if (!college.placements || college.placements.length === 0) return null;
  return [...college.placements].sort((a, b) => b.year - a.year)[0];
}

function formatINR(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatFeesAbbr(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
  return `₹${amount}`;
}

// Autocomplete selector component
function CollegeAutocompleteSelector({
  allColleges,
  onSelect,
  excludeIds,
}: {
  allColleges: { id: string; name: string }[];
  onSelect: (id: string) => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = allColleges
    .filter((c) => !excludeIds.includes(c.id))
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search and add a college..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-all duration-200 shadow-sm"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
            {filtered.length === 0 ? (
              <li className="px-4 py-2.5 text-xs font-semibold text-slate-500 italic">
                No colleges found
              </li>
            ) : (
              filtered.map((college) => (
                <li
                  key={college.id}
                  onClick={() => {
                    onSelect(college.id);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className="relative cursor-pointer select-none rounded-lg px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {college.name}
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allCollegesList, setAllCollegesList] = useState<{ id: string; name: string }[]>([]);
  const [collegesDetails, setCollegesDetails] = useState<CollegeWithRelations[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Extract selected IDs from URL
  const selectedIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  // Fetch list of all colleges for selectors on mount
  useEffect(() => {
    fetch("/api/colleges?limit=100")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        setAllCollegesList(
          (json.data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
          }))
        );
      })
      .catch((err) => console.error("Error fetching all colleges list:", err));
  }, []);

  // Fetch details when selectedIds change
  useEffect(() => {
    if (selectedIds.length === 0) {
      setCollegesDetails([]);
      setLoadingDetails(false);
      return;
    }

    setLoadingDetails(true);
    Promise.all(
      selectedIds.map(async (id) => {
        try {
          const res = await fetch(`/api/colleges/${id}`);
          if (res.ok) {
            return res.json();
          }
        } catch (e) {
          console.error(`Error fetching details for ID ${id}:`, e);
        }
        return null;
      })
    )
      .then((results) => {
        setCollegesDetails(results.filter(Boolean) as CollegeWithRelations[]);
      })
      .catch((err) => console.error("Error fetching details:", err))
      .finally(() => setLoadingDetails(false));
  }, [searchParams.get("ids")]); // trigger whenever the 'ids' param string updates

  const handleAddCollege = async (id: string) => {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 3) return;

    // Fetch and update local store to synchronize list
    try {
      const res = await fetch(`/api/colleges/${id}`);
      if (res.ok) {
        const col = await res.json();
        addToCompare(col);
      }
    } catch (e) {
      console.error(e);
    }

    const nextIds = [...selectedIds, id];
    const params = new URLSearchParams(searchParams.toString());
    params.set("ids", nextIds.join(","));
    router.push(`/compare?${params.toString()}`);
  };

  const handleRemoveCollege = (id: string) => {
    const nextIds = selectedIds.filter((cid) => cid !== id);
    const params = new URLSearchParams(searchParams.toString());
    if (nextIds.length > 0) {
      params.set("ids", nextIds.join(","));
    } else {
      params.delete("ids");
    }
    router.push(`/compare?${params.toString()}`);

    // Update local compare store
    removeFromCompare(id);
  };

  // Determine best performers for styling highlights
  const bestMetrics = (() => {
    if (collegesDetails.length < 2) return { ratingId: null, packageId: null, feeId: null };

    let bestRating = -1;
    let ratingId: string | null = null;
    let bestPackage = -1;
    let packageId: string | null = null;
    let lowestMaxFee = Infinity;
    let feeId: string | null = null;

    collegesDetails.forEach((c) => {
      if (c.rating > bestRating) {
        bestRating = c.rating;
        ratingId = c.id;
      }
      const p = getLatestPlacement(c);
      if (p && p.avgPackage > bestPackage) {
        bestPackage = p.avgPackage;
        packageId = c.id;
      }
      if (c.feesMax < lowestMaxFee) {
        lowestMaxFee = c.feesMax;
        feeId = c.id;
      }
    });

    return { ratingId, packageId, feeId };
  })();

  const slotsCount = 3;
  const comparedColleges = collegesDetails;

  // Helper to generate a detailed summary based on compared colleges
  const renderComparisonSummary = () => {
    if (comparedColleges.length < 2) return null;

    const insights: { title: string; desc: React.ReactNode }[] = [];

    // 1. Rating comparison
    const maxRating = Math.max(...comparedColleges.map((c) => c.rating));
    const bestRated = comparedColleges.filter((c) => c.rating === maxRating);
    if (bestRated.length === comparedColleges.length) {
      insights.push({
        title: "Academic Rating",
        desc: (
          <span>
            All selected colleges are rated equally at{" "}
            <span className="font-extrabold text-indigo-600">
              {maxRating.toFixed(1)}/5.0
            </span>.
          </span>
        ),
      });
    } else {
      insights.push({
        title: "Academic Rating",
        desc: (
          <span>
            <span className="font-extrabold text-slate-800">
              {bestRated.map((c) => c.name).join(" and ")}
            </span>{" "}
            {bestRated.length > 1 ? "lead" : "leads"} in academic quality with a rating of{" "}
            <span className="font-extrabold text-indigo-600">
              {maxRating.toFixed(1)}/5.0
            </span>.
          </span>
        ),
      });
    }

    // 2. Budget/Fees comparison
    const lowestMaxFee = Math.min(...comparedColleges.map((c) => c.feesMax));
    const mostAffordable = comparedColleges.filter((c) => c.feesMax === lowestMaxFee);
    insights.push({
      title: "Cost & Budget",
      desc: (
        <span>
          For budget-conscious options,{" "}
          <span className="font-extrabold text-slate-800">
            {mostAffordable.map((c) => c.name).join(" and ")}
          </span>{" "}
          {mostAffordable.length > 1 ? "are" : "is"} the most economical choice with maximum course fees capped at{" "}
          <span className="font-extrabold text-emerald-600">
            {formatFeesAbbr(lowestMaxFee)}
          </span>.
        </span>
      ),
    });

    // 3. Placement packages
    const placementData = comparedColleges.map((c) => {
      const lp = getLatestPlacement(c);
      return { college: c, lp };
    });

    const hasPlacements = placementData.some((p) => p.lp !== null);
    if (hasPlacements) {
      const validPlacements = placementData.filter((p) => p.lp !== null) as {
        college: CollegeWithRelations;
        lp: Placement;
      }[];

      const highestPkg = Math.max(...validPlacements.map((p) => p.lp.avgPackage));
      const bestPkgColleges = validPlacements.filter((p) => p.lp.avgPackage === highestPkg);

      insights.push({
        title: "Career Placements",
        desc: (
          <span>
            <span className="font-extrabold text-slate-800">
              {bestPkgColleges.map((p) => p.college.name).join(" and ")}
            </span>{" "}
            {bestPkgColleges.length > 1 ? "offer" : "offers"} the highest average salary package of{" "}
            <span className="font-extrabold text-indigo-600">
              {formatINR(highestPkg)}
            </span>.
          </span>
        ),
      });

      const highestRate = Math.max(...validPlacements.map((p) => p.lp.placementRate));
      const bestRateColleges = validPlacements.filter((p) => p.lp.placementRate === highestRate);

      insights.push({
        title: "Placement Rate",
        desc: (
          <span>
            <span className="font-extrabold text-slate-800">
              {bestRateColleges.map((p) => p.college.name).join(" and ")}
            </span>{" "}
            achieved the best placement rate of{" "}
            <span className="font-extrabold text-emerald-600">
              {highestRate.toFixed(1)}%
            </span>.
          </span>
        ),
      });
    }

    // Recommendation logic
    let conclusion = "Select the college that best matches your budget and rating targets.";
    if (hasPlacements) {
      const validPlacements = placementData.filter((p) => p.lp !== null) as {
        college: CollegeWithRelations;
        lp: Placement;
      }[];
      const highestPkg = Math.max(...validPlacements.map((p) => p.lp.avgPackage));
      const bestPkgColleges = validPlacements.filter((p) => p.lp.avgPackage === highestPkg);
      if (bestPkgColleges.length > 0) {
        conclusion = `${bestPkgColleges.map((p) => p.college.name).join(" & ")} offers the best overall career returns based on average placement package statistics.`;
      }
    }

    return (
      <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-white to-slate-100/40 border border-indigo-100/50 p-6 shadow-sm shadow-indigo-100/5 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/10">
            <Sparkles className="h-4.5 w-4.5 fill-white" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            Smart Comparison Recommendation Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {insights.map((insight, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                {insight.title}
              </p>
              <div className="text-xs font-semibold text-slate-600 leading-relaxed">
                {insight.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
          Best Recommendation:{" "}
          <span className="text-indigo-600">
            {conclusion}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200/60 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>
          <div className="flex items-center gap-1 text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3.5 py-1.5 rounded-full shadow-sm">
            <GitCompare className="h-3.5 w-3.5" />
            College Comparison Tool
          </div>
        </div>
      </div>

      <main className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Compare <span className="text-indigo-600">Colleges</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Compare rankings, locations, fees, placement stats, and offered courses side-by-side to make the best decision.
          </p>
        </div>

        {/* Loading details state */}
        {loadingDetails && comparedColleges.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm font-medium text-slate-500">Retrieving comparison details...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Main Side-by-Side Comparison Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Column 1: Labels (Visible on MD and up) */}
              <div className="hidden md:flex flex-col justify-start pt-[260px] gap-6 text-sm font-bold text-slate-400 uppercase tracking-wider select-none">
                <div className="h-[76px] flex items-center border-b border-slate-100 pb-2">Location</div>
                <div className="h-[76px] flex items-center border-b border-slate-100 pb-2">Overall Rating</div>
                <div className="h-[76px] flex items-center border-b border-slate-100 pb-2">Fee Range</div>
                <div className="h-[100px] flex items-center border-b border-slate-100 pb-2">Placement Rates</div>
                <div className="h-[100px] flex items-center border-b border-slate-100 pb-2">Avg placement Package</div>
                <div className="flex-1 flex flex-col pt-4">Offered Courses & Fees</div>
              </div>

              {/* Columns 2-4: Comparison slots */}
              {[...Array(slotsCount)].map((_, index) => {
                const college = comparedColleges[index];

                return (
                  <div 
                    key={index}
                    className={`rounded-2xl border ${
                      college 
                        ? "border-slate-200 bg-white shadow-sm" 
                        : "border-dashed border-slate-300 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center min-h-[450px]"
                    }`}
                  >
                    {college ? (
                      <div className="relative flex flex-col h-full">
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveCollege(college.id)}
                          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer"
                          title="Remove College"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        {/* Top Header Card */}
                        <div className="p-5 border-b border-slate-100 min-h-[260px] flex flex-col justify-between">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100/40 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 shadow-sm shadow-indigo-100/10">
                              Slot {index + 1}
                            </span>
                            <h3 className="mt-3 text-lg font-black tracking-tight text-slate-900 line-clamp-2 hover:text-indigo-600 leading-snug">
                              <Link href={`/colleges/${college.id}`}>{college.name}</Link>
                            </h3>
                          </div>
                          <div className="mt-4">
                            <Link
                              href={`/colleges/${college.id}`}
                              className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:shadow shadow-indigo-100 transition-all duration-200 active:scale-95"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>

                        {/* Location Row */}
                        <div className="p-5 border-b border-slate-100 h-[76px] flex flex-col justify-center">
                          <span className="md:hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Location</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <MapPin className="h-4 w-4 text-indigo-500 stroke-[2.5]" />
                            {college.location}
                          </span>
                        </div>

                        {/* Rating Row */}
                        <div className="p-5 border-b border-slate-100 h-[76px] flex flex-col justify-center">
                          <span className="md:hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Overall Rating</span>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/40 px-2.5 py-0.5 text-xs font-extrabold text-amber-700">
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              {college.rating.toFixed(1)}
                            </span>
                            {bestMetrics.ratingId === college.id && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                                <Sparkles className="h-2.5 w-2.5 fill-white" /> Top Rated
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Fee Range Row */}
                        <div className="p-5 border-b border-slate-100 h-[76px] flex flex-col justify-center">
                          <span className="md:hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Fee Range</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-800">
                              {college.feesMin === college.feesMax
                                ? formatFeesAbbr(college.feesMin)
                                : `${formatFeesAbbr(college.feesMin)} - ${formatFeesAbbr(college.feesMax)}`}
                            </span>
                            {bestMetrics.feeId === college.id && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                                Best Value
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Placement Rate Row */}
                        <div className="p-5 border-b border-slate-100 h-[100px] flex flex-col justify-center">
                          <span className="md:hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Placement Rate</span>
                          {(() => {
                            const lp = getLatestPlacement(college);
                            if (!lp) return <span className="text-xs font-semibold text-slate-400 italic">No placement data</span>;
                            return (
                              <div>
                                <span className="text-sm font-extrabold text-emerald-600">
                                  {lp.placementRate.toFixed(1)}%
                                </span>
                                <span className="ml-1 text-[10px] text-slate-400 font-bold">({lp.year} stats)</span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Placement Package Row */}
                        <div className="p-5 border-b border-slate-100 h-[100px] flex flex-col justify-center">
                          <span className="md:hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Avg placement Package</span>
                          {(() => {
                            const lp = getLatestPlacement(college);
                            if (!lp) return <span className="text-xs font-semibold text-slate-400 italic">No placement data</span>;
                            return (
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-800">
                                  {formatINR(lp.avgPackage)}
                                </span>
                                {bestMetrics.packageId === college.id && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-500 text-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                                    Top Package
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Course List & Fees */}
                        <div className="p-5 flex-1 flex flex-col">
                          <span className="md:hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Offered Courses & Fees</span>
                          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3">
                            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500">
                              {college.courses.length} courses offered
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
                            {college.courses.slice(0, 4).map((course) => (
                              <div key={course.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 flex items-center justify-between text-left text-[11px] hover:border-indigo-100 transition-colors">
                                <span className="font-extrabold text-slate-700 max-w-[60%] truncate">{course.name}</span>
                                <span className="font-extrabold text-slate-800 text-right">{formatFeesAbbr(course.fees)}</span>
                              </div>
                            ))}
                            {college.courses.length > 4 && (
                              <p className="text-[10px] text-slate-400 font-bold italic text-center mt-1">
                                + {college.courses.length - 4} more courses
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm mb-4">
                          <GitCompare className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">Add to slot {index + 1}</h4>
                        <p className="mt-1 text-xs font-medium text-slate-500 max-w-[200px] mb-4">
                          Search for colleges in the directory to add them to this slot.
                        </p>
                        <CollegeAutocompleteSelector
                          allColleges={allCollegesList}
                          onSelect={handleAddCollege}
                          excludeIds={selectedIds}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recommendation Summary */}
            {renderComparisonSummary()}
            
            {/* Empty comparison warning */}
            {comparedColleges.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 px-4 text-center mt-6 animate-in fade-in duration-300">
                <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 mb-4 shadow-sm">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No colleges selected</h3>
                <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
                  Select colleges above to compare them side-by-side or return to browse and choose directly from the card grid.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                  Browse Colleges Feed
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading comparison tool...</p>
        </div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
