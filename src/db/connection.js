const mongoose = require('mongoose');

async function connect(uri) {
  const target = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
  await mongoose.connect(target);
  console.log('MongoDB connected');
}

module.exports = { connect };
