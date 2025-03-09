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

// You can add additional polyfills as needed

export {}; // Export empty object to make this a proper module
