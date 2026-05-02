"use client";

import { useState } from "react";

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

function normalizeSrc(raw: string | null | undefined, fallback: string): string {
  if (!raw?.trim()) return fallback;
  const t = raw.trim();
  if (t.startsWith("https://")) return t;
  if (t.startsWith("http://")) return `https://${t.slice(7)}`;
  return fallback;
}

type RemoteImgProps = {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
};

/** Full-URL images only; failed loads swap to https fallback (no /public paths). */
export function RemoteImg({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  sizes: _sizes
}: RemoteImgProps) {
  const initial = normalizeSrc(src, fallbackSrc);
  const [current, setCurrent] = useState(initial);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setCurrent(fallbackSrc)}
    />
  );
}
