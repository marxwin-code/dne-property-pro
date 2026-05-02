import { Suspense } from "react";
import { RiskReportClient } from "./risk-report-client";

export default function RiskReportPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] px-4 py-24 text-center text-slate-400">
          Loading…
        </main>
      }
    >
      <RiskReportClient />
    </Suspense>
  );
}
