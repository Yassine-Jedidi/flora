/**
 * iOS Safari Compatibility Checker
 * 
 * This component runs in development mode to check for common iOS compatibility issues.
 * It logs warnings to the console when potential problems are detected.
 */

'use client';

import { useEffect } from 'react';

export function IOSCompatibilityChecker() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (!isIOS) return;

        console.log('%c🍎 iOS Device Detected - Running Compatibility Checks', 'background: #007AFF; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');

        // Check Safari version
        const match = navigator.userAgent.match(/Version\/(\d+)/);
        const safariVersion = match ? parseInt(match[1]) : null;

        if (safariVersion && safariVersion < 14) {
            console.warn('⚠️ Safari version < 14 detected. Some modern features may not work:');
            console.warn('  - Named capture groups in regex');
            console.warn('  - Some CSS properties');
            console.warn('  - Optional chaining may have issues');
        }

        // Check for common issues
        const checks = {
            localStorage: (() => {
                try {
                    localStorage.setItem('__test__', 'test');
                    localStorage.removeItem('__test__');
                    return true;
                } catch {
                    return false;
                }
            })(),

            touchEvents: 'ontouchstart' in window,

            passiveSupported: (() => {
                let passiveSupported = false;
                try {
                    const options = Object.defineProperty({}, 'passive', {
                        get() {
                            passiveSupported = true;
                            return false;
                        }
                    }) as AddEventListenerOptions;
                    const noop = () => { };
                    window.addEventListener('testPassive', noop, options);
                    window.removeEventListener('testPassive', noop, options);
                } catch {
                    passiveSupported = false;
                }
                return passiveSupported;
            })(),
        };

        console.log('✅ Compatibility Check Results:', {
            safariVersion,
            ...checks,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
            }
        });

        if (!checks.localStorage) {
            console.warn('⚠️ localStorage is not available (possibly in Private Browsing mode)');
        }

        // Monitor for regex errors
        const originalError = console.error;
        console.error = function (...args: unknown[]) {
            const message = args.map(arg => String(arg)).join(' ');
            if (message.includes('Invalid regular expression') || message.includes('group specifier')) {
                console.error('%c🚨 REGEX ERROR DETECTED - Check iOS_COMPATIBILITY.md for solutions', 'background: #FF3B30; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
            }
            originalError.apply(console, args);
        };

    }, []);

    return null;
}
