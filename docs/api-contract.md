# API Contract

This document defines the API contract for the Cricket Match Simulation backend.

Postman assets:

- Collection: `docs/postman/Cricket-API.postman_collection.json`
- Environment: `docs/postman/Cricket-API.postman_environment.json`

## Base Rules

- All endpoints are REST-style and return JSON only.
- Request bodies must be `application/json` for all body-based endpoints.
- Standard success and error envelopes are used everywhere.
- Backend business logic is consumed through APIs, independent of frontend implementation.
- APIs must work for non-browser clients (React Native/Postman/cURL) without cookie dependency.

## Standard Response Envelope

Success:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Request failed",
  "data": {
    "code": "ERROR_CODE_OR_DETAIL"
  }
}
```

## Authentication Contract

Protected endpoints accept Bearer token in `Authorization` header.

Browser NextAuth session cookies are supported as backward-compatible fallback for web UI only.

Header format for token auth:

```http
Authorization: Bearer <token>
```

Token validation is handled through NextAuth JWT utilities.

Header parsing uses:

```js
const authorization = req.headers.get("authorization");
```

## Content-Type Contract

For endpoints that accept a body (`POST` in this project):

- Required: `Content-Type: application/json`
- Missing or non-JSON content type returns `415`.
- Invalid JSON body returns `400`.

## Public Endpoints

### `POST /api/auth/register`

Description: Register a credentials user.

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Success `201` data:

```json
null
```

React Native call:

```js
await fetch(`${baseUrl}/api/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // optional for this endpoint
  },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    password: "secret123",
  }),
});
```

### `POST /api/auth/login`

Description: Credentials login endpoint for API clients (Postman/mobile).

Request body:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Success `200` data:

```json
{
  "token": "<nextauth-compatible-jwt>",
  "tokenType": "Bearer",
  "expiresIn": 2592000,
  "user": {
    "id": "userObjectId",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

React Native call:

```js
const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // optional for this endpoint
  },
  body: JSON.stringify({
    email: "jane@example.com",
    password: "secret123",
  }),
});

const loginJson = await loginRes.json();
const bearerToken = loginJson?.data?.token;
```

### `GET /api/auth/[...nextauth]` and `POST /api/auth/[...nextauth]`

Description: NextAuth protocol endpoint for browser/OAuth flows.

Note:

- This route is internal to NextAuth protocol behavior and is not normalized as a regular business API.
- React Native clients should use `POST /api/auth/login` for bearer token auth.

React Native usage (web OAuth handoff example):

```js
import * as Linking from "expo-linking";

await Linking.openURL(`${baseUrl}/api/auth/signin/google`);
```

### `GET /api/teams`

Description: Fetch all teams.

Request body: none.

Success `200` data:

```json
[
  {
    "_id": "teamId",
    "name": "India",
    "country": "India",
    "players": ["Rohit", "Gill"]
  }
]
```

React Native call:

```js
await fetch(`${baseUrl}/api/teams`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`, // optional for this endpoint
  },
});
```

### `POST /api/teams`

Description: Create a new team (admin-only).

Request body:

```json
{
  "name": "New Team",
  "country": "Country",
  "players": ["Player 1", "Player 2"]
}
```

Success `201` data:

```json
{
  "_id": "teamId",
  "name": "New Team",
  "country": "Country",
  "players": ["Player 1", "Player 2"]
}
```

**Authentication:** Requires Bearer token with admin role.

React Native call:

```js
await fetch(`${baseUrl}/api/teams`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    name: "New Team",
    country: "Country",
    players: ["Player 1", "Player 2"],
  }),
});
```

### `POST /api/admin/seed-teams`

Description: Seed predefined teams (admin-only, development utility).

Request body: none.

Success `200` or `201` data:

```json
{
  "count": 6,
  "teams": [
    {
      "name": "India",
      "country": "India",
      "players": 11
    }
  ]
}
```

**Authentication:** Requires Bearer token with admin role.

React Native call:

```js
await fetch(`${baseUrl}/api/admin/seed-teams`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
```

## Protected Endpoints

### `POST /api/match/create`

Description: Create a match.

Request body:

```json
{
  "teamA": "India",
  "teamB": "Australia",
  "overs": 5
}
```

Success `201` data:

```json
{
  "matchId": "matchObjectId"
}
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/create`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    teamA: "India",
    teamB: "Australia",
    overs: 5,
  }),
});
```

### `GET /api/match/history`

Description: Fetch authenticated user match history.

Request body: none.

Success `200` data:

```json
[
  {
    "_id": "matchId",
    "teamA": "India",
    "teamB": "Australia",
    "status": "IN_PROGRESS"
  }
]
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/history`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### `GET /api/match/:id`

Description: Fetch one match by ID (ownership enforced).

Request body: none.

Success `200` data:

```json
{
  "_id": "matchId",
  "teamA": "India",
  "teamB": "Australia",
  "status": "IN_PROGRESS",
  "innings": []
}
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/${matchId}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### `POST /api/match/toss`

Description: Complete toss and initialize first innings.

Request body:

```json
{
  "matchId": "matchObjectId",
  "decision": "bat",
  "tossWinner": "teamA"
}
```

Success `200` data:

```json
{
  "tossWinner": "teamA",
  "tossWinnerName": "India",
  "decision": "bat",
  "match": {}
}
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/toss`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    matchId,
    tossWinner: "teamA",
    decision: "bat",
  }),
});
```

### `POST /api/match/play-ball`

Description: Simulate one ball in current innings.

Request body:

```json
{
  "matchId": "matchObjectId"
}
```

Success `200` data:

```json
{
  "match": {}
}
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/play-ball`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ matchId }),
});
```

### `POST /api/match/pause`

Description: Pause an in-progress match.

Request body:

```json
{
  "matchId": "matchObjectId"
}
```

Success `200` data:

```json
{
  "matchId": "matchObjectId"
}
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/pause`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ matchId }),
});
```

### `POST /api/match/resume`

Description: Resume a paused match.

Request body:

```json
{
  "matchId": "matchObjectId"
}
```

Success `200` data:

```json
{
  "matchId": "matchObjectId"
}
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/resume`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ matchId }),
});
```

### `POST /api/match/:id/start-innings`

Description: Start second innings after first innings completion.

Request body: none.

Success `200` data:

```json
{
  "match": {}
}
```

React Native call:

```js
await fetch(`${baseUrl}/api/match/${matchId}/start-innings`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Common Error Codes

- `400` bad request or invalid JSON body
- `401` missing/invalid auth
- `403` forbidden (ownership mismatch)
- `404` resource not found
- `415` unsupported media type (non-JSON body)
- `500` internal server error

## Mobile Client Notes

- React Native Expo can call the same endpoints using Bearer token auth.
- No server component coupling is required for API consumption.
- Use `message` for user-facing status text.
- Treat `data` as the business payload for both success and failures (`data.code` on errors).
