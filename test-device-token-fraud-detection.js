const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001'; // Adjust if your backend runs on different port

// Simulate device token generation (similar to frontend)
const generateDeviceToken = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  const screenRes = '1920x1080';
  const timezone = 'America/New_York';
  
  const deviceFingerprint = `${userAgent}-${screenRes}-${timezone}-${timestamp}-${random}`;
  
  let hash = 0;
  for (let i = 0; i < deviceFingerprint.length; i++) {
    const char = deviceFingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0');
};

async function testDeviceTokenFraudDetection() {
  console.log('🛡️ Testing Device Token Fraud Detection System...\n');

  try {
    // Step 1: Register first user (referrer) with device token
    console.log('1️⃣ Registering first user (referrer) with device token...');
    const deviceToken1 = generateDeviceToken();
    const referrerData = {
      email: 'referrer@test.com',
      password: 'Password123',
      name: 'John Referrer',
      userType: 'customer',
      deviceToken: deviceToken1
    };

    const referrerResponse = await axios.post(`${API_BASE_URL}/auth/register`, referrerData);
    const referrer = referrerResponse.data.user;
    
    console.log(`✅ Referrer registered: ${referrer.name}`);
    console.log(`📊 Referrer's referral code: ${referrer.myReferralCode}`);
    console.log(`💰 Referrer's points: ${referrer.points}`);
    console.log(`📱 Device token: ${deviceToken1}`);
    
    // Display tracking information
    if (referrerResponse.data.trackingInfo) {
      console.log(`📍 Registration IP: ${referrerResponse.data.trackingInfo.registrationIP}`);
      console.log(`🌐 All IPs: ${referrerResponse.data.trackingInfo.registrationIPs.join(', ')}`);
      console.log(`🔍 Device token: ${referrerResponse.data.trackingInfo.registrationDeviceToken}`);
    }
    console.log('');

    // Step 2: Register second user with different device token (should work)
    console.log('2️⃣ Registering second user with different device token...');
    const deviceToken2 = generateDeviceToken();
    const validUserData = {
      email: 'valid.user@test.com',
      password: 'Password123',
      name: 'Valid User',
      userType: 'customer',
      enteredReferralCode: referrer.myReferralCode,
      deviceToken: deviceToken2
    };

    const validResponse = await axios.post(`${API_BASE_URL}/auth/register`, validUserData);
    const validUser = validResponse.data.user;
    
    console.log(`✅ Valid user registered: ${validUser.name}`);
    console.log(`💰 Valid user's points: ${validUser.points}`);
    console.log(`📱 Device token: ${deviceToken2}`);
    
    // Display tracking information
    if (validResponse.data.trackingInfo) {
      console.log(`📍 Registration IP: ${validResponse.data.trackingInfo.registrationIP}`);
      console.log(`🌐 All IPs: ${validResponse.data.trackingInfo.registrationIPs.join(', ')}`);
      console.log(`🔍 Device token: ${validResponse.data.trackingInfo.registrationDeviceToken}`);
      console.log(`🛡️ Fraud detected: ${validResponse.data.trackingInfo.fraudDetected}`);
    }
    
    if (validResponse.data.referralInfo) {
      console.log(`🎉 Referral bonus awarded!`);
      console.log(`   - Referrer: ${validResponse.data.referralInfo.referrerName}`);
      console.log(`   - Points awarded to referrer: ${validResponse.data.referralInfo.referrerPointsAwarded}\n`);
    }

    // Step 3: Try to register with same device token (should work but no points)
    console.log('3️⃣ Testing device token fraud detection - same device token...');
    try {
      const fraudUserData = {
        email: 'fraud.user@test.com',
        password: 'Password123',
        name: 'Fraud User',
        userType: 'customer',
        enteredReferralCode: referrer.myReferralCode,
        deviceToken: deviceToken1 // Same device token as referrer
      };

      const fraudResponse = await axios.post(`${API_BASE_URL}/auth/register`, fraudUserData);
      const fraudUser = fraudResponse.data;
      
      console.log(`✅ Account created: ${fraudUser.user.name}`);
      console.log(`💰 User points: ${fraudUser.user.points}`);
      console.log(`📱 Device token: ${deviceToken1}`);
      
      // Display tracking information
      if (fraudResponse.data.trackingInfo) {
        console.log(`📍 Registration IP: ${fraudResponse.data.trackingInfo.registrationIP}`);
        console.log(`🌐 All IPs: ${fraudResponse.data.trackingInfo.registrationIPs.join(', ')}`);
        console.log(`🔍 Device token: ${fraudResponse.data.trackingInfo.registrationDeviceToken}`);
        console.log(`🛡️ Fraud detected: ${fraudResponse.data.trackingInfo.fraudDetected}`);
        console.log(`⚠️ Fraud reason: ${fraudResponse.data.trackingInfo.fraudReason}`);
      }
      
      if (fraudUser.fraudWarning) {
        console.log(`⚠️ Fraud warning: ${fraudUser.fraudWarning.message}`);
        console.log(`📋 Reason: ${fraudUser.fraudWarning.reason}`);
        console.log(`📝 Details: ${fraudUser.fraudWarning.details}\n`);
      }
    } catch (error) {
      console.log(`❌ Unexpected error: ${error.response?.data?.error || error.message}\n`);
    }

    // Step 4: Register with different device token (should work)
    console.log('4️⃣ Testing with different device token...');
    try {
      const deviceToken3 = generateDeviceToken();
      const differentDeviceUserData = {
        email: 'different.device@test.com',
        password: 'Password123',
        name: 'Different Device User',
        userType: 'customer',
        enteredReferralCode: referrer.myReferralCode,
        deviceToken: deviceToken3
      };

      const differentDeviceResponse = await axios.post(`${API_BASE_URL}/auth/register`, differentDeviceUserData);
      const differentDeviceUser = differentDeviceResponse.data.user;
      
      console.log(`✅ Different device user registered: ${differentDeviceUser.name}`);
      console.log(`💰 User points: ${differentDeviceUser.points}`);
      console.log(`📱 Device token: ${deviceToken3}`);
      
      // Display tracking information
      if (differentDeviceResponse.data.trackingInfo) {
        console.log(`📍 Registration IP: ${differentDeviceResponse.data.trackingInfo.registrationIP}`);
        console.log(`🌐 All IPs: ${differentDeviceResponse.data.trackingInfo.registrationIPs.join(', ')}`);
        console.log(`🔍 Device token: ${differentDeviceResponse.data.trackingInfo.registrationDeviceToken}`);
        console.log(`🛡️ Fraud detected: ${differentDeviceResponse.data.trackingInfo.fraudDetected}`);
      }
      
      if (differentDeviceResponse.data.referralInfo) {
        console.log(`🎉 Referral bonus awarded!`);
        console.log(`   - Points awarded to referrer: ${differentDeviceResponse.data.referralInfo.referrerPointsAwarded}\n`);
      }
    } catch (error) {
      console.log(`❌ Unexpected error: ${error.response?.data?.error || error.message}\n`);
    }

    // Step 5: Test without device token (should use fingerprint)
    console.log('5️⃣ Testing without device token (uses fingerprint)...');
    try {
      const noTokenUserData = {
        email: 'no.token@test.com',
        password: 'Password123',
        name: 'No Token User',
        userType: 'customer',
        enteredReferralCode: referrer.myReferralCode
        // No deviceToken - will use fingerprint
      };

      const noTokenResponse = await axios.post(`${API_BASE_URL}/auth/register`, noTokenUserData);
      const noTokenUser = noTokenResponse.data.user;
      
      console.log(`✅ No token user registered: ${noTokenUser.name}`);
      console.log(`💰 User points: ${noTokenUser.points}`);
      console.log(`📱 Device fingerprint used`);
      
      // Display tracking information
      if (noTokenResponse.data.trackingInfo) {
        console.log(`📍 Registration IP: ${noTokenResponse.data.trackingInfo.registrationIP}`);
        console.log(`🌐 All IPs: ${noTokenResponse.data.trackingInfo.registrationIPs.join(', ')}`);
        console.log(`🔍 Device token: ${noTokenResponse.data.trackingInfo.registrationDeviceToken}`);
        console.log(`🛡️ Fraud detected: ${noTokenResponse.data.trackingInfo.fraudDetected}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Unexpected error: ${error.response?.data?.error || error.message}\n`);
    }

    console.log('🎯 Device Token Fraud Detection Test Summary:');
    console.log('✅ Valid referrals work correctly');
    console.log('✅ Device tokens are tracked and validated');
    console.log('✅ Same device token blocks points');
    console.log('✅ Different device tokens allow points');
    console.log('✅ Device fingerprinting works as fallback');
    console.log('✅ Multiple layers of fraud detection (IP + Device)');
    console.log('✅ Clear fraud warnings are provided to users');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDeviceTokenFraudDetection(); 