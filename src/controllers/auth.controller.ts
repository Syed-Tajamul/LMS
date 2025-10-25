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
    // .onTransform((request) => console.log(" request", request))
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

        return {
            success: true,
            message: 'User created',
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
        const accessToken = await jwt_auth.sign({ id: user[0].id, exp: "1h" })  //here we are just saving users id information.we can save much more info as well. 
        const refreshToken = await jwt_auth.sign({ id: user[0].id, exp: "7d" });

        cookie.access_token.set({
            value: accessToken,
            httpOnly: true,
            maxAge: 24 * 3600,
            secure: true,
        });

        cookie.refresh_token.set({
            value: refreshToken,
            httpOnly: true,
            maxAge: 7 * 24 * 3600,
            secure: true
        });

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
    .post("/refresh", async ({ cookie, jwt_auth }) => {
        const incomingRefreshToken = cookie.refresh_token?.value;
        if (!incomingRefreshToken) {
            return { message: "no refresh token present." }
        }

        const decodedToken = await jwt_auth.verify(incomingRefreshToken as string);

        if (!decodedToken) {
            return { message: "refresh token is invalid." }
        }

        const user = await db.select()
            .from(users)
            .where(eq(users.id, decodedToken.id as number))

        if (user[0].refresh_token !== incomingRefreshToken) {
            return { message: "invalid refresh token" }
        }

        const newAccessToken = await jwt_auth.sign({ id: decodedToken.id, exp: "1h" });
        const newRefreshToken = await jwt_auth.sign({ id: decodedToken.id, exp: "7d" });

        cookie.access_token.set({
            value: newAccessToken,
            httpOnly: true,
            maxAge: 24 * 3600,
            secure: true,
        });

        cookie.refresh_token.set({
            value: newRefreshToken,
            httpOnly: true,
            maxAge: 7 * 24 * 3600,
            secure: true
        });

        await db.update(users)
            .set({ refresh_token: newRefreshToken })
            .where(eq(users.id, user[0].id as number))

        console.log("cookie", cookie);

        return ({
            status: "success",
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        })
    })
    .get('/sign-out', async ({ cookie }) => {
        await db.update(users)
            .set({ refresh_token: null })
            .where(eq(users.refresh_token, cookie?.refresh_token?.value as string))
            .returning();
        cookie.refresh_token.remove();
        cookie.access_token.remove();
        return {
            status: "success",
            message: "user logged out",
            refresh_token: cookie.refresh_token?.value,
            access_token: cookie.access_token?.value
        };
    });