import Link from "next/link";

import {
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/ui/FormPrimitives";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/cart/calculations";
import {
  MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH,
  MAX_CUSTOMIZATION_TEXT_LENGTH,
  type CustomizationConfig,
} from "@/lib/customization/config";
import { addToCartAction } from "@/lib/actions/cart";

/**
 * Server-rendered add-to-cart form. The server action re-checks availability,
 * price, and stock before the item is written to the cart, so the browser
 * values here are only a convenience.
 */
export function AddToCartForm({
  productId,
  returnTo,
  maxQuantity,
  customization,
}: {
  productId: string;
  returnTo: string;
  maxQuantity: number;
  customization?: CustomizationConfig;
}) {
  const upperBound = Math.max(
    1,
    Math.min(maxQuantity, MAX_QUANTITY_PER_ITEM),
  );

  return (
    <form
      action={addToCartAction}
      className="mt-4 flex flex-wrap items-end gap-3"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      {customization?.enabled ? (
        <fieldset className="w-full space-y-3 border-t border-gold/20 pt-4">
          <legend className="font-nav text-sm font-semibold not-italic text-white">
            Customization
          </legend>
          <p className="text-xs text-champagne/70">
            Optional. Leave every customization field blank to order this item
            without customization.
          </p>

          <div>
            <label
              htmlFor={`customization-text-${productId}`}
              className="block text-xs font-semibold uppercase tracking-[0.16em] text-champagne/70"
            >
              Name or text (maximum {MAX_CUSTOMIZATION_TEXT_LENGTH}{" "}
              characters)
            </label>
            <input
              id={`customization-text-${productId}`}
              name="customizationText"
              maxLength={MAX_CUSTOMIZATION_TEXT_LENGTH}
              className={`${inputClass} mt-1`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`customization-font-${productId}`}
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-champagne/70"
              >
                Font
              </label>
              <select
                id={`customization-font-${productId}`}
                name="customizationFont"
                defaultValue=""
                className={`${inputClass} mt-1`}
              >
                <option value="">No customization</option>
                {customization.fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`customization-colour-${productId}`}
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-champagne/70"
              >
                Colour
              </label>
              <select
                id={`customization-colour-${productId}`}
                name="customizationColour"
                defaultValue=""
                className={`${inputClass} mt-1`}
              >
                <option value="">No customization</option>
                {customization.colours.map((colour) => (
                  <option key={colour} value={colour}>
                    {colour}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor={`customization-instructions-${productId}`}
              className="block text-xs font-semibold uppercase tracking-[0.16em] text-champagne/70"
            >
              Additional instructions (optional)
            </label>
            <textarea
              id={`customization-instructions-${productId}`}
              name="customizationInstructions"
              rows={2}
              maxLength={MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH}
              className={`${inputClass} mt-1`}
            />
          </div>
        </fieldset>
      ) : null}

      <div>
        <label
          htmlFor={`add-quantity-${productId}`}
          className="block text-xs font-semibold uppercase tracking-[0.16em] text-champagne/70"
        >
          Quantity
        </label>
        <input
          id={`add-quantity-${productId}`}
          name="quantity"
          type="number"
          min={1}
          max={upperBound}
          defaultValue={1}
          className={`${inputClass} mt-1 w-24`}
        />
      </div>

      <button type="submit" className={buttonPrimary}>
        Add to cart
      </button>
      <Link href="/cart" className={buttonSecondary}>
        View cart
      </Link>
    </form>
  );
}
