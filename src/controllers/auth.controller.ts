import { Elysia, t } from 'elysia';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { jwt } from '@elysiajs/jwt';

export const User = new Elysia({ prefix: '/auth' })
    .use(jwt({
        name: 'jwt_auth',
        secret: process.env.JWT_SECRET!
    }))
    .onTransform((request) => console.log(" request", request))
    .post("/sign-up", async (request) => {
        const user = await db.select()
            .from(users)
            .where(eq(users.email, request.body.email));

        if (user.length) return { message: "user already exists" };

        const newUser = await db.insert(users)
            .values({
                ...request.body,
                password: await Bun.password.hash(request.body.password),
            }).returning()

        if (!newUser) return { message: "Problems creating user" }

        const token = await request.jwt_auth.sign({ id: newUser[0].id })
        return {
            success: true,
            message: 'User created',
            access_token: token,
        }
    },
        {
            body: t.Object({
                email: t.String(),
                password: t.String(),
                first_name: t.String(),
                last_name: t.String(),
            })
        }
    )
    .post(
        '/sign-in',
        async ({
            store: { user, session },
            status,
            body: { username, password },
            cookie: { token }
        }) => {
            if (
                !user[username] ||
                !(await Bun.password.verify(password, user[username]))
            )
                return status(400, {
                    success: false,
                    message: 'Invalid username or password'
                })
            const key = crypto.getRandomValues(new Uint32Array(1))[0]
            session[key] = username
            token.value = key
            return {
                success: true,
                message: `Signed in as ${username}`
            }
        },
        {
            body: t.Object({
                username: t.String({ minLength: 1 }),
                password: t.String({ minLength: 8 })
            }),
            cookie: t.Cookie(
                {
                    token: t.Number()
                },
                {
                    secrets: 'seia'
                }
            )
        }
    ) 