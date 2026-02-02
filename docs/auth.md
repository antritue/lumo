# Authentication (Supabase & Google)

Lumo uses **Supabase Auth** with a **Google-only** OAuth flow. This guide covers the implementation details and configuration specific to Lumo. For general information, refer to the [Official Supabase Google Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google).

---

## The Auth Flow

*Edit this diagram in the [Mermaid Live Editor](https://mermaid.live)*

```mermaid
sequenceDiagram
    participant User
    participant Lumo (Client)
    participant Supabase (Server)
    participant Google
    participant Lumo API (/callback)

    User->>Lumo (Client): Click "Sign In"
    Lumo (Client)->>Supabase (Server): signInWithOAuth(provider: 'google')
    Supabase (Server)->>Google: Authorize Request
    Google-->>User: Show Account Picker (prompt: select_account)
    User->>Google: Select Account
    Google->>Lumo API (/callback): Redirect with ?code=xyz
    Lumo API (/callback)->>Supabase (Server): exchangeCodeForSession(code)
    Supabase (Server)-->>Lumo API (/callback): Validates Session
    Lumo API (/callback)->>Lumo (Client): Redirect to /dashboard
    Lumo (Client)->>Supabase (Server): AuthProvider: getSession() (Restores Session)
    Supabase (Server)-->>Lumo (Client): User Data
    Lumo (Client)->>Supabase (Server): onAuthStateChange (Listener)
    Lumo (Client)->>Lumo (Client): Update Zustand Store
```

---

## Configuration Guidelines

### 1. Google Cloud Console
- **Clients** (Edit your OAuth 2.0 Client ID):
  - **Authorized redirect URIs**: You must whitelist the Supabase callback URL.
    - **Development**: `https://[YOUR_DEV_PROJECT_ID].supabase.co/auth/v1/callback`
    - **Production**: `https://[YOUR_PROD_PROJECT_ID].supabase.co/auth/v1/callback`
  - **Authorized JavaScript origins**: Add your primary domains.
    - `http://localhost:3000`
    - `https://www.lumo.homes`
- **Branding** (OAuth consent screen):
  - **Authorized domains**: Add your own domain and your provider's domain.
    - `lumo.homes`
    - `supabase.co`
  - **Publishing Status**: Click **"Publish App"** to move from *Testing* to *Production*. 
    - *Testing mode* restricts logins to white-listed "Test users" only.
    - *Production mode* allows any Google user to log in (within the unverified limit).

### 2. Supabase Dashboard
- **Authentication > Providers**: Enable Google.
  - Insert `Client ID` and `Client Secret` from Google Cloud.
- **Authentication > URL Configuration**:
  - **Site URL**: 
    - Development: `http://localhost:3000`
    - Production: `https://www.lumo.homes`
  - **Redirect URIs**: Can be left empty. Supabase automatically trusts any redirect that matches the **Site URL** (and its sub-paths).

### 3. Environment Variables
Ensure these vary between your environment:
- **Local (`.env.local`)**: Uses your development project keys.
- **Production (Vercel)**: Uses your production project keys.
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

---

## Key Behaviors

### Account Switching
We use `prompt: 'select_account'` in the OAuth options. This ensures that even if a user is already logged into Google, they are shown the selection screen, allowing them to switch accounts or login with a different email.

### Session Persistence
Auth is session-based and persists via browser cookies.
- **Sign Out**: Clears Lumo cookies but **does not** log the user out of Google.
- **Sign In**: The Google account selection screen will always be shown (even if previously authorized) due to the `prompt: 'select_account'` configuration. This ensures users can always choose or switch accounts.

### Real-Time Sync
The `AuthProvider` (`components/dashboard/auth/auth-provider.tsx`) acts as the "heartbeat":
- **On Mount**: Checks for an existing session via `getSession()`.
- **On Change**: Listens for any state shifts (login, logout, token refresh) via `onAuthStateChange` and updates the global Zustand store instantly.

---

## Structure
All auth logic is colocated in `components/dashboard/auth/`:
- `store.ts`: Zustand state (user, loading).
- `use-auth.ts`: Hook providing `signInWithGoogle` and `signOut`.
- `auth-provider.tsx`: Root-level listener for the dashboard.
- `index.ts`: Public API for the feature.
