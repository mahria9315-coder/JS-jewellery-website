type CustomizationDisplay = {
  text: string;
  font: string;
  colour: string;
  instructions: string | null;
};

/**
 * Customer-safe display of a saved or cart customization. Supplier identity,
 * costs, margins, and internal notes are never part of this value.
 */
export function CustomizationSummary({
  customization,
  className = "",
}: {
  customization: CustomizationDisplay | null | undefined;
  className?: string;
}) {
  if (!customization) {
    return null;
  }

  return (
    <div
      className={`mt-2 rounded-brand border border-gold/15 px-3 py-2 text-xs text-champagne/70 ${className}`}
    >
      <p className="font-semibold text-champagne">Customization</p>
      <dl className="mt-1 space-y-0.5">
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">Text</dt>
          <dd className="text-white">{customization.text}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">Font</dt>
          <dd className="text-white">{customization.font}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">Colour</dt>
          <dd className="text-white">{customization.colour}</dd>
        </div>
        {customization.instructions ? (
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold">Instructions</dt>
            <dd className="whitespace-pre-line text-white">
              {customization.instructions}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
