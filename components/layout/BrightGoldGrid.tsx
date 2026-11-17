/**
 * Homepage-only Bright Gold Geometric Grid.
 *
 * A deep premium black base carries thin champagne-gold grid lines with a
 * lower-opacity secondary grid for depth. The artwork is built from CSS
 * gradients only, is static, is clipped to the viewport, and is inert for
 * pointer and assistive-technology users.
 */
export function BrightGoldGrid() {
  return (
    <div
      className="site-background site-background--home-grid"
      data-background="bright-gold-geometric-grid"
      aria-hidden="true"
    />
  );
}
