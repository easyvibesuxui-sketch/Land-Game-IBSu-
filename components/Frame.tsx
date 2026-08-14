/**
 * A fixed hairline frame with corner ticks — the one piece of chrome that never
 * moves. It gives the page a held edge instead of content running to the
 * browser's, which is most of what separates an instrument from a poster.
 *
 * Drawn with `difference` blending so a single element works over both the
 * near-black sections and the pale one: against black it lightens, against
 * white it darkens, and it never has to be told which it is sitting on.
 *
 * Server component — nothing here is stateful.
 */
export default function Frame() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70]"
      style={{ mixBlendMode: "difference" }}
    >
      <div className="absolute inset-2.5 border border-white/[0.14] md:inset-4" />

      {/* Corner ticks, sitting proud of the frame's own corners. */}
      {(
        [
          ["top-0 left-0", "border-l border-t"],
          ["top-0 right-0", "border-r border-t"],
          ["bottom-0 left-0", "border-l border-b"],
          ["bottom-0 right-0", "border-r border-b"],
        ] as const
      ).map(([place, edges]) => (
        <span
          key={place}
          className={`absolute ${place} h-5 w-5 ${edges} border-white/45 md:h-7 md:w-7`}
          style={{ margin: "0.375rem" }}
        />
      ))}
    </div>
  );
}
