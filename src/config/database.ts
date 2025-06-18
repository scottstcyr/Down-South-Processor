import { DataSource } from "typeorm";
import { config } from "dotenv";
import { VaultEntry } from "../entities/VaultEntry";
import { log } from "../utils/logger";
import { LogEntry } from "../entities/LogEntry";
import { DSOrder } from "../entities/DSOrder";
import { DSOrderDetail } from "../entities/DSOrderDetail";

// Load environment variables
config();

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: parseInt(process.env.DB_PORT ?? "1433"),
    username: process.env.DB_USERNAME ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_DATABASE ?? "DATABASE NOT SET",
    synchronize: false, // Set to false in production
    logging: ["error"],
    entities: [VaultEntry, LogEntry, DSOrder, DSOrderDetail],
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        log.info("Database connection established");
    } catch (error) {
        log.error("Error connecting to database:", error);
        throw error;
    }
};
