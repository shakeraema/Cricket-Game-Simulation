# 🏏 Cricket API - Quick Start

## Start Server
```bash
npm run dev
```
Server runs on `http://localhost:3000`

---

## Authentication Flow

### 1. Register
```curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"password123"}'
```

### 2. Login (Get Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGci...",
    "expiresIn": 2592000
  }
}
```

### 3. Use Token
Save the token and use in all requests:
```bash
curl -H "Authorization: Bearer TOKEN_HERE" http://localhost:3000/api/endpoint
```

---

## API Endpoints

### Public (No Auth Required)
```
GET  /api/teams
```

### Authentication
```
POST /api/auth/register        # Create user
POST /api/auth/login           # Get token
POST /api/auth/logout          # Logout
```

### Match Operations (Auth Required)
```
POST /api/match/create         # Create new match
GET  /api/match/[id]           # Get match details
GET  /api/match/history        # Get your matches
POST /api/match/toss           # Complete toss
POST /api/match/play-ball      # Play next ball
POST /api/match/pause          # Pause match
POST /api/match/resume         # Resume match
```

---

## Complete Test Workflow

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# 2. Login (save TOKEN!)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  | jq -r '.data.token')

echo $TOKEN

# 3. Create match
MATCH=$(curl -s -X POST http://localhost:3000/api/match/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"teamA":"India","teamB":"Pakistan","overs":3}' \
  | jq -r '.data.matchId')

echo $MATCH

# 4. Complete toss
curl -X POST http://localhost:3000/api/match/toss \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"matchId\":\"$MATCH\",\"tossWinner\":\"teamA\",\"decision\":\"bat\"}"

# 5. Play ball
curl -X POST http://localhost:3000/api/match/play-ball \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"matchId\":\"$MATCH\"}"

# 6. Get match history
curl -X GET http://localhost:3000/api/match/history \
  -H "Authorization: Bearer $TOKEN"

# 7. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Key Files

### Backend Core
- `src/lib/jwtUtils.js` - JWT token creation/validation
- `src/middleware/authMiddleware.js` - Bearer token validation
- `src/app/api/[...]` - All API endpoints

### Client Pages
- `src/app/login/page.jsx` - Login form
- `src/app/signup/page.jsx` - Registration form
- `src/app/dashboard/page.jsx` - Dashboard
- `src/app/page.jsx` - Landing page

### Components
- `src/components/auth/LogoutButton.jsx` - Logout button
- `src/components/Dashboard/` - Dashboard widgets

---

## Token Header Format

✅ **Correct:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

❌ **Incorrect:**
```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     (missing Bearer)
Authorization: Bearer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  (extra colon)
```

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "data": { "code": "ERROR_CODE" }
}
```

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | No permission (e.g., not admin) |
| BAD_REQUEST | 400 | Invalid input |
| NOT_FOUND | 404 | Resource doesn't exist |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function login(email, password) {
  const response = await fetch('http://your-api/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const { data } = await response.json();
  await AsyncStorage.setItem('token', data.token);
  return data.token;
}

async function createMatch(token, teamA, teamB, overs) {
  const response = await fetch('http://your-api/api/match/create', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ teamA, teamB, overs })
  });
  
  return response.json();
}
```

---

## Postman Setup

1. Create new Collection
2. Create Environment with variable: `token`
3. For each request:
   - Add header: `Authorization: Bearer {{token}}`
   - After login, set: `pm.environment.set("token", pm.response.json().data.token);`

---

## Environment Variables

```
NEXTAUTH_SECRET=your-random-secret-key
MONGODB_URI=mongodb://localhost:27017/cricket-db
```

---

## Full Documentation

- **API Contract**: `docs/API_CONTRACT.md`
- **Testing Guide**: `docs/BACKEND_DECOUPLING_GUIDE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Completion Report**: `DECOUPLING_COMPLETE.md`

---

## Status

✅ **Decoupled** - No Next.js-specific behavior  
✅ **API-First** - All operations through REST endpoints  
✅ **Stateless** - JWT bearer token authentication  
✅ **Cross-Platform** - Works with any HTTP client  
✅ **Production-Ready** - Secure and well-documented  

🚀 **Ready to deploy!**
