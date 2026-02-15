import { Buffer } from 'buffer';

if (typeof globalThis.process === 'undefined') {
  // @ts-expect-error Node.js process polyfill for browser
  globalThis.process = {
    env: {
      NODE_ENV: import.meta.env.MODE || 'production',
    },
    version: '',
    cwd: () => '/',
  };
}

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

// @ts-expect-error Mark as browser environment
if (typeof process !== 'undefined' && !process.browser) {
  // @ts-expect-error
  process.browser = true;
}
