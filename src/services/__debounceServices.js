import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * Returns a debounced function (stable identity) that always invokes the latest `callback`.
 * @param {(...args: any[]) => any} callback
 * @param {number} delay - ms to wait after the last call before running
 */
export const useDebounce = (callback, delay) => {
    const timer = useRef(null);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    return useCallback((...args) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        return new Promise((resolve) => {
            timer.current = setTimeout(async () => {
                const result = await callbackRef.current(...args);
                resolve(result);
            }, delay);
        });
    }, [delay]);
};

/**
 * Debounces a value (e.g. controlled input string). Updates `delay` ms after `value` stops changing.
 */
export function useDebouncedValue(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}
