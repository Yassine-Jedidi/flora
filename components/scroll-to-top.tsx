"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useEffect } from "react";

// Isomorphic layout effect to avoid server-side warnings
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ScrollToTop() {
    const pathname = usePathname();

    useIsomorphicLayoutEffect(() => {
        // Immediate scroll to top without animation
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

        // Fallback for some browsers that might need a tick
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
        });
    }, [pathname]);

    return null;
}
