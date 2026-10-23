# DevTinder API

Express + MongoDB backend for the DevTinder project.

## Run locally

```bash
npm install
cp src/.env.example src/.env   # then fill in the values
npm run dev                    # http://localhost:3000
```

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with nodemon |
| `npm start` | Start normally |
| `npm run seed` | Create demo users / requests (demo@devtinder.dev / Demo@1234) |

## Environment variables (`src/.env`)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/devTinder
JWT_SECRET=<random 64-char string>
CLIENT_ORIGINS=http://localhost:5173,https://dev-tinder.site
```

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**MongoDB passwords must be URL-encoded.** `@` becomes `%40`, `#` becomes
`%23`, and so on. This was one of the reasons the server could not connect.

## Routes

All routes are available both at `/` and at `/api`:

- `POST /signup`, `POST /login`, `POST /logout`, `DELETE /deleteuser`
- `GET /profile/view`, `PATCH /profile/edit`, `PATCH /profile/updatePassword`
- `POST /request/send/:status/:toUserId`
- `POST /request/review/:status/:requestId`
- `GET /user/request`, `GET /user/connections`, `GET /user/feed`
- `GET /` (health), `GET /api/health`

Auth accepts either the `token` cookie or `Authorization: Bearer <jwt>`.
The bearer option keeps login working when the frontend is on a different
domain (e.g. Vercel) and the browser blocks third-party cookies.

## Deploying

Set `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production` and `CLIENT_ORIGINS`
on your host. `CLIENT_ORIGINS` must contain the exact frontend URL(s), for
example `https://dev-tinder.site,https://dev-tinder-master.vercel.app`. Vercel
preview URLs that start with `dev-tinder` / `devtinder` are allowed
automatically.

## About the old credentials

The original `src/config/database.js` had a hard-coded MongoDB password and
an unencoded `@`. That file is fixed, but the password still exists in the
repository history — rotate the database user's password in MongoDB Atlas.
