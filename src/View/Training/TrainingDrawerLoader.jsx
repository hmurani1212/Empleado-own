import React from 'react'

/**
 * Centered spinner for Training module side drawer content (initial load or blocking states).
 */
export function TrainingDrawerSpinner({
  label = 'Loading…',
  className = '',
  size = 'md',
}) {
  const ring =
    size === 'lg'
      ? 'h-12 w-12 border-[3px]'
      : 'h-10 w-10 border-2'
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${ring} border-bgBlue border-t-transparent rounded-full animate-spin shrink-0`}
      />
      {label ? (
        <p className="text-sm text-gray-600 font-poppins text-center px-4">{label}</p>
      ) : null}
    </div>
  )
}

/**
 * Full-panel overlay with spinner — parent must have `position: relative`.
 */
export function TrainingDrawerOverlay({ show, label = 'Please wait…' }) {
  if (!show) return null
  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <TrainingDrawerSpinner label={label} size="lg" className="py-12" />
    </div>
  )
}
