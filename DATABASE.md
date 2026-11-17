# Database and Prisma Infrastructure

T013 configured local PostgreSQL 18 and Prisma 7 as **infrastructure only** and
created no domain tables. On 8 November 2026 the owner-approved T013A and T052
scopes added the supplier/catalogue, order/payment/return, and admin schema
through additive, data-preserving migrations. T013A real supplier and product
records remain blocked on owner-supplied data; the schema and workflows do not
invent any records.

## Local topology (verified 6 November 2026)

| Item | Verified value |
| --- | --- |
| PostgreSQL server | 18.6, Windows service `postgresql-x64-18` (Running, Automatic) |
| Host / port | `localhost:5432` |
| Database | `js_jewellers` |
| Database owner | `js_jewellers_app` |
| Application role | `js_jewellers_app` (`rolsuper=f`, `rolcreatedb=f`, `rolcanlogin=t`) |
| Schema | `public` |
| Domain tables | Supplier, agreement, product/image, order/payment/return, customer/address/shipping, admin role/user/session/audit, content/navigation/media/SEO, product customization, courier/destination |
| Prisma migrations | 6 applied (`20261106000000_infrastructure_baseline`, `20261108000000_supplier_catalogue_orders`, `20261108010000_admin_panel`, `20261109000000_product_customization`, `20261110000000_courier_integrations`, `20261111000000_courier_contact_details`) |
| Seed data | 6 admin roles; approved business/shipping/payment defaults; 4 homepage placeholder sections; 8 navigation links; 3 `DRAFT` content-page stubs. No admin user, supplier, product, order, payment, return, or customer record |

`pg_isready -h localhost -p 5432` returns `localhost:5432 - accepting
connections`. Authenticated `psql` verification confirms `current_user =
js_jewellers_app`, `current_database = js_jewellers`, and server version `18.6`.

The PostgreSQL client tools (`psql.exe`, `pg_isready.exe`, etc.) live under
`C:\Program Files\PostgreSQL\18\bin` and are not on `PATH`.

## Secret handling

- `DATABASE_URL` is stored only in `.env.local`.
- `.env.local` is ignored by Git (`.gitignore`: `.env*`) and is not tracked.
- `.env.example` contains placeholder values only and is the only tracked file
  with a `DATABASE_URL` template.
- Never print, log, commit, or paste the real connection string. Its structure
  is `postgresql://<user>:<password>@<host>:<port>/<database>` with query
  parameters.

## Installed packages

Exact versions pinned in `package.json`:

| Package | Version | Role |
| --- | --- | --- |
| `prisma` | 7.10.1 | CLI (dev dependency) |
| `@prisma/client` | 7.10.1 | Generated client |
| `@prisma/adapter-pg` | 7.10.1 | Node `pg` driver adapter |
| `pg` | 8.23.1 | PostgreSQL driver |

The generated client is written to `generated/prisma/`, which is ignored by Git
and regenerated with `npm run prisma:generate`.

## Prisma configuration

`prisma.config.ts` (Prisma 7 API) loads `.env.local` with Node's built-in
`loadEnvFile` before defining the config, so the CLI resolves `DATABASE_URL`
without a `dotenv` dependency. It sets:

- `schema`: `prisma/schema.prisma`
- `migrations.path`: `prisma/migrations`
- `datasource.url`: `process.env.DATABASE_URL ?? ""`

`prisma/schema.prisma` declares the generator (`prisma-client`, output
`../generated/prisma`) and a `postgresql` datasource. It contains the domain
models and enums for suppliers, agreements, products/images/inventory,
orders/items/payment/status events, returns, customers/addresses/shipping,
business/payment settings, content/navigation/media/SEO, and admin
roles/users/sessions/audit logs.

## Migration workflow

Use the scripts in `package.json`:

| Command | Purpose |
| --- | --- |
| `npm run prisma:validate` | Validate the schema |
| `npm run prisma:generate` | Regenerate the client |
| `npm run prisma:status` | Show applied/pending migrations |
| `npm run prisma:deploy` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run prisma:migrate` | Create/apply a dev migration (`prisma migrate dev`) |

### Baseline

`prisma/migrations/20261106000000_infrastructure_baseline/migration.sql`
contains no DDL. It initialises the Prisma migration workflow for
`js_jewellers` and records itself in `_prisma_migrations` only. It was applied
with `npx prisma migrate deploy` (exit 0); `npm run prisma:status` then reports
`Database schema is up to date!` (exit 0).

### Domain migrations applied on 8 November 2026

`20261108000000_supplier_catalogue_orders` adds the supplier, agreement,
product/image, inventory, order/item, payment/status event, return, customer,
address, shipping, business/payment settings, content, navigation, media, and
SEO structures. `20261108010000_admin_panel` adds the admin role/user/session,
audit, and related extensions. Both are additive and were applied with
`npx prisma migrate deploy`; `npm run prisma:status` now reports
`Database schema is up to date!`.

Key integrity rules include unique order number, unique idempotency key,
unique payment/order event history rows, unique supplier agreement versions,
and server-enforced status transitions recorded in append-only event tables.
The admin migration seeds the six approved role rows plus safe defaults that
mirror already-approved content: business/shipping/payment settings, homepage
placeholder sections, navigation links, and three `DRAFT` policy-page stubs.
The policy stubs stay `DRAFT` and `noindex`, so the public site keeps using the
approved static policy pages until an administrator publishes reviewed content.
It does not create an administrator account, default password, supplier,
product, stock value, order, or customer.

### Later additive migrations (9–11 November 2026)

`20261109000000_product_customization` (T015/T016) adds product customization
configuration, persisted customization snapshots, and the production-status
workflow. `20261110000000_courier_integrations` (T057) adds the courier
registry — the `Courier` and `CourierDestination` tables, five courier enums,
per-order courier columns (`courierCode`, `courierName`,
`courierTrackingNumber`, `courierFulfilmentStatus`), and their indexes.
`20261111000000_courier_contact_details` (T060) adds the optional
owner-entered `Courier.contactDetails` column for the generic,
provider-independent courier registry. All are additive only: no existing
column, row, or historical migration is modified, and none seeds data.

The courier migrations deliberately seed nothing and default jewellery
acceptance to `NOT_ACCEPTED`, because many courier companies restrict or
prohibit jewellery under their standard terms. Courier rows are created only
by an authorised administrator through the admin shipping page, and adding a
courier company is never treated as proof of approval. All three migrations
were applied with the documented `npm run prisma:deploy`; `npm run
prisma:status` reports `Database schema is up to date!`.

### Adding schema later

Further domain schema belongs to the task that owns the approved data
(T013A/T014 and later approved tasks). When that work is approved:

1. Add models to `prisma/schema.prisma`.
2. Create a migration and review the generated SQL.
3. Apply it with `npm run prisma:deploy`.
4. Verify with `npm run prisma:status` and a read-only query.

### Shadow-database caveat

`npm run prisma:migrate` (`prisma migrate dev`) creates a temporary shadow
database to detect schema drift. The `js_jewellers_app` role has
`rolcreatedb=f`, so `migrate dev` will fail on its default shadow database.

Do **not** grant extra privileges without owner approval. For now, use
`prisma migrate deploy` for applying reviewed migrations. If `migrate dev` is
needed later, the owner must approve either a dedicated shadow database or a
role with `CREATEDB`.

## Scope restrictions

- The schema may hold supplier, product, order, payment, return, courier, and admin data, but no supplier, product, stock, order, payment, return, courier, or admin-user record has been invented or loaded.
- No invented settlement, delivery-cost, or order-transmission rules are encoded as real data.
- Do not reset, drop, or overwrite the database or role.
- Do not deploy or commit the connection string.
- Real supplier onboarding requires owner-supplied identities, agreements, SKUs, costs, stock, and image rights.
