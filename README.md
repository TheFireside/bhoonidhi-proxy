# Bhoonidhi Proxy API

This project provides a drop-in replacement for the [Bhoonidhi Satellite Data API](https://bhoonidhi.nrsc.gov.in), simulating its endpoints, headers, and payload formats. It uses mock or alternate satellite data sources internally, allowing your frontend/client code to work even if Bhoonidhi is down.

## Features

- Replicates Bhoonidhi API endpoints and payloads
- Mock authentication and token management
- Mock STAC collections and search
- Mock download endpoint with access control
- Modular Express.js codebase, ready for serverless deployment (AWS Lambda)
- **Shared `requireAuth` middleware** for all protected routes
- **Standardized response codes and error messages** matching Bhoonidhi API

## Endpoints

### POST /auth/token

- Accepts: `{ userId, password, grant_type: 'password' | 'refresh_token', refresh_token? }`
- Returns: `{ access_token, refresh_token, expires_in }`

### POST /auth/logout

- Header: `Authorization: Bearer <refresh_token>`
- Invalidates the refresh token

### GET /data/collections

- Header: `Authorization: Bearer <access_token>`
- Returns: `{ collections: [ ... ] }`

### POST /data/search

- Header: `Authorization: Bearer <access_token>`
- Accepts: STAC-style search query
- Returns: `FeatureCollection` (mock)

### GET /download?id=<id>&collection=<collection>

- Header: `Authorization: Bearer <access_token>`
- Returns: `{ download_url }` (mock)

## Error Codes

| Code | Description           | Scenario                                    |
| ---- | --------------------- | ------------------------------------------- |
| 200  | Success               | Request processed successfully              |
| 400  | Bad Request           | Incorrect keys or missing input             |
| 401  | Unauthorized          | Invalid credentials or tokens               |
| 403  | Forbidden             | Max sessions active (not simulated in mock) |
| 500  | Internal Server Error | Server-side error                           |

## Development

### Local

```bash
npm install
npm run dev
# Server runs on http://localhost:3000
```

### Build & Run (Node)

```bash
npm run build
npm start
```

### Serverless (AWS Lambda)

- Deploy `dist/lambdaHandler.js` as your Lambda entrypoint

## Project Structure

- `src/routes/` — Route handlers for each API group
- `src/utils/` — Token management and shared middleware
- `src/app.ts` — Express app setup and middleware
- `src/lambdaHandler.ts` — Serverless handler and local server entry

---

MIT License
