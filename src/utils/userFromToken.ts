import { PrismaClient } from "@prisma/client";

export default async function userFromToken(token?: string) {
    if (token) {
    const prisma = new PrismaClient()
    const tokenInfo = await prisma.userToken.findFirst({ where: { value: token } })
    if (tokenInfo) {
        const user = await prisma.user.findFirst({ where: { id: tokenInfo.userId } })
        if (user) {
            return user
        } else {
            return undefined
        }
    } else {
        return undefined
    }
}
    return undefined
}