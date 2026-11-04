# J's Jewellery — Marketing Integration Requirements

**Status:** T035 documentation completed 4 November 2026. No marketing integration is live.
**Scope:** Meta Pixel, Meta advertising, Google Analytics, Instagram, and search-engine tools.
**Sources:** `spec.md` §15–§16, `AGENTS.md` §6, §9, and §11, `plan.md` §5.1.

This document records what each integration requires before it may be enabled. It does not add
scripts, SDKs, cookies, tracking IDs, credentials, network calls, or paid services. No integration
may be described as working until it has been configured with owner-provided credentials, tested,
and approved.

## 1. Status definitions

| Status | Meaning |
|---|---|
| **WORKING** | Configured with owner-approved credentials, tested, and verified in the deployed environment. |
| **PENDING** | Requirements are documented, but an owner decision or configuration step is outstanding. |
| **BLOCKED** | The integration cannot proceed until a missing credential, approval, or dependency is resolved. |

Only one of these labels may be used. An unconfigured integration must not be labelled WORKING.

## 2. Current status at a glance

| Integration | Status | Missing before it can proceed |
|---|---|---|
| Meta Pixel | **BLOCKED** | Owner-provided Pixel/dataset ID, approved event scope, consent mechanism, and approved privacy wording. |
| Meta advertising | **BLOCKED** | Approved ad account, campaign budget, audience, and owner authorisation. Not required for the MVP. |
| Google Analytics (GA4) | **BLOCKED** | Owner-provided GA4 measurement ID, consent approach, data-retention settings, and approved privacy wording. |
| Instagram | **BLOCKED** | Approved account handle, confirmed content/image rights, and a decision between a profile link, official post embeds, or an API-fed feed. |
| Search-engine tools | **PENDING** | Approved domain and hosting, plus owner authorisation to verify Google Search Console or Bing Webmaster Tools. |

**No integration is currently WORKING.** At the time of writing:

- No tracking script or tag manager is loaded by the application.
- No analytics or advertising package is installed.
- No Pixel ID, measurement ID, Instagram token, or advertising credential exists.
- No cookie or consent banner exists, because there is no non-essential tracking to gate yet.
- No customer data is sent to any third party.

## 3. Meta Pixel

### Purpose

Measure approved storefront events so the owner can evaluate advertising performance. The Pixel is
not required for the MVP to function.

### Requirements before implementation

1. **Ownership and identifier:** the owner supplies the Meta Business Portfolio and the correct
   Pixel/dataset ID. The store must not create an ID on the owner's behalf.
2. **Event scope:** agree an allowlist before any code is added. A reasonable initial scope is
   `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, and `Purchase`. `Purchase` must only
   fire for a genuinely created order and must not imply payment success for Cash on Delivery.
3. **Consent:** the Pixel must not load or fire before the consent mechanism permits it. The
   consent decision and the privacy notice must be approved first.
4. **Data minimisation:** do not send names, mobile numbers, delivery addresses, order notes,
   customization text, supplier identity, supplier cost, margin, or payment details. Do not send
   hashed personal data unless the owner has approved that use after privacy review.
5. **Configuration:** the ID must be supplied through environment configuration, not committed to
   source. A proposed public variable name is `NEXT_PUBLIC_META_PIXEL_ID`; it is not configured.
6. **Verification:** test with Meta Events Manager test events in a non-production environment
   before enabling the tag for customers.

### Current status

**BLOCKED.** The owner has not provided an ID, approved event scope, consent mechanism, or privacy
wording. No Pixel code or dependency exists.

## 4. Google Analytics

### Purpose

Measure aggregate site usage and catalogue interest. GA4 is not required for the MVP to function.

### Requirements before implementation

1. **Property ownership:** the owner supplies the GA4 property and measurement ID. The store must
   not create analytics properties on the owner's behalf.
2. **Consent:** analytics storage must be denied by default where consent is required, and only
   enabled after a recorded consent choice. The consent approach must be approved before launch.
3. **Event scope:** use a documented, minimal event set. Do not enable automatic collection of
   form contents or other personal data without review.
4. **Data minimisation:** exclude names, mobile numbers, addresses, order notes, customization
   text, supplier data, and payment references. Search terms and URLs must be reviewed so that
   customer-entered text is not transmitted.
5. **Retention and sharing:** the owner must approve data-retention settings and any Google
   product-sharing settings.
6. **Configuration:** the measurement ID must be supplied through environment configuration. A
   proposed public variable name is `NEXT_PUBLIC_GA_MEASUREMENT_ID`; it is not configured.
7. **Verification:** confirm events in GA4 DebugView and confirm that no personal data appears in
   collected parameters before enabling the tag for customers.

### Current status

**BLOCKED.** No GA4 measurement ID, consent decision, retention setting, or privacy wording exists.
No analytics code or dependency exists.

## 5. Instagram

### Purpose

Connect the storefront to the owner's Instagram presence, for example by linking to the profile,
embedding approved posts, or displaying an approved feed.

### Options and requirements

| Option | Requirements | Trade-offs |
|---|---|---|
| Profile link | Owner-provided handle and confirmation that the account is the official store account. | Simplest and lowest risk; no third-party script. |
| Official post embeds | Handle, specific approved post URLs, and permission to display the content. | Adds a third-party embed and may affect performance and privacy. |
| API-fed feed | Meta app, approved API access, access token, token-refresh plan, and server-side secret storage. | Highest complexity and access dependency; not justified for the MVP without owner approval. |

Additional requirements for every option:

- Confirm the owner owns or has permission to use every image and caption shown.
- Do not scrape Instagram or copy content without permission.
- Provide a plain link fallback so the section remains usable if an embed fails.
- Keep alt text meaningful and do not let an embed break keyboard navigation or contrast.
- Do not load Instagram scripts before the consent decision covers them.

### Current status

**BLOCKED.** No official handle, content permission, image rights, or integration approach has been
approved. No embed, API token, or third-party script exists.

## 6. Credentials and configuration

No credential values exist in this repository. Never commit a real credential, paste one into chat,
or add one to `.env.example`.

| Credential or setting | Provided by | Storage expectation | Status |
|---|---|---|---|
| Meta Pixel/dataset ID | Owner / Meta Business Portfolio | Public client identifier in environment configuration | NOT PROVIDED |
| Meta app ID and secret (only if Instagram API is approved) | Owner / Meta developer account | Secret server-side environment variable | NOT PROVIDED |
| Instagram access token (only if API-fed feed is approved) | Owner / Meta app | Secret server-side environment variable with refresh plan | NOT PROVIDED |
| Instagram handle | Owner | Public configuration | NOT PROVIDED |
| GA4 measurement ID | Owner / Google Analytics | Public client identifier in environment configuration | NOT PROVIDED |
| Consent configuration and privacy wording | Owner with appropriate review | Application configuration and policy content | NOT APPROVED |
| Search Console / Webmaster verification | Owner | DNS record, HTML file, or meta tag after domain approval | NOT PROVIDED |

## 7. Consent and privacy behaviour

The following applies to every non-essential integration:

- Do not load analytics, advertising, or social embeds before the required consent is recorded.
- Do not use pre-ticked consent, implied consent, or a rejecting option that is harder to use than
  accepting.
- Allow consent to be withdrawn as easily as it is given.
- Document what is collected, why, which provider receives it, and how long it is retained.
- Do not send personal data to analytics or advertising services.
- Do not claim legal compliance. The applicable requirements for Pakistan and for any jurisdiction
  serving customers must be confirmed by the owner with appropriate advice before launch.
- The privacy policy must disclose approved integrations. Its wording is still PENDING, so no
  integration can be activated yet.

## 8. Activation gate

An integration may move to **WORKING** only when all of the following are true:

- [ ] The owner approves the service, its purpose, and the data it receives.
- [ ] The owner supplies a valid credential through a secure channel, not through source control.
- [ ] The consent mechanism and privacy wording are approved.
- [ ] The implementation has been reviewed for data minimisation and no personal data is sent.
- [ ] The integration has been tested in a non-production environment and the result recorded.
- [ ] The status in this document and in `tasks.md` is updated honestly.

Until then, the integration remains PENDING or BLOCKED. T035 does not authorise implementation.

## 9. Out of scope for T035

- WhatsApp contact is a communication link, not a marketing tracker. It depends on the owner
  supplying and approving a business number, which remains PENDING.
- Search-engine optimisation metadata, sitemap, robots rules, and structured data belong to
  T032–T034 and remain dependent on the approved domain and real product data.
- No advertising campaign, audience, budget, or creative is created by this task.
