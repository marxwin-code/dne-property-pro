"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useSiteText } from "@/lib/i18n/use-site-text";

export default function InvoiceExtractPage() {
  const t = useSiteText();
  const tx = t.invoiceExtract;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("invoice-extract.xlsx");

  const revokeBlob = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
  };

  const handleSubmit = async () => {
    const input = inputRef.current;
    if (!input?.files?.length) {
      setError(tx.errorNoPdf);
      return;
    }
    const pdfs = Array.from(input.files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length === 0) {
      setError(tx.errorNoPdf);
      return;
    }

    setError(null);
    revokeBlob();
    setLoading(true);

    try {
      const formData = new FormData();
      for (const f of pdfs) {
        formData.append("files", f);
      }
      const res = await fetch("/api/invoice-extract", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        let msg = tx.errorGeneric;
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const m = cd?.match(/filename="([^"]+)"/);
      if (m?.[1]) setFileName(m[1]);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : tx.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-lux-paper via-[#ebe6de] to-lux-paper-deep">
      <section className="border-b border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">{tx.kicker}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{tx.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">{tx.lead}</p>
          <Link
            href="/labs"
            className="mt-8 inline-flex text-sm font-medium text-lux-gold underline-offset-4 hover:underline"
          >
            {tx.backToLabs}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-2xl border border-stone-300/50 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
          <label className="block text-sm font-semibold text-lux-ink" htmlFor="invoice-pdfs">
            {tx.uploadLabel}
          </label>
          <p className="mt-1 text-xs text-slate-500">{tx.uploadHint}</p>
          <input
            id="invoice-pdfs"
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="mt-4 block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          />

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="mt-8 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? tx.processing : tx.submit}
          </button>

          {error ? (
            <p className="mt-4 text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}

          {blobUrl ? (
            <div className="mt-8 space-y-2 border-t border-stone-200 pt-6">
              <p className="text-sm font-medium text-emerald-700">{tx.successReady}</p>
              <a
                href={blobUrl}
                download={fileName}
                className="inline-flex w-full items-center justify-center rounded-xl border border-brand-600 bg-white px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-blue-50"
              >
                {tx.download}
              </a>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
