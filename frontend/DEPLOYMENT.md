# Frontend Deployment Guide

This guide explains how to deploy the Kola frontend to Vercel with the Render backend.

## Environment Configuration

### Required Environment Variables

Set these environment variables in your Vercel project settings:

```bash
NEXT_PUBLIC_BACKEND_URL=https://citsa-hackathon-2.onrender.com
```

### Local Development

For local development, create a `.env.local` file in the frontend directory:

```bash
NEXT_PUBLIC_BACKEND_URL=https://citsa-hackathon-2.onrender.com
```

## API Configuration

The frontend uses a centralized API configuration system:

- **File**: `frontend/lib/api-config.ts`
- **Default Backend URL**: `https://citsa-hackathon-2.onrender.com`
- **Environment Variable**: `NEXT_PUBLIC_BACKEND_URL`

### API Configuration Functions

- `getBackendUrl()`: Returns the configured backend URL
- `getApiUrl(endpoint)`: Returns a full API URL for a given endpoint
- `testApiConfiguration()`: Logs configuration details for debugging

## API Call Patterns

### 1. Next.js API Routes (Recommended)

For authentication and sensitive operations, use Next.js API routes:

```typescript
// ✅ Good - Uses Next.js API route
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

### 2. Direct Backend Calls

For public data and non-sensitive operations, call the backend directly:

```typescript
// ✅ Good - Uses API configuration utility
import { getApiUrl } from '@/lib/api-config'

const response = await fetch(getApiUrl('/public/products'))
```

## Testing Configuration

### 1. API Status Component

Visit `/test-connection` to see the API configuration status and test backend connectivity.

### 2. Console Logging

The application logs API configuration details to the browser console:

```javascript
🔧 Backend URL Configuration:
  - NEXT_PUBLIC_BACKEND_URL: https://citsa-hackathon-2.onrender.com
  - Final Backend URL: https://citsa-hackathon-2.onrender.com
  - Node Environment: production
```

## Deployment Checklist

### Before Deployment

1. ✅ Set `NEXT_PUBLIC_BACKEND_URL` in Vercel environment variables
2. ✅ Verify all API calls use the configuration utility
3. ✅ Test the `/test-connection` page locally
4. ✅ Ensure no hardcoded localhost URLs remain

### After Deployment

1. ✅ Verify environment variables are set in Vercel
2. ✅ Test the `/test-connection` page on production
3. ✅ Check browser console for configuration logs
4. ✅ Test authentication flow
5. ✅ Test marketplace data loading

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from your Vercel domain
2. **Environment Variables Not Loading**: Check Vercel environment variable settings
3. **API Calls Failing**: Verify the backend URL is correct and accessible

### Debug Steps

1. Visit `/test-connection` to check configuration
2. Check browser console for API configuration logs
3. Verify environment variables in Vercel dashboard
4. Test backend connectivity directly

## File Structure

```
frontend/
├── lib/
│   └── api-config.ts          # API configuration utility
├── app/
│   ├── api/                   # Next.js API routes
│   │   └── auth/
│   │       ├── login/
│   │       └── register/
│   └── test-connection/       # Configuration test page
└── components/
    └── api-status.tsx         # Configuration status component
```

## Security Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Sensitive operations should go through Next.js API routes
- Public data can be fetched directly from the backend
- Always validate and sanitize data on both frontend and backend 