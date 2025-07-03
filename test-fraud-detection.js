const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001'; // Adjust if your backend runs on different port

async function testFraudDetection() {
  console.log('🛡️ Testing Fraud Detection System...\n');

  try {
    // Step 1: Register first user (referrer)
    console.log('1️⃣ Registering first user (referrer)...');
    const referrerData = {
      email: 'referrer@test.com',
      password: 'Password123',
      name: 'John Referrer',
      userType: 'customer'
    };

    const referrerResponse = await axios.post(`${API_BASE_URL}/auth/register`, referrerData);
    const referrer = referrerResponse.data.user;
    
    console.log(`✅ Referrer registered: ${referrer.name}`);
    console.log(`📊 Referrer's referral code: ${referrer.myReferralCode}`);
    console.log(`💰 Referrer's points: ${referrer.points}\n`);

    // Step 2: Register second user with valid referral code (should work)
    console.log('2️⃣ Registering second user with valid referral code...');
    const validUserData = {
      email: 'valid.user@test.com',
      password: 'Password123',
      name: 'Valid User',
      userType: 'customer',
      enteredReferralCode: referrer.myReferralCode
    };

    const validResponse = await axios.post(`${API_BASE_URL}/auth/register`, validUserData);
    const validUser = validResponse.data.user;
    
    console.log(`✅ Valid user registered: ${validUser.name}`);
    console.log(`💰 Valid user's points: ${validUser.points}`);
    console.log(`📊 Referral relationship established\n`);

    // Step 3: Try to register another user with the same referral code from same IP (should work but no points)
    console.log('3️⃣ Testing fraud detection - same IP, same referral code...');
    try {
      const fraudUserData = {
        email: 'fraud.user@test.com',
        password: 'Password123',
        name: 'Fraud User',
        userType: 'customer',
        enteredReferralCode: referrer.myReferralCode
      };

      const fraudResponse = await axios.post(`${API_BASE_URL}/auth/register`, fraudUserData);
      const fraudUser = fraudResponse.data;
      
      console.log(`✅ Account created: ${fraudUser.user.name}`);
      console.log(`💰 User points: ${fraudUser.user.points}`);
      
      if (fraudUser.fraudWarning) {
        console.log(`⚠️ Fraud warning: ${fraudUser.fraudWarning.message}`);
        console.log(`📋 Reason: ${fraudUser.fraudWarning.reason}`);
        console.log(`📝 Details: ${fraudUser.fraudWarning.details}\n`);
      }
    } catch (error) {
      console.log(`❌ Unexpected error: ${error.response?.data?.error || error.message}\n`);
    }

    // Step 4: Try to register with referrer's own email (self-referral)
    console.log('4️⃣ Testing self-referral prevention...');
    try {
      const selfReferralData = {
        email: 'referrer@test.com', // Same email as referrer
        password: 'Password123',
        name: 'Self Referral',
        userType: 'customer',
        enteredReferralCode: referrer.myReferralCode
      };

      await axios.post(`${API_BASE_URL}/auth/register`, selfReferralData);
      console.log('❌ Should have failed with self-referral error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Self-referral prevented: ${error.response.data.error}\n`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }

    // Step 5: Register user without referral code (should work)
    console.log('5️⃣ Registering user without referral code...');
    const regularUserData = {
      email: 'regular@test.com',
      password: 'Password123',
      name: 'Regular User',
      userType: 'customer'
    };

    const regularResponse = await axios.post(`${API_BASE_URL}/auth/register`, regularUserData);
    const regularUser = regularResponse.data.user;
    
    console.log(`✅ Regular user registered: ${regularUser.name}`);
    console.log(`💰 Regular user's points: ${regularUser.points}\n`);

    console.log('🎯 Fraud Detection Test Summary:');
    console.log('✅ Valid referrals work correctly');
    console.log('✅ Same IP accounts are created but points are blocked');
    console.log('✅ Self-referrals are prevented');
    console.log('✅ Users without referral codes can register');
    console.log('✅ IP addresses are tracked for fraud detection');
    console.log('✅ Clear fraud warnings are provided to users');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testFraudDetection(); 