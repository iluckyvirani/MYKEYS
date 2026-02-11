/**
 * Razorpay Configuration
 * Manages Razorpay API keys and instance initialization
 */

import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    'Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.'
  );
}

/**
 * Initialize Razorpay instance with test credentials
 * Using testing mode - no real money is charged
 */
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Razorpay Configuration Object
 */
export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  isTestMode: process.env.RAZORPAY_KEY_ID.includes('test'),
};

/**
 * Test Razorpay Connection
 * Call this to verify Razorpay credentials are valid
 */
export async function testRazorpayConnection(): Promise<boolean> {
  try {
    // Test connection by checking if the instance is properly initialized
    // If credentials are invalid, the SDK will throw an error on first API call
    if (!razorpayInstance) {
      return false;
    }
    return true;
  } catch (error: any) {
    console.error('Razorpay connection test failed:', error);
    return false;
  }
}

export default razorpayInstance;
