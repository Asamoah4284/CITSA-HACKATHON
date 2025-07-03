# Fraud Detection System - Complete Check List

## Overview

The fraud detection system uses **7 different checks** across **3 categories** to prevent referral fraud while allowing legitimate users to register.

## 🛡️ **Fraud Detection Categories**

### **1. Device Token Checks (2 checks)**
### **2. IP Address Checks (3 checks)**  
### **3. Historical Usage Checks (2 checks)**

---

## 📱 **1. Device Token Checks**

### **Check #1: Same Device Token as Referrer**
```javascript
// Check if device token matches the referrer's registration device token
if (referrer.registrationDeviceToken && deviceToken && 
    referrer.registrationDeviceToken === deviceToken) {
  return { isFraud: true, reason: 'Same device token detected - potential self-referral fraud' };
}
```
**What it detects:** User trying to refer themselves using the same device
**Example:** User A registers with device token "abc123", then tries to create another account with the same device token using their own referral code

### **Check #2: Previously Used Device Token**
```javascript
// Check if device token is in the referrer's used device tokens
if (deviceToken && referrer.usedDeviceTokens && referrer.usedDeviceTokens.length > 0) {
  const hasUsedDeviceToken = referrer.usedDeviceTokens.some(tokenRecord => tokenRecord.token === deviceToken);
  if (hasUsedDeviceToken) {
    return { isFraud: true, reason: 'Device token previously used by referrer - potential fraud' };
  }
}
```
**What it detects:** User trying to use a device token that the referrer has used before
**Example:** User A uses device token "abc123", then User B tries to use the same device token with User A's referral code

---

## 🌐 **2. IP Address Checks**

### **Check #3: Same Primary IP as Referrer**
```javascript
// Check if any of the client IPs match the referrer's registration IP
if (referrer.registrationIP && clientIPs.includes(referrer.registrationIP)) {
  return { isFraud: true, reason: 'Same IP address detected - potential self-referral fraud' };
}
```
**What it detects:** User trying to refer themselves from the same IP address
**Example:** User A registers from IP "192.168.1.100", then tries to create another account from the same IP using their own referral code

### **Check #4: Same IP Chain as Referrer**
```javascript
// Check if any of the client IPs match any of the referrer's registration IPs
if (referrer.registrationIPs && referrer.registrationIPs.length > 0) {
  const matchingIPs = clientIPs.filter(ip => referrer.registrationIPs.includes(ip));
  if (matchingIPs.length > 0) {
    return { isFraud: true, reason: `Same IP address detected (${matchingIPs.join(', ')}) - potential self-referral fraud` };
  }
}
```
**What it detects:** User trying to refer themselves from any IP in the referrer's IP chain
**Example:** User A registers with IPs ["192.168.1.100", "10.0.0.1"], then tries to create another account from either IP using their own referral code

### **Check #5: Previously Used IP by Referrer**
```javascript
// Check if any of the client IPs are in the referrer's used IPs
const referrerUsedIPs = referrer.usedIPs.map(ipRecord => ipRecord.ip);
const matchingUsedIPs = clientIPs.filter(ip => referrerUsedIPs.includes(ip));
if (matchingUsedIPs.length > 0) {
  return { isFraud: true, reason: `IP address previously used by referrer (${matchingUsedIPs.join(', ')}) - potential fraud` };
}
```
**What it detects:** User trying to use an IP address that the referrer has used before
**Example:** User A uses IP "192.168.1.100", then User B tries to use the same IP with User A's referral code

---

## 📚 **3. Historical Usage Checks**

### **Check #6: IP Already Used with This Referral Code**
```javascript
// Check if any user with any of these IPs has used this referral code before
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
**What it detects:** Multiple users trying to use the same IP address with the same referral code
**Example:** User A uses IP "192.168.1.100" with referral code "ABC123", then User B tries to use the same IP with the same referral code

### **Check #7: Device Token Already Used with This Referral Code**
```javascript
// Add device token check if provided
if (deviceToken) {
  existingUserQuery.$or.push(
    { 'usedDeviceTokens.token': deviceToken },
    { registrationDeviceToken: deviceToken }
  );
}
```
**What it detects:** Multiple users trying to use the same device token with the same referral code
**Example:** User A uses device token "abc123" with referral code "ABC123", then User B tries to use the same device token with the same referral code

---

## 🚫 **Additional Blocking Checks**

### **Self-Referral by Email (Blocks Registration)**
```javascript
// Prevent self-referral by email (this still blocks registration)
if (referrer.email === email) {
  return res.status(400).json({ error: 'You cannot refer yourself' });
}
```
**What it detects:** User trying to use their own email address as a referral
**Action:** Completely blocks registration (not just points)

---

## 📊 **Fraud Detection Flow**

```
Registration Request
         ↓
1. Extract Device Token & IPs
         ↓
2. Validate Referral Code
         ↓
3. Run Fraud Detection Checks
         ↓
   ┌─────────────────┐
   │ Check #1-7      │
   │ (in order)      │
   └─────────────────┘
         ↓
4. Determine Result:
   ├─ Fraud Detected → Block Points, Allow Registration
   └─ No Fraud → Award Points
         ↓
5. Track IPs & Device Tokens
         ↓
6. Return Response with Tracking Info
```

---

## 🎯 **Detection Scenarios**

### **Scenario 1: Same Device, Different IP**
- **Device Token:** Same as referrer
- **IP Address:** Different from referrer
- **Result:** ❌ Fraud detected (Check #1)
- **Action:** Block points, allow registration

### **Scenario 2: Different Device, Same IP**
- **Device Token:** Different from referrer
- **IP Address:** Same as referrer
- **Result:** ❌ Fraud detected (Check #3 or #4)
- **Action:** Block points, allow registration

### **Scenario 3: Same Device, Same IP**
- **Device Token:** Same as referrer
- **IP Address:** Same as referrer
- **Result:** ❌ Fraud detected (Check #1, #3, #4)
- **Action:** Block points, allow registration

### **Scenario 4: Different Device, Different IP**
- **Device Token:** Different from referrer
- **IP Address:** Different from referrer
- **Result:** ✅ No fraud detected
- **Action:** Award points to referrer

### **Scenario 5: Previously Used Device/IP**
- **Device Token:** Previously used by referrer
- **IP Address:** Previously used by referrer
- **Result:** ❌ Fraud detected (Check #2, #5)
- **Action:** Block points, allow registration

---

## 🔧 **Configuration**

### **Points System**
- **Referrer gets:** 100 points for successful referral
- **New user gets:** 0 points (no bonus for using referral code)

### **Fraud Response**
- **Registration:** Always allowed
- **Points:** Blocked if fraud detected
- **Warning:** Clear explanation provided

### **Tracking**
- **IP Addresses:** All IPs in request chain tracked
- **Device Tokens:** All device tokens tracked
- **History:** Complete audit trail maintained

---

## 🧪 **Testing**

Run the comprehensive test script to verify all checks:
```bash
node test-device-token-fraud-detection.js
```

This tests all 7 fraud detection checks and various scenarios.

---

## 📈 **Effectiveness**

### **Strengths:**
- ✅ **Multi-layer protection** (7 different checks)
- ✅ **Device + IP tracking** (comprehensive coverage)
- ✅ **Historical analysis** (prevents repeated abuse)
- ✅ **User-friendly** (allows registration, blocks only points)
- ✅ **Transparent** (clear fraud warnings)

### **Limitations:**
- ⚠️ **VPN/Proxy bypass** (can be circumvented with advanced tools)
- ⚠️ **Device token clearing** (users can clear localStorage)
- ⚠️ **Shared networks** (legitimate users on same network)

### **Mitigation:**
- 🔒 **Multiple detection layers** reduce bypass effectiveness
- 🔒 **Historical tracking** catches repeated attempts
- 🔒 **Clear warnings** discourage abuse
- 🔒 **Regular monitoring** for pattern detection 