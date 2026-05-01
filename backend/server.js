import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './src/app.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });