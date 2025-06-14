import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

declare global {
    var __db__: PrismaClient | undefined;
}

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
    db = new PrismaClient();
} else {
    if (!global.__db__) {
        global.__db__ = new PrismaClient({
            log: ['query', 'error', 'warn'],
        });
    }
    db = global.__db__;
}

// Ensure the database is connected
db.$connect().catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

export { db as prisma }; 