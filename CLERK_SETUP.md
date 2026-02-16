# Clerk Setup for SimpleClaw

## Account Created
- **Clerk Account**: mavismavis1124@gmail.com (via Google auth)
- **Organization**: Personal workspace

## Next Steps (Manual via Dashboard)

Since browser session dropped, complete setup manually:

1. Go to https://dashboard.clerk.com/apps/new
2. Application name: **SimpleClaw**
3. Enable: Google ✓, Email ✓
4. Create application

## After Creation - Get API Keys

From Clerk Dashboard → SimpleClaw → API Keys:

```bash
# Add to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Code Integration (Next.js)

Install:
```bash
npm install @clerk/nextjs
```

Update `app/layout.tsx`:
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

Create `app/sign-in/[[...sign-in]]/page.tsx`:
```typescript
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <SignIn />
}
```

Create `app/dashboard/page.tsx`:
```typescript
import { auth, currentUser } from '@clerk/nextjs'

export default async function Dashboard() {
  const { userId } = auth()
  const user = await currentUser()
  
  if (!userId) return <div>Not signed in</div>
  
  return (
    <div>
      <h1>Welcome {user?.firstName}</h1>
      {/* Bot token submission form goes here */}
    </div>
  )
}
```

Update middleware.ts:
```typescript
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up', '/api/webhook']
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
```

## Auth Flow

1. User clicks "Get Started" on landing page
2. Redirected to `/sign-in` with Google option
3. After auth → `/dashboard` with bot token submission
4. Bot deployed under their user ID

---

**Status**: Clerk account ready, need manual app creation + API keys
**ETA**: 10 mins once you paste keys
