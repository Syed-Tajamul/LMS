import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { commonFields } from "./common";
import { users } from "./users";
import { leave_types } from "./leave_types";

// import { commonFields } from "../common";

export const leave_requests = sqliteTable('leave_requests', {
    ...commonFields,
    user_id: text().notNull().references(() => users.id),
    leave_id: text().notNull().references(() => leave_types.id),
    start_dat: text().notNull(),
    end_date: text().notNull(),
    reason: text().notNull(),
    approver_id: text().references(() => users.id),
    comments: text(),
    status: text().default("pending"),
});
