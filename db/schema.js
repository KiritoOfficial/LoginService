const { sql } = require("drizzle-orm");
const { sqliteTable, text, integer, index } = require("drizzle-orm/sqlite-core");

const hwids = sqliteTable("hwids", {
  id: text("id").primaryKey(),
  tokenId: text("token_id").references(() => tokens.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  tokenHwidIndex: index("token_hwid_idx").on(table.tokenId, table.id),
}));

const tokens = sqliteTable("tokens", {
  id: text("id").primaryKey(),
  maxHwids: integer("max_hwids").notNull().default(1),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  user: integer("user").references(() => users.id, { onDelete: "set null" }),
});

const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  username: text("username"),
  isBanned: integer("is_banned", { mode: "boolean" }).notNull().default(false),
});

module.exports = { tokens, hwids, users };