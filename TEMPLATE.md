# Template Usage Guide

This document provides step-by-step instructions for using the WP App Template to create your own application.

## 🎯 Getting Started with the Template

### Step 1: Project Setup

1. **Download/Clone the template**
2. **Rename the project directory** to your project name
3. **Update package.json**:
   ```json
   {
     "name": "your-project-name",
     "description": "Your project description",
     "keywords": ["your", "keywords"]
   }
   ```

### Step 2: Environment Configuration

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your specific values**:
   ```env
   # Database - Update with your database details
   DB_HOST=your-database-server
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   DB_DATABASE=your-database-name
   
   # API Integration - Replace with your API credentials
   API_DOMAIN=your-api-domain
   API_ACCESS_TOKEN=your-access-token
   ```

### Step 3: Customize the Application

#### Option A: Keep Shopify Integration
If you're building a Shopify-related application, update the credentials in `.env` and you're ready to go.

#### Option B: Replace with Your API

1. **Remove Shopify dependencies**:
   ```bash
   npm uninstall @shopify/admin-api-client
   ```

2. **Install your API client**:
   ```bash
   npm install your-api-package
   ```

3. **Update the following files**:
   - `/src/services/ShopifyService.ts` → `/src/services/YourApiService.ts`
   - `/src/types/ShopifyTypes.ts` → `/src/types/YourApiTypes.ts`
   - `/src/tasks/ShopifyTasks.ts` → `/src/tasks/YourApiTasks.ts`

## 🗃 Database Customization

### Updating Entities

1. **Modify existing entities** in `/src/entities/`:
   - Update `VaultEntry.ts` if needed (usually keep as-is)
   - Update `LogEntry.ts` if needed (usually keep as-is)
   - Add your custom entities

2. **Example custom entity**:
   ```typescript
   @Entity('your_table_name')
   export class YourCustomEntity {
       @PrimaryGeneratedColumn()
       public id!: number;

       @Column({ type: 'varchar', length: 100 })
       public name!: string;

       @CreateDateColumn()
       public createdAt!: Date;
   }
   ```

### Database Schema

The template follows these conventions:
- Use `varchar()` not `nvarchar()` for strings
- Primary keys as `IDENTITY(1,1)` (handled by `@PrimaryGeneratedColumn()`)
- Field lengths: 50 for names, 125 for addresses, 10 for zip, etc.
- Use `!` for required fields, `?` for optional

## 🔄 Task Scheduling Customization

### Creating Custom Tasks

1. **Create task file** in `/src/tasks/YourCustomTask.ts`:
   ```typescript
   import { BaseTask } from './BaseTask';

   export class YourCustomTask extends BaseTask {
       public static taskName = 'your-custom-task';
       
       public async run(): Promise<void> {
           this.logger.info(`Starting ${YourCustomTask.taskName}`);
           
           try {
               // Your business logic here
               await this.processYourData();
               
               this.logger.info(`${YourCustomTask.taskName} completed successfully`);
           } catch (error) {
               this.logger.error(`${YourCustomTask.taskName} failed:`, error);
               throw error;
           }
       }

       private async processYourData(): Promise<void> {
           // Implementation here
       }
   }
   ```

2. **Register task** in `/src/tasks/index.ts`:
   ```typescript
   export { YourCustomTask } from './YourCustomTask';
   ```

3. **Schedule task** in scheduler service or via CLI commands

## 🛠 Service Layer Customization

### Creating Custom Services

1. **Create service file** in `/src/services/YourService.ts`:
   ```typescript
   export class YourService {
       private logger = createLogger({ service: 'YourService' });

       public async performOperation(): Promise<YourResultType> {
           this.logger.info('Performing operation');
           
           try {
               // Service logic here
               const result = await this.businessLogic();
               return result;
           } catch (error) {
               this.logger.error('Operation failed:', error);
               throw error;
           }
       }
   }
   ```

## 📋 CLI Command Customization

### Adding Custom Commands

1. **Update `/src/cli.ts`**:
   ```typescript
   program
       .command('your-command')
       .description('Description of your command')
       .option('-p, --param <value>', 'Parameter description')
       .action(async (options) => {
           try {
               await yourCommandHandler(options);
           } catch (error) {
               console.error('Command failed:', error);
               process.exit(1);
           }
       });
   ```

## 🧪 Testing Your Changes

1. **Run existing tests**:
   ```bash
   npm test
   ```

2. **Create tests for your components**:
   ```typescript
   // /test/services/YourService.test.ts
   import { YourService } from '../../src/services/YourService';

   describe('YourService', () => {
       test('should perform operation successfully', async () => {
           const service = new YourService();
           const result = await service.performOperation();
           expect(result).toBeDefined();
       });
   });
   ```

## 🚀 Deployment Preparation

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Test production build**:
   ```bash
   npm start -- status
   ```

3. **Set up production environment variables**

4. **Configure database in production**

## 📝 Customization Checklist

- [ ] Updated `package.json` with project details
- [ ] Created and configured `.env` file
- [ ] Replaced/updated API integration
- [ ] Customized database entities
- [ ] Created custom tasks
- [ ] Updated CLI commands
- [ ] Added custom services
- [ ] Written tests for new functionality
- [ ] Updated documentation
- [ ] Tested build and deployment

## 🎨 Architecture Patterns

This template follows these patterns:
- **Repository Pattern**: Data access through entities
- **Service Layer**: Business logic separation
- **Command Pattern**: CLI command structure
- **Observer Pattern**: Event-driven task scheduling
- **Factory Pattern**: Service instantiation
- **Singleton Pattern**: Database connections

## 🔧 Common Customizations

### 1. Different Database (PostgreSQL, MySQL)
- Update dependencies in `package.json`
- Modify database configuration in `/src/config/database.ts`
- Update entity decorators if needed

### 2. Different API (REST vs GraphQL)
- Replace client library
- Update service methods
- Modify type definitions
- Update error handling

### 3. Additional Logging Destinations
- Modify Winston configuration in `/src/utils/logger.ts`
- Add new transports (file, database, external service)

### 4. Authentication/Authorization
- Add auth middleware
- Create user entities
- Update services with auth checks
- Add auth-related CLI commands

This template provides a solid foundation that can be adapted to virtually any business application requirements while maintaining code quality and architectural consistency.
