import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',  // Specify your test directory
  timeout: 30000,
  use: {
    headless: true,  // Run tests in headless mode
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    trace: 'on'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});

