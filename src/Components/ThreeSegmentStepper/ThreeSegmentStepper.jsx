import React from "react";

/**
 * Three steps: connectors only between circles; each label sits centered under its circle.
 * Uses a 5-column grid (circle | line | circle | line | circle) so labels align with icons.
 *
 * @param {number} activeStep 0–2
 * @param {'hire'|'employee'} [variant='hire']
 * @param {Array<{ key?: string, icon: React.ReactNode, label: React.ReactNode, onClick?: () => void, circleClassName: string, buttonProps?: object }>} steps exactly three items
 */
export default function ThreeSegmentStepper({
  activeStep,
  variant = "hire",
  steps,
}) {
  if (!Array.isArray(steps) || steps.length !== 3) {
    console.warn("ThreeSegmentStepper expects exactly 3 steps");
    return null;
  }

  const filled =
    variant === "employee" ? "bg-bgBlue" : "bg-[#3DA5F4]";
  const empty = "bg-gray-200";

  const labelClass =
    variant === "employee"
      ? "text-[#474747] text-[13px] font-Urbanist font-medium leading-snug text-center whitespace-normal px-1"
      : "text-[#818a90] text-[13px] leading-snug text-center px-1";

  const circlePad = "shadow-[0_0_0_3px_#fff]";

  return (
    <div className="w-full min-w-0">
      <div
        className="grid w-full min-w-0 gap-y-3"
        style={{
          gridTemplateColumns: "auto minmax(0, 1fr) auto minmax(0, 1fr) auto",
          gridTemplateRows: "auto auto",
        }}
      >
        {/* Row 1: circles and connectors */}
        {steps.map((step, index) => (
          <React.Fragment key={step.key ?? index}>
            <div
              className="flex justify-center"
              style={{ gridColumn: index * 2 + 1, gridRow: 1 }}
            >
              <button
                type="button"
                onClick={step.onClick}
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8bc9f8] focus-visible:ring-offset-2 ${circlePad} ${step.circleClassName ?? ""}`}
                {...(step.buttonProps ?? {})}
              >
                {step.icon}
              </button>
            </div>
            {index < steps.length - 1 ? (
              <div
                role="presentation"
                className="flex min-h-[40px] min-w-0 items-center px-0.5"
                style={{ gridColumn: index * 2 + 2, gridRow: 1 }}
              >
                <div
                  className={`h-0.5 min-h-[2px] w-full rounded-full ${activeStep >= index + 1 ? filled : empty}`}
                />
              </div>
            ) : null}
          </React.Fragment>
        ))}

        {/* Row 2: labels under each circle (same columns 1, 3, 5) */}
        {steps.map((step, index) => (
          <span
            key={`${step.key ?? index}-label`}
            className={labelClass}
            style={{ gridColumn: index * 2 + 1, gridRow: 2 }}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
