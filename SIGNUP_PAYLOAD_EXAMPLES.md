# Signup Payload Examples

## Overview

The signup endpoint accepts different payload structures based on user type and whether a referral code is being used. The frontend automatically includes device tokens for fraud detection.

## 🚀 **Basic Customer Signup (No Referral)**

### **Request Payload:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "userType": "customer",
  "deviceToken": "a1b2c3d4"
}
```

### **Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "userType": "customer",
    "points": 0,
    "myReferralCode": "ABC123DEF",
    "enteredReferralCode": null,
    "registrationIP": "192.168.1.100",
    "registrationIPs": ["192.168.1.100", "10.0.0.1"],
    "registrationDeviceToken": "a1b2c3d4",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "referralInfo": null,
  "fraudWarning": null,
  "trackingInfo": {
    "registrationIP": "192.168.1.100",
    "registrationIPs": ["192.168.1.100", "10.0.0.1"],
    "registrationDeviceToken": "a1b2c3d4",
    "fraudDetected": false,
    "fraudReason": null
  }
}
```

---

## 🎯 **Customer Signup with Valid Referral**

### **Request Payload:**
```json
{
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Smith",
  "userType": "customer",
  "enteredReferralCode": "ABC123DEF",
  "deviceToken": "e5f6g7h8"
}
```

### **Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "userType": "customer",
    "points": 0,
    "myReferralCode": "DEF456GHI",
    "enteredReferralCode": "ABC123DEF",
    "registrationIP": "192.168.1.101",
    "registrationIPs": ["192.168.1.101"],
    "registrationDeviceToken": "e5f6g7h8",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "referralInfo": {
    "referrerName": "John Doe",
    "pointsAwarded": 0,
    "referrerPointsAwarded": 100
  },
  "fraudWarning": null,
  "trackingInfo": {
    "registrationIP": "192.168.1.101",
    "registrationIPs": ["192.168.1.101"],
    "registrationDeviceToken": "e5f6g7h8",
    "fraudDetected": false,
    "fraudReason": null
  }
}
```

---

## 🏪 **Artisan Signup (Business Account)**

### **Request Payload:**
```json
{
  "email": "artisan@business.com",
  "password": "SecurePassword123!",
  "name": "Artisan Business",
  "userType": "artisan",
  "businessName": "Crafty Creations",
  "businessCategory": "handmade",
  "businessDescription": "Handcrafted jewelry and accessories",
  "phone": "+1234567890",
  "country": "Nigeria",
  "city": "Lagos",
  "website": "https://craftycreations.com",
  "enteredReferralCode": "ABC123DEF",
  "deviceToken": "i9j0k1l2"
}
```

### **Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "email": "artisan@business.com",
    "name": "Artisan Business",
    "userType": "artisan",
    "points": 0,
    "myReferralCode": "GHI789JKL",
    "enteredReferralCode": "ABC123DEF",
    "businessName": "Crafty Creations",
    "businessCategory": "handmade",
    "businessDescription": "Handcrafted jewelry and accessories",
    "phone": "+1234567890",
    "country": "Nigeria",
    "city": "Lagos",
    "website": "https://craftycreations.com",
    "registrationIP": "192.168.1.102",
    "registrationIPs": ["192.168.1.102"],
    "registrationDeviceToken": "i9j0k1l2",
    "createdAt": "2024-01-15T10:40:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "referralInfo": {
    "referrerName": "John Doe",
    "pointsAwarded": 0,
    "referrerPointsAwarded": 100
  },
  "fraudWarning": null,
  "trackingInfo": {
    "registrationIP": "192.168.1.102",
    "registrationIPs": ["192.168.1.102"],
    "registrationDeviceToken": "i9j0k1l2",
    "fraudDetected": false,
    "fraudReason": null
  }
}
```

---

## ⚠️ **Signup with Fraud Detection**

### **Request Payload (Same Device Token):**
```json
{
  "email": "fraud.user@example.com",
  "password": "SecurePassword123!",
  "name": "Fraud User",
  "userType": "customer",
  "enteredReferralCode": "ABC123DEF",
  "deviceToken": "a1b2c3d4"
}
```

### **Response (Fraud Detected):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "email": "fraud.user@example.com",
    "name": "Fraud User",
    "userType": "customer",
    "points": 0,
    "myReferralCode": "MNO012PQR",
    "enteredReferralCode": "ABC123DEF",
    "registrationIP": "192.168.1.100",
    "registrationIPs": ["192.168.1.100"],
    "registrationDeviceToken": "a1b2c3d4",
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  },
  "referralInfo": null,
  "fraudWarning": {
    "message": "Referral points blocked due to fraud detection",
    "reason": "Same device token detected - potential self-referral fraud",
    "details": "Account created successfully but referral points were not awarded due to fraud detection rules"
  },
  "trackingInfo": {
    "registrationIP": "192.168.1.100",
    "registrationIPs": ["192.168.1.100"],
    "registrationDeviceToken": "a1b2c3d4",
    "fraudDetected": true,
    "fraudReason": "Same device token detected - potential self-referral fraud"
  }
}
```

---

## 📋 **Complete Payload Field Reference**

### **Required Fields:**
```json
{
  "email": "string",           // User's email address (unique)
  "password": "string",        // User's password (min 6 chars)
  "name": "string",           // User's full name
  "userType": "string"        // "customer" or "artisan"
}
```

### **Optional Fields:**
```json
{
  "enteredReferralCode": "string",  // Referral code from another user
  "deviceToken": "string",          // Device token for fraud detection
  "businessName": "string",         // Required for artisans
  "businessCategory": "string",     // Required for artisans
  "businessDescription": "string",  // Required for artisans
  "phone": "string",               // Required for artisans
  "country": "string",             // Required for artisans
  "city": "string",                // Required for artisans
  "website": "string"              // Optional for artisans
}
```

### **Artisan-Specific Required Fields:**
When `userType` is `"artisan"`, these fields become required:
- `businessName`
- `businessCategory`
- `businessDescription`
- `phone`
- `country`
- `city`

---

## 🔧 **Frontend Implementation**

### **JavaScript/TypeScript Example:**
```javascript
import { getDeviceToken } from '@/lib/device-token';

const handleSignup = async (formData) => {
  try {
    // Get device token automatically
    const deviceToken = await getDeviceToken();
    
    // Prepare payload
    const payload = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      userType: formData.userType,
      deviceToken: deviceToken
    };
    
    // Add referral code if provided
    if (formData.enteredReferralCode) {
      payload.enteredReferralCode = formData.enteredReferralCode;
    }
    
    // Add artisan fields if applicable
    if (formData.userType === 'artisan') {
      payload.businessName = formData.businessName;
      payload.businessCategory = formData.businessCategory;
      payload.businessDescription = formData.businessDescription;
      payload.phone = formData.phone;
      payload.country = formData.country;
      payload.city = formData.city;
      if (formData.website) {
        payload.website = formData.website;
      }
    }
    
    // Send request
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Handle successful registration
      console.log('Registration successful:', data);
      
      // Check for fraud warning
      if (data.fraudWarning) {
        console.warn('Fraud detected:', data.fraudWarning);
      }
      
      // Show tracking info for debugging
      console.log('Tracking info:', data.trackingInfo);
    } else {
      // Handle error
      console.error('Registration failed:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### **React Hook Example:**
```javascript
import { useState } from 'react';
import { getDeviceToken } from '@/lib/device-token';

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fraudWarning, setFraudWarning] = useState(null);
  
  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    setFraudWarning(null);
    
    try {
      const deviceToken = await getDeviceToken();
      const payload = {
        ...formData,
        deviceToken
      };
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.fraudWarning) {
          setFraudWarning(data.fraudWarning);
        }
        return data;
      } else {
        setError(data.error);
        return null;
      }
    } catch (err) {
      setError('Network error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { signup, loading, error, fraudWarning };
};
```

---

## 🧪 **Testing Payloads**

### **Valid Customer Signup:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User",
    "userType": "customer",
    "deviceToken": "test1234"
  }'
```

### **Valid Artisan Signup:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artisan@example.com",
    "password": "Password123",
    "name": "Artisan User",
    "userType": "artisan",
    "businessName": "My Business",
    "businessCategory": "handmade",
    "businessDescription": "Handcrafted items",
    "phone": "+1234567890",
    "country": "Nigeria",
    "city": "Lagos",
    "deviceToken": "artisan123"
  }'
```

### **Signup with Referral:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "referred@example.com",
    "password": "Password123",
    "name": "Referred User",
    "userType": "customer",
    "enteredReferralCode": "ABC123DEF",
    "deviceToken": "referred123"
  }'
```

---

## 📝 **Notes**

1. **Device Token**: Automatically generated by frontend, no user input required
2. **IP Addresses**: Automatically captured by backend middleware
3. **Fraud Detection**: Runs automatically when referral code is provided
4. **Response Format**: Always includes tracking information for transparency
5. **Error Handling**: Clear error messages for validation failures
6. **Security**: Password validation and email uniqueness enforced 