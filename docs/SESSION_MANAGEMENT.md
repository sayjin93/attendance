# Session Management & Auto-Refresh

This document explains how the session management and auto-refresh system works in this application.

## Problem
Previously, the session would expire after 1 hour, logging users out even if they were actively using the application.

## Solution
We've implemented a multi-layered session refresh system that automatically extends the session when users are active.

## How It Works

### 1. Middleware Auto-Refresh (`middleware.ts`)
The middleware automatically checks every request and refreshes the session token when it's about to expire:

- **Checks**: On every page navigation
- **Refresh Trigger**: When less than 15 minutes remain on the session
- **Action**: Automatically creates a new JWT token and cookie with a fresh 1-hour expiration
- **User Experience**: Completely transparent - users never notice

### 2. Client-Side Auto-Refresh (`useSessionRefresh` hook)
A React hook that monitors user activity and proactively refreshes the session:

- **Activity Tracking**: Monitors mouse, keyboard, scroll, touch, and click events
- **Smart Refresh**: Only refreshes if user has been active in the last 5 minutes
- **Refresh Interval**: Checks every 5 minutes (configurable)
- **API Endpoint**: Calls `/api/auth/refresh` to get a new token

### 3. Session Check Endpoint (`/api/auth/session`)
Returns the current session information without refreshing:

```typescript
GET /api/auth/session
```

Response:
```json
{
  "professorId": "123",
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": true
}
```

### 4. Session Refresh Endpoint (`/api/auth/refresh`)
Creates a new session token, extending the expiration time:

```typescript
POST /api/auth/refresh
```

Response:
```json
{
  "professorId": "123",
  "firstName": "John",
  "lastName": "Doe",
  "isAdmin": true
}
```

## Implementation Details

### Token Expiration
- **Initial Duration**: 30 minutes from login
- **Auto-Refresh Threshold**: 10 minutes before expiration (middleware)
- **Client Refresh**: Every 5 minutes if user is active
- **Activity Window**: User must be active within the last 5 minutes

### Security Features
- **httpOnly Cookie**: Prevents JavaScript access to the token
- **Secure Flag**: Uses HTTPS in production
- **SameSite**: Set to "lax" to prevent CSRF attacks
- **JWT Signing**: Uses HS256 algorithm with a secret key

## Usage

### In Your Application
The session refresh is automatically enabled in `ClientLayout`:

```typescript
// Automatically enabled for authenticated users
useSessionRefresh(!!professorId);
```

### Customization
You can customize the refresh behavior:

```typescript
// Refresh every 3 minutes instead of 5
useSessionRefresh(true, 3 * 60 * 1000);

// Disable auto-refresh
useSessionRefresh(false);
```

### Middleware Refresh Threshold
To change when the middleware refreshes the token, edit `middleware.ts`:

```typescript
// Current: refreshes when less than 10 minutes remain
const shouldRefresh = timeUntilExpiry < 10 * 60;

// Example: Change to 5 minutes
const shouldRefresh = timeUntilExpiry < 5 * 60;
```

## User Scenarios

### Scenario 1: Active User
- User logs in at 9:00 AM
- User actively uses the app throughout the day
- Session is automatically refreshed every 5-15 minutes
- User is **never logged out** as long as they remain active

### Scenario 2: Idle User
- User logs in at 9:00 AM
- User leaves the browser open but doesn't interact
- After 30 minutes (9:30 AM), the session expires
- On next interaction, user is redirected to login

### Scenario 3: Occasional User
- User logs in at 9:00 AM
- User interacts at 9:20 AM - session refreshed
- User doesn't interact again until 10:00 AM
- Session has expired, user redirected to login

## Monitoring

### Client Console
The hook logs when the session is refreshed:
```
Session refreshed successfully
```

### Server Logs
Middleware errors are logged in the console:
```
Error in middleware: [error details]
```

## Benefits

✅ **No Unexpected Logouts**: Active users are never logged out  
✅ **Improved UX**: Seamless experience with no interruptions  
✅ **Security Maintained**: Inactive sessions still expire  
✅ **Automatic**: No user action required  
✅ **Efficient**: Only refreshes when necessary  
✅ **Scalable**: Works on both server and client side

## Troubleshooting

### Issue: Still Getting Logged Out
1. Check if `useSessionRefresh` is enabled in your layout
2. Verify the activity events are firing (check console logs)
3. Ensure cookies are not being blocked by browser settings

### Issue: Session Not Refreshing
1. Check browser console for errors
2. Verify `/api/auth/refresh` endpoint is accessible
3. Check that the JWT secret key is properly configured

### Issue: Too Many Refresh Requests
1. Increase the `refreshInterval` parameter
2. Adjust the activity window threshold
3. Check for unnecessary re-renders in your components

## Files Modified/Created

1. ✅ `middleware.ts` - Added auto-refresh logic
2. ✅ `app/api/auth/session/route.ts` - Created session check endpoint
3. ✅ `app/api/auth/refresh/route.ts` - Created refresh endpoint
4. ✅ `hooks/useSessionRefresh.ts` - Created client-side refresh hook
5. ✅ `app/(pages)/ClientLayout.tsx` - Integrated auto-refresh hook
