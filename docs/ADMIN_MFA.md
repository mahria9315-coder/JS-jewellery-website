# JS Jewellers — Administrator Multi-Factor Authentication

**Prepared:** 12 November 2026
**Audience:** The website owner, the Super Admin, and the deployment operator.
**Status:** Implemented and verified locally (`tests/mfa.test.mjs`, 13 tests).
The production secret and the first enrolled authenticator are **owner
actions** and do not exist yet.

This document describes how administrator MFA works, how to configure it, what
the owner must do, and what is still missing before launch.

---

## 1. What MFA adds

Before T064, an administrator account was protected by a password plus a
database-backed session. A stolen password was enough to sign in. T064 adds a
second factor:

- **TOTP authenticator app** (Google Authenticator, Microsoft Authenticator,
  1Password, Aegis, etc.) using a standard 30-second, six-digit code.
- **Ten single-use recovery codes**, shown once, for when the authenticator
  device is lost.

A password alone never creates an administrator session while an authenticator
is enrolled. The sign-in flow becomes:

1. Email + password.
2. If an authenticator is enrolled, a signed five-minute challenge cookie is
   issued and the browser is sent to `/admin/mfa/verify`.
3. The user enters a six-digit TOTP code or a recovery code.
4. Only after successful verification is a database session created.

If the account has **no** enrolled authenticator and MFA is enforced, the user
is restricted to `/admin/mfa` until enrolment is complete.

---

## 2. Policy

| Environment | Behaviour |
| --- | --- |
| Production (`NODE_ENV=production`) | MFA is **always enforced**. There is no environment switch that removes it. |
| Development / test | MFA is opt-in with `ADMIN_MFA_REQUIRED=true`. Without it, the existing password-only flow is used and the MFA pages remain available for manual testing. |

The production rule is implemented in `lib/admin/mfa-policy.ts` and covered by
tests. A missing or invalid `ADMIN_MFA_ENCRYPTION_KEY` in production also makes
the MFA flow fail closed: enrolment cannot start, and any enrolled account is
still required to present a second factor.

---

## 3. Required server configuration

| Variable | Requirement | Purpose |
| --- | --- | --- |
| `ADMIN_MFA_ENCRYPTION_KEY` | **Required in production** | 32 raw bytes (base64, base64url, or 64 hex characters) used to encrypt TOTP secrets at rest with AES-256-GCM. |
| `ADMIN_MFA_CHALLENGE_SECRET` | Optional | Signing secret for the five-minute challenge cookie. When unset, `CHECKOUT_DRAFT_SECRET` is used. Set it to give MFA challenge signing its own rotation path. |
| `ADMIN_MFA_REQUIRED` | Development only | `true` enables the full MFA flow locally. Production ignores it and always enforces MFA. Do not set it in production. |

Generate a key on the server (never paste it into chat, a ticket, or a
screenshot):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

`npm run env:check` validates the key's shape without printing it.
`node scripts/check-production-env.mjs --self-test` includes missing-key and
short-key cases.

> **Key custody.** Losing the key makes every enrolled authenticator
> unreadable. Rotating the key without re-enrolling every administrator has the
> same effect. Store it in the hosting provider's secret manager with the same
> care as the database password. This is an owner responsibility.

---

## 4. How enrolment works

1. Sign in as an administrator.
2. Open `/admin/mfa`.
3. Select **Start authenticator setup**. The server generates a 20-byte secret,
   encrypts it, and stores a **pending** credential. Nothing is usable yet.
4. Add the account to the authenticator app using the displayed setup key or
   setup URI.
5. Enter the current six-digit code. On success the credential is marked
   confirmed and ten recovery codes are generated.
6. **Save the recovery codes immediately.** They are shown once via a short
   HTTP-only cookie (`js_admin_mfa_recovery_display`, five minutes) and are then
   removed. Only scrypt hashes are stored in the database.

The pending secret is re-displayed only while the credential is unconfirmed. It
is replaced if setup is started again.

### Recovery-code format

- Ten codes per generation.
- Each code is two groups of five characters from an unambiguous alphabet
  (no `I`, `O`, `0`, `1`), for example `ABCDE-FGHJK`.
- Lookup is case- and separator-insensitive.
- Each code is consumed on first successful use.
- Regenerating recovery codes invalidates every previous code.

---

## 5. Signing in with MFA

- **Authenticator code:** enter the current six-digit code. A code from the
  previous or next 30-second step is accepted (clock-skew window of ±1 step).
  A code can be used only once; the stored time-step counter prevents replay.
- **Recovery code:** enter one unused recovery code. It is marked used
  immediately. The account shows how many unused codes remain on `/admin/mfa`.
- When codes run low, regenerate the set from `/admin/mfa` after confirming a
  current authenticator code or recovery code.

Rate limits apply to enrolment, confirmation, regeneration, and verification
(see `docs/RATE_LIMITING.md`). Failed attempts return a generic message and do
not reveal whether the account exists or has an authenticator.

---

## 6. Lost device or lost recovery sheet

The affected administrator cannot self-recover without a second factor. A
**Super Admin** must reset their MFA:

1. Open **Admin → Users**, then the affected user.
2. Use **Reset multi-factor authentication**.
3. The reset deletes the authenticator credential and all recovery codes and is
   written to the audit log.
4. The affected user signs in with their password and is sent to
   `/admin/mfa` to enrol a new authenticator.

The Super Admin cannot reset their own MFA through this control; use the
break-glass bootstrap path if the only Super Admin loses both factors. The
bootstrap script resets the named account and is documented in the README.

---

## 7. Data model and storage

Two additive tables were added by migration
`20261112000000_admin_mfa`:

| Table | Holds |
| --- | --- |
| `AdminMfaCredential` | One row per enrolled administrator: encrypted TOTP secret (`v1.iv.tag.ciphertext`, AES-256-GCM), `confirmedAt`, and `lastUsedCounter`. |
| `AdminMfaRecoveryCode` | Salted scrypt hashes of recovery codes, one row per code, with `usedAt`. |

- The plaintext TOTP secret exists only in memory inside `lib/admin/mfa.ts`.
- Secrets, recovery codes, setup URIs, and signing keys are never logged and are
  covered by the log-redaction tests.
- Deleting an administrator cascades to their MFA rows (schema relation).

The migration is additive and was applied locally with `npm run prisma:deploy`
(seven migrations total at the time of writing).

---

## 8. Owner checklist before launch

- [ ] Generate `ADMIN_MFA_ENCRYPTION_KEY` and store it in the hosting secret
      manager. Confirm `npm run env:check` reports it valid.
- [ ] Optionally generate a separate `ADMIN_MFA_CHALLENGE_SECRET`.
- [ ] Create the first Super Admin through `/admin/setup`.
- [ ] Enrol an authenticator on the Super Admin account before inviting staff.
- [ ] Store the Super Admin recovery codes offline, in a safe the owner
      controls. Do not keep them in email, chat, or the repository.
- [ ] Enable MFA on every staff account at creation time.
- [ ] Record who holds the encryption key and who can run break-glass recovery.
- [ ] Keep a tested backup/restore plan for the database; MFA rows are part of
      the database backup.

Until these are done, production administrator MFA remains **not configured**
and the verdict stays **NOT READY (NO-GO)**.

---

## 9. What is not covered

- WebAuthn / passkeys, hardware security keys, or SMS as a second factor.
- Per-role MFA policy overrides (MFA is all-or-nothing per environment).
- Device trust / "remember this device" cookies.
- Automated alerting when an administrator's MFA is reset or disabled; the audit
  log records the event, but no external alert is sent.
- Recovery of the encryption key itself. Key backup is an owner/operator
  responsibility outside the application.

These are deliberate scope boundaries, not claims that the feature exists.

---

## 10. Verification

| Check | Result |
| --- | --- |
| `tests/mfa.test.mjs` | 13 tests: key parsing, AES-GCM round-trip and tamper rejection, recovery-code hashing and rejection, TOTP validation, replay counter advancement, policy, challenge-token signing/expiry. |
| `npm run typecheck` / `npm run lint` | Pass |
| `npm run env:check -- --self-test` | Missing and short MFA key cases fail closed |
| `npm audit --omit=dev` | Clean; `otpauth@9.6.0` is MIT-licensed |

No real authenticator secret, recovery code, encryption key, or production
account was created for testing. Test values are deterministic and non-secret.
