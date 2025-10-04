import Elysia, { t } from "elysia";
import { leave_types } from "../db/schema/leave_types";
import { db } from "../db";
import { asc, eq } from "drizzle-orm";
export const LeaveType = new Elysia(
    {
        prefix: "/leave-types"
    }
)
    .onTransform(({ body }) =>
        console.log("body", body)
    )
    // .onError((error) =>
    //     console.log("error", error)
    // )
    .get("", async () => {
        const rows = await db.select()
            .from(leave_types)
            .limit(5)
            .orderBy(asc(leave_types.type))
        return rows;
    })
    .post("", async ({ body }) => {
        const row = await db.insert(leave_types)
            .values({
                type: body.type,
                description: body.description,
                annual_quota: body.annual_quota
            }).returning();
        return row
    },
        {
            body: t.Object({
                type: t.String(),
                description: t.String(),
                annual_quota: t.Number()
            })
        }
    )
    .put("/:id", async ({ params: { id }, body }) => {
        return await db
            .update(leave_types)
            .set({
                type: body.type,
                description: body.description,
                annual_quota: body.annual_quota
            })
            .where(eq(leave_types.id, id))
            .returning();
    },
        {
            params: t.Object({ id: t.Number() }),
            body: t.Object({
                type: t.String(),
                description: t.String(),
                annual_quota: t.Number()
            })
        }
    )
    .delete("/:id", async ({ params: { id } }) => {
        await db.delete(leave_types)
            .where(eq(leave_types.id, id))
            .returning();

        return { message: "success" }
    },
        {
            params: t.Object({ id: t.Number() })
        }
    )