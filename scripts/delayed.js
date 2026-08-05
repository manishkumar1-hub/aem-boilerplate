import { sampleRUM } from './aem.js';

// 1. Core Web Vitals RUM (Real User Monitoring) Sampling
sampleRUM('cwv');

// 2. Add Third-Party / MarTech Scripts Here (e.g., Google Analytics / Tag Manager)
console.log('🚀 loadDelayed executed! 3 seconds have passed since initial page render.');
