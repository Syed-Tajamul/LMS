import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { commonFields } from "./common";
import { leave_requests } from "./leave_requests";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const leave_approvels = sqliteTable('leave_approvels', {
    ...commonFields,
    leave_request_id: text().notNull().references(() => leave_requests.id),
    approver_id: text().notNull().references(() => users.id),
    status: text().notNull(),
    comments: text(),
    action_date: text().default(sql`(CURRENT_TIMESTAMP)`),
})