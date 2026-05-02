"use client";

export function PropertyListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1222]/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="aspect-video animate-pulse bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      <div className="space-y-3 px-5 py-6">
        <div className="h-6 max-w-[85%] animate-pulse rounded-md bg-slate-700/80" />
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-slate-700/60" />
        <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-800/80" />
        <div className="h-12 w-full animate-pulse rounded-md bg-slate-800/60" />
      </div>
    </div>
  );
}
