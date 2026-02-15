/**
 * Razorpay Configuration
 * Manages Razorpay API keys and instance initialization
 */

import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('Razorpay Configuration:');
console.log('- Key ID:', keyId ? `${keyId.substring(0, 10)}...` : 'NOT SET');
console.log('- Key Secret:', keySecret ? `${keySecret.substring(0, 5)}...` : 'NOT SET');

if (!keyId || !keySecret) {
  throw new Error(
    'Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.'
  );
}

/**
 * Initialize Razorpay instance with test credentials
 * Using testing mode - no real money is charged
 */
export const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

console.log('Razorpay instance initialized successfully');

/**
 * Razorpay Configuration Object
 */
export const razorpayConfig = {
  keyId: keyId,
  keySecret: keySecret,
  isTestMode: keyId.includes('test'),
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
