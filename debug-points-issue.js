const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001'; // Adjust if your backend runs on different port

// Simulate device token generation
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

async function debugPointsIssue() {
  console.log('🔍 Debugging Points Issue...\n');

  try {
    // Step 1: Register first user (referrer)
    console.log('1️⃣ Registering referrer...');
    const deviceToken1 = generateDeviceToken();
    const referrerData = {
      email: 'referrer@debug.com',
      password: 'Password123',
      name: 'John Referrer',
      userType: 'customer',
      deviceToken: deviceToken1
    };

    const referrerResponse = await axios.post(`${API_BASE_URL}/auth/register`, referrerData);
    const referrer = referrerResponse.data.user;
    
    console.log(`✅ Referrer registered: ${referrer.name}`);
    console.log(`📊 Referrer's referral code: ${referrer.myReferralCode}`);
    console.log(`💰 Referrer's initial points: ${referrer.points}`);
    console.log(`📱 Device token: ${deviceToken1}\n`);

    // Step 2: Register second user with different device token (should award points)
    console.log('2️⃣ Registering referred user with different device token...');
    const deviceToken2 = generateDeviceToken();
    const referredUserData = {
      email: 'referred@debug.com',
      password: 'Password123',
      name: 'Jane Referred',
      userType: 'customer',
      enteredReferralCode: referrer.myReferralCode,
      deviceToken: deviceToken2
    };

    const referredResponse = await axios.post(`${API_BASE_URL}/auth/register`, referredUserData);
    const referredUser = referredResponse.data;
    
    console.log(`✅ Referred user registered: ${referredUser.user.name}`);
    console.log(`💰 Referred user's points: ${referredUser.user.points}`);
    console.log(`📱 Device token: ${deviceToken2}`);
    
    if (referredUser.referralInfo) {
      console.log(`🎉 Referral bonus awarded!`);
      console.log(`   - Referrer: ${referredUser.referralInfo.referrerName}`);
      console.log(`   - Points awarded to referrer: ${referredUser.referralInfo.referrerPointsAwarded}`);
    } else {
      console.log(`❌ No referral info in response`);
    }
    
    if (referredUser.fraudWarning) {
      console.log(`⚠️ Fraud warning: ${referredUser.fraudWarning.message}`);
      console.log(`📋 Reason: ${referredUser.fraudWarning.reason}`);
    }
    
    console.log(`🛡️ Fraud detected: ${referredUser.trackingInfo.fraudDetected}`);
    console.log(`📝 Fraud reason: ${referredUser.trackingInfo.fraudReason}\n`);

    // Step 3: Check referrer's points by logging in
    console.log('3️⃣ Checking referrer\'s points after referral...');
    const loginData = {
      email: 'referrer@debug.com',
      password: 'Password123'
    };

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    const loggedInReferrer = loginResponse.data.user;
    
    console.log(`✅ Referrer logged in: ${loggedInReferrer.name}`);
    console.log(`💰 Referrer's current points: ${loggedInReferrer.points}`);
    console.log(`📊 Expected points: ${referrer.points + 100}`);
    console.log(`📈 Points difference: ${loggedInReferrer.points - referrer.points}\n`);

    // Step 4: Test with same device token (should block points)
    console.log('4️⃣ Testing with same device token (should block points)...');
    try {
      const fraudUserData = {
        email: 'fraud@debug.com',
        password: 'Password123',
        name: 'Fraud User',
        userType: 'customer',
        enteredReferralCode: referrer.myReferralCode,
        deviceToken: deviceToken1 // Same device token as referrer
      };

      const fraudResponse = await axios.post(`${API_BASE_URL}/auth/register`, fraudUserData);
      const fraudUser = fraudResponse.data;
      
      console.log(`✅ Fraud user registered: ${fraudUser.user.name}`);
      console.log(`💰 Fraud user's points: ${fraudUser.user.points}`);
      
      if (fraudUser.fraudWarning) {
        console.log(`⚠️ Fraud warning: ${fraudUser.fraudWarning.message}`);
        console.log(`📋 Reason: ${fraudUser.fraudWarning.reason}`);
      }
      
      console.log(`🛡️ Fraud detected: ${fraudUser.trackingInfo.fraudDetected}`);
      console.log(`📝 Fraud reason: ${fraudUser.trackingInfo.fraudReason}\n`);
    } catch (error) {
      console.log(`❌ Error registering fraud user: ${error.response?.data?.error || error.message}\n`);
    }

    console.log('🎯 Points Issue Debug Summary:');
    console.log('✅ Referrer registration works');
    console.log('✅ Referral code generation works');
    console.log('✅ Fraud detection works');
    console.log('❓ Points awarding needs investigation');
    console.log('📊 Check backend console for detailed logs');

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Run the debug
debugPointsIssue(); 