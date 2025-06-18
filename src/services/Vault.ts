import { parseNamedParameters } from "../utils/utils";
import { AppDataSource } from "../config/database";
import { VaultEntry } from "../entities/VaultEntry";
import { logger } from "../utils/logger";

export class Vault {
    private static instance: Vault;
    private startupParams: Record<string, string>;
    private cache: Map<string, string>;

    private constructor() {
        // Cache startup parameters at initialization
        this.startupParams = parseNamedParameters(false, false);
        this.cache = new Map<string, string>();
    }

    public static getInstance(): Vault {
        if (!Vault.instance) {
            Vault.instance = new Vault();
        }
        return Vault.instance;
    }

    /**
     * Read a value using four-tier lookup:
     * 1. Startup parameters
     * 2. Environment variables
     * 3. Local cache
     * 4. MSSQL Vault table
     */
    public async read(key: string): Promise<string | undefined> {
        // 3. Check local cache
        const cachedValue = this.cache.get(key);
        if (cachedValue !== undefined) {
            logger.temp(`Vault: Found key '${key}' in local cache`);
            return cachedValue;
        }

        // 1. Check startup parameters first
        if (this.startupParams[key] !== undefined) {
            logger.temp(`Vault: Found key '${key}' in startup parameters`);
            return this.startupParams[key];
        }

        // 2. Check environment variables
        const envValue = process.env[key];
        if (envValue !== undefined) {
            logger.temp(`Vault: Found key '${key}' in environment variables`);
            return envValue;
        }

        // 4. Check database Vault table
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            const repository = AppDataSource.getRepository(VaultEntry);
            const entry = await repository.findOne({ where: { key } });
            
            if (entry && entry.value !== undefined) {
                logger.temp(`Vault: Found key '${key}' in database`);
                // Cache the value for future reads
                this.cache.set(key, entry.value);
                return entry.value;
            }
        } catch (error) {
            logger.error(`Vault: Error reading from database for key '${key}': ${error}`);
            // Fall through to return undefined
        }

        logger.info(`Vault: Key '${key}' not found in any source`);
        return undefined;
    }

    /**
     * Write a value to the MSSQL Vault table and update the cache
     * If key exists, update it; otherwise, insert it
     */
    public async write(key: string, value: string): Promise<void> {
        try {
            const repository = AppDataSource.getRepository(VaultEntry);
            
            // Use upsert operation (insert or update)
            await repository.save({
                key,
                value
            });
            
            // Update the cache with the new value
            this.cache.set(key, value);
            
            logger.debug(`Vault: Successfully wrote key '${key}' to database and cache`);
        } catch (error) {
            logger.error(`Vault: Error writing to database for key '${key}': ${error}`);
            throw error;
        }
    }

    /**
     * Delete a key from the MSSQL Vault table and remove from cache
     * Returns true if the key existed and was deleted, false otherwise
     */
    public async delete(key: string): Promise<boolean> {
        try {
            const repository = AppDataSource.getRepository(VaultEntry);
            const result = await repository.delete({ key });
            
            const existed = result.affected !== undefined && result.affected !== null && result.affected > 0;
            
            // Remove from cache regardless of database result to ensure consistency
            this.cache.delete(key);
            
            logger.debug(`Vault: Delete key '${key}' - existed: ${existed}, removed from cache`);
            return existed;
        } catch (error) {
            logger.error(`Vault: Error deleting from database for key '${key}': ${error}`);
            throw error;
        }
    }

    /**
     * Clear the entire local cache
     */
    public clearCache(): void {
        this.cache.clear();
        logger.debug(`Vault: Local cache cleared`);
    }

    /**
     * Get cache statistics for debugging
     */
    public getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
