import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 60000,
  retries: 1,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    // Disable trace/screenshots to avoid ENOSPC (disk full) errors
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
         ...devices['Desktop Chrome'],
         channel: 'chrome',
      },
    },
  ],
  // Auto-start the Vite dev server before running E2E tests.
  // The backend must be started separately:
  //   cd backend_api && .\venv\Scripts\python.exe run.py
  webServer: {
    command: 'npm run dev -- --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 60000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
