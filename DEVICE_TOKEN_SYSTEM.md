# Device Token Fraud Detection System

## Overview

The device token system enhances fraud detection by tracking unique device identifiers in addition to IP addresses. This provides multiple layers of protection against referral fraud.

## How It Works

### 1. Device Token Generation

**Frontend (localStorage-based):**
- Generates a unique token based on device characteristics
- Stores token in localStorage for persistence across sessions
- Uses browser fingerprinting as fallback

**Backend (Server-side):**
- Validates device tokens from requests
- Generates device fingerprints from request headers
- Tracks device tokens in user profiles

### 2. Fraud Detection Layers

1. **Device Token Matching**: Check if new user's device token matches referrer's
2. **IP Address Matching**: Check if IP addresses overlap
3. **Historical Tracking**: Check if device token was previously used
4. **Combined Validation**: Multiple checks for comprehensive protection

## Implementation Details

### Backend Changes

#### User Model (`Back-end/models/User.js`)
```javascript
// New fields added:
registrationDeviceToken: String,  // Device token at registration
usedDeviceTokens: [{              // All device tokens used
  token: String,
  usedAt: Date
}]
```

#### Fraud Detection Method
```javascript
// Enhanced fraud detection with device tokens
User.checkForFraud(referrerCode, clientIPs, deviceToken)
```

#### Registration Route (`Back-end/routes/auth.js`)
- Accepts `deviceToken` in request body
- Falls back to device fingerprint if no token provided
- Tracks device tokens for both referrer and new user

### Frontend Changes

#### Device Token Utility (`frontend/lib/device-token.js`)
```javascript
// Key functions:
getDeviceToken()        // Get or create device token
generateDeviceToken()   // Create new device token
clearDeviceToken()      // Remove device token
getDeviceInfo()         // Get device information
```

#### Signup Form (`frontend/app/signup/page.tsx`)
- Automatically includes device token in registration requests
- No user interaction required

## Usage Examples

### Valid Referral (Different Device)
```javascript
// User A registers with device token "abc123"
// User B registers with device token "def456" using A's referral code
// Result: Points awarded, no fraud detected
```

### Fraud Attempt (Same Device)
```javascript
// User A registers with device token "abc123"
// User B registers with device token "abc123" using A's referral code
// Result: Account created, points blocked, fraud warning returned
```

### API Response Examples

#### Successful Referral
```json
{
  "user": {
    "name": "John Doe",
    "points": 0,
    "myReferralCode": "ABC123"
  },
  "referralInfo": {
    "referrerName": "Jane Smith",
    "referrerPointsAwarded": 100
  }
}
```

#### Fraud Detected
```json
{
  "user": {
    "name": "John Doe",
    "points": 0,
    "myReferralCode": "ABC123"
  },
  "fraudWarning": {
    "message": "Referral points blocked due to fraud detection",
    "reason": "Same device token detected - potential self-referral fraud",
    "details": "Device token matches referrer's registration device"
  }
}
```

## Testing

Run the comprehensive test script:
```bash
node test-device-token-fraud-detection.js
```

This tests:
- ✅ Valid referrals with different device tokens
- ✅ Fraud detection with same device tokens
- ✅ Device fingerprinting fallback
- ✅ Multiple fraud detection layers
- ✅ Clear fraud warnings

## Security Features

### 1. Multi-Layer Detection
- Device token matching
- IP address tracking
- Historical usage patterns
- Combined validation

### 2. Persistent Tracking
- Device tokens stored in localStorage
- Server-side tracking of all used tokens
- Cross-session persistence

### 3. Fallback Mechanisms
- Device fingerprinting when no token available
- IP-based detection as backup
- Graceful degradation

### 4. User Experience
- Account creation always allowed
- Clear fraud warnings
- Transparent point blocking
- No disruption to normal registration

## Configuration

### Device Token Settings
- **Storage Key**: `kola_device_token` (localStorage)
- **Token Length**: 8-character hex string
- **Validation**: SHA256 format validation
- **Persistence**: Survives browser sessions

### Fraud Detection Settings
- **Points Awarded**: 100 to referrer, 0 to new user
- **Self-Referral**: Blocked by email matching
- **Device Matching**: Blocks points, allows registration
- **IP Matching**: Blocks points, allows registration

## Best Practices

1. **Always include device tokens** in registration requests
2. **Handle fraud warnings gracefully** in UI
3. **Provide clear user feedback** about point blocking
4. **Monitor fraud patterns** for system improvements
5. **Regular testing** of fraud detection scenarios

## Troubleshooting

### Common Issues

1. **Device token not generated**
   - Check localStorage access
   - Verify browser compatibility
   - Use device fingerprinting fallback

2. **False positive fraud detection**
   - Check device token uniqueness
   - Verify IP address handling
   - Review fraud detection logic

3. **Token persistence issues**
   - Clear localStorage and regenerate
   - Check browser privacy settings
   - Verify storage permissions

### Debug Information

Use `getDeviceInfo()` to get comprehensive device information:
```javascript
{
  userAgent: "Mozilla/5.0...",
  screenResolution: "1920x1080",
  timezone: "America/New_York",
  language: "en-US",
  platform: "Win32",
  deviceToken: "a1b2c3d4"
}
```

## Future Enhancements

1. **Advanced Fingerprinting**: Canvas, WebGL, audio fingerprinting
2. **Behavioral Analysis**: Typing patterns, mouse movements
3. **Machine Learning**: Pattern recognition for fraud detection
4. **Real-time Monitoring**: Live fraud detection dashboard
5. **Geolocation**: Location-based fraud detection 