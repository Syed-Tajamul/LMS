import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

export const commonFields = {
    id: integer().primaryKey({ autoIncrement: true }),
    meta: text(),
    created_at: text().default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text().default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    deleted_at: text(),
} as const;

export const omitFields = ["id", "nano", "meta", "created_at", "updated_at", "deleted_at"] as const;