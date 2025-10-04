import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { commonFields } from "./common";
import { users } from "./users";
import { leave_types } from "./leave_types";

export const leave_balance = sqliteTable('leave_balance', {
    ...commonFields,
    user_id: text().notNull().references(() => users.id),
    leave_type_id: text().notNull().references(() => leave_types.id),
    balance: integer(),
});
