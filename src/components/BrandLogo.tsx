"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Props = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  xs: { width: 56, height: 56, className: "h-11 w-11" },
  sm: { width: 96, height: 96, className: "h-20 w-20" },
  md: {
    width: 180,
    height: 180,
    className: "h-[112px] w-[112px] md:h-[128px] md:w-[128px]",
  },
  lg: { width: 220, height: 220, className: "h-36 w-36" },
};

export function BrandLogo({ size = "md", className = "" }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const src = isDark ? "/logo-dark.png" : "/logo-ligh.png";
  const dim = sizes[size];

  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center no-underline hover:!no-underline ${className}`}
      aria-label="RJ Tech — Inicio"
    >
      <Image
        src={src}
        alt="RJ Tech"
        width={dim.width}
        height={dim.height}
        className={`${dim.className} rounded-full object-cover`}
        priority
      />
    </Link>
  );
}
