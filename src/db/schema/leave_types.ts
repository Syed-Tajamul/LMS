import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { commonFields } from "./common";

// import { commonFields } from "../common";

export const leave_types = sqliteTable('leave_types', {
    ...commonFields,
    type: text().notNull(),
    description: text(),
    annual_quota: integer().notNull(),
});
