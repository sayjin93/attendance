# Session Management & Token Rotation

This document explains how the access token + refresh token system works in this application.

## Architecture

The application uses a dual-token JWT architecture:

- **Access Token** (15 min): Short-lived JWT in an httpOnly cookie (`access_token`). Carries user claims and is verified by the proxy and API routes.
- **Refresh Token** (7 days): Long-lived JWT in an httpOnly cookie (`refresh_token`). Has a `jti` (JWT ID) claim stored in the `RefreshToken` database table, enabling server-side revocation and token rotation.

## How It Works

### 1. Login (`/api/auth/login`)

On successful login, the server issues both tokens:

- Creates an **access token** (15-minute expiry) with user claims (`professorId`, `firstName`, `lastName`, `isAdmin`)
- Creates a **refresh token** (7-day expiry) with a unique `jti`
- Stores the `jti` in the `RefreshToken` database table for revocation tracking
- Sets both as httpOnly cookies in the response

### 2. Proxy Auto-Refresh (`proxy.ts`)

The Next.js proxy intercepts every page navigation:

- **Verifies** the `access_token` cookie
- **If expired**: Falls back to the `refresh_token` to extract claims and issues a fresh access token transparently
- **Injects headers**: `X-Professor-Id`, `X-First-Name`, `X-Last-Name`, `X-Is-Admin` for server components
- **Blocks** non-admin users from admin-only routes

User experience is seamless — they never see a login redirect flash.

### 3. API Client 401 Interceptor (`services/api-client.ts`)

The centralized API client handles token expiry for client-side API calls:

- On a **401 response** (from any non-auth API route), automatically calls `/api/auth/refresh`
- **Deduplicates** concurrent refresh attempts (shared promise)
- **Retries** the failed request after a successful refresh
- If refresh fails, the error propagates normally (redirected to login by `useAuth`)

### 4. Token Rotation (`/api/auth/refresh`)

Each refresh rotates the entire token pair:

1. Verify the refresh token JWT signature and expiry
2. Look up the `jti` in the `RefreshToken` database table
3. **If revoked** (reuse detected): Revoke ALL tokens for that user (theft protection) and clear cookies
4. Fetch fresh user data from the database (picks up name/role changes)
5. Issue a new access token + refresh token pair
6. **Atomic transaction**: Revoke old refresh token, create new one in DB
7. Set both new cookies in the response
8. Clean up expired/old revoked tokens (housekeeping)

### 5. Proactive Refresh (`useSessionRefresh` hook)

The client-side hook keeps the session alive during active use:

- **Monitors activity**: mousedown, keydown, scroll, touchstart, click
- **Every 10 minutes**: If the user was active, calls `/api/auth/refresh`
- **On failure**: Redirects to `/login`
- This also rotates the refresh token, keeping the 7-day window sliding

### 6. Logout (`/api/auth/logout`)

- Revokes the refresh token in the database
- Clears both `access_token` and `refresh_token` cookies

### 7. Session Check (`/api/auth/session`)

Returns the current user info from the access token without refreshing:

```typescript
GET /api/auth/session
```

Response:
```json
{
  "professorId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": true
}
```

## Token Details

### Access Token
- **Cookie name**: `access_token`
- **Expiry**: 15 minutes
- **Payload**: `professorId`, `firstName`, `lastName`, `isAdmin`
- **Verified by**: Proxy (page routes), `requireAuth()` / `requireAdmin()` (API routes)

### Refresh Token
- **Cookie name**: `refresh_token`
- **Expiry**: 7 days
- **Payload**: Same as access token + `jti` (unique token ID)
- **Stored in DB**: `RefreshToken` table with `jti`, `professorId`, `expiresAt`, `revokedAt`, `replacedBy`
- **Rotation**: Each use generates a new pair and invalidates the old one

### Cookie Security
- `httpOnly: true` — Prevents JavaScript access (XSS protection)
- `secure: true` — HTTPS only in production
- `sameSite: "lax"` — CSRF protection
- `path: "/"` — Available to all routes

## Database: RefreshToken Model

```prisma
model RefreshToken {
  id          String    @id @default(cuid())
  jti         String    @unique
  professorId Int
  professor   Professor @relation(fields: [professorId], references: [id], onDelete: Cascade)
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  revokedAt   DateTime?
  replacedBy  String?

  @@index([professorId])
}
```

## Security Features

### Token Rotation
Each refresh creates a new token pair and revokes the old one. The `replacedBy` field creates a chain for auditing.

### Theft Detection
If a revoked refresh token is reused (e.g., by an attacker who stole an old token), the system:
1. Detects it's already revoked
2. Revokes ALL active refresh tokens for that user
3. Clears cookies — forces re-login on all sessions

### Server-Side Revocation
Unlike a single-JWT system where tokens can't be invalidated before expiry, refresh tokens are validated against the database on every use. Compromised tokens can be revoked instantly.

## Usage

### In Your Application
Session refresh is automatically enabled in `ClientLayout`:

```typescript
// Automatically enabled for authenticated users
useSessionRefresh(!!professorId);
```

### Customization

```typescript
// Refresh every 8 minutes instead of 10
useSessionRefresh(true, 8 * 60 * 1000);

// Disable auto-refresh
useSessionRefresh(false);
```

## User Scenarios

### Scenario 1: Active User
- User logs in at 9:00 AM
- Access token expires at 9:15 AM, but proxy/API client transparently refresh it
- Refresh token rotated every 10 min by `useSessionRefresh`
- User is **never logged out** as long as they remain active

### Scenario 2: Idle User
- User logs in at 9:00 AM
- User leaves the browser open but doesn't interact
- Access token expires at 9:15 AM
- On next page navigation → proxy uses refresh token to issue a new access token
- On next API call → API client uses refresh endpoint to retry
- If idle for 7 days → refresh token expires, user redirected to login

### Scenario 3: Token Theft
- Attacker steals refresh token and uses it
- Legitimate user's next refresh attempt uses the now-revoked token
- System detects reuse → revokes ALL tokens for that user
- Both attacker and user must re-login (user is protected)

## Files

1. `lib/tokens.ts` — Token creation, verification, and cookie serialization
2. `proxy.ts` — Auth proxy with transparent access token refresh
3. `app/api/auth/login/route.ts` — Issues both tokens on login
4. `app/api/auth/refresh/route.ts` — Token rotation with DB validation and theft detection
5. `app/api/auth/logout/route.ts` — Revokes refresh token in DB, clears cookies
6. `app/api/auth/session/route.ts` — Returns current session from access token
7. `lib/auth.ts` — Server-side `requireAuth()` / `requireAdmin()` for API routes
8. `services/api-client.ts` — 401 interceptor with deduplicated refresh + retry
9. `hooks/useSessionRefresh.ts` — Proactive 10-minute refresh cycle
10. `prisma/schema.prisma` — `RefreshToken` model
