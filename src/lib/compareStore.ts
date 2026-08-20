import { College } from "@/generated/prisma/client";

const COMPARE_KEY = "colleges_compare_list";
const MAX_COMPARE = 3;

export function getCompareList(): College[] {
  if (typeof window === "undefined") return [];
  try {
    const list = localStorage.getItem(COMPARE_KEY);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error("Error reading compare list", e);
    return [];
  }
}

export function addToCompare(college: College): { success: boolean; error?: string } {
  if (typeof window === "undefined") return { success: false };
  try {
    const list = getCompareList();
    if (list.some((c) => c.id === college.id)) {
      return { success: true }; // already in list
    }
    if (list.length >= MAX_COMPARE) {
      return { success: false, error: `You can compare up to ${MAX_COMPARE} colleges.` };
    }
    // Only save minimal data or full data as needed.
    const newList = [...list, college];
    localStorage.setItem(COMPARE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent("compare-updated"));
    return { success: true };
  } catch (e) {
    console.error("Error adding to compare list", e);
    return { success: false, error: "Failed to add to comparison list." };
  }
}

export function removeFromCompare(collegeId: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getCompareList();
    const newList = list.filter((c) => c.id !== collegeId);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent("compare-updated"));
  } catch (e) {
    console.error("Error removing from compare list", e);
  }
}

export function isInCompare(collegeId: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getCompareList();
  return list.some((c) => c.id === collegeId);
}

export function clearCompareList(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMPARE_KEY);
  window.dispatchEvent(new CustomEvent("compare-updated"));
}
