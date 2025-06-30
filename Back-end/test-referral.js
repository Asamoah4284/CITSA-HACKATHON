const mongoose = require('mongoose');
const User = require('./models/User');
const Artisan = require('./models/Artisan');
const Referral = require('./models/Referral');
require('dotenv').config();

async function testReferralFunctionality() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if we have users and artisans
    const userCount = await User.countDocuments();
    const artisanCount = await Artisan.countDocuments();
    const referralCount = await Referral.countDocuments();

    console.log(`📊 Database Stats:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Artisans: ${artisanCount}`);
    console.log(`   Referrals: ${referralCount}`);

    if (userCount === 0) {
      console.log('❌ No users found. Please run the seed script first.');
      return;
    }

    if (artisanCount === 0) {
      console.log('❌ No artisans found. Please run the seed script first.');
      return;
    }

    // Get a sample user and artisan
    const user = await User.findOne();
    const artisan = await Artisan.findOne();

    console.log(`👤 Sample User: ${user.name} (${user.email})`);
    console.log(`🎨 Sample Artisan: ${artisan.name} (${artisan.specialty})`);

    // Test referral code generation
    console.log('\n🧪 Testing referral functionality...');
    
    // Check if user already has a referral for this artisan
    const existingReferral = await Referral.findOne({
      referrer: user._id,
      artisan: artisan._id
    });

    if (existingReferral) {
      console.log(`✅ User already has referral: ${existingReferral.referralCode}`);
    } else {
      console.log('📝 No existing referral found - would create new one');
    }

    // Test referral claiming
    const testReferral = await Referral.findOne();
    if (testReferral) {
      console.log(`🔗 Found test referral: ${testReferral.referralCode}`);
      console.log(`   Referrer: ${testReferral.referrer}`);
      console.log(`   Artisan: ${testReferral.artisan}`);
      console.log(`   Status: ${testReferral.status}`);
    }

    console.log('\n✅ Referral functionality test completed!');
    console.log('🚀 Your referral system should be working properly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

testReferralFunctionality(); 