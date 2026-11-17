import { getPublicBusinessContact } from "@/lib/public-settings";

/**
 * Confirmed business and contact details for the policy pages. Values come from
 * the admin business settings when saved, otherwise from the owner-confirmed
 * fallbacks in `lib/site.ts`. No address, registration number, or other
 * unconfirmed detail is invented.
 */
export async function PolicyContact() {
  const contact = await getPublicBusinessContact();

  return (
    <div className="space-y-3">
      <p>
        <strong className="font-semibold text-accent">Brand:</strong>{" "}
        {contact.storeName}
      </p>
      <p>
        <strong className="font-semibold text-accent">
          Legal/business name:
        </strong>{" "}
        {contact.legalName}
      </p>
      <p>
        <strong className="font-semibold text-accent">Location:</strong>{" "}
        {contact.location}
      </p>
      {contact.openingHours ? (
        <p>
          <strong className="font-semibold text-accent">
            Opening hours:
          </strong>{" "}
          {contact.openingHours}
        </p>
      ) : null}
      <p>
        <strong className="font-semibold text-accent">WhatsApp:</strong>{" "}
        <a
          href={contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
        >
          {contact.whatsappDisplay}
          <span className="sr-only"> (opens WhatsApp in a new tab)</span>
        </a>
      </p>
      <p>
        <strong className="font-semibold text-accent">Email:</strong>{" "}
        <a
          href={contact.emailUrl}
          className="inline-flex min-h-11 items-center break-all font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus"
        >
          {contact.email}
          <span className="sr-only"> (opens your email app)</span>
        </a>
      </p>
    </div>
  );
}
