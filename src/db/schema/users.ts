import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { commonFields } from "./common";

// import { commonFields } from "../common";

export const users = sqliteTable('users', {
    ...commonFields,
    first_name: text().notNull(),
    last_name: text().notNull(),
    email: text().unique().notNull(),
    password: text().notNull(),
    phone: text(),
    image: text('image'),
    last_login_ip: text(),
    last_login_at: text(),
    refresh_token: text(),
    suspended_at: text(),
    suspension_reason: text(),
    role: text().notNull().default("employee"),
});
