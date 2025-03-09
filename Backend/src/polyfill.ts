/**
 * This file contains polyfills needed by the application.
 */

// Polyfill for fetch if needed
if (!global.fetch) {
  try {
    // Try to use node-fetch
    const nodeFetch = require('node-fetch');
    global.fetch = nodeFetch;
    global.Headers = nodeFetch.Headers;
    global.Request = nodeFetch.Request;
    global.Response = nodeFetch.Response;
  } catch (error) {
    console.warn('node-fetch is not installed. If fetch is needed, please install it: npm install node-fetch');
  }
}

// Add TextEncoder polyfill if needed
if (typeof global.TextEncoder === 'undefined') {
  try {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
  } catch (error) {
    console.warn('TextEncoder/TextDecoder polyfill failed to load');
  }
}

// Polyfill for Yahoo Finance library compatibility issues
import yahooFinance from 'yahoo-finance2';

// Suppress Yahoo Finance notices
yahooFinance.suppressNotices(['yahooSurvey']);

// Patch the Headers prototype with getSetCookie if it doesn't exist
if (global.Headers && !global.Headers.prototype.getSetCookie) {
  global.Headers.prototype.getSetCookie = function() {
    return this.get('set-cookie') ? [this.get('set-cookie')] : [];
  };
}

// Patch fetch to ensure Response objects have getSetCookie
const originalFetch = global.fetch;
if (originalFetch) {
  global.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    if (response.headers && !response.headers.getSetCookie) {
      response.headers.getSetCookie = function() {
        return this.get('set-cookie') ? [this.get('set-cookie')] : [];
      };
    }
    
    return response;
  };
}

// You can add additional polyfills as needed

export {}; // Export empty object to make this a proper module
