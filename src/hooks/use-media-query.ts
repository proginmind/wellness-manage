"use client";

import { useEffect, useState } from "react";

/**
 * Returns whether the given media query matches. Defaults to false during SSR
 * and on first paint to avoid hydration mismatch, then updates after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
