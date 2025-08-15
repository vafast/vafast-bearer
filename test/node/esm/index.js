if ('Bun' in globalThis) {
  throw new Error('❌ Use Node.js to run this test!');
}

import { bearer } from '../../../dist/index.mjs';

if (typeof bearer !== 'function') {
  throw new Error('❌ ESM Node.js failed');
}

console.log('✅ ESM Node.js works!');
