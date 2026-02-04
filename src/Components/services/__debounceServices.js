import { useRef } from 'react';

export const useDebounce = (callback, delay) => {
    const timer = useRef(null);

    return async (...args) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        return new Promise((resolve) => {
            timer.current = setTimeout(async () => {
                const result = await callback(...args);
                resolve(result);
            }, delay);
        });
    };
};
