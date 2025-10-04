import Elysia, { t } from "elysia";
import { db } from "../db";
import { asc, eq } from "drizzle-orm";
import { leave_requests } from "../db/schema/leave_requests";
export const LeaveRequests = new Elysia(
    {
        prefix: "/leave-requests"
    }
)
    .onTransform(({ body }) =>
        console.log("body", body)
    )
    .get("", async () => {
        const rows = await db.select()
            .from(leave_requests)
            .limit(10)
            .orderBy(asc(leave_requests.status))
        return rows;
    })
    .post("", async ({ body }) => {
        const row = await db.insert(leave_requests)
            .values({
                user_id: user.id,
                leave_id: body.leaveId,
                approver_id: null,
                comments: null,
                ...body
            }).returning();
        return row
    },
        {
            body: t.Object({
                leaveId: t.String(),
                start_dat: t.String(),
                end_date: t.String(),
                reason: t.String(),
                status: t.Optional(t.String())
            })
        }
    )
    .put("/:id", async ({ params: { id }, body }) => {
        return await db
            .update(leave_requests)
            .set({
                approver_id: users.id,
                comments: body.comments,
                status: body.status,
            })
            .where(eq(leave_requests.id, id))
            .returning();
    },
        {
            params: t.Object({ id: t.Number() }),
            body: t.Object({
                approver_id: t.String(),
                comments: t.String(),
                status: t.String()
            })
        }
    )
    .delete("/:id", async ({ params: { id } }) => {
        await db.delete(leave_requests)
            .where(eq(leave_requests.id, id))
            .returning();

        return { message: "success" }
    },
        {
            params: t.Object({ id: t.Number() })
        }
    )