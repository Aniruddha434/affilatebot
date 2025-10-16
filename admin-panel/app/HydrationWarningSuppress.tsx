'use client';

import { useEffect } from 'react';

/**
 * Suppresses hydration warnings in development mode
 * These warnings are typically caused by browser extensions
 * (e.g., Bitwarden adding bis_skin_checked attributes)
 */
export default function HydrationWarningSuppress() {
  useEffect(() => {
    // Suppress hydration warnings in both development and production
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration') ||
         args[0].includes('hydration') ||
         args[0].includes('bis_skin_checked') ||
         args[0].includes('did not match') ||
         args[0].includes('server rendered HTML') ||
         args[0].includes('client properties'))
      ) {
        return;
      }
      originalError.call(console, ...args);
    };

    console.warn = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration') ||
         args[0].includes('hydration') ||
         args[0].includes('bis_skin_checked'))
      ) {
        return;
      }
      originalWarn.call(console, ...args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}

