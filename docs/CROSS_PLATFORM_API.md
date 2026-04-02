# Cricket API - Cross-Platform Documentation

## Overview

All APIs are fully cross-platform compatible and work with any HTTP client (Web, React Native, Mobile, CLI, etc.).

### Key Requirements

✅ **Response Format**: All APIs return `{ success, message, data }`  
✅ **Headers**: Use `Authorization: Bearer <token>` (no cookies required)  
✅ **Content-Type**: Set `Content-Type: application/json` for POST requests  
✅ **Platform Independent**: Uses standard Web APIs - works everywhere  

---

## API Base URL

```
http://localhost:3000/api   (Development)
https://api.example.com/api (Production)
```

---

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {
    "key": "value"
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error message",
  "data": {
    "code": "ERROR_CODE"
  }
}
```

### Status Codes
- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `415`: Unsupported Media Type
- `500`: Internal Server Error

---

## Authentication

### Step 1: Login to Get Bearer Token

#### API: `POST /api/auth/login`

**Request**
```json
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 2592000,
    "user": {
      "id": "user_id_123",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

#### React Native Example
```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token for future requests
      await AsyncStorage.setItem('authToken', data.data.token);
      console.log('Login successful:', data.data.user);
      return data.data;
    } else {
      console.error('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

#### Axios Example
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const loginResponse = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});

const token = loginResponse.data.data.token;
localStorage.setItem('authToken', token);
```

### Step 2: Use Bearer Token for All Requests

**Add this header to every API call:**
```
Authorization: Bearer <token>
```

---

## APIs

### 1. Authentication APIs

#### 📝 Register User
**POST /api/auth/register**

```javascript
// React Native
async function registerUser(name, email, password) {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return await response.json();
}

// Usage
const result = await registerUser('Jane Doe', 'jane@example.com', 'password123');
if (result.success) {
  console.log('Registration successful');
}
```

**Request**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": null
}
```

---

#### 🔑 Login User (Bearer Token)
**POST /api/auth/login**

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 2592000,
    "user": {
      "id": "user_id_123",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

```javascript
// React Native
async function loginUser(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    await AsyncStorage.setItem('authToken', data.data.token);
    return data.data;
  } else {
    throw new Error(data.message);
  }
}
```

---

### 2. Teams API

#### 📋 Get All Teams
**GET /api/teams**

No authentication required.

```javascript
// React Native
async function getTeams() {
  const response = await fetch('http://localhost:3000/api/teams', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data; // Array of teams
  }
}

// Usage
const teams = await getTeams();
console.log(teams); 
// [
//   { _id: "...", name: "India", country: "India", players: [...] },
//   { _id: "...", name: "Pakistan", country: "Pakistan", players: [...] }
// ]
```

**Response (200)**
```json
{
  "success": true,
  "message": "Teams fetched successfully",
  "data": [
    {
      "_id": "team_123",
      "name": "India",
      "country": "India",
      "players": ["Rohit", "Kohli", "Iyer", ...]
    },
    {
      "_id": "team_124",
      "name": "Pakistan",
      "country": "Pakistan",
      "players": ["Babar", "Shaheen", "Rizwan", ...]
    }
  ]
}
```

---

#### ➕ Create Team (Admin Only)
**POST /api/teams**

Requires: `Authorization: Bearer <admin_token>`

```javascript
// React Native
async function createTeam(token, name, country, players) {
  const response = await fetch('http://localhost:3000/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, country, players }),
  });
  
  return await response.json();
}

// Usage
const result = await createTeam(
  bearerToken,
  'New Team',
  'CountryName',
  ['Player1', 'Player2', 'Player3']
);
```

**Request**
```json
{
  "name": "New Team",
  "country": "CountryName",
  "players": ["Player1", "Player2", "Player3"]
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "_id": "team_125",
    "name": "New Team",
    "country": "CountryName",
    "players": ["Player1", "Player2", "Player3"]
  }
}
```

---

### 3. Match APIs

#### ➕ Create Match
**POST /api/match/create**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function createMatch(token, teamA, teamB, overs) {
  const response = await fetch('http://localhost:3000/api/match/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ teamA, teamB, overs }),
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data.matchId; // Get match ID
  } else {
    throw new Error(data.message);
  }
}

// Usage
const matchId = await createMatch(token, 'India', 'Pakistan', 50);
```

**Request**
```json
{
  "teamA": "India",
  "teamB": "Pakistan",
  "overs": 50
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Match created successfully",
  "data": {
    "matchId": "match_123"
  }
}
```

---

#### 📊 Get Match History
**GET /api/match/history**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function getMatchHistory(token) {
  const response = await fetch('http://localhost:3000/api/match/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data; // Array of matches
  }
}

// Usage
const matches = await getMatchHistory(token);
matches.forEach(match => {
  console.log(`${match.teamA} vs ${match.teamB}: ${match.status}`);
});
```

**Response (200)**
```json
{
  "success": true,
  "message": "Match history fetched successfully",
  "data": [
    {
      "_id": "match_123",
      "teamA": "India",
      "teamB": "Pakistan",
      "overs": 50,
      "status": "COMPLETED",
      "createdAt": "2026-03-24T10:00:00Z",
      "createdBy": "user_id_123"
    }
  ]
}
```

---

#### 📋 Get Match Details
**GET /api/match/[id]**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function getMatchDetails(token, matchId) {
  const response = await fetch(`http://localhost:3000/api/match/${matchId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

// Usage
const matchData = await getMatchDetails(token, 'match_123');
console.log(matchData.data);
```

**Response (200)**
```json
{
  "success": true,
  "message": "Match fetched successfully",
  "data": {
    "_id": "match_123",
    "teamA": "India",
    "teamB": "Pakistan",
    "overs": 50,
    "status": "IN_PROGRESS",
    "currentInnings": 1,
    "toss": {
      "winner": "India",
      "decision": "bat"
    }
  }
}
```

---

#### 🎲 Complete Toss
**POST /api/match/toss**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function completeToss(token, matchId, tossWinner, decision) {
  const response = await fetch('http://localhost:3000/api/match/toss', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      matchId,
      tossWinner, // "teamA" or "teamB"
      decision,   // "bat" or "bowl"
    }),
  });
  
  return await response.json();
}

// Usage
const result = await completeToss(token, 'match_123', 'teamA', 'bat');
```

**Request**
```json
{
  "matchId": "match_123",
  "tossWinner": "teamA",
  "decision": "bat"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Toss completed",
  "data": {
    "tossWinner": "teamA",
    "tossWinnerName": "India",
    "decision": "bat",
    "match": { ... }
  }
}
```

---

#### ▶️ Start Second Innings
**POST /api/match/[id]/start-innings**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function startSecondInnings(token, matchId) {
  const response = await fetch(
    `http://localhost:3000/api/match/${matchId}/start-innings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  return await response.json();
}

// Usage
const result = await startSecondInnings(token, 'match_123');
```

**Response (200)**
```json
{
  "success": true,
  "message": "Second innings started successfully",
  "data": {
    "match": { ... }
  }
}
```

---

#### ⚾ Play Ball
**POST /api/match/play-ball**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function playBall(token, matchId) {
  const response = await fetch('http://localhost:3000/api/match/play-ball', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ matchId }),
  });
  
  return await response.json();
}

// Usage
const result = await playBall(token, 'match_123');
console.log(result.data.match); // Updated match state
```

**Request**
```json
{
  "matchId": "match_123"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Ball played successfully",
  "data": {
    "match": {
      "_id": "match_123",
      "status": "IN_PROGRESS",
      "currentInnings": 1,
      "ballCount": 5,
      "runs": 8
    }
  }
}
```

---

#### ⏸️ Pause Match
**POST /api/match/pause**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function pauseMatch(token, matchId) {
  const response = await fetch('http://localhost:3000/api/match/pause', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ matchId }),
  });
  
  return await response.json();
}

// Usage
const result = await pauseMatch(token, 'match_123');
```

**Request**
```json
{
  "matchId": "match_123"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Match paused successfully",
  "data": {
    "matchId": "match_123"
  }
}
```

---

#### ▶️ Resume Match
**POST /api/match/resume**

Requires: `Authorization: Bearer <user_token>`

```javascript
// React Native
async function resumeMatch(token, matchId) {
  const response = await fetch('http://localhost:3000/api/match/resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ matchId }),
  });
  
  return await response.json();
}

// Usage
const result = await resumeMatch(token, 'match_123');
```

**Request**
```json
{
  "matchId": "match_123"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Match resumed successfully",
  "data": {
    "matchId": "match_123"
  }
}
```

---

### 4. Admin APIs

#### 🌱 Seed Teams (Admin Only)
**POST /api/admin/seed-teams**

Requires: `Authorization: Bearer <admin_token>`

Seeds initial cricket teams for development.

```javascript
// React Native
async function seedTeams(token) {
  const response = await fetch('http://localhost:3000/api/admin/seed-teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

// Usage
const result = await seedTeams(adminToken);
if (result.success) {
  console.log(`Teams seeded: ${result.data.count || 'Already exists'}`);
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Teams already exist",
  "data": {
    "count": 8
  }
}
```

---

## Reusable Helper Classes

### React Native Helper

```javascript
// services/ApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async getToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async setToken(token) {
    await AsyncStorage.setItem('authToken', token);
  }

  async clearToken() {
    await AsyncStorage.removeItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth Methods
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success) {
      await this.setToken(data.data.token);
    }

    return data;
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Teams Methods
  async getTeams() {
    const data = await this.request('/teams');
    return data.data;
  }

  // Match Methods
  async createMatch(teamA, teamB, overs) {
    const data = await this.request('/match/create', {
      method: 'POST',
      body: JSON.stringify({ teamA, teamB, overs }),
    });
    return data.data.matchId;
  }

  async getMatchHistory() {
    const data = await this.request('/match/history');
    return data.data;
  }

  async getMatch(matchId) {
    const data = await this.request(`/match/${matchId}`);
    return data.data;
  }

  async completeToss(matchId, tossWinner, decision) {
    const data = await this.request('/match/toss', {
      method: 'POST',
      body: JSON.stringify({ matchId, tossWinner, decision }),
    });
    return data.data;
  }

  async playBall(matchId) {
    const data = await this.request('/match/play-ball', {
      method: 'POST',
      body: JSON.stringify({ matchId }),
    });
    return data.data;
  }

  async pauseMatch(matchId) {
    const data = await this.request('/match/pause', {
      method: 'POST',
      body: JSON.stringify({ matchId }),
    });
    return data.data;
  }

  async resumeMatch(matchId) {
    const data = await this.request('/match/resume', {
      method: 'POST',
      body: JSON.stringify({ matchId }),
    });
    return data.data;
  }

  async startSecondInnings(matchId) {
    const data = await this.request(`/match/${matchId}/start-innings`, {
      method: 'POST',
    });
    return data.data;
  }
}

export default new ApiService();
```

### Usage in React Native Component

```javascript
import ApiService from './services/ApiService';

function CricketApp() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);

  const handleLogin = async (email, password) => {
    try {
      const result = await ApiService.login(email, password);
      if (result.success) {
        setUser(result.data.user);
        await loadMatches();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const loadMatches = async () => {
    try {
      const data = await ApiService.getMatchHistory();
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  return (
    // JSX here
  );
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "data": {
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid Bearer token |
| `FORBIDDEN` | 403 | User lacks required permissions (e.g., not admin) |
| `BAD_REQUEST` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Wrong Content-Type header |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### React Native Error Handling

```javascript
async function apiCall(endpoint, options) {
  try {
    const response = await ApiService.request(endpoint, options);
    if (!response.success) {
      handleError(response.data.code, response.message);
    }
    return response.data;
  } catch (error) {
    console.error('Network error:', error);
    // Show toast/alert to user
  }
}

function handleError(code, message) {
  switch (code) {
    case 'UNAUTHORIZED':
      // Redirect to login
      break;
    case 'FORBIDDEN':
      // Show "Access Denied" message
      break;
    case 'NOT_FOUND':
      // Show "Resource not found" message
      break;
    default:
      console.error(message);
  }
}
```

---

## Testing with cURL

```bash
# Get teams
curl -X GET http://localhost:3000/api/teams

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create match (with token)
curl -X POST http://localhost:3000/api/match/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"teamA":"India","teamB":"Pakistan","overs":50}'

# Play ball
curl -X POST http://localhost:3000/api/match/play-ball \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"matchId":"match_123"}'
```

---

## Testing with Postman

1. **Create Environment Variable**: Set `{{token}}` in Postman environment
2. **Login Request**: Copy `data.data.token` to `{{token}}`
3. **All Other Requests**: Add header `Authorization: Bearer {{token}}`

---

## Checklist: Cross-Platform Ready ✅

- ✅ No cookie-only dependency
- ✅ Bearer token support in all APIs
- ✅ `req.headers.get("authorization")` used consistently
- ✅ Standard response format: `{ success, message, data }`
- ✅ Uses `Response.json()` (platform agnostic)
- ✅ React Native examples for all endpoints
- ✅ Works without browser environment
- ✅ Mobile, CLI, and any HTTP client can use APIs

---

## Deployment Checklist

- [ ] Set `NEXTAUTH_SECRET` in production environment
- [ ] Configure CORS if frontend is on different domain
- [ ] Use HTTPS in production
- [ ] Set secure cookie flags if using sessions
- [ ] Implement rate limiting for login endpoint
- [ ] Add request validation middleware
- [ ] Enable GZIP compression
- [ ] Monitor API error rates
