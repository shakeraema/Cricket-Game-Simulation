# Cricket Match API - Complete Contract

## Overview
This is a **pure REST API** with no server-side session dependency. All authentication uses JWT Bearer tokens, making it compatible with:
- ✅ Postman
- ✅ cURL
- ✅ React Native
- ✅ Web browsers
- ✅ Any HTTP client

## Authentication

### Getting a Token
All protected endpoints require an `Authorization: Bearer <token>` header.

**To get a token:**
1. Call `POST /api/auth/login` with credentials
2. Store the returned `token` value
3. Include `Authorization: Bearer {token}` in all subsequent API calls

---

## API Endpoints

### 1. Authentication

#### POST `/api/auth/register`
Register a new user with credentials.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": null
}
```

**Usage Examples:**

cURL:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

React Native:
```javascript
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

#### POST `/api/auth/login`
Login with email and password, receive JWT bearer token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 2592000,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Usage Examples:**

cURL:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePassword123"}'
```

React Native:
```javascript
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePassword123'
  })
});
const { data: { token } } = await loginResponse.json();
// Store token in AsyncStorage or state management
```

---

#### POST `/api/auth/logout`
Logout the current user (stateless - just client-side token deletion).

**Request:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Usage Examples:**

cURL:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

React Native:
```javascript
await fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
// Delete token from local storage
```

---

### 2. Teams

#### GET `/api/teams`
Get all available cricket teams (public endpoint).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Teams fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "India",
      "country": "India",
      "players": ["Rohit", "Kohli", "Iyer", "Pant", ...]
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Pakistan",
      "country": "Pakistan",
      "players": ["Babar", "Fakhar", "Imam", ...]
    }
  ]
}
```

**Usage Examples:**

cURL:
```bash
curl -X GET http://localhost:3000/api/teams
```

React Native:
```javascript
const response = await fetch('http://localhost:3000/api/teams');
const { data: teams } = await response.json();
```

---

#### POST `/api/teams`
Create a new team (admin-only).

**Request:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

```json
{
  "name": "New Zealand",
  "country": "New Zealand",
  "players": ["Connor", "Tom", "James", "Kyle", "Tim"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "New Zealand",
    "country": "New Zealand",
    "players": ["Connor", "Tom", "James", "Kyle", "Tim"]
  }
}
```

**Usage Examples:**

cURL:
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Zealand",
    "country": "New Zealand",
    "players": ["Connor", "Tom", "James", "Kyle", "Tim"]
  }'
```

---

### 3. Matches

#### POST `/api/match/create`
Create a new cricket match.

**Request:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "teamA": "India",
  "teamB": "Pakistan",
  "overs": 5
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Match created successfully",
  "data": {
    "matchId": "507f1f77bcf86cd799439020"
  }
}
```

**Usage Examples:**

cURL:
```bash
curl -X POST http://localhost:3000/api/match/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamA": "India",
    "teamB": "Pakistan",
    "overs": 5
  }'
```

React Native:
```javascript
const response = await fetch('http://localhost:3000/api/match/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    teamA: 'India',
    teamB: 'Pakistan',
    overs: 5
  })
});
const { data: { matchId } } = await response.json();
```

---

#### GET `/api/match/[id]`
Get details of a specific match.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Match fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "createdBy": "507f1f77bcf86cd799439011",
    "teamA": "India",
    "teamB": "Pakistan",
    "oversLimit": 5,
    "status": "CREATED",
    "toss": null,
    "innings": [],
    "currentInnings": 0,
    "createdAt": "2026-03-24T10:00:00Z"
  }
}
```

**Usage Examples:**

cURL:
```bash
curl -X GET http://localhost:3000/api/match/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### GET `/api/match/history`
Get all matches created by the current user.

**Request:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Match history fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "teamA": "India",
      "teamB": "Pakistan",
      "status": "COMPLETED",
      "createdAt": "2026-03-24T10:00:00Z"
    }
  ]
}
```

**Usage Examples:**

cURL:
```bash
curl -X GET http://localhost:3000/api/match/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

React Native:
```javascript
const response = await fetch('http://localhost:3000/api/match/history', {
  headers: { 'Authorization': 'Bearer ' + token }
});
const { data: matches } = await response.json();
```

---

#### POST `/api/match/toss`
Complete the toss and decide batting order.

**Request:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "matchId": "507f1f77bcf86cd799439020",
  "tossWinner": "teamA",
  "decision": "bat"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Toss completed",
  "data": {
    "tossWinner": "teamA",
    "tossWinnerName": "India",
    "decision": "bat",
    "match": { ...match data... }
  }
}
```

**Usage Examples:**

cURL:
```bash
curl -X POST http://localhost:3000/api/match/toss \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "507f1f77bcf86cd799439020",
    "tossWinner": "teamA",
    "decision": "bat"
  }'
```

---

#### POST `/api/match/play-ball`
Play the next ball in the match.

**Request:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "matchId": "507f1f77bcf86cd799439020"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ball played successfully",
  "data": {
    "match": { ...updated match data... }
  }
}
```

**Usage Examples:**

cURL:
```bash
curl -X POST http://localhost:3000/api/match/play-ball \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"matchId": "507f1f77bcf86cd799439020"}'
```

---

#### POST `/api/match/pause`
Pause the current match.

**Request:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "matchId": "507f1f77bcf86cd799439020"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Match paused successfully",
  "data": {
    "matchId": "507f1f77bcf86cd799439020"
  }
}
```

---

#### POST `/api/match/resume`
Resume a paused match.

**Request:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "matchId": "507f1f77bcf86cd799439020"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Match resumed successfully",
  "data": {
    "matchId": "507f1f77bcf86cd799439020"
  }
}
```

---

## Error Responses

All errors follow this format:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid input",
  "data": { "code": "BAD_REQUEST" }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required. Use: Authorization: Bearer <token>",
  "data": { "code": "UNAUTHORIZED" }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Admin access required",
  "data": { "code": "FORBIDDEN" }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Match not found",
  "data": { "code": "NOT_FOUND" }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Login failed",
  "data": { "code": "LOGIN_ERROR" }
}
```

---

## Complete cURL Testing Workflow

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.data.token')

# 3. Get teams
curl -X GET http://localhost:3000/api/teams

# 4. Create match
MATCH_ID=$(curl -s -X POST http://localhost:3000/api/match/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"teamA":"India","teamB":"Pakistan","overs":3}' \
  | jq -r '.data.matchId')

# 5. Get match details
curl -X GET http://localhost:3000/api/match/$MATCH_ID \
  -H "Authorization: Bearer $TOKEN"

# 6. Complete toss
curl -X POST http://localhost:3000/api/match/toss \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"matchId\":\"$MATCH_ID\",\"tossWinner\":\"teamA\",\"decision\":\"bat\"}"

# 7. Play ball
curl -X POST http://localhost:3000/api/match/play-ball \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"matchId\":\"$MATCH_ID\"}"

# 8. Pause match
curl -X POST http://localhost:3000/api/match/pause \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"matchId\":\"$MATCH_ID\"}"

# 9. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## React Native Complete Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://your-api.example.com';

// Helper to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = await AsyncStorage.getItem('authToken');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
}

// Register
export async function register(name, email, password) {
  return apiRequest('/api/auth/register', 'POST', { name, email, password });
}

// Login
export async function login(email, password) {
  const result = await apiRequest('/api/auth/login', 'POST', { email, password });
  if (result.success && result.data.token) {
    await AsyncStorage.setItem('authToken', result.data.token);
  }
  return result;
}

// Get match history
export async function getMatchHistory() {
  return apiRequest('/api/match/history');
}

// Create match
export async function createMatch(teamA, teamB, overs) {
  return apiRequest('/api/match/create', 'POST', { teamA, teamB, overs });
}

// Play ball
export async function playBall(matchId) {
  return apiRequest('/api/match/play-ball', 'POST', { matchId });
}

// Logout
export async function logout() {
  await apiRequest('/api/auth/logout', 'POST');
  await AsyncStorage.removeItem('authToken');
}
```

---

## Key Design Principles

✅ **Stateless**: No server-side sessions. All auth is JWT Bearer tokens.  
✅ **Cross-platform**: Works with any HTTP client - browsers, mobile, CLI tools.  
✅ **RESTful**: Standard HTTP methods and status codes.  
✅ **Self-contained**: Complete request examples for every endpoint.  
✅ **Secure**: Bearer token in Authorization header, not URL parameters.  
✅ **Testable**: APIs can be tested with Postman, cURL, and React Native.
