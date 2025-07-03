# Fraud Detection Check Flow - Step by Step

## 🔍 **How the Check is Performed**

The fraud detection happens in the `User.checkForFraud()` method when a user registers with a referral code. Here's exactly how it works:

---

## 📋 **Step 1: Method Call**

```javascript
// Called from registration route
const fraudCheck = await User.checkForFraud(enteredReferralCode, req.clientIPs, deviceToken);
```

**Parameters:**
- `enteredReferralCode`: The referral code the user entered (e.g., "ABC123DEF")
- `req.clientIPs`: Array of IP addresses from the request (e.g., ["192.168.1.100", "10.0.0.1"])
- `deviceToken`: Device token from frontend (e.g., "a1b2c3d4")

---

## 🔍 **Step 2: Find the Referrer**

```javascript
// Find the referrer by their referral code
const referrer = await this.findByReferralCode(referrerCode);
if (!referrer) {
  throw new Error('Invalid referral code');
}
```

**What happens:**
- Searches database for user with `myReferralCode: "ABC123DEF"`
- If not found → throws error "Invalid referral code"
- If found → continues with fraud checks

**Example referrer data:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "John Doe",
  "email": "john@example.com",
  "myReferralCode": "ABC123DEF",
  "registrationIP": "192.168.1.100",
  "registrationIPs": ["192.168.1.100", "10.0.0.1"],
  "registrationDeviceToken": "a1b2c3d4",
  "usedIPs": [
    {"ip": "192.168.1.101", "usedAt": "2024-01-15T10:35:00.000Z"}
  ],
  "usedDeviceTokens": [
    {"token": "e5f6g7h8", "usedAt": "2024-01-15T10:35:00.000Z"}
  ]
}
```

---

## 🛡️ **Step 3: Run Fraud Detection Checks (7 Checks)**

### **Check #1: Same Device Token as Referrer**
```javascript
if (referrer.registrationDeviceToken && deviceToken && 
    referrer.registrationDeviceToken === deviceToken) {
  return {
    isFraud: true,
    reason: 'Same device token detected - potential self-referral fraud',
    referrer: referrer,
    allowRegistration: true,
    allowPoints: false
  };
}
```

**Logic:** `"a1b2c3d4" === "a1b2c3d4"` → **FRAUD DETECTED**

### **Check #2: Previously Used Device Token**
```javascript
if (deviceToken && referrer.usedDeviceTokens && referrer.usedDeviceTokens.length > 0) {
  const hasUsedDeviceToken = referrer.usedDeviceTokens.some(tokenRecord => tokenRecord.token === deviceToken);
  if (hasUsedDeviceToken) {
    return { isFraud: true, reason: 'Device token previously used by referrer - potential fraud' };
  }
}
```

**Logic:** Check if `"a1b2c3d4"` exists in `["e5f6g7h8"]` → **NO FRAUD** (different tokens)

### **Check #3: Same Primary IP as Referrer**
```javascript
if (referrer.registrationIP && clientIPs.includes(referrer.registrationIP)) {
  return { isFraud: true, reason: 'Same IP address detected - potential self-referral fraud' };
}
```

**Logic:** Check if `"192.168.1.100"` exists in `["192.168.1.100", "10.0.0.1"]` → **FRAUD DETECTED**

### **Check #4: Same IP Chain as Referrer**
```javascript
if (referrer.registrationIPs && referrer.registrationIPs.length > 0) {
  const matchingIPs = clientIPs.filter(ip => referrer.registrationIPs.includes(ip));
  if (matchingIPs.length > 0) {
    return { isFraud: true, reason: `Same IP address detected (${matchingIPs.join(', ')}) - potential self-referral fraud` };
  }
}
```

**Logic:** Find common IPs between `["192.168.1.100", "10.0.0.1"]` and `["192.168.1.100", "10.0.0.1"]` → **FRAUD DETECTED** (both IPs match)

### **Check #5: Previously Used IP by Referrer**
```javascript
const referrerUsedIPs = referrer.usedIPs.map(ipRecord => ipRecord.ip);
const matchingUsedIPs = clientIPs.filter(ip => referrerUsedIPs.includes(ip));
if (matchingUsedIPs.length > 0) {
  return { isFraud: true, reason: `IP address previously used by referrer (${matchingUsedIPs.join(', ')}) - potential fraud` };
}
```

**Logic:** Check if any IP in `["192.168.1.100", "10.0.0.1"]` exists in `["192.168.1.101"]` → **NO FRAUD** (no matches)

### **Check #6: IP Already Used with This Referral Code**
```javascript
const existingUserQuery = {
  enteredReferralCode: referrerCode,
  $or: [
    { 'usedIPs.ip': { $in: clientIPs } },
    { registrationIP: { $in: clientIPs } },
    { registrationIPs: { $in: clientIPs } }
  ]
};
const existingUserWithIP = await this.findOne(existingUserQuery);
if (existingUserWithIP) {
  return { isFraud: true, reason: 'IP address already used with this referral code - potential fraud' };
}
```

**Logic:** Search database for any user who:
- Used referral code "ABC123DEF" AND
- Has any IP from `["192.168.1.100", "10.0.0.1"]`
→ **FRAUD DETECTED** (same IP used with same referral code)

### **Check #7: Device Token Already Used with This Referral Code**
```javascript
if (deviceToken) {
  existingUserQuery.$or.push(
    { 'usedDeviceTokens.token': deviceToken },
    { registrationDeviceToken: deviceToken }
  );
}
```

**Logic:** Search database for any user who:
- Used referral code "ABC123DEF" AND
- Has device token "a1b2c3d4"
→ **FRAUD DETECTED** (same device token used with same referral code)

---

## 📊 **Step 4: Return Result**

### **If Fraud Detected:**
```javascript
return {
  isFraud: true,
  reason: 'Same device token detected - potential self-referral fraud',
  referrer: referrer,
  allowRegistration: true,
  allowPoints: false
};
```

### **If No Fraud Detected:**
```javascript
return {
  isFraud: false,
  referrer: referrer,
  allowRegistration: true,
  allowPoints: true
};
```

---

## 🔄 **Step 5: Registration Route Processing**

```javascript
// In registration route
fraudCheck = await User.checkForFraud(enteredReferralCode, req.clientIPs, deviceToken);

if (fraudCheck.isFraud) {
  fraudDetected = true;
  fraudReason = fraudCheck.reason;
  referrer = fraudCheck.referrer;
} else {
  referrer = fraudCheck.referrer;
}

// Create user (always allowed)
const user = new User(userData);
await user.save();

// Award points only if no fraud detected
if (enteredReferralCode && referrer && !fraudDetected) {
  referralResult = await User.awardReferralPoints(enteredReferralCode, user._id);
}
```

---

## 🎯 **Example Scenarios**

### **Scenario 1: Same Device, Different IP**
```javascript
// Referrer data
referrer.registrationDeviceToken = "a1b2c3d4"
referrer.registrationIP = "192.168.1.100"

// New user data
deviceToken = "a1b2c3d4"  // Same device token
clientIPs = ["192.168.1.101"]  // Different IP

// Check #1: "a1b2c3d4" === "a1b2c3d4" → FRAUD DETECTED
// Result: Points blocked, registration allowed
```

### **Scenario 2: Different Device, Same IP**
```javascript
// Referrer data
referrer.registrationDeviceToken = "a1b2c3d4"
referrer.registrationIP = "192.168.1.100"

// New user data
deviceToken = "e5f6g7h8"  // Different device token
clientIPs = ["192.168.1.100"]  // Same IP

// Check #3: "192.168.1.100" in ["192.168.1.100"] → FRAUD DETECTED
// Result: Points blocked, registration allowed
```

### **Scenario 3: Different Device, Different IP**
```javascript
// Referrer data
referrer.registrationDeviceToken = "a1b2c3d4"
referrer.registrationIP = "192.168.1.100"

// New user data
deviceToken = "e5f6g7h8"  // Different device token
clientIPs = ["192.168.1.101"]  // Different IP

// All checks pass → NO FRAUD
// Result: Points awarded, registration allowed
```

---

## 📝 **Key Points**

1. **Checks run in order** - First fraud detection stops the process
2. **Registration always allowed** - Only points are blocked
3. **Multiple detection layers** - Device tokens + IP addresses
4. **Historical tracking** - Previous usage patterns are checked
5. **Clear feedback** - Specific reason provided for fraud detection

The system provides comprehensive fraud protection while maintaining a good user experience! 🚀 