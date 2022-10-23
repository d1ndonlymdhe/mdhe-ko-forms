import { router, publicProcedure } from "../trpc"
import { z } from "zod"
import crypto from "crypto"

const authObject = z.object({
    username: z.string(),
    password: z.string()
})

export const authRouter = router({
    signUp: publicProcedure.input(authObject)
        .mutation(async ({ input, ctx }) => {
            const username = input.username;
            const password = input.password;
            const salt = hash(Math.random().toString() + (new Date().getTime().toString()))
            if (username && password) {
                const user = await ctx.prisma.user.findFirst({ where: { username } })
                if (user) {
                    return {
                        status: "error",
                        message: "USER_ALREADY_EXISTS"
                    }
                } else {
                    const newUser = await ctx.prisma.user.create({
                        data: {
                            username: username,
                            password: hash(password + salt),
                            salt: salt
                        }
                    })
                    return {
                        status: "success",
                    }
                }
            } else {
                return {
                    status: "error",
                    message: "NO_USERNAME_PASSWORD"
                }
            }
        })
    ,
    logIn: publicProcedure.input(authObject)
        .mutation(async ({ input, ctx }) => {
            const username = input.username
            const password = input.password
            const user = await ctx.prisma.user.findFirst({ where: { username } })
            if (user) {
                const salt = user.salt;
                if (hash(password + salt) === user.password) {
                    const Token = await ctx.prisma.userToken.create({
                        data: {
                            userId: user.id,
                            value: hash(`${new Date().getTime().toString} + ${Math.random().toString()} + ${username}`)
                        }
                    })
                    return {
                        status: "success",
                        message: Token.value
                    }
                } else {
                    return {
                        status: "error",
                        message: "WRONG_PASSWORD"
                    }
                }
            } else {
                return {
                    status: "error",
                    message: "NO_USER"
                }
            }
        })
})



export function hash(input: string) {
    const hash = crypto.createHash('sha256').update(input).digest('base64')
    return hash
}