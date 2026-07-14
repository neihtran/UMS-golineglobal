import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI);
    
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    
    // Connection event handlers
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
}
