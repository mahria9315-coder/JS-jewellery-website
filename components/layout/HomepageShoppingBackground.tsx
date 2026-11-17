/**
 * Homepage-only background layer.
 *
 * In the dark theme the layer renders as solid pure black (#000000) with no
 * image, gradient, or overlay — the owner-supplied shopping image is retired
 * for that theme. In the light theme CSS restores the exact existing
 * treatment: the image fixed to the viewport, centred, cropped with `cover`,
 * under a minimal ivory readability veil. The layer is decorative, inert,
 * static, and clipped so it cannot receive pointer events, shift layout, or
 * create horizontal overflow.
 */
export function HomepageShoppingBackground() {
  return (
    <div
      className="site-background site-background--home-image"
      data-background="homepage-shopping-image"
      aria-hidden="true"
    />
  );
}
