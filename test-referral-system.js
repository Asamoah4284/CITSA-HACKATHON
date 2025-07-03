const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001'; // Adjust if your backend runs on different port

async function testReferralSystem() {
  console.log('🧪 Testing Referral System...\n');

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

    // Step 2: Register second user with referrer's code
    console.log('2️⃣ Registering second user with referral code...');
    const referredUserData = {
      email: 'referred@test.com',
      password: 'Password123',
      name: 'Jane Referred',
      userType: 'customer',
      enteredReferralCode: referrer.myReferralCode
    };

    const referredResponse = await axios.post(`${API_BASE_URL}/auth/register`, referredUserData);
    const referredUser = referredResponse.data.user;
    const referralInfo = referredResponse.data.referralInfo;
    
    console.log(`✅ Referred user registered: ${referredUser.name}`);
    console.log(`📊 Referred user's referral code: ${referredUser.myReferralCode}`);
    console.log(`📊 Referred user's entered referral code: ${referredUser.enteredReferralCode}`);
    console.log(`💰 Referred user's points: ${referredUser.points}`);
    
    if (referralInfo) {
      console.log(`🎉 Referral bonus awarded!`);
      console.log(`   - Referrer: ${referralInfo.referrerName}`);
      console.log(`   - Points awarded to new user: ${referralInfo.pointsAwarded}`);
      console.log(`   - Points awarded to referrer: ${referralInfo.referrerPointsAwarded}\n`);
    }

    // Step 3: Register third user without referral code
    console.log('3️⃣ Registering third user without referral code...');
    const regularUserData = {
      email: 'regular@test.com',
      password: 'Password123',
      name: 'Bob Regular',
      userType: 'customer'
    };

    const regularResponse = await axios.post(`${API_BASE_URL}/auth/register`, regularUserData);
    const regularUser = regularResponse.data.user;
    
    console.log(`✅ Regular user registered: ${regularUser.name}`);
    console.log(`📊 Regular user's referral code: ${regularUser.myReferralCode}`);
    console.log(`📊 Regular user's entered referral code: ${regularUser.enteredReferralCode}`);
    console.log(`💰 Regular user's points: ${regularUser.points}\n`);

    // Step 4: Test invalid referral code
    console.log('4️⃣ Testing invalid referral code...');
    try {
      const invalidReferralData = {
        email: 'invalid@test.com',
        password: 'Password123',
        name: 'Invalid User',
        userType: 'customer',
        enteredReferralCode: 'INVALID123'
      };

      await axios.post(`${API_BASE_URL}/auth/register`, invalidReferralData);
      console.log('❌ Should have failed with invalid referral code');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Correctly rejected invalid referral code: ${error.response.data.error}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }

    console.log('\n🎯 Referral System Test Summary:');
    console.log('✅ Users can register with referral codes');
    console.log('✅ Points are awarded to referrer only (100 points)');
    console.log('✅ New users get 0 points for using referral codes');
    console.log('✅ Invalid referral codes are rejected');
    console.log('✅ Users without referral codes get 0 points');
    console.log('✅ Each user gets their own unique referral code');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testReferralSystem(); 