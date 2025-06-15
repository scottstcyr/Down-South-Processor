# ACH Processor - Quick Start Guide

## Prerequisites

- Node.js (latest version)
- TypeScript
- Microsoft SQL Server 2022
- Shopify store with admin API access

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

## Configuration

1. **Environment Variables:**
   Copy the `.env` file and update with your credentials:
   ```bash
   # Database Configuration
   DB_HOST=your-sql-server
   DB_PORT=1433
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   DB_DATABASE=your-database

   # Shopify Configuration
   SHOPIFY_DOMAIN=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your-access-token
   SHOPIFY_API_VERSION=2025-01
   ```

## First Time Setup

1. **Create database tables:**
   ```bash
   npm run dev -- create-tables
   ```

2. **Test your configuration:**
   ```bash
   npm run dev -- status
   ```

3. **Test Shopify API connection:**
   ```bash
   npm run dev -- test
   ```

## Usage



## Production Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Run in production:**
   ```bash
   npm start -- start
   ```

## Commands Reference

| Command | Description |
|---------|-------------|
| `status` | Check configuration and connections |
| `test` | Test Shopify API connection |

## File Locations

- **Reports:** `./reports/` directory
- **Logs:** `./logs/` directory
- **Configuration:** `.env` file

## Troubleshooting

1. **Database connection issues:**
   - Verify SQL Server is running
   - Check firewall settings
   - Validate connection string

2. **Shopify API issues:**
   - Verify access token has correct permissions
   - Check API rate limits
   - Validate domain format

3. **Missing data:**
   - Check date ranges
   - Verify Shopify payment data exists
   - Review logs for errors

For detailed logs, check the `./logs/` directory.
