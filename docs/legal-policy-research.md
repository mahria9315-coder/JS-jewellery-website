# Legal and Policy Research — Privacy, Returns, and Payments

**Prepared:** 6 November 2026  
**Updated:** 8 November 2026 (checkout, order, manual-payment, and refund workflows implemented; formal legal review still pending)  
**Scope:** Business details, the `/privacy`, `/returns`, and `/shipping` policy pages, and the server-only payment configuration boundary for JS Jewellers / JS Jewellery.  
**Status:** Commercial terms implemented and technically verified; formal legal review and final legal-wording approval remain outstanding. This document is not legal advice.

## 1. Actual sales destinations and why the scope is limited

- `spec.md` states the intended market is **Pakistan**.
- The application now has a cart route, a checkout route, an order record, and an order lookup page. Checkout accepts **Pakistan only**; there is no delivery-country selector and no delivery serviceability configuration for any other country.
- A return-policy configuration now exists (`lib/returns-policy.ts`), but it does not enable delivery. **Pakistan is the only configured return destination**; every other destination deliberately shows that its return terms require confirmation. No country outside Pakistan has been approved or researched for delivery.
- The business is based in **Karachi, Sindh**, so Sindh is the relevant provincial jurisdiction for the policy research.
- Other provinces of Pakistan have their own consumer protection frameworks. They were **not individually researched** for this draft. The pages therefore state that mandatory rights under other applicable laws are not limited, rather than claiming province-by-province or worldwide compliance.

## 2. Sources reviewed

| Instrument | Official source used | Relevant provisions | How it affects the draft | Confidence and limits |
| --- | --- | --- | --- | --- |
| **Sindh Consumer Protection Act 2014** (Sindh Act No. XVII of 2015), as amended | Sindh Judicial Academy updated compilation: <https://sja.gos.pk/assets/Updated_Laws/Sindh%20Consumer%20Protection%20Act%2C%202014.pdf>; original Sindh Laws PDF: <https://sindhlaws.gov.pk/setup/publications_SindhCode/PUB-15-000096.pdf> | s.20: a seller's return and refund policy must be disclosed clearly to the buyer before the transaction is completed, at the point of purchase. s.12: product liability cannot be limited or excluded by a contract term or notice. s.29: written pre-claim notice; trader reply within 15 days; claim generally within 30 days; Consumer Court may extend within statutory limits. s.32: Consumer Court may order repair, replacement, refund, compensation, costs, recall, and other remedies. | The returns page discloses the policy before purchase, states that statutory rights cannot be excluded, keeps the client-approved 3-day change-of-mind window and 25% deduction separate from mandatory remedies, and summarises the complaint route. | High confidence in the extracted text. The page summary is general and does not reproduce every procedural detail. |
| **Sindh Consumer Protection (Amendment) Act 2023** (Sindh Act No. XXIX of 2023) | Provincial Assembly of Sindh: <https://www.pas.gov.pk/uploads/acts/Sindh%20Act%20No.XXIX%20of%202023.pdf> | Amends s.2 definitions (adds Consumer Court and claim definitions), s.30 (settlement "at any stage of trial"; Consumer Court instead of Consumer Council), and s.34 (appeal to District and Sessions Court instead of Sindh High Court). | The draft uses the amended framework. These amendments do **not** change ss.12, 20, 29, or 32. | High confidence; the PDF was downloaded and the amending sections extracted. |
| **Sale of Goods Act 1930** (federal Act No. III of 1930) | Punjab Code official compilation: <https://punjabcode.punjab.gov.pk/uploads/articles/sale_of_goods_act-_1930-pdf.pdf>; Pakistan Code listing: <https://www.pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-a5aU-sg-jjjjjjjjjjjjj> | s.16-A: seller must inform the buyer of a defect in the goods sold, except where the defect is obviously known to the buyer. s.17: implied conditions as to quality or fitness, including merchantable quality and reasonable fitness for a disclosed purpose. s.44: a buyer who validly rejects goods is not bound to return them unless otherwise agreed, but must intimate rejection. s.60: remedy for breach of warranty (price reduction or damages). | The returns page refers generally to goods matching their description, merchantable quality, fitness for purpose, and the duty to disclose known defects. It does not reproduce the full conditions or remedies. | The Act is federal, but the Pakistan Code site was unreachable during research. The Punjab Code compilation is an official provincial compilation of the same federal Act. Section numbering follows that compilation; some sources describe the quality/fitness provision as s.16 because s.16-A was inserted later. |
| **Electronic Transactions Ordinance 2002** | Pakistan Code / Ministry of Law sources; secondary practitioner summaries reviewed | Recognises electronic records, signatures, and contracts; does not create a general returns, refund, or cooling-off right. | Not relied on for any return or refund promise. Mentioned only in this research note as context for online contracting. | Limited review. No specific consumer return/refund mandate was identified. |
| **National e-Commerce Policy 2019** and **draft e-Commerce Policy 2.0 (2025–30)** | Ministry of Commerce (`commerce.gov.pk`); the policy PDFs were blocked by Cloudflare during this research | Policy documents, not binding statutes. The 2019 framework addressed consumer protection at a high level. The draft 2.0 proposes enforceable return/refund and platform-liability rules, but it is a draft. | Not cited as law and not used to create enforceable commitments. | Treated as policy context only. No claim that a draft policy is in force. |
| **Data protection framework** | Chambers Data Protection & Privacy 2026 (Pakistan), DLA Piper Data Protection Laws of the World, ICLG Pakistan 2026, DataGuidance | As of 6 November 2026, no comprehensive general data protection statute was identified as being in force. The Personal Data Protection Bill remains pending. PECA 2016 and the PECA Amendment 2025 address certain cybercrime and unauthorised-data offences. | The privacy page describes actual and intended practices without claiming compliance with a specific data protection statute. It avoids promising a statutory response deadline or a statutory right that is not yet in force. | Secondary practitioner sources, not the Bill text. The legislative position can change; re-check before launch. |

## 3. Jurisdiction findings

### 3.1 Change-of-mind returns

No general statutory "cooling-off" right for online purchases was identified in the Sindh Act or the Sale of Goods Act. The client-approved **3-day Pakistan change-of-mind return period** is therefore a **voluntary commercial term**, not a statement of statutory entitlement. The page states that it applies only where the law permits it and does not shorten any longer statutory period.

For an eligible change-of-mind return in Pakistan, the approved term deducts **25%** from the customer's paid amount and refunds **75%**. The page shows a worked example (PKR 10,000 → PKR 2,500 deduction → PKR 7,500 refund) and states explicitly that the deduction never applies to defective, faulty, damaged, incorrect, or otherwise legally protected returns. Pre-purchase disclosure and legal review remain required before the term can be relied on at checkout.

### 3.2 Faulty, damaged, or incorrect goods

Mandatory protections exist for defective products, misdescription, and failure to conform to the contract. The draft:

- distinguishes faulty/damaged/incorrect items from change-of-mind returns;
- states that the 25% change-of-mind deduction does not apply to these returns;
- states that statutory rights cannot be excluded;
- commits to a remedy required by law (repair, replacement, refund, compensation, or other);
- states that JS Jewellery covers return shipping where the law requires it;
- keeps JS Jewellery as the customer's point of contact instead of requiring direct supplier negotiation.

### 3.3 Refund method and timing

No fixed statutory refund method or refund deadline for ordinary retail refunds was identified in the reviewed provisions. The draft therefore:

- applies the approved **75% refund** after the 25% deduction for eligible Pakistan change-of-mind returns;
- uses an approved **Bank Transfer** or **Easypaisa** refund where lawful and operationally available;
- follows the original payment method where the law requires it;
- refuses to substitute store credit for a legally due monetary refund without agreement;
- states that the specific refund timeline is **pending owner approval** and that any legal deadline will be met.

This avoids inventing a deadline that the owner has not approved.

### 3.4 Return shipping costs

No general statutory allocation for change-of-mind return shipping was identified. The draft states that the customer may bear change-of-mind return shipping **only where lawful and disclosed before purchase**. For faulty, damaged, or incorrect items, JS Jewellery covers return shipping **where required by law**.

### 3.5 Jewellery-specific exceptions

No statutory list of jewellery exceptions was identified. The draft treats personalised/customised items, hygiene-sensitive pierced earrings, and items damaged after delivery as possible **change-of-mind** exclusions only. It expressly states that these exclusions do not apply to faulty, damaged, or incorrect items and will be applied only where lawful.

### 3.6 Pre-purchase disclosure

Sindh Act s.20 requires the seller's return and refund policy to be disclosed clearly before the transaction is completed at the point of purchase. Checkout now requires explicit acceptance of the return and refund policy before an order is completed, and records the policy version on the order. Formal legal review of the wording remains outstanding.

## 4. Destination and compliance position

- **Researched and intended:** Pakistan, with Sindh as the relevant provincial jurisdiction.
- **Researched:** Sindh consumer law and the federal Sale of Goods Act 1930.
- **Configured return destination:** Pakistan only (`lib/returns-policy.ts`).
- **Not individually researched:** Punjab, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Gilgit-Baltistan, and Azad Jammu and Kashmir.
- **Not approved:** every country outside Pakistan.
- **No delivery destination outside Pakistan was enabled.** Checkout accepts Pakistan only; no delivery-country selector or other-country serviceability configuration was added.
- **International position:** the client has approved that international returns follow the applicable rules of the customer's country, with a 25% deduction only where that country's law permits it and it is disclosed before purchase. No such country has been researched or configured, so every unconfigured destination displays “return terms require confirmation.” The site does not claim worldwide compliance or guaranteed worldwide returns.
- **Delivery estimate:** the client-approved 4–7 day estimate applies to all intended destinations. It is presented as an estimate only, without invented courier, tracking, charge, customs, or guaranteed-date details.

The pages therefore say that the business currently intends to serve customers in Pakistan only and that no other country has been approved for delivery. They do not claim worldwide compliance.

## 5. What the policy pages now implement

### Privacy

- Confirmed identity: brand **JS Jewellers**; legal/business name **JS Jewellery**; location **Karachi, Sindh, Pakistan**.
- Confirmed contact: email **mahria9315@gmail.com** as a clickable `mailto:` link, and WhatsApp **+92 333 9422818**, linked to `https://wa.me/923339422818` with `target="_blank"` and `rel="noopener noreferrer"`.
- Data categories, purposes, supplier/courier/payment sharing, retention, security, cookies/local storage, requests, children's privacy, updates, and contact.
- Payment section states that Bank Transfer (Islamic Bank) and Easypaisa are approved, that both remain unavailable until their server-only account values are configured, that account details are server-only and never public, and that selecting a method or submitting an order does not mean payment has been received or verified.
- Honest statements about the current site: checkout accepts Pakistan only, no analytics/advertising cookies, theme preference stored in local storage.
- No supplier identity, cost, agreement, or margin disclosure.

### Returns

- Confirmed business details and contact channels.
- Order pages now offer an online return request, and refunds are calculated server-side: 25% only for eligible Pakistan change-of-mind returns, and the full amount for protected cases.
- Statutory rights under the Sindh Consumer Protection Act 2014 and Sale of Goods Act 1930, with links to official texts.
- Client-approved Pakistan **3-day** change-of-mind window, **25% deduction**, and **75% refund**, with a worked PKR 10,000 example.
- Explicit safeguard that the deduction never applies to defective, faulty, damaged, incorrect, or legally protected returns, and that statutory remedies remain separate.
- Country-aware international section backed by `lib/returns-policy.ts`; Pakistan is the only configured destination and all others show “return terms require confirmation.”
- Condition requirements, change-of-mind exclusions, faulty/damaged/incorrect remedies, request process, return-shipping responsibility, refunds, exchanges, supplier-fulfilled orders, complaints, and Consumer Court summary.
- Client-approved **4–7 day** delivery estimate, presented as an estimate only.
- No invented return address, refund deadline, courier, tracking, charge, customs arrangement, or legal-approval claim.

### Shipping and delivery

- New `/shipping` page publishing the client-approved **4–7 day** estimate for intended destinations.
- States that Pakistan is the intended market and no destination outside Pakistan is enabled.
- Does not invent courier names, tracking, charges, customs arrangements, or guaranteed dates.
- Checkout and order records now exist. The estimate is stored on each order as an estimate, not a guaranteed delivery date. Delivery charges and courier/tracking arrangements remain unconfigured and PENDING.

### Payments

- `lib/payments/config.ts` is the server-only configuration boundary for Bank Transfer (Islamic Bank) and Easypaisa.
- `.env.example` contains placeholder names only; no account number, account-holder name, or other value is committed.
- No payment account detail is rendered on any public page or client bundle.
- Checkout, order creation, customer payment submission, and admin-only verification/rejection now exist. Instructions are rendered only after a configured method is selected, and no payment is ever marked verified automatically.
- Both methods remain unavailable because their server-only account values are missing. No payment has been received or verified.

## 6. Open decisions and blockers

The following remain **pending owner approval, legal review, or a secure data supply**:

- final approval of the policy wording and completion of formal legal review;
- the exact Bank Transfer account number, Easypaisa number, and confirmed account-holder names, supplied through a secure server-only channel;
- specific data-retention periods;
- security arrangements and incident-response process;
- any future cookies, analytics, advertising, or third-party services;
- the approved refund timeline;
- the return address and supplier return workflow;
- final confirmation of the jewellery condition/exclusion list;
- removal of `noindex` after approval;
- legal research and configuration for any province or country outside the researched Pakistan/Sindh scope;
- confirmation of delivery charges, courier, tracking, and customs arrangements before publication.

The checkout-stage policy, return, payment, and delivery disclosures are implemented and record the policy version. This does not replace formal legal review or final owner approval.

## 7. Source-access notes and uncertainty

- `pakistancode.gov.pk` was unreachable from this environment on 6 November 2026. The official Punjab Code compilation was used for the Sale of Goods Act 1930 text.
- `commerce.gov.pk` policy PDFs were blocked by Cloudflare. The e-Commerce Policy documents were treated as non-binding context and were not relied on for enforceable commitments.
- The Sindh Act text was extracted from the official Sindh Laws PDF and cross-checked against the Sindh Judicial Academy updated compilation and the 2023 amendment.
- The data protection position was checked against multiple 2026 practitioner summaries; the Personal Data Protection Bill is not treated as enacted law.
- This research is a drafting input, **not legal advice**. A qualified Pakistani lawyer should review the final policy before launch and before any new destination is enabled.
