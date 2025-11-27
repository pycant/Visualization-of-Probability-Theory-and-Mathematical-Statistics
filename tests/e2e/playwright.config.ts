import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './',
  timeout: 30_000,
  webServer: {
    command: 'node ./server.js',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    headless: true,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
  },
});
