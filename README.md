This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## REST API

The API uses the MariaDB schema in `database/schema.sql`. Create the `kolegahub_db`
database, import that schema, copy `.env.example` to `.env.local`, and set the
database credentials and a random `JWT_SECRET` of at least 32 characters. Install
dependencies with `npm install`, then start the app with `npm run dev`.

Protected endpoints require `Authorization: Bearer <token>`. Register or log in
to receive a token. Passwords are stored as bcrypt hashes; user-list endpoints
never return password hashes.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Log in (`email`, `password`) |
| `GET` | `/api/me` | Token | Get the authenticated user's profile and balances |
| `GET` | `/api/users` | Public | List public user details, rating summaries, and visible titles |
| `GET` | `/api/users/:id` | Public | Get a public rating summary and owned titles |
| `GET` | `/api/reviews?reviewee_id=:id` | Public | List reviews; optional `reviewee_id` and `reviewer_id` filters |
| `POST` | `/api/reviews` | Token | Submit a review and appreciation IDs |
| `GET` | `/api/appreciations` | Public | List appreciation choices |
| `GET` | `/api/titles` | Public | List available titles |
| `GET` | `/api/milestones` | Public | List milestone requirements and rewards |
| `POST` | `/api/milestones/:id/claim` | Token | Claim an assigned, eligible milestone |
| `GET` | `/api/shop-items` | Public | List active shop items |
| `GET` | `/api/redemptions` | Token | List the authenticated user's redemptions |
| `POST` | `/api/redemptions` | Token | Redeem an item (`item_id`) |

Review creation awards 250 karma and the configured feedback EXP (default 10).
`REVIEW_COOLDOWN_HOURS` controls the per-reviewer/per-reviewee cooldown
(default 0, disabled). Redemptions and milestone claims update balances in
database transactions; their user ID is taken from the token, not the request.
The review form stores the JWT from login or registration in `localStorage` under the `token` key.
The overall rating is saved to each of the four review score fields.
The API currently has no admin role or endpoints for managing shop inventory,
milestones, or titles.

Errors use JSON in the form `{ "error": "..." }`. Successful collection
responses use a resource key such as `{ "users": [...] }`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
