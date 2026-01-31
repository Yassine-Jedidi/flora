'use client';

import { useEffect } from 'react';

/**
 * Mobile Debug Console
 * Loads Eruda debug console on mobile devices for easier debugging
 * Only loads in development mode
 */
export function MobileDebug() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Only load on mobile devices
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                import('eruda').then((eruda) => {
                    eruda.default.init();
                    console.log('📱 Eruda mobile debug console initialized');
                });
            }
        }
    }, []);

    return null;
}
