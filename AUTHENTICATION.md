# Authentication Implementation

This document explains the cookie-based authentication system implemented in the Lifo Frontend.

## Features

### 1. Cookie-Based Persistence
- Auth cookies are automatically set when users log in
- Cookies persist between browser sessions
- App automatically checks for existing auth on startup

### 2. Automatic 401 Handling
- Any API call returning 401 Unauthorized automatically logs out the user
- Prevents stale authentication states
- Provides seamless user experience

### 3. Proper Session Management
- Login sets server-side cookies via the `/api/auth/signin` endpoint
- Logout clears both local state and server-side cookies via `/api/auth/signout`
- Initial auth check via `/api/auth/verify` endpoint

## Usage

### For Login
The login process automatically handles cookies. No changes needed in components using `useAuth()`.

```javascript
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login(username, password);
  if (result.success) {
    // User is now logged in and cookies are set
  }
};
```

### For Authenticated API Calls
Use the `authenticatedFetch` utility for any API calls that require authentication:

```javascript
const { authenticatedFetch, LIFO_API_URL } = useAuth();

const fetchUserData = async () => {
  try {
    const response = await authenticatedFetch(`${LIFO_API_URL}/api/user/profile`);
    
    if (response.ok) {
      const data = await response.json();
      // Handle successful response
    } else {
      // Handle error response
    }
    // Note: 401 responses are automatically handled
  } catch (error) {
    // Handle network errors
  }
};
```

### For Logout
The logout function automatically clears both local state and server cookies:

```javascript
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Clears local state and server cookies
};
```

## API Endpoints Expected

The implementation expects these backend endpoints:

1. `POST /api/auth/signin` - Login endpoint that sets auth cookies
2. `POST /api/auth/signout` - Logout endpoint that clears auth cookies  
3. `GET /api/auth/verify` - Endpoint to verify current auth status

All endpoints should:
- Support CORS with credentials
- Use HTTP-only cookies for security
- Return appropriate status codes (200 for success, 401 for unauthorized)

## Security Considerations

- Uses `credentials: 'include'` for all authenticated requests
- Cookies should be HTTP-only and Secure in production
- 401 responses trigger immediate logout to prevent stale sessions
- No sensitive data stored in local storage