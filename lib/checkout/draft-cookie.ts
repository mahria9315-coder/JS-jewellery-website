/**
 * Cookie name shared by the checkout draft server action and the review page.
 *
 * Kept outside the `"use server"` action module because that directive only
 * permits async function exports.
 */
export const CHECKOUT_DRAFT_COOKIE = "js_checkout_draft";
