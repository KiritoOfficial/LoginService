const { users } = require("../../db/schema");
const database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");

const sqlite = new database("./db/database.db");

const db = drizzle(sqlite, { schema: { users } });

module.exports = db;