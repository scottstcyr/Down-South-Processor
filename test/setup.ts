import { config } from 'dotenv';
import 'reflect-metadata';

// Load test environment variables
config({ path: '.env.test' });

// Setup global test configuration
beforeAll(() => {
  // Mock environment variables for testing
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '1433';
  process.env.DB_USERNAME = 'test';
  process.env.DB_PASSWORD = 'test';
  process.env.DB_DATABASE = 'test';
  process.env.SHOPIFY_DOMAIN = 'test.myshopify.com';
  process.env.SHOPIFY_ACCESS_TOKEN = 'test_token';
  process.env.SHOPIFY_API_VERSION = '2025-01';
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
});

// Global test teardown
afterAll(() => {
  // Clean up any global resources
});

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
