"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import invoiceLimits from "@/config/invoice-extract.json";
import { fillTemplate } from "@/lib/i18n/fill-template";
import { useSiteText } from "@/lib/i18n/use-site-text";

type ApiSuccess = {
  success: true;
  data: {
    invoice_number: string;
    amount: string;
    address: string;
    matched_property_id: string;
  };
  excel: { content_base64: string; filename: string };
};

type ApiError = { success: false; error: string };

export default function InvoiceExtractPage() {
  const t = useSiteText();
  const tx = t.invoiceExtract;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("invoice-extract.xlsx");
  const [summary, setSummary] = useState<ApiSuccess["data"] | null>(null);

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
    if (input.files.length !== 1) {
      setError(tx.errorNoPdf);
      return;
    }
    const file = input.files[0];
    const mime = (file.type || "").toLowerCase();
    const nameOk = file.name.toLowerCase().endsWith(".pdf");
    if (mime !== "application/pdf" && !nameOk) {
      setError(tx.errorNoPdf);
      return;
    }
    const maxBytes = invoiceLimits.limits.maxUploadBytes;
    if (file.size > maxBytes) {
      const mb = Math.round(maxBytes / (1024 * 1024));
      setError(fillTemplate(tx.errorFileTooLarge, { mb }));
      return;
    }

    setError(null);
    setSummary(null);
    revokeBlob();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/invoice-extract", {
        method: "POST",
        body: formData
      });

      const j = (await res.json()) as ApiSuccess | ApiError;

      if (!("success" in j) || j.success === false) {
        const msg = "error" in j && typeof j.error === "string" ? j.error : tx.errorGeneric;
        setError(msg);
        return;
      }

      setSummary(j.data);
      setFileName(j.excel.filename || "invoice-extract.xlsx");
      const bin = atob(j.excel.content_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch {
      setError(tx.errorGeneric);
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

          {summary ? (
            <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/80 p-4 text-left text-sm text-slate-800">
              <p className="font-semibold text-lux-ink">Match summary</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Invoice #: {summary.invoice_number || "—"}</li>
                <li>Amount: {summary.amount || "—"}</li>
                <li>Address: {summary.address || "—"}</li>
                <li>Matched property_id: {summary.matched_property_id}</li>
              </ul>
            </div>
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
