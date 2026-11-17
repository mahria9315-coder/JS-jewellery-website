/**
 * Non-homepage decorative geometric grid.
 *
 * A quiet black-and-gold grid sits over the approved theme gradient. It is
 * built from CSS gradients only, is clipped to the viewport, never captures
 * pointer events, and uses no animation.
 */
export function GeometricGrid() {
  return (
    <div
      className="site-background site-background--grid"
      data-background="geometric-grid"
      aria-hidden="true"
    />
  );
}
