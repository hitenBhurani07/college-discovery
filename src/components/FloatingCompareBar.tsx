"use client";

import { useEffect, useState } from "react";
import { GitCompare } from "lucide-react";
import { College } from "@/generated/prisma/client";
import { getCompareList, clearCompareList } from "@/lib/compareStore";
import { usePathname } from "next/navigation";

export default function FloatingCompareBar() {
  const [compareList, setCompareList] = useState<College[]>([]);
  const pathname = usePathname();

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

  // Hide the bar if we are on the compare page itself or if no colleges are selected
  if (pathname === "/compare" || compareList.length === 0) {
    return null;
  }

  return (
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
  );
}
