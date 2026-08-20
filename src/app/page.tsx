"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CollegeCard from "@/components/CollegeCard";
import { College } from "@/generated/prisma/client";
import { Search, X, Sparkles, AlertCircle, SlidersHorizontal, ChevronLeft, ChevronRight, GitCompare } from "lucide-react";
import { getCompareList, clearCompareList } from "@/lib/compareStore";

// All distinct cities in the seeded dataset
const LOCATIONS = [
  "Bengaluru", "New Delhi", "Mumbai", "Kolkata", "Chennai",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Bhubaneswar",
  "Manipal", "Coimbatore", "Vellore", "Chandigarh", "Nagpur",
  "Pilani", "Lucknow", "Mysuru",
];

const RATING_OPTIONS = [
  { label: "Any rating", value: "" },
  { label: "3.0+", value: "3.0" },
  { label: "3.5+", value: "3.5" },
  { label: "4.0+", value: "4.0" },
  { label: "4.5+", value: "4.5" },
];

// ─── SearchBar (isolated Suspense boundary) ─────────────────────────────────
function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchVal) {
        params.set("search", searchVal);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset page to 1 on search change
      router.replace(`/?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal, router, searchParams]);

  // Sync on external URL change (back/forward navigation)
  useEffect(() => {
    setSearchVal(searchParams.get("search") || "");
  }, [searchParams]);

  return (
    <div className="relative rounded-2xl shadow-md shadow-slate-100/80">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5">
        <Search className="h-5 w-5 text-slate-400 stroke-[2]" />
      </div>
      <input
        type="text"
        value={searchVal}
        onChange={(e) => setSearchVal(e.target.value)}
        placeholder="Search by college name (e.g., IIT, BITS)..."
        className="block w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm font-medium text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
      />
      {searchVal && (
        <button
          onClick={() => setSearchVal("")}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ─── FiltersBar (isolated Suspense boundary) ─────────────────────────────────
function FiltersBar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [minFees, setMinFees] = useState(searchParams.get("minFees") || "");
  const [maxFees, setMaxFees] = useState(searchParams.get("maxFees") || "");

  // Push any filter change to URL immediately (no debounce needed for selects)
  const pushFilters = (
    overrides: Partial<{ location: string; minRating: string; minFees: string; maxFees: string }>
  ) => {
    const next = {
      location: overrides.location ?? location,
      minRating: overrides.minRating ?? minRating,
      minFees: overrides.minFees ?? minFees,
      maxFees: overrides.maxFees ?? maxFees,
    };

    const params = new URLSearchParams(searchParams.toString());

    const set = (key: string, val: string) =>
      val ? params.set(key, val) : params.delete(key);

    set("location", next.location);
    set("minRating", next.minRating);
    set("minFees", next.minFees);
    set("maxFees", next.maxFees);
    params.delete("page"); // Reset page to 1 on filter change

    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  // Debounce fee inputs
  useEffect(() => {
    const handler = setTimeout(() => pushFilters({}), 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFees, maxFees]);

  const hasActiveFilters = location || minRating || minFees || maxFees;

  const clearAll = () => {
    setLocation("");
    setMinRating("");
    setMinFees("");
    setMaxFees("");
    const params = new URLSearchParams(searchParams.toString());
    ["location", "minRating", "minFees", "maxFees", "page"].forEach((k) => params.delete(k));
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <SlidersHorizontal className="h-3.5 w-3.5 stroke-[2.5]" />
        Filters
      </div>

      {/* Location */}
      <select
        value={location}
        onChange={(e) => {
          setLocation(e.target.value);
          pushFilters({ location: e.target.value });
        }}
        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 cursor-pointer"
      >
        <option value="">All Cities</option>
        {LOCATIONS.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      {/* Min Rating */}
      <select
        value={minRating}
        onChange={(e) => {
          setMinRating(e.target.value);
          pushFilters({ minRating: e.target.value });
        }}
        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 cursor-pointer"
      >
        {RATING_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Fee Range */}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          value={minFees}
          onChange={(e) => setMinFees(e.target.value)}
          placeholder="Min ₹"
          className="w-24 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 placeholder-slate-400 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        />
        <span className="text-slate-400 text-sm font-bold">–</span>
        <input
          type="number"
          min={0}
          value={maxFees}
          onChange={(e) => setMaxFees(e.target.value)}
          placeholder="Max ₹"
          className="w-24 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 placeholder-slate-400 hover:border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        />
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-xl bg-red-50/50 hover:bg-red-50 cursor-pointer"
        >
          <X className="h-3.5 w-3.5 stroke-[2.5]" />
          Clear
        </button>
      )}
    </div>
  );
}

// ─── CollegeGrid (isolated Suspense boundary) ────────────────────────────────
function CollegeGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState<College[]>([]);

  // Pagination states
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });

  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const minRating = searchParams.get("minRating") || "";
  const minFees = searchParams.get("minFees") || "";
  const maxFees = searchParams.get("maxFees") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

  // Fetch comparison list state on mount & synchronize
  useEffect(() => {
    setCompareList(getCompareList());

    const handleCompareUpdate = () => {
      setCompareList(getCompareList());
    };

    window.addEventListener("compare-updated", handleCompareUpdate);
    return () => {
      window.removeEventListener("compare-updated", handleCompareUpdate);
    };
  }, []);

  // Fetch saved IDs once (non-blocking; 401 is expected when logged out)
  useEffect(() => {
    fetch("/api/saved")
      .then((r) => (r.ok ? r.json() : []))
      .then((items: { collegeId: string }[]) => {
        setSavedIds(new Set(items.map((i) => i.collegeId)));
      })
      .catch(() => {}); // silently ignore — user is not logged in
  }, []);

  useEffect(() => {
    let active = true;

    const fetchColleges = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (location) params.set("location", location);
        if (minRating) params.set("minRating", minRating);
        if (minFees) params.set("minFees", minFees);
        if (maxFees) params.set("maxFees", maxFees);
        params.set("page", page.toString());
        params.set("limit", "9"); // 9 is ideal for a 3-column layout grid

        const res = await fetch(`/api/colleges?${params.toString()}`);
        if (res.ok && active) {
          const json = await res.json();
          setColleges(json.data || []);
          setMeta(json.meta || { total: 0, page: 1, limit: 9, totalPages: 1 });
        }
      } catch (err) {
        console.error("Error fetching colleges:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchColleges();
    return () => { active = false; };
  }, [search, location, minRating, minFees, maxFees, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`, { scroll: true });
  };

  if (loading) return <CollegeGridSkeleton />;

  if (colleges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-4 text-center animate-in fade-in duration-300">
        <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-gray-900">No colleges found</h3>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          Showing <span className="font-semibold text-slate-900">{colleges.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{meta.total}</span> colleges
        </p>
      </div>
      
      {/* College Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {colleges.map((college) => (
          <CollegeCard
            key={college.id}
            college={college}
            initialSaved={savedIds.has(college.id)}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2 border-t border-slate-200/60 pt-6">
          <button
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold shadow-sm transition-all cursor-pointer ${
                  meta.page === p
                    ? "bg-indigo-600 text-white shadow-indigo-100"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          >
            Next
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-3.5 shadow-2xl text-white flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-500/20">
              <GitCompare className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight">Compare Colleges</p>
              <p className="text-xs font-semibold text-slate-400">
                {compareList.length} of 3 selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.location.href = `/compare?ids=${compareList.map((c) => c.id).join(",")}`;
              }}
              className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
            >
              Compare Now
            </button>
            <button
              onClick={() => clearCompareList()}
              className="rounded-xl border border-slate-700 text-slate-400 hover:text-white px-3 py-2 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function CollegeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-12 rounded bg-gray-200" />
          </div>
          <div className="mt-4 h-6 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-6 w-1/2 rounded bg-gray-200" />
          <div className="mt-4 h-12 rounded-xl bg-gray-50" />
          <div className="mt-5 flex gap-3">
            <div className="h-10 flex-1 rounded-xl bg-gray-200" />
            <div className="h-10 w-10 rounded-xl bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero + Search + Filters */}
      <section className="bg-gradient-to-b from-white via-white to-slate-50 border-b border-slate-200/50 py-16 sm:py-20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100/60 px-3.5 py-1.5 text-xs font-extrabold text-indigo-700 shadow-sm shadow-indigo-100/10">
              <Sparkles className="h-3.5 w-3.5 fill-indigo-100" />
              Discover Colleges Instantly
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl max-w-3xl mx-auto leading-[1.15]">
              Find Your <span className="text-indigo-600">Dream College</span>
            </h1>
            <p className="mx-auto mt-4.5 max-w-2xl text-base font-medium text-slate-500 sm:text-lg">
              Explore and search top-rated Indian colleges with real-time package stats, courses, locations, and pricing.
            </p>

            {/* Search input — its own Suspense boundary */}
            <div className="mx-auto mt-9 max-w-xl">
              <Suspense fallback={
                <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-100 border border-slate-200" />
              }>
                <SearchBar />
              </Suspense>
            </div>
          </div>

          {/* Filters row — its own Suspense boundary */}
          <div className="mt-8 flex justify-center">
            <Suspense fallback={
              <div className="h-10 w-full max-w-2xl animate-pulse rounded-xl bg-slate-100 border border-slate-200" />
            }>
              <FiltersBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Results grid — its own Suspense boundary */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<CollegeGridSkeleton />}>
          <CollegeGrid />
        </Suspense>
      </main>
    </div>
  );
}
