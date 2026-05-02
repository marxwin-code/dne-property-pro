"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { PROPERTY_IMG_FALLBACK } from "@/lib/luxury-media";

function normalizeSrc(raw: string | null | undefined, fallback: string): string {
  if (!raw?.trim()) return fallback;
  const t = raw.trim();
  if (t.startsWith("https://")) return t;
  if (t.startsWith("http://")) return `https://${t.slice(7)}`;
  return fallback;
}

type RemoteImgProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src: string | null | undefined;
  fallbackSrc?: string;
};

/** Full https URLs; empty → default luxury fallback; onError → default. lazy loading. */
export function RemoteImg({
  src,
  alt,
  fallbackSrc = PROPERTY_IMG_FALLBACK,
  className,
  onLoad,
  onError,
  loading = "lazy",
  ...rest
}: RemoteImgProps) {
  const initial = normalizeSrc(src, fallbackSrc);
  const [current, setCurrent] = useState(initial);

  return (
    <img
      {...rest}
      src={current}
      alt={alt || ""}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={onLoad}
      onError={(e) => {
        if (current !== fallbackSrc) {
          setCurrent(fallbackSrc);
        }
        onError?.(e);
      }}
    />
  );
}
