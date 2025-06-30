const mongoose = require('mongoose');
const Referral = require('../models/Referral');

// TODO: Update with your actual MongoDB connection string if not using env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/YOUR_DB_NAME';

async function cleanupDuplicates() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Find all duplicate (referrer, artisan) pairs
  const duplicates = await Referral.aggregate([
    {
      $group: {
        _id: { referrer: '$referrer', artisan: '$artisan' },
        count: { $sum: 1 },
        ids: { $push: { id: '$_id', createdAt: '$createdAt' } }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]);

  let totalDeleted = 0;

  for (const dup of duplicates) {
    // Sort by createdAt descending, keep the most recent
    const sorted = dup.ids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const toDelete = sorted.slice(1).map(x => x.id);

    if (toDelete.length > 0) {
      const res = await Referral.deleteMany({ _id: { $in: toDelete } });
      totalDeleted += res.deletedCount;
      console.log(`Deleted ${res.deletedCount} duplicate(s) for referrer ${dup._id.referrer} and artisan ${dup._id.artisan}`);
    }
  }

  console.log(`Cleanup complete. Total duplicates deleted: ${totalDeleted}`);
  await mongoose.disconnect();
}

cleanupDuplicates().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
}); 