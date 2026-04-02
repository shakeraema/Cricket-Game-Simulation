# Backend Architecture - Quick Reference

## 🔑 Authentication Flow

### 1. User Registration
```
POST /api/auth/register
{ name, email, password }
     ↓
Create user in MongoDB
     ↓
Return 201 Created
```

### 2. User Login
```
POST /api/auth/login
{ email, password }
     ↓
Verify credentials
     ↓
Generate JWT token (jsonwebtoken)
     ↓
Return { token, user, expiresIn }
     ↓
Client stores token in localStorage
```

### 3. Protected API Calls
```
Authorization: Bearer <token>
     ↓
authMiddleware.requireAuth()
     ↓
verifyToken() - Verify JWT signature
     ↓
Extract userId from token
     ↓
Allow request to proceed
```

### 4. Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
     ↓
Verify token is valid
     ↓
Return success
     ↓
Client deletes localStorage token
```

---

## 🗂️ Key Files

### JWT & Auth
- `src/lib/jwtUtils.js` - JWT creation/verification (NO NextAuth)
- `src/middleware/authMiddleware.js` - Bearer token validation
- `src/app/api/auth/login/route.js` - Login endpoint
- `src/app/api/auth/logout/route.js` - Logout endpoint
- `src/app/api/auth/register/route.js` - Registration endpoint

### API Client
- `src/lib/apiClient.js` - Axios wrapper with Bearer token support
- Uses `setAuthToken()` to manage Authorization header

### Components (No Server Logic)
- `src/app/page.jsx` - Landing page (client component)
- `src/app/login/page.jsx` - Login form (client component)
- `src/app/signup/page.jsx` - Signup form (client component)
- `src/app/dashboard/page.jsx` - Dashboard (client component)
- `src/components/auth/LogoutButton.jsx` - API-based logout
- `src/components/Dashboard/MatchCountWidget.jsx` - API-based count fetch

---

## 🔄 API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Get JWT token |
| POST | `/api/auth/logout` | ✅ | Logout (clear client token) |
| GET | `/api/teams` | ❌ | List all teams |
| POST | `/api/teams` | ✅ Admin | Create team |
| POST | `/api/match/create` | ✅ | Create match |
| GET | `/api/match/[id]` | ✅ | Get match details |
| GET | `/api/match/history` | ✅ | Get user's matches |
| POST | `/api/match/toss` | ✅ | Complete toss |
| POST | `/api/match/play-ball` | ✅ | Play a ball |
| POST | `/api/match/pause` | ✅ | Pause match |
| POST | `/api/match/resume` | ✅ | Resume match |

---

## 📱 Bearer Token Usage

### cURL
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://api.example.com/endpoint
```

### JavaScript/React
```javascript
const response = await fetch('/api/endpoint', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### React Native
```javascript
fetch('http://api.example.com/endpoint', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### Axios (src/lib/apiClient.js)
```javascript
setAuthToken(token); // Sets default header
// Or per-request:
apiPost('/api/endpoint', body, token);
```

---

## 🛡️ Security Features

✅ **JWT Signing**: Uses `NEXTAUTH_SECRET` env var  
✅ **Bearer Token**: HTTP header (not URL param)  
✅ **Token Expiry**: 30 days by default  
✅ **Password Hashing**: bcryptjs (10 salt rounds)  
✅ **CORS**: Configure in Next.js headers if needed  
✅ **Stateless**: No server-side sessions to hack  

---

## 🔧 Configuration

### Environment Variables Needed
```
NEXTAUTH_SECRET=your-random-secret-key
MONGODB_URI=mongodb://...
```

### The Secret
- Used for signing JWT tokens
- Can be any random string
- Keep private and secure
- Same value across all servers for distributed systems

---

## 📊 Data Flow for Match Creation

```
User submits form
     ↓
POST /api/match/create
  + Authorization: Bearer {token}
  + { teamA, teamB, overs }
     ↓
authMiddleware.requireAuth()
  - Verify token
  - Extract userId
     ↓
matchService.createMatch()
  - Create Document
  - Set createdBy: userId
  - Set status: CREATED
     ↓
Save to MongoDB.matches
     ↓
Return { success: true, matchId }
     ↓
Client navigates to /match/{matchId}
```

---

## ✅ No More NextAuth Dependencies

### Removed:
- ❌ `getServerSession()` calls
- ❌ `signIn()` function
- ❌ `signOut()` function
- ❌ NextAuth provider wrapper
- ❌ OAuth Google/GitHub (for now)

### Kept:
- ✅ `jsonwebtoken` library
- ✅ JWT encoding/decoding
- ✅ Bearer token validation
- ✅ All business logic

---

## 🧪 Testing Checklist

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# 2. Login (save token!)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' \
  | jq -r '.data.token')

# 3. Protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/match/history

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Scaling Advantages

1. **No Session Store**: Don't need Redis for sessions
2. **Stateless**: Can run infinite replicas
3. **API-First**: Mobile apps, web, CLI - all compatible
4. **Cost**: No session backend infrastructure needed
5. **Performance**: JWT validation is local and fast

---

## 🔀 Migration from NextAuth (If Needed)

If you have existing NextAuth sessions:

1. Create migration endpoint to convert sessions → tokens
2. Or recreate users through `/api/auth/login`
3. Update client code to use Bearer tokens
4. Gradually deprecate NextAuth endpoints

For now: **Fresh start = fresh users** ✅

---

## 📚 Complete Documentation

- Full API contract: `docs/API_CONTRACT.md`
- Testing guide: `docs/BACKEND_DECOUPLING_GUIDE.md`
- This file: `docs/ARCHITECTURE.md`

---

## 💡 Key Takeaway

**This is now a pure REST API.**
- Works with any client
- No server-side framework dependency
- Scales horizontally
- Can be called from anywhere
- Ready for external integrations

The Next.js framework is now just a **client** of the API, not the server itself.
