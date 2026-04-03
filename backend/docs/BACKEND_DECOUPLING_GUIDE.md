# Backend Decoupling - Testing Guide

## What Was Changed

### 1. Removed NextAuth Dependencies
- ✅ Created standalone JWT utility (`src/lib/jwtUtils.js`)
- ✅ Refactored `authMiddleware.js` to use only Bearer tokens
- ✅ Updated login endpoint to use `jsonwebtoken` instead of `next-auth/jwt`
- ✅ Created logout endpoint (`/api/auth/logout`)
- ✅ Removed NextAuth from login page
- ✅ Removed NextAuth from signup page
- ✅ Updated LogoutButton to use API calls
- ✅ Updated MatchCountWidget to fetch via API
- ✅ Made dashboard a client component with API calls
- ✅ Made landing page a client component

### 2. Authentication is Now Stateless
- No server-side sessions
- All auth uses `Authorization: Bearer <token>` header
- JWT tokens generated with `jsonwebtoken` library
- Token stored in `localStorage` (browser) or state management (mobile)

### 3. All Mutations Go Through APIs
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Logout: `POST /api/auth/logout`
- Create match: `POST /api/match/create`
- Toss: `POST /api/match/toss`
- Play ball: `POST /api/match/play-ball`
- Pause: `POST /api/match/pause`
- Resume: `POST /api/match/resume`

---

## How to Test

### Option 1: cURL Testing

#### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": null
}
```

#### 2. Login to Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Expected response:
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
      "name": "Test User",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

**Save the token value!**

#### 3. Get Teams (Public - No Auth Required)
```bash
curl -X GET http://localhost:3000/api/teams
```

#### 4. Create a Match
Replace `YOUR_TOKEN` with the token from login:

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

Expected response:
```json
{
  "success": true,
  "message": "Match created successfully",
  "data": {
    "matchId": "507f1f77bcf86cd799439020"
  }
}
```

**Save the matchId!**

#### 5. Complete the Toss
Replace `YOUR_TOKEN` and `MATCH_ID` with actual values:

```bash
curl -X POST http://localhost:3000/api/match/toss \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "MATCH_ID",
    "tossWinner": "teamA",
    "decision": "bat"
  }'
```

#### 6. Play a Ball
```bash
curl -X POST http://localhost:3000/api/match/play-ball \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"matchId": "MATCH_ID"}'
```

#### 7. Pause the Match
```bash
curl -X POST http://localhost:3000/api/match/pause \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"matchId": "MATCH_ID"}'
```

#### 8. Resume the Match
```bash
curl -X POST http://localhost:3000/api/match/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"matchId": "MATCH_ID"}'
```

#### 9. Get Match History
```bash
curl -X GET http://localhost:3000/api/match/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 10. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Option 2: Postman Testing

1. **Create a new Postman collection** for this API
2. **Set up an environment variable** for the token:
   - Variable name: `token`
   - Initial value: (empty)
   - Current value: (empty)

3. **Create requests** in this order:

#### Register
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@user.com",
  "password": "test123456"
}
```

#### Login
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@user.com",
  "password": "test123456"
}
```
- **After successful response**, set the token in Postman:
  - Open the test tab
  - Add: `pm.environment.set("token", pm.response.json().data.token);`

#### All Subsequent Requests
- Add header: `Authorization: Bearer {{token}}`

---

### Option 3: React Native Testing

Use the provided helper functions from [API_CONTRACT.md](./API_CONTRACT.md#react-native-complete-example):

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Register
await register('John Doe', 'john@example.com', 'password123');

// 2. Login
await login('john@example.com', 'password123');

// 3. Get teams
const response = await apiRequest('/api/teams');

// 4. Create match
const result = await createMatch('India', 'Pakistan', 5);

// 5. Play ball
await playBall(matchId);

// 6. Logout
await logout();
```

---

## Verification Checklist

- [ ] Can register a new user via /api/auth/register
- [ ] Can login and receive a Bearer token via /api/auth/login
- [ ] Can access protected endpoints with Bearer token
- [ ] Requests without Bearer token get 401 Unauthorized
- [ ] Can create a match via /api/match/create
- [ ] Can complete toss via /api/match/toss
- [ ] Can play ball via /api/match/play-ball
- [ ] Can pause/resume matches
- [ ] Can fetch match history via /api/match/history
- [ ] Can logout via /api/auth/logout
- [ ] Dashboard loads without getServerSession()
- [ ] Login page uses API instead of signIn()
- [ ] Signup page uses API instead of signIn()
- [ ] Token persists in localStorage
- [ ] Token is cleared on logout

---

## Architecture Summary

### Before
```
Client → NextAuth Provider → API Route
                ↓
            JWT Tokens (NextAuth)
                ↓
            Session/Cookies
                ↓
            Database
```

### After
```
Client → API Route → JWT Verify → Database
          ↑
       Bearer Token
   (Authorization Header)
```

### Key Benefits

✅ **Stateless**: No server-side session store  
✅ **Cross-Platform**: Works with React Native, Flutter, etc.  
✅ **Testable**: Works with Postman, cURL, etc.  
✅ **Scalable**: Can run multiple instances  
✅ **Standard**: Follows REST API conventions  
✅ **Secure**: JWTs signed with secret key  

---

## Migration Path (Optional)

If you want to keep NextAuth for OAuth but use JWT for credentials:

1. Keep `/api/auth/[...nextauth]/route.js` for OAuth
2. Use the new `/api/auth/login` for credentials
3. Use the new JWT utilities in both places
4. Client logic can detect which provider was used and act accordingly

But for **pure API-first backend**, the current setup is complete! ✅

---

## Troubleshooting

### "Invalid token" error
- Make sure token wasn't modified
- Check if token has expired (30 days by default)
- Verify `NEXTAUTH_SECRET` env var is set

### "Authentication required" error
- Check if Authorization header is present
- Verify header format: `Authorization: Bearer <token>`
- Not: `Authorization: <token>` or `Bearer: <token>`

### CORS errors (React Native / Postman)
- Ensure backend allows cross-origin requests
- Check `/etc/hosts` for API URL resolution

### Database connection errors
- Ensure MongoDB is running
- Check `MONGODB_URI` environment variable
- Verify database credentials

---

## Next Steps

1. Run the cURL tests above to verify each endpoint
2. Import the API contract into Postman
3. Test with React Native using the provided examples
4. Remove NextAuth settings from `.env.local` if not needed for OAuth
5. Update any remaining OAuth flows to use the new JWT system

---

## Files Modified

- ✅ `src/lib/jwtUtils.js` - New JWT utility
- ✅ `src/middleware/authMiddleware.js` - Simplified to Bearer only
- ✅ `src/app/api/auth/login/route.js` - Uses jwtUtils
- ✅ `src/app/api/auth/logout/route.js` - New endpoint
- ✅ `src/app/page.jsx` - Client component with API checks
- ✅ `src/app/dashboard/page.jsx` - Client component with API calls
- ✅ `src/app/login/page.jsx` - Uses API login
- ✅ `src/app/signup/page.jsx` - Uses API register
- ✅ `src/components/auth/LogoutButton.jsx` - Uses API logout
- ✅ `src/components/Dashboard/MatchCountWidget.jsx` - Uses API fetch
- ✅ `docs/API_CONTRACT.md` - Complete API documentation

---

## Backward Compatibility

⚠️ **Breaking Changes**:
- OAuth login (Google/GitHub) no longer works with current setup
- NextAuth session cookies are no longer used
- Client code must use Bearer tokens in Authorization header

✅ **Still Works**:
- All REST API endpoints
- All MongoDB database queries
- All business logic (matches, teams, etc.)
- Can be used by any HTTP client
