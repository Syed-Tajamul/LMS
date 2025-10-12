import { Elysia, t } from 'elysia';
import { db } from '../db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { jwt } from '@elysiajs/jwt';

export const User = new Elysia({ prefix: '/auth' })
    .use(jwt({
        name: 'jwt_auth',
        secret: process.env.JWT_SECRET!,
    }))
    .onTransform((request) => console.log(" request", request))
    .post("sign-up", async (request) => {
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
    .post("sign-in", async ({ body, jwt_auth, cookie }) => {
        const user = await db.select()
            .from(users)
            .where(eq(users.email, body.email))
            .limit(1);

        if (!user.length) return { message: "User does not exist" }
        const isPasswordCorrect = await Bun.password.verify(body.password, user[0].password)
        if (!isPasswordCorrect) return { message: "Password is incorrect" }
        const accessToken = await jwt_auth.sign({ id: user[0].id, exp: "1h" })
        cookie.access_token.set({
            value: accessToken,
            httpOnly: true,
            maxAge: 24 * 3600,
            secure: true,
        });
        const refreshToken = await Bun.password.hash(Bun.randomUUIDv7());

        await db.update(users)
            .set({ refresh_token: refreshToken })
            .where(eq(users.id, user[0].id))

        return ({ status: "success" })
    },
        {
            body: t.Object({
                email: t.String(),
                password: t.String(),
            })
        }
    )
    .get('/sign-out', ({ cookie }) => {
        console.log(cookie, "cookie")
        // token.remove()
        //     return {
        //         success: true,
        //         message: 'Signed out'
        //     }
        // },
        //     {
        //         cookie: 'optionalSession'
        //     }
    }) 