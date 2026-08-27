"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Archivos (misma convención que logo-dark / logo-light):
 * - favicon-dark.png  → R plateada (legible en pestaña oscura / Incógnito)
 * - favicon-light.png → R oscura (legible en pestaña clara)
 */
const FOR_DARK_UI = "/favicon-dark.png";
const FOR_LIGHT_UI = "/favicon-light.png";

export function ThemeFavicon() {
  const { theme } = useTheme();

  useEffect(() => {
    // Solo el toggle explícito "light" usa la R oscura.
    // system / dark / sin tema → plateada (Incógnito y Chrome oscuro).
    const href = theme === "light" ? FOR_LIGHT_UI : FOR_DARK_UI;

    const apply = (rel: string, id: string) => {
      let link = document.head.querySelector<HTMLLinkElement>(
        `link[data-rj-favicon="${id}"]`,
      );
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        link.type = "image/png";
        link.setAttribute("data-rj-favicon", id);
        document.head.appendChild(link);
      }
      const absolute = new URL(href, window.location.origin).href;
      if (link.href !== absolute) link.href = href;
    };

    apply("icon", "icon");
    apply("shortcut icon", "shortcut");

    document.head
      .querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"]:not([data-rj-favicon]), link[rel="shortcut icon"]:not([data-rj-favicon])',
      )
      .forEach((el) => el.remove());
  }, [theme]);

  return null;
}
