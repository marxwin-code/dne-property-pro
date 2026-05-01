"use client";

import { FormEvent, useState } from "react";

export function HousePackageLeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorDetail(null);
    try {
      const res = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email,
          propertyType: "House & Land Package — /house-package",
          message:
            "Requested full property report from House Package page (pricing breakdown & investment analysis)."
        })
      });
      let data: { success?: boolean; message?: string } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setStatus("error");
        setErrorDetail("Invalid response from server.");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setErrorDetail(data.message ?? `Request failed (${res.status}).`);
        return;
      }
      if (data.success !== true) {
        setStatus("error");
        setErrorDetail(data.message ?? "The server did not confirm delivery.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorDetail("Network error. Please try again.");
    }
  };

  const inputClass =
    "w-full border border-slate-300 bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#d4af37]/25";

  return (
    <form className="mt-10 grid max-w-md gap-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="hp-name" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Name
        </label>
        <input
          id="hp-name"
          required
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="hp-email" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Email
        </label>
        <input
          id="hp-email"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mt-2`}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 w-full border border-[#0f172a] bg-[#0f172a] px-8 py-4 text-[11px] font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#1e293b] disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Request Full Report"}
      </button>
      {status === "success" ? (
        <p className="text-sm text-emerald-800">
          Thank you. We will email your full property report shortly.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-800">{errorDetail ?? "Something went wrong."}</p>
      ) : null}
    </form>
  );
}
