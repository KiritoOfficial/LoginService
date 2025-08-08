const { defineConfig } = require("drizzle-kit");

const url = "./db/database.db";

export default defineConfig({
  url,
  dialect: "sqlite",
  schema: "./db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url
  }
});